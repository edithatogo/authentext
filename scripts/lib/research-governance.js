const QUERY_FIELDS = Object.freeze([
  'document_type',
  'subtype',
  'jurisdiction',
  'organisation',
  'venue',
  'study_type',
  'project_style',
]);

const APPROVED_SOURCE_CLASSES = new Set([
  'official-guidance',
  'standards-body',
  'publisher-guidance',
  'government',
  'professional-body',
  'project-local',
]);

export function isApprovedSourceClass(value) {
  return APPROVED_SOURCE_CLASSES.has(value);
}

const KNOWN_MULTIWORD_PLACES = new Set([
  'new zealand',
  'united kingdom',
  'united states',
  'south australia',
  'new south wales',
]);

const SOURCE_METADATA_FIELDS = Object.freeze([
  'title',
  'publisher',
  'url',
  'retrieved_at',
  'source_class',
]);

function normalizeValue(value) {
  return typeof value === 'string' ? value.trim().replace(/\s+/gu, ' ') : '';
}

function hasSensitiveValue(value, field) {
  if (/\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/u.test(value)) return true;
  if (/\b(?:bearer\s+|sk-|api[_ -]?key\b|token\b)[A-Za-z0-9._-]{8,}/iu.test(value)) return true;
  if (/\[[12]\d{3}\]\s+[A-Z]{2,}\w*\s+\d+/u.test(value)) return true;
  if (/\b(?:patient|client|employee)\s+(?:name|id)\s*[:=]/iu.test(value)) return true;
  if (
    field === 'jurisdiction' &&
    /^(?:[\p{Lu}][\p{L}'’-]+\s+){1,2}[\p{Lu}][\p{L}'’-]+$/u.test(value) &&
    !KNOWN_MULTIWORD_PLACES.has(value.toLocaleLowerCase())
  ) {
    return true;
  }
  return false;
}

/**
 * Construct a bounded query from governed profile metadata. Raw document text,
 * embedded instructions, identifiers, citations, and arbitrary keys are never
 * accepted as query material.
 * @param {Record<string, unknown>} metadata
 */
export function buildMetadataQuery(metadata = {}) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return { safe: false, query: null, fields: [], omitted_fields: [], reason: 'invalid-metadata' };
  }

  const omittedFields = Object.keys(metadata).filter((key) => !QUERY_FIELDS.includes(key));
  const parts = [];
  const fields = [];
  for (const field of QUERY_FIELDS) {
    if (!Object.hasOwn(metadata, field)) continue;
    const value = normalizeValue(metadata[field]);
    if (!value || value.length > 120 || hasSensitiveValue(value, field)) {
      return {
        safe: false,
        query: null,
        fields,
        omitted_fields: omittedFields,
        reason: 'unsafe-metadata',
        rejected_field: field,
      };
    }
    fields.push(field);
    parts.push(value);
  }

  if (parts.length === 0) {
    return {
      safe: false,
      query: null,
      fields: [],
      omitted_fields: omittedFields,
      reason: 'no-query-metadata',
    };
  }
  return {
    safe: true,
    query: parts.join(' '),
    fields,
    omitted_fields: omittedFields,
    reason: 'safe-metadata-only',
  };
}

/**
 * Require material need, explicit permission, an approved public source class,
 * and a nonsensitive metadata-only query. Any failed condition falls back to
 * local conservative guidance.
 * @param {Record<string, unknown>} request
 */
export function evaluateResearchGate(request = {}) {
  if (request.material_need !== true) {
    return { allowed: false, reason: 'not-material', fallback: 'local-conservative-guidance' };
  }
  if (request.permission !== 'allowed') {
    return {
      allowed: false,
      reason: 'permission-required',
      fallback: 'local-conservative-guidance',
    };
  }
  if (!APPROVED_SOURCE_CLASSES.has(request.source_class)) {
    return {
      allowed: false,
      reason: 'source-class-not-approved',
      fallback: 'local-conservative-guidance',
    };
  }

  const query = buildMetadataQuery(request.metadata);
  if (!query.safe) {
    return {
      allowed: false,
      reason: query.reason,
      rejected_field: query.rejected_field,
      fallback: 'local-conservative-guidance',
    };
  }
  return {
    allowed: true,
    reason: 'approved',
    source_class: request.source_class,
    query: query.query,
    query_fields: query.fields,
  };
}

function validIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

/**
 * Ingest only the public metadata envelope needed to create a governed source
 * record. Response bodies and arbitrary provider fields are untrusted payloads
 * and cause the entire candidate to be rejected.
 * @param {Record<string, unknown>} candidate
 */
export function ingestSourceCandidate(candidate = {}) {
  const reject = (reason) => ({ accepted: false, reason, record: null });
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
    return reject('invalid-candidate');
  }
  const unknownFields = Object.keys(candidate).filter(
    (field) => !SOURCE_METADATA_FIELDS.includes(field)
  );
  if (unknownFields.length > 0) return reject('untrusted-payload-fields');
  if (!APPROVED_SOURCE_CLASSES.has(candidate.source_class)) {
    return reject('source-class-not-approved');
  }

  for (const field of ['title', 'publisher']) {
    if (!normalizeValue(candidate[field]) || normalizeValue(candidate[field]).length > 200) {
      return reject('invalid-public-metadata');
    }
  }
  if (!validIsoDate(candidate.retrieved_at)) return reject('invalid-retrieval-date');

  let url;
  try {
    url = new URL(candidate.url);
  } catch {
    return reject('invalid-public-url');
  }
  if (url.protocol !== 'https:' || url.username || url.password) {
    return reject('invalid-public-url');
  }

  return {
    accepted: true,
    reason: 'metadata-only',
    record: {
      title: normalizeValue(candidate.title),
      publisher: normalizeValue(candidate.publisher),
      url: url.href,
      retrieved_at: candidate.retrieved_at,
      source_class: candidate.source_class,
    },
  };
}

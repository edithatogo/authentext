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

const KNOWN_MULTIWORD_PLACES = new Set([
  'new zealand',
  'united kingdom',
  'united states',
  'south australia',
  'new south wales',
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

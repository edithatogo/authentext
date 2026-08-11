import fs from 'node:fs';
import path from 'node:path';

const DELIVERY_CONTRACTS = Object.freeze({
  pasted: 'text',
  file: 'summary',
  embedded: 'artifact-only',
});
const CAPABILITIES = Object.freeze(['mutate_file', 'research', 'publish']);
const MINIMUM_SAMPLE_WORDS = 40;
const LOCAL_POINTER_KINDS = new Set(['local-file', 'local-folder']);
const PUBLISHED_POINTER_KINDS = new Set(['doi', 'url', 'orcid', 'institutional-repo']);
const TEXT_CORPUS_EXTENSIONS = new Set(['.md', '.markdown', '.txt', '.text', '.rst']);
const DOI_PATTERN = /^(?:doi:)?(10\.\d{4,9}\/\S+)$/iu;
const ORCID_PATTERN = /^(?:https?:\/\/orcid\.org\/)?(\d{4}-\d{4}-\d{4}-\d{3}[\dX])$/iu;

/**
 * Resolve output shape and explicit capability grants independently.
 * @param {{mode?: string, grants?: Record<string, unknown>}} input
 * @returns {{mode: string, response_contract: string, capabilities: Record<string, boolean>}}
 */
export function resolveDeliveryMode({ mode = 'pasted', grants = {} } = {}) {
  if (!Object.hasOwn(DELIVERY_CONTRACTS, mode)) {
    throw new TypeError(`Unsupported delivery mode: ${mode}`);
  }
  return {
    mode,
    response_contract: DELIVERY_CONTRACTS[mode],
    capabilities: Object.fromEntries(
      CAPABILITIES.map((capability) => [capability, grants[capability] === true])
    ),
  };
}

function wordsIn(text) {
  return text.match(/[\p{L}\p{N}]+(?:['’][\p{L}]+)*/gu) ?? [];
}

function mean(values) {
  if (values.length === 0) return 0;
  return Number((values.reduce((total, value) => total + value, 0) / values.length).toFixed(2));
}

/**
 * Build a bounded voice profile from observable features of a user-supplied
 * sample. It does not infer personal attributes or authorship.
 * @param {string} sample
 * @returns {Record<string, unknown>}
 */
export function calibrateVoiceSample(sample) {
  if (typeof sample !== 'string') throw new TypeError('Voice sample must be text');
  const words = wordsIn(sample);
  if (words.length < MINIMUM_SAMPLE_WORDS) {
    return {
      status: 'insufficient-sample',
      provenance: 'user-sample',
      sample_words: words.length,
      features: null,
      limitation: `Short samples under ${MINIMUM_SAMPLE_WORDS} words cannot support calibration.`,
    };
  }

  const sentences = sample
    .split(/(?<=[.!?])(?:\s+|$)/u)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  const paragraphs = sample
    .split(/\r?\n\s*\r?\n/u)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const normalizedWords = words.map((word) => word.toLocaleLowerCase());
  const firstPerson = normalizedWords.filter((word) =>
    /^(?:i|me|my|mine|we|us|our|ours)$/u.test(word)
  );
  const contractions = words.filter((word) => /['’]/u.test(word));
  const punctuation = [...new Set(sample.match(/[,:;.!?—–()-]/gu) ?? [])].sort();

  return {
    status: 'calibrated',
    provenance: 'user-sample',
    sample_words: words.length,
    features: {
      sentence_length: {
        mean: mean(sentences.map((sentence) => wordsIn(sentence).length)),
        observed_sentences: sentences.length,
      },
      vocabulary: {
        lexical_diversity: Number(
          (new Set(normalizedWords).size / normalizedWords.length).toFixed(3)
        ),
        mean_word_length: mean(words.map((word) => [...word].length)),
      },
      contractions: {
        rate: Number((contractions.length / words.length).toFixed(3)),
      },
      punctuation: { observed: punctuation },
      paragraphing: {
        paragraphs: paragraphs.length,
        mean_sentences: mean(
          paragraphs.map(
            (paragraph) =>
              paragraph.split(/(?<=[.!?])(?:\s+|$)/u).filter((sentence) => sentence.trim()).length
          )
        ),
      },
      stance:
        firstPerson.length === 0
          ? 'impersonal'
          : firstPerson.length / words.length >= 0.05
            ? 'first-person'
            : 'mixed',
    },
  };
}

function distinct(values) {
  return [...new Set(Array.isArray(values) ? values : [])];
}

function isTextCorpusFile(filePath) {
  return TEXT_CORPUS_EXTENSIONS.has(path.extname(filePath).toLocaleLowerCase());
}

function defaultReadFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function defaultListFiles(directory) {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(directory, entry.name));
}

function corpusFailure(status, limitation, provenance = 'local-corpus') {
  return {
    status,
    provenance,
    sample_words: 0,
    features: null,
    limitation,
    uploaded_to_search: false,
    search_query: null,
    sent_current_document: false,
  };
}

function classifyStringPointer(text) {
  const doi = text.match(DOI_PATTERN);
  if (doi) return { ok: true, kind: 'doi', value: doi[1] };

  const orcid = text.match(ORCID_PATTERN);
  if (orcid) return { ok: true, kind: 'orcid', value: orcid[1].toUpperCase() };

  if (/^https?:\/\//iu.test(text)) {
    if (/orcid\.org/iu.test(text)) {
      const fromUrl = text.match(/(\d{4}-\d{4}-\d{4}-\d{3}[\dX])/iu);
      if (fromUrl) return { ok: true, kind: 'orcid', value: fromUrl[1].toUpperCase() };
    }
    if (/handle\.net|hdl\.handle\.net|\/handle\/|repository|eprints?/iu.test(text)) {
      return { ok: true, kind: 'institutional-repo', value: text };
    }
    return { ok: true, kind: 'url', value: text };
  }

  return { ok: true, kind: 'local-file', path: text };
}

/**
 * Classify an explicit corpus pointer. A missing pointer is not a license to
 * search a disk or inbox.
 * @param {unknown} input
 * @returns {{ok: true, kind: string, path?: string, value?: string}|{ok: false, reason: string}}
 */
export function parseCorpusPointer(input) {
  if (input === null || input === undefined || input === '') {
    return { ok: false, reason: 'An explicit corpus pointer is required.' };
  }
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) return { ok: false, reason: 'An explicit corpus pointer is required.' };
    return classifyStringPointer(trimmed);
  }
  if (typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, reason: 'An explicit corpus pointer is required.' };
  }

  const kind = typeof input.kind === 'string' ? input.kind : '';
  const pointerValue =
    typeof input.value === 'string'
      ? input.value
      : typeof input.path === 'string'
        ? input.path
        : typeof input.id === 'string'
          ? input.id
          : '';
  if (!pointerValue.trim()) {
    return { ok: false, reason: 'Unsupported or incomplete corpus pointer.' };
  }
  if (LOCAL_POINTER_KINDS.has(kind)) {
    return { ok: true, kind, path: pointerValue };
  }
  if (PUBLISHED_POINTER_KINDS.has(kind)) {
    return { ok: true, kind, value: pointerValue };
  }
  return { ok: false, reason: 'Unsupported or incomplete corpus pointer.' };
}

function publishedIdentifier(parsed) {
  return parsed.value ?? parsed.path;
}

/**
 * Fetch public metadata for a named published-work pointer. The query is the
 * identifier only. The current document is never sent. Full text requires a
 * separate grant.
 * @param {{
 *   pointer?: unknown,
 *   consent?: boolean,
 *   fullTextGrant?: boolean,
 *   fetchMetadata?: (query: {kind: string, identifier: string}) => Record<string, unknown>,
 *   fetchFullText?: (query: {kind: string, identifier: string}) => string,
 *   currentDocument?: string,
 * }} [input]
 * @returns {Record<string, unknown>}
 */
export function ingestPublishedWork({
  pointer,
  consent = false,
  fullTextGrant = false,
  fetchMetadata,
  fetchFullText,
  currentDocument,
} = {}) {
  const parsed = parseCorpusPointer(pointer);
  if (!parsed.ok) {
    return corpusFailure(
      parsed.reason.includes('Unsupported') ? 'unsupported-pointer' : 'missing-pointer',
      parsed.reason,
      'published-work'
    );
  }
  if (!PUBLISHED_POINTER_KINDS.has(parsed.kind)) {
    return corpusFailure(
      'not-published',
      'Published intake accepts a DOI, URL, ORCID, or institutional-repo identifier.',
      'published-work'
    );
  }
  if (consent !== true) {
    return corpusFailure(
      'consent-required',
      'Published work is fetched only after the user grants consent.',
      'published-work'
    );
  }

  const query = { kind: parsed.kind, identifier: publishedIdentifier(parsed) };
  if (
    typeof currentDocument === 'string' &&
    currentDocument &&
    JSON.stringify(query).includes(currentDocument)
  ) {
    return corpusFailure(
      'unsafe-query',
      'The current document must not appear in a published-work query.',
      'published-work'
    );
  }

  let metadata = null;
  if (typeof fetchMetadata === 'function') {
    metadata = fetchMetadata(query);
  }

  if (fullTextGrant === true && typeof fetchFullText === 'function') {
    const text = fetchFullText(query);
    if (typeof text !== 'string') {
      return {
        ...corpusFailure('unreadable', 'The public full text could not be read.', 'published-work'),
        query,
        metadata,
      };
    }
    const profile = calibrateVoiceSample(text);
    return {
      ...profile,
      provenance: 'published-work',
      query,
      metadata,
      uploaded_to_search: false,
      search_query: null,
      sent_current_document: false,
    };
  }

  return {
    status: 'metadata-only',
    provenance: 'published-work',
    features: null,
    query,
    metadata,
    uploaded_to_search: false,
    search_query: null,
    sent_current_document: false,
    limitation:
      'Public metadata was fetched. Voice calibration needs the public full text, and that requires a separate grant.',
  };
}

/**
 * Build a voice profile from a named local file or folder. Consent is required
 * before any read. The feature record matches a pasted sample of the same text.
 * @param {{
 *   pointer?: unknown,
 *   consent?: boolean,
 *   readFile?: (filePath: string) => string,
 *   listFiles?: (directory: string) => string[],
 * }} [input]
 * @returns {Record<string, unknown>}
 */
export function calibrateLocalCorpus({
  pointer,
  consent = false,
  readFile = defaultReadFile,
  listFiles = defaultListFiles,
} = {}) {
  const parsed = parseCorpusPointer(pointer);
  if (!parsed.ok) {
    return corpusFailure(
      parsed.reason.includes('Unsupported') ? 'unsupported-pointer' : 'missing-pointer',
      parsed.reason
    );
  }
  if (!LOCAL_POINTER_KINDS.has(parsed.kind)) {
    return corpusFailure(
      'unsupported-pointer',
      'Local calibration accepts only a named file or folder.'
    );
  }
  if (consent !== true) {
    return corpusFailure(
      'consent-required',
      'Local corpus files are read only after the user grants consent.'
    );
  }

  try {
    let text;
    if (parsed.kind === 'local-file') {
      text = readFile(parsed.path);
    } else {
      const files = listFiles(parsed.path)
        .filter((filePath) => isTextCorpusFile(filePath))
        .sort((left, right) => left.localeCompare(right));
      if (files.length === 0) {
        return corpusFailure('unreadable', 'The local folder has no readable text files.');
      }
      text = files.map((filePath) => readFile(filePath)).join('\n\n');
    }
    if (typeof text !== 'string') {
      return corpusFailure('unreadable', 'The local corpus is unreadable.');
    }

    const profile = calibrateVoiceSample(text);
    return {
      ...profile,
      provenance: 'local-corpus',
      uploaded_to_search: false,
      search_query: null,
    };
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'cannot read';
    return corpusFailure('unreadable', `The local corpus is unreadable: ${detail}.`);
  }
}

/**
 * Email and other host plugins stay off unless the user names the plugin and
 * the host has granted it. This is a gate, not a mail client.
 * @param {{plugin?: string, namedGrant?: string, hostGranted?: boolean}} [input]
 * @returns {{enabled: boolean, reason: string, plugin: string|null}}
 */
export function resolvePluginSource({ plugin, namedGrant, hostGranted = false } = {}) {
  if (typeof plugin !== 'string' || !plugin.trim()) {
    return { enabled: false, reason: 'plugin-off-by-default', plugin: null };
  }
  if (hostGranted !== true) {
    return { enabled: false, reason: 'host-not-granted', plugin };
  }
  if (namedGrant !== plugin) {
    return { enabled: false, reason: 'named-grant-required', plugin };
  }
  return { enabled: true, reason: 'granted', plugin };
}

/**
 * Thin adapter for a named host plugin. Callers supply readItems. Authentext
 * does not open a mailbox or scrape an inbox.
 * @param {{name: string, readItems?: () => unknown[]}} spec
 */
export function createPluginAdapter(spec = {}) {
  const name = typeof spec.name === 'string' ? spec.name : '';
  return {
    name,
    collect({ grant, hostGranted = false } = {}) {
      const gate = resolvePluginSource({
        plugin: name,
        namedGrant: grant,
        hostGranted,
      });
      if (!gate.enabled) {
        return { ...gate, items: [] };
      }
      if (typeof spec.readItems !== 'function') {
        return { ...gate, items: [], reason: 'reader-not-provided' };
      }
      return { ...gate, items: spec.readItems() };
    },
  };
}

/**
 * Select no more than one question whose answer changes authority, operation,
 * routing, or safety. Non-material gaps receive conservative assumptions.
 * @param {Record<string, unknown>} intake
 * @returns {{question: Record<string, string>|null, remaining_material_questions: number, assumptions: Record<string, string>}}
 */
export function selectMaterialQuestion(intake = {}) {
  const questions = [];
  const operationCandidates = distinct(intake.operation_candidates);
  const archetypeCandidates = distinct(intake.archetype_candidates);

  if (intake.requires_current_guidance === true && intake.research_permission === 'not_requested') {
    questions.push({
      field: 'research_permission',
      text: 'May I search current guidance using nonsensitive document-profile metadata?',
      reason: 'Current guidance is material, but research authority has not been granted.',
    });
  }
  const parsedPointer = intake.corpus_pointer
    ? parseCorpusPointer(intake.corpus_pointer)
    : { ok: false };
  if (
    parsedPointer.ok &&
    LOCAL_POINTER_KINDS.has(parsedPointer.kind) &&
    intake.corpus_consent !== true
  ) {
    questions.push({
      field: 'corpus_consent',
      text: 'May I read the named local files to build a voice profile? The text stays local and will not be uploaded to search.',
      reason: 'A corpus pointer was named, but local-read consent has not been granted.',
    });
  }
  if (
    parsedPointer.ok &&
    PUBLISHED_POINTER_KINDS.has(parsedPointer.kind) &&
    intake.published_consent !== true
  ) {
    questions.push({
      field: 'published_consent',
      text: 'May I fetch public metadata for the named DOI, URL, ORCID, or repository record? I will not send the current document.',
      reason: 'A published-work pointer was named, but fetch consent has not been granted.',
    });
  }
  if (intake.plugin && intake.plugin_grant !== intake.plugin) {
    questions.push({
      field: 'plugin_grant',
      text: `May I use the named host plugin "${intake.plugin}" as a voice source? Plugins stay off until you name them and the host grants them.`,
      reason: 'A plugin was named, but it does not have a matching grant.',
    });
  }
  if (operationCandidates.length > 1) {
    questions.push({
      field: 'operation',
      text: 'Should I review or rewrite this document?',
      reason: 'The requested operation changes the output contract.',
    });
  }
  if (archetypeCandidates.length > 1) {
    questions.push({
      field: 'archetype',
      text: `Which document type best applies: ${archetypeCandidates.join(' or ')}?`,
      reason: 'The candidate document types use different routing or safety boundaries.',
    });
  }

  return {
    question: questions[0] ?? null,
    remaining_material_questions: Math.max(questions.length - 1, 0),
    assumptions: {
      audience: typeof intake.audience === 'string' ? intake.audience : 'general',
      editing_strength:
        typeof intake.editing_strength === 'string' ? intake.editing_strength : 'conservative',
      research_permission:
        typeof intake.research_permission === 'string'
          ? intake.research_permission
          : 'not_requested',
    },
  };
}

const RESTRICTED_VOICE_CLASSES = new Set(['clinical', 'legal', 'regulatory', 'submitted-academic']);

/**
 * Decide whether a calibrated sample may override a style rule, and whether a
 * corpus fact may enter the current draft. Never-add, never-lose, and
 * protected spans still win.
 * @param {{
 *   sampleUsesEmDash?: boolean,
 *   styleRule?: string,
 *   corpusFact?: string,
 *   currentSourceSupports?: boolean,
 *   userAsked?: boolean,
 *   protectedSpan?: boolean,
 *   neverAddConflict?: boolean,
 *   neverLoseConflict?: boolean,
 *   documentClass?: string,
 * }} [input]
 */
export function resolveVoicePrecedence({
  sampleUsesEmDash = false,
  styleRule = 'dash-ban',
  corpusFact,
  currentSourceSupports = false,
  userAsked = false,
  protectedSpan = false,
  neverAddConflict = false,
  neverLoseConflict = false,
  documentClass,
} = {}) {
  const styleOverride =
    styleRule === 'dash-ban' && sampleUsesEmDash === true ? 'keep-sample-dash' : 'apply-style-rule';

  let insert = false;
  let insertReason = 'corpus-fact-not-requested';
  if (protectedSpan === true) {
    insertReason = 'protected-span';
  } else if (neverAddConflict === true) {
    insertReason = 'never-add';
  } else if (neverLoseConflict === true) {
    insertReason = 'never-lose';
  } else if (corpusFact && userAsked === true && currentSourceSupports === true) {
    insert = true;
    insertReason = 'user-asked-and-source-supports';
  } else if (corpusFact && userAsked === true && currentSourceSupports !== true) {
    insertReason = 'current-source-lacks-claim';
  } else if (corpusFact) {
    insertReason = 'corpus-does-not-license-fabrication';
  }

  return {
    style_override: styleOverride,
    may_insert_corpus_fact: insert,
    insert_reason: insertReason,
    skip_personality:
      typeof documentClass === 'string' && RESTRICTED_VOICE_CLASSES.has(documentClass),
    skip_first_person_texture:
      typeof documentClass === 'string' && RESTRICTED_VOICE_CLASSES.has(documentClass),
  };
}

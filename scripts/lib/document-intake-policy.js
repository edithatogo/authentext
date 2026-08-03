const DELIVERY_CONTRACTS = Object.freeze({
  pasted: 'text',
  file: 'summary',
  embedded: 'artifact-only',
});
const CAPABILITIES = Object.freeze(['mutate_file', 'research', 'publish']);
const MINIMUM_SAMPLE_WORDS = 40;

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

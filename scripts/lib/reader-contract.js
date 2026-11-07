import { extractProtectedSpans } from './ast-shield.js';
import { sentencesWithLines } from './epistemic-discourse.js';

// Reader-fit findings are contextual review prompts, never authorship evidence.
const IT_TERMS = new Set([
  'pipeline',
  'pipelines',
  'orchestrate',
  'orchestration',
  'stack',
  'payload',
  'artifact',
  'artifacts',
  'upstream',
  'downstream',
  'bandwidth',
  'runtime',
  'deploy',
  'deployment',
  'ingest',
  'observability',
  'telemetry',
]);
const AUDIENCES = ['unspecified', 'general', 'mixed', 'specialist'];
const MODES = ['unknown', 'human', 'single-pass', 'iterative', 'retrieval-assisted', 'multi-agent'];
const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
function closed(value, keys, label) {
  if (!object(value) || Object.keys(value).some((key) => !keys.includes(key)))
    throw new TypeError('Invalid reader contract ' + label);
}
function strings(value, label) {
  if (
    !Array.isArray(value) ||
    value.length > 200 ||
    value.some((s) => typeof s !== 'string' || !s.trim() || s.length > 1000)
  )
    throw new TypeError('Invalid reader contract ' + label);
}
function integer(value, label, minimum = 0) {
  if (!Number.isSafeInteger(value) || value < minimum || value > 10000000)
    throw new TypeError('Invalid length word constraint: ' + label);
}
export function validateReaderContract(contract) {
  closed(
    contract,
    [
      'schemaVersion',
      'audience',
      'domain',
      'productionMode',
      'allowedTerms',
      'contextNeeds',
      'length',
    ],
    'fields'
  );
  if (contract.schemaVersion !== '1.0.0') throw new TypeError('Invalid reader contract version');
  if (contract.audience !== undefined && !AUDIENCES.includes(contract.audience))
    throw new TypeError('Invalid reader contract audience');
  if (contract.productionMode !== undefined && !MODES.includes(contract.productionMode))
    throw new TypeError('Invalid reader contract production mode');
  if (
    contract.domain !== undefined &&
    (typeof contract.domain !== 'string' || contract.domain.length > 80)
  )
    throw new TypeError('Invalid reader contract domain');
  for (const name of ['allowedTerms', 'contextNeeds'])
    if (contract[name] !== undefined) strings(contract[name], name);
  if (contract.length === undefined) return;
  const length = contract.length;
  const keys = {
    preserve: ['toleranceFraction'],
    maximum: ['maxWords'],
    range: ['minWords', 'maxWords'],
    target: ['targetWords', 'toleranceWords'],
    unconstrained: [],
  };
  if (!object(length) || typeof length.mode !== 'string' || !Object.hasOwn(keys, length.mode))
    throw new TypeError('Invalid length mode');
  closed(length, ['mode', 'severity', ...keys[length.mode]], 'length');
  if (length.severity !== undefined && !['warning', 'error'].includes(length.severity))
    throw new TypeError('Invalid length severity');
  if (length.mode === 'maximum' || length.mode === 'range') integer(length.maxWords, 'maxWords', 1);
  if (length.mode === 'range') {
    integer(length.minWords, 'minWords');
    if (length.minWords > length.maxWords) throw new TypeError('Conflicting length word limits');
  }
  if (length.mode === 'target') {
    integer(length.targetWords, 'targetWords', 1);
    if (length.toleranceWords !== undefined) integer(length.toleranceWords, 'toleranceWords');
  }
  if (
    length.toleranceFraction !== undefined &&
    (!Number.isFinite(length.toleranceFraction) ||
      length.toleranceFraction < 0 ||
      length.toleranceFraction > 1)
  )
    throw new TypeError('Invalid length tolerance');
}

// A deterministic convention, not a venue's native word counter. All supplied
// sections count; callers must explicitly select a body/section when required.
export function countContractWords(text) {
  return (text.match(/\S+/gu) ?? []).filter((part) => /[\p{L}\p{N}]/u.test(part)).length;
}
function measureLength(original, rewrite, settings = { mode: 'preserve' }) {
  const sourceWords = countContractWords(original),
    outputWords = countContractWords(rewrite);
  const severity = settings.severity ?? (settings.mode === 'preserve' ? 'warning' : 'error');
  let minWords = 0,
    maxWords = null;
  if (settings.mode === 'preserve') {
    const tolerance = settings.toleranceFraction ?? 0.1;
    minWords = Math.floor(sourceWords * (1 - tolerance));
    maxWords = Math.ceil(sourceWords * (1 + tolerance));
  } else if (settings.mode === 'maximum' || settings.mode === 'range') {
    minWords = settings.minWords ?? 0;
    maxWords = settings.maxWords;
  } else if (settings.mode === 'target') {
    const tolerance = settings.toleranceWords ?? Math.ceil(settings.targetWords * 0.1);
    minWords = Math.max(0, settings.targetWords - tolerance);
    maxWords = settings.targetWords + tolerance;
  }
  const withinBounds = outputWords >= minWords && (maxWords === null || outputWords <= maxWords);
  return {
    mode: settings.mode,
    countScope: 'supplied-text',
    countingMethod: 'Whitespace-separated units containing a Unicode letter or digit',
    sourceWords,
    outputWords,
    deltaWords: outputWords - sourceWords,
    ratio: sourceWords ? outputWords / sourceWords : null,
    minWords,
    maxWords,
    severity,
    withinBounds,
    hardFailure: !withinBounds && severity === 'error',
  };
}
function unprotectedProse(text, format) {
  let output = '',
    previous = 0;
  for (const span of extractProtectedSpans(text, format)) {
    output +=
      text.slice(previous, span.start) + text.slice(span.start, span.end).replace(/[^\r\n]/gu, ' ');
    previous = span.end;
  }
  return output + text.slice(previous);
}
export function inspectReaderContract(original, rewrite, contract, { format = 'md' } = {}) {
  validateReaderContract(contract);
  const length = measureLength(original, rewrite, contract.length);
  const findings = [];
  if (!length.withinBounds) findings.push({ code: 'LENGTH_BUDGET', severity: length.severity });
  const audience = contract.audience ?? 'unspecified';
  const productionMode = contract.productionMode ?? 'unknown';
  const allowed = new Set((contract.allowedTerms ?? []).map((s) => s.toLowerCase()));
  if (['general', 'mixed'].includes(audience) && contract.domain !== 'technical') {
    const lines = unprotectedProse(rewrite, format).split(/\r\n?|\n/u);
    lines.forEach((line, index) => {
      const terms = new Set((line.match(/[\p{L}-]+/gu) ?? []).map((s) => s.toLowerCase()));
      for (const term of terms)
        if (IT_TERMS.has(term) && !allowed.has(term))
          findings.push({
            code: 'TRANSFERRED_IT_REGISTER',
            severity: 'review',
            term,
            line: index + 1,
          });
    });
    for (const sentence of sentencesWithLines(rewrite, format)) {
      const wordCount = countContractWords(sentence.text);
      if (wordCount > 35)
        findings.push({
          code: 'LONG_SENTENCE_REVIEW',
          severity: 'review',
          wordCount,
          startLine: sentence.startLine,
          endLine: sentence.endLine,
        });
    }
  }
  const manualChecks = [
    'reader-purpose',
    'missing-background',
    'unexplained-terms-and-acronyms',
    'concept-introduction-order',
    'information-load',
    'required-claim-coverage',
    'register-fit',
  ];
  if (['iterative', 'retrieval-assisted', 'multi-agent'].includes(productionMode))
    manualChecks.push('agent-handoff-context', 'process-residue', 'cross-section-duplication');
  return {
    schemaVersion: '1.0.0',
    audience,
    productionMode,
    length,
    findings,
    contextAssessment: 'manual-review-required',
    contextRequirements: (contract.contextNeeds ?? []).length,
    manualChecks,
    qualityCertified: false,
  };
}

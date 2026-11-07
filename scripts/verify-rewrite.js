#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inspectReaderContract } from './lib/reader-contract.js';
import { readUtf8 } from './lib/runtime-io.js';
import { inspectDiscourse } from './lib/epistemic-discourse.js';
import { metrics, invariants, multisetDiff, parseArgs } from './lib/frontier-text.js';

const categories = {
  codeBlocks: 'modifiedCodeBlocks',
  inlineCode: 'modifiedInlineCode',
  markdownLinks: 'modifiedMarkdownLinks',
  urls: 'modifiedUrls',
  dois: 'missingDois',
  citations: 'missingCitations',
  numbers: 'missingNumbers',
  pValues: 'modifiedPValues',
  quantities: 'modifiedQuantities',
  currencies: 'modifiedCurrencies',
  dates: 'modifiedDates',
};
export function inspectRewrite(
  original,
  rewrite,
  {
    mode = 'standard',
    profile = null,
    allowCodeEdits = false,
    allowModalityShift = false,
    format = 'md',
    readerContract = null,
  } = {}
) {
  if (!['light', 'standard', 'deep'].includes(mode)) throw new Error('Invalid mode');
  if (profile !== null && profile.schemaVersion !== '1.0.0')
    throw new Error('Invalid profile version');
  const old = invariants(original),
    fresh = invariants(rewrite);
  const originalMetrics = metrics(original),
    rewriteMetrics = metrics(rewrite);
  const checks = { missingCitations: [], missingNumbers: [], modifiedCodeBlocks: [] };
  let passed = true;
  for (const [category, name] of Object.entries(categories)) {
    if (allowCodeEdits && ['codeBlocks', 'inlineCode'].includes(category)) continue;
    const diff = multisetDiff(old[category], fresh[category]);
    if (diff.missing.length || diff.added.length) {
      checks[name] = diff;
      passed = false;
    }
  }
  const discourse = inspectDiscourse(original, rewrite, { format });
  const permitted = new Set(['hedge-lost', 'certainty-increased', 'causal-inflation']);
  const blockedDrift = discourse.epistemicDrift.some(
    (item) => !allowModalityShift || item.reasons.some((reason) => !permitted.has(reason))
  );
  if (mode !== 'light' && (blockedDrift || discourse.polarityInversion.length > 0)) passed = false;
  const readerFit =
    readerContract === null
      ? null
      : inspectReaderContract(original, rewrite, readerContract, { format });
  if (readerFit?.length.hardFailure) passed = false;
  const mechanicallyPassed = passed;
  const inconclusive = discourse.alignmentIssues.length > 0;
  if (mode !== 'light' && inconclusive) passed = false;
  const verificationStatus = !mechanicallyPassed
    ? 'blocked'
    : inconclusive
      ? 'inconclusive'
      : 'checks-passed';
  const warnings = [];
  if (inconclusive)
    warnings.push({
      code: 'INCONCLUSIVE_ALIGNMENT',
      message: 'Unaligned claims require contextual review; this is not proof of a changed claim',
    });
  if (
    mode !== 'light' &&
    rewriteMetrics.sentenceCount >= 4 &&
    rewriteMetrics.sentenceLength.cv < 0.45 &&
    (profile?.metrics?.sentenceLength?.cv ?? 1) >= 0.45
  ) {
    warnings.push({
      code: 'LOW_CV',
      message:
        'Sentence-length CV is below a heuristic review threshold; this is not an AI detector',
    });
  }
  const cap =
    profile?.constraints?.emDashPer1000Max ?? profile?.metrics?.punctuationPer1000?.emDash ?? 0;
  if (rewriteMetrics.punctuationPer1000.emDash > cap + 1e-9) {
    warnings.push({
      code: 'EM_DASH_DENSITY',
      cap,
      actual: rewriteMetrics.punctuationPer1000.emDash,
    });
  }
  warnings.push({
    code: 'SEMANTIC_REVIEW_REQUIRED',
    message:
      'Protected-literal checks do not prove claim equivalence, factual support, or appropriate negation and scope',
  });
  return {
    schemaVersion: '1.0.0',
    ...discourse,
    readerFit,
    verificationStatus,
    overrides: { allowCodeEdits, allowModalityShift },
    passed,
    mode,
    stylometry: {
      original: originalMetrics,
      rewrite: rewriteMetrics,
      deltaCV: rewriteMetrics.sentenceLength.cv - originalMetrics.sentenceLength.cv,
    },
    invariants: checks,
    warnings,
  };
}
function readMetadata(file) {
  const text = readUtf8(file);
  try {
    return JSON.parse(text);
  } catch {
    throw new TypeError('Metadata must be valid JSON');
  }
}
function main() {
  try {
    const a = parseArgs(process.argv.slice(2));
    if (!a.original || !a.rewrite) throw new Error('Requires --original and --rewrite');
    const profile = a.profile ? readMetadata(a.profile) : null;
    const result = inspectRewrite(readUtf8(a.original), readUtf8(a.rewrite), {
      mode: a.mode || 'standard',
      profile,
      readerContract: a['reader-contract'] ? readMetadata(a['reader-contract']) : null,
      allowCodeEdits: a['allow-code-edits'] === true,
      allowModalityShift: a['allow-modality-shift'] === true,
      format:
        a.format ||
        (['md', 'qmd', 'rmd', 'typ', 'tex'].includes(
          path.extname(a.original).slice(1).toLowerCase()
        )
          ? path.extname(a.original).slice(1).toLowerCase()
          : 'md'),
    });
    process.stdout.write(JSON.stringify(result, null, a.json ? 0 : 2) + '\n');
    if (!result.passed) process.exitCode = 1;
  } catch (e) {
    process.stderr.write('verify-rewrite: ' + e.message + '\n');
    process.exitCode = 2;
  }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();

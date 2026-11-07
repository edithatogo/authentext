#!/usr/bin/env node
import fs from 'node:fs';
import { analyzeDiscourse } from './lib/epistemic-discourse.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { metrics, invariants, multisetDiff, parseArgs, readText } from './lib/frontier-text.js';

const categories = {
  codeBlocks: 'modifiedCodeBlocks',
  inlineCode: 'modifiedInlineCode',
  markdownLinks: 'modifiedMarkdownLinks',
  urls: 'modifiedUrls',
  dois: 'missingDois',
  citations: 'missingCitations',
  numbers: 'missingNumbers',
  pValues: 'modifiedPValues',
  currencies: 'modifiedCurrencies',
  units: 'modifiedUnits',
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
  } = {}
) {
  if (!['light', 'standard', 'deep'].includes(mode)) throw new Error('Invalid mode');
  if (profile !== null && profile.schemaVersion !== '1.0.0')
    throw new Error('Invalid profile version');
  for (const value of [
    profile?.constraints?.emDashPer1000Max,
    profile?.metrics?.punctuationPer1000?.emDash,
    profile?.metrics?.sentenceLength?.cv,
  ]) {
    if (value !== undefined && (typeof value !== 'number' || !Number.isFinite(value) || value < 0))
      throw new Error('Invalid numeric profile constraint');
  }
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
  const warnings = [];
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
    if (profile?.constraints?.emDashPer1000Max !== undefined) passed = false;
  }
  warnings.push({
    code: 'SEMANTIC_REVIEW_REQUIRED',
    message:
      'Protected-literal checks do not prove claim equivalence, factual support, or appropriate negation and scope',
  });
  const discourse = analyzeDiscourse(original, rewrite, { format });
  if (mode !== 'light') {
    if (
      (!allowModalityShift && discourse.epistemicDrift.length) ||
      discourse.polarityInversion.length ||
      discourse.alignmentUncertain.length
    )
      passed = false;
  }
  return {
    ...discourse,
    overrides: { allowCodeEdits, allowModalityShift },
    schemaVersion: '1.0.0',
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
function main() {
  try {
    const a = parseArgs(process.argv.slice(2), [
      'original',
      'rewrite',
      'profile',
      'mode',
      'json',
      'allow-code-edits',
      'allow-modality-shift',
      'format',
    ]);
    if (!a.original || !a.rewrite) throw new Error('Requires --original and --rewrite');
    const profile = a.profile ? JSON.parse(fs.readFileSync(a.profile, 'utf8')) : null;
    const result = inspectRewrite(readText(a.original), readText(a.rewrite), {
      mode: a.mode || 'standard',
      profile,
      allowCodeEdits: a['allow-code-edits'] === true,
      allowModalityShift: a['allow-modality-shift'] === true,
      format:
        a.format ||
        (['qmd', 'rmd', 'typ', 'tex'].includes(path.extname(a.original).slice(1).toLowerCase())
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

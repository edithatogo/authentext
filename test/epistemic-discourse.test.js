import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { inspectRewrite } from '../scripts/verify-rewrite.js';

import * as discourse from '../scripts/lib/epistemic-discourse.js';
const inspect = (...args) => {
  assert.equal(
    typeof discourse?.inspectDiscourse,
    'function',
    'Discourse checker is not implemented'
  );
  return discourse.inspectDiscourse(...args);
};

test('associative scoped claim cannot become an unqualified causal claim', () => {
  const a = 'Exposure A was associated with outcome B in this cohort.';
  const b = 'Exposure A causes outcome B.';
  const result = inspect(a, b);
  assert.ok(result.epistemicDrift.length > 0);
  assert.ok(result.epistemicDrift.some((d) => d.reasons.includes('scope-lost')));
  assert.equal(inspectRewrite(a, b).passed, false);
});

test('hedge deletion is detected even without a strong assertion verb', () => {
  const result = inspect('Exposure may increase patient risk.', 'Exposure increases patient risk.');
  assert.ok(result.epistemicDrift.some((d) => d.reasons.includes('hedge-lost')));
});

test('retained hedges and negated causal verbs are not ranked as causal certainty', () => {
  for (const [a, b] of [
    ['Exposure may cause patient harm.', 'Patient harm may result from exposure.'],
    ['Exposure does not prove patient harm.', 'Patient harm is not proven by exposure.'],
    [
      'In this cohort, exposure was associated with harm.',
      'Exposure was associated with harm in this cohort.',
    ],
  ]) {
    assert.deepEqual(inspect(a, b).epistemicDrift, [], a);
  }
});

test('negation and deontic obligation changes are separately identified', () => {
  assert.ok(
    inspect(
      'Exposure did not increase patient risk.',
      'Exposure increased patient risk.'
    ).epistemicDrift.some((d) => d.reasons.includes('negation-changed'))
  );
  assert.ok(
    inspect(
      'The board must approve the purchase.',
      'The board may approve the purchase.'
    ).epistemicDrift.some((d) => d.reasons.includes('obligation-changed'))
  );
});

test('concession inversion is detected and blocks standard verification', () => {
  const a = 'Although the intervention reduced wait times, total costs increased.';
  const b = 'Although total costs increased, the intervention reduced wait times.';
  assert.equal(inspect(a, b).polarityInversion.length, 1);
  assert.equal(inspectRewrite(a, b).passed, false);
});

test('a sentence split retaining the concession direction passes', () => {
  const a = 'Although the intervention reduced wait times, total costs increased.';
  const b = 'The intervention reduced wait times. However, total costs increased.';
  assert.deepEqual(inspect(a, b).polarityInversion, []);
});

test('contrast deletion is flagged without requiring inverted word order', () => {
  const a = 'Although the intervention reduced wait times, total costs increased.';
  const b = 'The intervention reduced wait times and total costs increased.';
  assert.ok(inspect(a, b).polarityInversion.some((d) => d.reason === 'contrast-lost'));
});

test('modality override is explicit and does not override citations or polarity', () => {
  const a = 'Exposure A may cause outcome B [12].';
  const b = 'Exposure A causes outcome B [12].';
  const override = inspectRewrite(a, b, { allowModalityShift: true });
  assert.equal(override.passed, true);
  assert.equal(override.overrides.allowModalityShift, true);
  assert.equal(
    inspectRewrite(a, b.replace('[12]', '[13]'), { allowModalityShift: true }).passed,
    false
  );
  const x = 'Although the intervention reduced wait times, total costs increased.';
  const y = 'Although total costs increased, the intervention reduced wait times.';
  assert.equal(inspectRewrite(x, y, { allowModalityShift: true }).passed, false);
});

test('six uniform sentences produce a line-accurate advisory only', () => {
  const source = [
    'The team reviewed clinical information carefully.',
    'The team reviewed clinical information carefully.',
    'The team reviewed clinical information carefully.',
    'The team reviewed clinical information carefully.',
    'The team reviewed clinical information carefully.',
    'The team reviewed clinical information carefully.',
  ].join('\n');
  const result = inspect(source, source);
  assert.ok(result.flatEntropySpans.some((span) => span.startLine === 1 && span.endLine === 6));
  assert.equal(inspectRewrite(source, source).passed, true);
  assert.match(result.densityMethod, /proxy/i);
});

test('line mapping excludes code blocks without shifting later prose lines', () => {
  const source = [
    '```js',
    'may causes guaranteed',
    '```',
    '',
    ...Array(6).fill('The team reviewed clinical information carefully.'),
  ].join('\n');
  const result = inspect(source, source);
  assert.ok(result.flatEntropySpans.some((span) => span.startLine === 5 && span.endLine === 10));
  assert.equal(result.epistemicDrift.length, 0);
});

test('unmatched substantive statements are reported as inconclusive, not proven equivalent', () => {
  const result = inspect(
    'The intervention may reduce patient harm.',
    'The weather was clear in the afternoon.'
  );
  assert.ok(result.alignmentIssues.length);
  assert.equal(result.semanticEquivalenceProven, false);
});

test('CLI returns exit 1 for epistemic and polarity failures', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'discourse-'));
  try {
    for (const [a, b, field] of [
      [
        'Exposure A was associated with outcome B in this cohort.',
        'Exposure A causes outcome B.',
        'epistemicDrift',
      ],
      [
        'Although the intervention reduced wait times, total costs increased.',
        'Although total costs increased, the intervention reduced wait times.',
        'polarityInversion',
      ],
    ]) {
      const original = path.join(temp, 'source.md'),
        rewrite = path.join(temp, 'rewrite.md');
      fs.writeFileSync(original, a);
      fs.writeFileSync(rewrite, b);
      const run = spawnSync(
        process.execPath,
        ['scripts/verify-rewrite.js', '--original', original, '--rewrite', rewrite, '--json'],
        { encoding: 'utf8' }
      );
      assert.equal(run.status, 1, run.stderr);
      assert.ok(JSON.parse(run.stdout)[field].length);
    }
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});

test('adding a new mandatory obligation is blocked even with a modality override', () => {
  const original = 'Clinicians discuss the treatment options with patients.';
  const rewrite = 'Clinicians must discuss the treatment options with patients.';
  const report = inspectRewrite(original, rewrite, { allowModalityShift: true });
  assert.equal(report.passed, false);
  assert.ok(report.epistemicDrift.some((item) => item.reasons.includes('obligation-changed')));
});

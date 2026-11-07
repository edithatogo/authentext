import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { inspectRewrite } from '../scripts/verify-rewrite.js';

const api = () => import('../scripts/lib/epistemic-discourse.js');

test('associative evidence cannot be promoted to causation or lose cohort scope', () => {
  const report = inspectRewrite(
    'Exposure A was associated with outcome B in this cohort.',
    'Exposure A causes outcome B.'
  );
  assert.equal(report.passed, false);
  assert.ok(report.epistemicDrift.length);
  assert.ok(report.epistemicDrift.some((x) => x.reasons.includes('scope-removed')));
});

test('concession and matrix-clause roles cannot be inverted', () => {
  const report = inspectRewrite(
    'Although the intervention reduced wait times, total costs increased.',
    'Although total costs increased, the intervention reduced wait times.'
  );
  assert.equal(report.passed, false);
  assert.ok(report.polarityInversion.length);
});

test('the modality override is explicit and cannot bypass citation or polarity drift', () => {
  const original = 'Exposure A may improve outcome B [12].';
  const revised = 'Exposure A improves outcome B [12].';
  assert.equal(inspectRewrite(original, revised).passed, false);
  const allowed = inspectRewrite(original, revised, { allowModalityShift: true });
  assert.equal(allowed.passed, true);
  assert.equal(allowed.overrides.allowModalityShift, true);
  assert.equal(
    inspectRewrite(original, revised.replace('[12]', '[13]'), { allowModalityShift: true }).passed,
    false
  );
});

test('unchanged technical prose and equivalent hedged cause wording are not escalated', () => {
  const original = 'Exposure may cause nausea in this cohort.';
  assert.equal(inspectRewrite(original, original).passed, true);
  assert.equal(
    inspectRewrite(original, 'Exposure might cause nausea in this cohort.').passed,
    true
  );
});

test('hedge stripping in a split claim is detected even when another sentence keeps may', () => {
  const report = inspectRewrite(
    'Treatment may improve sleep and concentration.',
    'Treatment may improve sleep. Treatment improves concentration.'
  );
  assert.equal(report.passed, false);
  assert.ok(report.epistemicDrift.length);
});

test('negation and deontic force are independent preservation dimensions', () => {
  assert.equal(
    inspectRewrite('Exposure does not cause nausea.', 'Exposure causes nausea.').passed,
    false
  );
  assert.equal(
    inspectRewrite(
      'Clinicians must record adverse events.',
      'Clinicians may record adverse events.'
    ).passed,
    false
  );
});

test('scope without a tier increase is still protected', () => {
  const report = inspectRewrite(
    'The estimated treatment effect applies in this cohort.',
    'The estimated treatment effect applies.'
  );
  assert.equal(report.passed, false);
  assert.ok(report.epistemicDrift.some((x) => x.reasons.includes('scope-removed')));
});

test('a meaning-bearing contrast marker cannot silently disappear', () => {
  const original = 'Although the intervention reduced wait times, total costs increased.';
  const revised = 'The intervention reduced wait times and total costs increased.';
  assert.equal(inspectRewrite(original, revised).passed, false);
});

test('uncertain alignment is reported, not called verified semantic equivalence', async () => {
  const { analyzeDiscourse } = await api();
  const report = analyzeDiscourse('Treatment may improve appetite.', 'Nutrition is better.');
  assert.ok(report.alignmentUncertain.length);
});

test('six uniform sentences trigger a line-accurate density warning, not a detector score', async () => {
  const { analyzeDiscourse } = await api();
  const source =
    '\n\n' +
    [
      'Careful researchers measured relevant clinical outcomes.',
      'Careful clinicians recorded relevant clinical symptoms.',
      'Careful nurses recorded relevant clinical observations.',
      'Careful analysts assessed relevant clinical differences.',
      'Careful reviewers assessed relevant clinical findings.',
      'Careful writers described relevant clinical conclusions.',
    ].join('\n');
  const report = analyzeDiscourse(source, source);
  assert.ok(report.flatEntropySpans.length);
  assert.equal(report.flatEntropySpans[0].startLine, 3);
  assert.equal(report.flatEntropySpans[0].endLine, 8);
  assert.equal(report.densityMethod, 'lexical-density-proxy');
});

test('sentence spans preserve source offsets and ignore decimals and familiar abbreviations', async () => {
  const { sentenceSpans } = await api();
  const source = 'Dr. Smith reported p = 0.004.\nThe next result differed.';
  const spans = sentenceSpans(source);
  assert.equal(spans.length, 2);
  assert.equal(spans[1].startLine, 2);
  for (const span of spans) assert.equal(source.slice(span.start, span.end), span.text);
});

test('code and math are not treated as editorial claims or flat prose', async () => {
  const { analyzeDiscourse } = await api();
  const source = '~~~js\nconst must = "causes";\n~~~\n\nOrdinary result.';
  const report = analyzeDiscourse(source, source);
  assert.deepEqual(report.epistemicDrift, []);
  assert.deepEqual(report.flatEntropySpans, []);
});

test('CLI returns status 1 and named discourse telemetry for user acceptance examples', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'discourse-cli-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  for (const [before, after, field] of [
    [
      'Exposure A was associated with outcome B in this cohort',
      'Exposure A causes outcome B',
      'epistemicDrift',
    ],
    [
      'Although the intervention reduced wait times, total costs increased',
      'Although total costs increased, the intervention reduced wait times',
      'polarityInversion',
    ],
  ]) {
    const original = path.join(dir, 'source.md'),
      rewrite = path.join(dir, 'rewrite.md');
    fs.writeFileSync(original, before);
    fs.writeFileSync(rewrite, after);
    const run = spawnSync(
      process.execPath,
      ['scripts/verify-rewrite.js', '--original', original, '--rewrite', rewrite, '--json'],
      { encoding: 'utf8' }
    );
    assert.equal(run.status, 1, run.stderr);
    assert.ok(JSON.parse(run.stdout)[field].length);
  }
});

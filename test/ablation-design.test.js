import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

async function subject() {
  const uri = new URL('../evaluation/ablation-design.js', import.meta.url);
  assert.ok(fs.existsSync(uri), 'A governed ablation design must exist');
  return import(uri.href);
}
const patterns = Array.from({ length: 40 }, (_, i) => ({ id: i + 1, content: `Pattern ${i + 1}` }));

test('every ablation retains a fixed preservation contract and adds zero-style control', async () => {
  const { buildVariants, SAFETY_CONTRACT } = await subject();
  const variants = buildVariants(patterns);
  assert.equal(variants.length, 88);
  assert.equal(new Set(variants.map((row) => row.id)).size, 88);
  assert.ok(variants.every((row) => row.prompt.startsWith(SAFETY_CONTRACT)));
  assert.deepEqual(variants.find((row) => row.id === 'no-style').activePatterns, []);
  assert.equal(variants.find((row) => row.id === 'no-style').prompt, SAFETY_CONTRACT);
  assert.equal(variants.find((row) => row.id === 'without-27').activePatterns.includes(27), false);
  assert.match(
    variants.find((row) => row.id === 'without-27').prompt,
    /Preserve citations, numbers, units, code/u
  );
});

test('pattern input is complete, ordered and never silently duplicated', async () => {
  const { buildVariants } = await subject();
  for (const invalid of [patterns.slice(1), [...patterns.slice(0, 39), patterns[0]], [{ id: 1 }]]) {
    assert.throws(() => buildVariants(invalid), /pattern/iu);
  }
});

test('dry-run plus provider is rejected before invocation', async () => {
  const { assertExecutionMode } = await subject();
  assert.throws(() => assertExecutionMode({ dryRun: true, provider: 'runner.js' }), /dry-run/iu);
  assert.throws(() => assertExecutionMode({ dryRun: false }), /provider/iu);
  assert.throws(() => assertExecutionMode({ provider: 'runner.js' }), /input/iu);
  assert.doesNotThrow(() => assertExecutionMode({ dryRun: true }));
  assert.doesNotThrow(() => assertExecutionMode({ provider: 'runner.js', input: 'document.md' }));
});

test('attempt failures and inconclusive checks remain separate and in the denominator', async () => {
  const { scoreAttempts } = await subject();
  const variants = [0, 1, 2, 3].map((i) => ({
    id: String(i),
    kind: 'test',
    activePatterns: [],
    prompt: 'safety',
  }));
  let calls = 0;
  const result = scoreAttempts(variants, {
    execute: (run) => {
      calls++;
      if (run.id === '0') throw new Error('private source secret');
      return run.id;
    },
    inspect: (output) => ({
      verificationStatus:
        output === '1' ? 'inconclusive' : output === '2' ? 'blocked' : 'checks-passed',
      passed: output === '3',
      stylometry: {
        deltaCV: 0,
        original: { punctuationPer1000: { emDash: 0 } },
        rewrite: { punctuationPer1000: { emDash: 0 } },
      },
      warnings: [],
    }),
  });
  assert.equal(calls, 4);
  assert.equal(result.summary.planned, 4);
  assert.equal(result.summary.attempted, 4);
  assert.equal(result.summary.providerFailures, 1);
  assert.equal(result.summary.inconclusive, 1);
  assert.equal(result.summary.blocked, 1);
  assert.equal(result.summary.checksPassed, 1);
  assert.equal(result.rows[1].invariantPreservationRate, null);
  assert.equal(result.rows[2].invariantPreservationRate, null);
  assert.equal(result.rows[3].invariantPreservationRate, null);
  assert.equal(
    result.rows.every((row) => row.netMarginalLift === null),
    true
  );
  assert.doesNotMatch(JSON.stringify(result), /private source secret/u);
});

test('a verifier failure does not discard later attempts or become a provider error', async () => {
  const { scoreAttempts } = await subject();
  const selected = [
    { id: 'a', prompt: 'a', activePatterns: [] },
    { id: 'b', prompt: 'b', activePatterns: [] },
  ];
  const report = scoreAttempts(selected, {
    execute: () => 'text',
    inspect: () => {
      throw new Error('source data');
    },
  });
  assert.equal(report.summary.verifierFailures, 2);
  assert.equal(report.summary.providerFailures, 0);
  assert.equal(report.summary.attempted, 2);
});

test('planning-only rows never become observations', async () => {
  const { scoreAttempts } = await subject();
  const report = scoreAttempts([{ id: 'full', prompt: 'fixed', activePatterns: [1] }]);
  assert.equal(report.summary.attempted, 0);
  assert.equal(report.rows[0].executionStatus, 'not-run');
  assert.equal(report.rows[0].verified, false);
});

test('missing local provider files become redacted failed attempts, not uncaught errors', async () => {
  const { scoreAttempts } = await subject();
  const missing = new URL('../evaluation/absent-provider-for-regression.js', import.meta.url);
  assert.equal(fs.existsSync(missing), false);
  const report = scoreAttempts([{ id: 'missing', prompt: 'fixed', activePatterns: [] }], {
    execute: () => fs.statSync(missing),
    inspect: () => {
      throw new Error('The verifier must not run');
    },
  });
  assert.equal(report.summary.providerFailures, 1);
  assert.equal(report.summary.attempted, 1);
  assert.equal(report.summary.verifierFailures, 0);
  assert.equal(report.rows[0].executionStatus, 'provider-failed');
  assert.doesNotMatch(JSON.stringify(report), /ENOENT|absent-provider|statSync/u);
});

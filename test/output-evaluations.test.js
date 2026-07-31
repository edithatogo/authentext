import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { evaluateOutputCases } from '../scripts/lib/skill-evaluator.js';

const cases = JSON.parse(fs.readFileSync('test/fixtures/output-evaluations.json', 'utf8'));

test('output corpus covers rewrite, restraint, voice, stance, and invariants', () => {
  assert.deepEqual([...new Set(cases.map(({ category }) => category))].sort(), [
    'invariant',
    'restraint',
    'rewrite',
    'stance',
    'voice',
  ]);
});

test('concrete rewrite outputs satisfy their behavioral constraints', () => {
  const summary = evaluateOutputCases(cases);
  assert.equal(summary.schema_version, 1);
  assert.equal(summary.total, cases.length);
  assert.equal(summary.passed, cases.length);
  assert.equal(summary.failed, 0, JSON.stringify(summary.results, null, 2));
});

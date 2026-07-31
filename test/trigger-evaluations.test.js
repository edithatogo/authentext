import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { classifySkillRequest, evaluateTriggerCases } from '../scripts/lib/skill-evaluator.js';

const cases = JSON.parse(fs.readFileSync('test/fixtures/trigger-evaluations.json', 'utf8'));

test('trigger corpus covers required evaluation classes', () => {
  assert.deepEqual([...new Set(cases.map(({ category }) => category))].sort(), [
    'near_miss',
    'negative',
    'paraphrased',
    'positive',
  ]);
  assert.ok(cases.every(({ id, prompt }) => id && prompt));
});

test('request classifier matches the trigger corpus', async (t) => {
  for (const evaluation of cases) {
    await t.test(evaluation.id, () => {
      assert.deepEqual(classifySkillRequest(evaluation.prompt), evaluation.expected);
    });
  }
});

test('trigger evaluation summary is machine-readable and complete', () => {
  const summary = evaluateTriggerCases(cases);
  assert.equal(summary.schema_version, 1);
  assert.equal(summary.total, cases.length);
  assert.equal(summary.passed, cases.length);
  assert.equal(summary.failed, 0);
  assert.ok(summary.results.every(({ id, passed }) => id && passed));
});

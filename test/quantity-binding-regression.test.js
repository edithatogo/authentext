import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectRewrite } from '../scripts/verify-rewrite.js';

for (const [name, original, rewritten] of [
  ['currency symbol', 'The fee was $100.', 'The fee was €100.'],
  ['currency code', 'The cost was AUD 100.', 'The cost was NZD 100.'],
  ['dose unit', 'The dose was 5 mg.', 'The dose was 5 g.'],
  ['compound unit', 'The dose was 5 mg/kg/day.', 'The dose was 5 mg/day.'],
  ['named date', 'The meeting was on 5 May 2026.', 'The meeting was on 5 June 2026.'],
])
  test(`verification rejects ${name} changes with unchanged numeric value`, () => {
    assert.equal(inspectRewrite(original, rewritten).passed, false);
    assert.equal(inspectRewrite(original, original).passed, true);
  });

test('ambiguous count-to-group alignment is inconclusive, not a preservation pass', () => {
  const report = inspectRewrite(
    'Group A included 40 patients. Group B included 20 patients.',
    'Group A included 20 patients. Group B included 40 patients.'
  );
  assert.equal(report.passed, false);
  assert.equal(report.verificationStatus, 'inconclusive');
  assert.ok(report.alignmentIssues.length > 0);
});

test('an unchanged document passes checks without claiming semantic proof', () => {
  const text = 'The dose was 5 mg and the fee was $100.';
  const report = inspectRewrite(text, text);
  assert.equal(report.verificationStatus, 'checks-passed');
  assert.equal(report.semanticEquivalenceProven, false);
});

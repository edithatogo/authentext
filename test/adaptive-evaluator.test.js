import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import {
  compareHostEvaluations,
  evaluateAdversarialCase,
  measureQuality,
  routeHealthStudyType,
  routeTechnicalSubtype,
} from '../scripts/lib/adaptive-evaluator.js';

test('adaptive corpus covers six classes and at least ten representative subtypes', () => {
  const fixture = JSON.parse(
    fs.readFileSync('test/fixtures/adaptive-document-evaluations.json', 'utf8')
  );
  assert.equal(new Set(fixture.cases.map((item) => item.subtype)).size >= 10, true);
  assert.deepEqual([...new Set(fixture.cases.map((item) => item.class))].sort(), [
    'adversarial',
    'ambiguous',
    'composite',
    'near-miss',
    'negative',
    'positive',
  ]);
});

test('technical routing distinguishes task, concept, reference, and troubleshooting', () => {
  assert.equal(routeTechnicalSubtype('how-to'), 'task');
  assert.equal(routeTechnicalSubtype('concept'), 'concept');
  assert.equal(routeTechnicalSubtype('api-docs'), 'reference');
  assert.equal(routeTechnicalSubtype('troubleshooting'), 'troubleshooting');
});

test('health routing selects minimum reporting without claiming compliance', () => {
  assert.deepEqual(routeHealthStudyType('systematic-review'), {
    guidance_family: 'PRISMA',
    check_mode: 'minimum-reporting',
    compliance_claim: false,
    human_review_required: true,
  });
  assert.equal(routeHealthStudyType('randomised-trial').guidance_family, 'CONSORT');
});

test('adversarial cases fail closed across privacy, conflicts, and stale sources', () => {
  for (const kind of ['prompt-injection', 'private-content', 'source-conflict', 'stale-guidance']) {
    const result = evaluateAdversarialCase({ kind });
    assert.equal(result.allowed, false, kind);
    assert.equal(result.requires_review, true, kind);
  }
});

test('negative cases reject detector evasion, attribution, invention, disfluency, and bans', () => {
  for (const kind of [
    'detector-evasion',
    'authorship-inference',
    'invented-specificity',
    'artificial-disfluency',
    'universal-punctuation-ban',
  ]) {
    assert.equal(evaluateAdversarialCase({ kind }).allowed, false, kind);
  }
});

test('quality metrics remain separate and bounded', () => {
  assert.deepEqual(
    measureQuality({
      proposed_changes: 2,
      total_units: 10,
      false_positives: 1,
      findings: 5,
      protected_total: 4,
      protected_preserved: 4,
      requirements_total: 3,
      requirements_covered: 2,
      calibrated: 8,
      classified: 10,
    }),
    {
      restraint: 0.8,
      false_positive_rate: 0.2,
      preservation: 1,
      requirement_coverage: 0.667,
      change_density: 0.2,
      classification_calibration: 0.8,
    }
  );
});

test('host comparison permits bounded variance but rejects routing drift', () => {
  const result = compareHostEvaluations([
    { host: 'codex', route: 'technical:reference', similarity: 1 },
    { host: 'gemini', route: 'technical:reference', similarity: 0.92 },
    { host: 'copilot', route: 'technical:reference', similarity: 0.9 },
  ]);
  assert.equal(result.passed, true);
  assert.equal(result.max_variance, 0.1);
  assert.equal(
    compareHostEvaluations([
      { host: 'codex', route: 'technical:reference', similarity: 1 },
      { host: 'other', route: 'technical:task', similarity: 0.99 },
    ]).passed,
    false
  );
});

test('invalid evaluator inputs fail predictably without reaching numeric spreads', () => {
  assert.throws(() => compareHostEvaluations([]), {
    name: 'TypeError',
    message: 'At least two host evaluations are required',
  });
  assert.throws(
    () =>
      compareHostEvaluations([
        { host: 'codex', route: 'technical:reference', similarity: 1 },
        { host: 'other', route: 'technical:reference', similarity: 2 },
      ]),
    RangeError
  );
  assert.throws(() => routeTechnicalSubtype('unknown'), TypeError);
  assert.throws(() => routeHealthStudyType('unknown'), TypeError);
  assert.throws(() => evaluateAdversarialCase({ kind: 'unknown' }), TypeError);
});

test('zero denominators produce bounded zero metrics', () => {
  assert.deepEqual(
    measureQuality({
      proposed_changes: 0,
      total_units: 0,
      false_positives: 0,
      findings: 0,
      protected_total: 0,
      protected_preserved: 0,
      requirements_total: 0,
      requirements_covered: 0,
      calibrated: 0,
      classified: 0,
    }),
    {
      restraint: 1,
      false_positive_rate: 0,
      preservation: 0,
      requirement_coverage: 0,
      change_density: 0,
      classification_calibration: 0,
    }
  );
});

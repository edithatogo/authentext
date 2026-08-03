import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calibrateVoiceSample,
  resolveDeliveryMode,
  selectMaterialQuestion,
} from '../scripts/lib/document-intake-policy.js';

test('delivery modes never imply mutation, research, or publication authority', () => {
  for (const mode of ['pasted', 'file', 'embedded']) {
    const delivery = resolveDeliveryMode({ mode });
    assert.equal(delivery.mode, mode);
    assert.equal(delivery.capabilities.mutate_file, false, mode);
    assert.equal(delivery.capabilities.research, false, mode);
    assert.equal(delivery.capabilities.publish, false, mode);
  }
});

test('explicit grants are scoped independently from delivery mode', () => {
  const delivery = resolveDeliveryMode({
    mode: 'file',
    grants: { mutate_file: true, research: false, publish: false },
  });

  assert.deepEqual(delivery.capabilities, {
    mutate_file: true,
    research: false,
    publish: false,
  });
  assert.equal(delivery.response_contract, 'summary');
});

test('pasted and embedded modes select bounded response contracts', () => {
  assert.equal(resolveDeliveryMode({ mode: 'pasted' }).response_contract, 'text');
  assert.equal(resolveDeliveryMode({ mode: 'embedded' }).response_contract, 'artifact-only');
  assert.throws(() => resolveDeliveryMode({ mode: 'remote-url' }), /delivery mode/);
});

test('voice calibration records only observable writing features', () => {
  const sample = [
    "I don't want a grand introduction. Start with the decision and explain why it matters.",
    'Use short paragraphs, but let a longer sentence carry detail when the detail earns its place.',
    'Prefer concrete verbs. Keep the stance measured, direct, and open about uncertainty.',
    'A heading should help the reader navigate; it should not advertise the prose beneath it.',
  ].join('\n\n');
  const profile = calibrateVoiceSample(sample);

  assert.equal(profile.status, 'calibrated');
  assert.equal(profile.provenance, 'user-sample');
  assert.ok(profile.features.sentence_length.mean > 0);
  assert.ok(profile.features.paragraphing.mean_sentences >= 1);
  assert.ok(profile.features.contractions.rate > 0);
  assert.ok(Array.isArray(profile.features.punctuation.observed));
  assert.ok(['first-person', 'impersonal', 'mixed'].includes(profile.features.stance));
  for (const prohibited of [
    'identity',
    'demographics',
    'disability',
    'personality',
    'authorship',
    'ai_likelihood',
  ]) {
    assert.equal(Object.hasOwn(profile, prohibited), false, prohibited);
    assert.equal(Object.hasOwn(profile.features, prohibited), false, prohibited);
  }
});

test('short samples disclose limits instead of fabricating a voice profile', () => {
  const profile = calibrateVoiceSample('Please make this clearer.');
  assert.equal(profile.status, 'insufficient-sample');
  assert.equal(profile.features, null);
  assert.match(profile.limitation, /short/i);
});

test('asks at most one question when operation ambiguity changes the output contract', () => {
  const decision = selectMaterialQuestion({
    operation_candidates: ['review', 'rewrite'],
    archetype_candidates: ['workplace', 'technical'],
  });
  assert.equal(decision.question.field, 'operation');
  assert.match(decision.question.text, /review or rewrite/i);
  assert.equal(decision.remaining_material_questions, 1);
});

test('asks for research permission only when current guidance is materially required', () => {
  const decision = selectMaterialQuestion({
    requires_current_guidance: true,
    research_permission: 'not_requested',
  });
  assert.equal(decision.question.field, 'research_permission');
  assert.match(decision.question.text, /search current guidance/i);
});

test('asks document type when candidates have different safety boundaries', () => {
  const decision = selectMaterialQuestion({
    operation_candidates: ['review'],
    archetype_candidates: ['workplace', 'legal-regulatory'],
  });
  assert.equal(decision.question.field, 'archetype');
  assert.match(decision.question.reason, /safety|routing/i);
});

test('uses conservative assumptions when missing fields do not materially change routing', () => {
  const decision = selectMaterialQuestion({
    operation_candidates: ['review'],
    archetype_candidates: ['workplace'],
    audience: null,
  });
  assert.equal(decision.question, null);
  assert.deepEqual(decision.assumptions, {
    audience: 'general',
    editing_strength: 'conservative',
    research_permission: 'not_requested',
  });
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDocumentProfile } from '../scripts/lib/document-profile-builder.js';

test('builds a complete profile from explicit intake fields', () => {
  const profile = buildDocumentProfile({
    operation: 'review',
    delivery_mode: 'file',
    archetype: 'technical',
    subtypes: ['how-to'],
    purpose: 'help an administrator rotate credentials',
    audience: ['system administrator'],
    stakes: 'high',
    authorities: ['project style guide'],
    lifecycle: 'final',
    constraints: ['retain commands', 'maximum 800 words'],
    editing_strength: 'conservative',
    research_permission: 'denied',
  });

  assert.equal(profile.operation.value, 'review');
  assert.equal(profile.delivery_mode.value, 'file');
  assert.equal(profile.archetype.value, 'technical');
  assert.equal(profile.subtypes[0].value, 'how-to');
  assert.equal(profile.purpose.value, 'help an administrator rotate credentials');
  assert.deepEqual(profile.audience.value, ['system administrator']);
  assert.equal(profile.stakes.value, 'high');
  assert.deepEqual(profile.authorities, ['project style guide']);
  assert.equal(profile.lifecycle.value, 'final');
  assert.deepEqual(profile.constraints, ['retain commands', 'maximum 800 words']);
  assert.equal(profile.editing_strength.value, 'conservative');
  assert.equal(profile.research_permission.value, 'denied');
  assert.equal(profile.composite, false);
  assert.deepEqual(profile.components, []);

  for (const key of [
    'operation',
    'delivery_mode',
    'archetype',
    'purpose',
    'audience',
    'stakes',
    'lifecycle',
    'editing_strength',
    'research_permission',
  ]) {
    assert.equal(profile[key].confidence, 1, key);
    assert.equal(profile[key].provenance, 'user', key);
  }
});

test('uses conservative governed defaults when intake is ambiguous', () => {
  const profile = buildDocumentProfile({ text: 'Please review this.' });

  assert.equal(profile.operation.value, 'review');
  assert.equal(profile.archetype.value, 'unknown');
  assert.equal(profile.stakes.value, 'high');
  assert.equal(profile.editing_strength.value, 'conservative');
  assert.equal(profile.research_permission.value, 'not_requested');
  assert.ok(profile.archetype.confidence < 0.5);
  assert.equal(profile.archetype.provenance, 'heuristic');
});

test('represents composite documents without collapsing their components', () => {
  const profile = buildDocumentProfile({
    operation: 'structural',
    components: [
      { archetype: 'technical', subtype: 'reference' },
      { archetype: 'public-content', subtype: 'faq' },
    ],
  });

  assert.equal(profile.composite, true);
  assert.equal(profile.archetype.value, 'composite');
  assert.deepEqual(profile.components, [
    { archetype: 'technical', subtype: 'reference' },
    { archetype: 'public-content', subtype: 'faq' },
  ]);
});

test('rejects unsupported governed values instead of silently coercing them', () => {
  assert.throws(
    () => buildDocumentProfile({ operation: 'approve', stakes: 'extreme' }),
    /operation|stakes/
  );
});

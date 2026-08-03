import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const REGISTRY_PATH = path.join('src', 'document-intelligence', 'profile-registry.json');
const EXPECTED_FAMILIES = [
  'academic',
  'clinical-safety',
  'commercial',
  'correspondence',
  'creative-narrative',
  'employment',
  'governance',
  'health-research',
  'legal-regulatory',
  'product',
  'public-content',
  'technical',
  'workplace',
];

test('profile registry seeds every required document family', () => {
  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  assert.equal(registry.schema_version, 1);
  assert.deepEqual(registry.profiles.map((profile) => profile.id).sort(), EXPECTED_FAMILIES);
});

test('profiles are data-only progressive-disclosure records', () => {
  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  for (const profile of registry.profiles) {
    assert.ok(profile.subtypes.length >= 2, profile.id);
    assert.ok(profile.references.includes('references/core-patterns.md'), profile.id);
    assert.ok(profile.checks.length > 0, profile.id);
    assert.ok(profile.safe_boundaries.length > 0, profile.id);
    assert.ok(profile.false_positive_risks.length > 0, profile.id);
    assert.ok(Array.isArray(profile.source_resolvers), profile.id);
    assert.equal(Object.hasOwn(profile, 'instructions'), false, profile.id);
    assert.equal(Object.hasOwn(profile, 'patterns'), false, profile.id);
    for (const reference of profile.references) {
      assert.ok(fs.existsSync(reference), `${profile.id}: missing ${reference}`);
    }
  }
});

test('technical family distinguishes task, concept, reference, and troubleshooting', () => {
  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  const technical = registry.profiles.find((profile) => profile.id === 'technical');
  assert.deepEqual(
    ['concept', 'how-to', 'reference', 'troubleshooting'].filter((subtype) =>
      technical.subtypes.includes(subtype)
    ),
    ['concept', 'how-to', 'reference', 'troubleshooting']
  );
});

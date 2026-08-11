import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  GUIDANCE_PRECEDENCE,
  resolveGuidance,
  validateDocumentProfile,
} from '../scripts/lib/document-intelligence.js';

const ROOT = process.cwd();
const CONTRACT_ROOT = path.join(ROOT, 'src', 'document-intelligence');

function field(value, confidence = 1, provenance = 'user') {
  return { value, confidence, provenance };
}

function baseProfile() {
  return {
    schema_version: 1,
    profile_id: 'profile-001',
    operation: field('review'),
    delivery_mode: field('pasted'),
    archetype: field('workplace'),
    subtypes: [field('briefing-note')],
    purpose: field('support a decision'),
    audience: field(['executive']),
    stakes: field('high'),
    authorities: [],
    lifecycle: field('draft'),
    constraints: [],
    editing_strength: field('conservative'),
    research_permission: field('not_requested'),
    composite: false,
    components: [],
  };
}

test('one runtime skill remains discoverable', () => {
  const candidates = ['SKILL.md', 'SKILL_PROFESSIONAL.md'];
  const discoverable = candidates.filter((filename) => {
    const content = fs.readFileSync(path.join(ROOT, filename), 'utf8');
    return /^---\r?\n[\s\S]*?^name:/m.test(content);
  });
  assert.deepEqual(discoverable, ['SKILL.md']);
});

test('document profile contract files are checked in and parseable', () => {
  for (const filename of [
    'document-profile.schema.json',
    'guidance-source.schema.json',
    'diagnostic-receipt.schema.json',
    'guidance-precedence.json',
    'pattern.schema.json',
    'protected-span.schema.json',
    'evaluation-fixture.schema.json',
    'agent-skills-portable.schema.json',
    'protected-span-classes.json',
  ]) {
    assert.doesNotThrow(() =>
      JSON.parse(fs.readFileSync(path.join(CONTRACT_ROOT, filename), 'utf8'))
    );
  }
});

test('validates known, unknown, and composite document profiles', () => {
  assert.deepEqual(validateDocumentProfile(baseProfile()), []);

  const unknown = baseProfile();
  unknown.archetype = field('unknown', 0.2, 'heuristic');
  unknown.subtypes = [];
  assert.deepEqual(validateDocumentProfile(unknown), []);

  const composite = baseProfile();
  composite.archetype = field('composite', 0.8, 'document');
  composite.composite = true;
  composite.components = [
    { archetype: 'technical', subtype: 'how-to' },
    { archetype: 'public-content', subtype: 'faq' },
  ];
  assert.deepEqual(validateDocumentProfile(composite), []);
});

test('rejects invalid confidence, provenance, and composite state', () => {
  const invalid = baseProfile();
  invalid.purpose.confidence = 1.2;
  invalid.audience.provenance = 'model_guess';
  invalid.composite = true;

  const errors = validateDocumentProfile(invalid).join('\n');
  assert.match(errors, /purpose\.confidence/);
  assert.match(errors, /audience\.provenance/);
  assert.match(errors, /components/);
});

test('guidance precedence is deterministic and higher authority wins conflicts', () => {
  assert.deepEqual(GUIDANCE_PRECEDENCE, [
    'user',
    'project',
    'binding',
    'document_type',
    'domain',
    'general',
    'authentext',
  ]);

  const resolved = resolveGuidance([
    { id: 'general-active', authority: 'general', rule_key: 'voice', value: 'active' },
    { id: 'project-formal', authority: 'project', rule_key: 'voice', value: 'formal' },
    { id: 'authentext-plain', authority: 'authentext', rule_key: 'voice', value: 'plain' },
    { id: 'domain-citations', authority: 'domain', rule_key: 'citations', value: 'retain' },
  ]);

  assert.deepEqual(
    resolved.active.map((rule) => rule.id),
    ['project-formal', 'domain-citations']
  );
  assert.deepEqual(
    resolved.conflicts.map((entry) => entry.suppressed.id),
    ['general-active', 'authentext-plain']
  );
  assert.equal(resolved.conflicts[0].reason, 'higher-authority');
});

test('guidance resolution rejects malformed and ungoverned rules', () => {
  assert.throws(
    () =>
      resolveGuidance([
        { id: 'rogue', authority: 'unknown-source', rule_key: 'voice', value: 'override' },
      ]),
    /authority/
  );
  assert.throws(
    () => resolveGuidance([{ id: '', authority: 'user', rule_key: 'voice', value: 'direct' }]),
    /id/
  );
  assert.throws(
    () => resolveGuidance([{ id: 'missing-key', authority: 'user', value: 'direct' }]),
    /rule_key/
  );
});

test('equal-authority conflicts retain stable input order', () => {
  const resolved = resolveGuidance([
    { id: 'first', authority: 'project', rule_key: 'voice', value: 'formal' },
    { id: 'second', authority: 'project', rule_key: 'voice', value: 'conversational' },
  ]);
  assert.equal(resolved.active[0].id, 'first');
  assert.equal(resolved.conflicts[0].suppressed.id, 'second');
  assert.equal(resolved.conflicts[0].reason, 'stable-tie-break');
});

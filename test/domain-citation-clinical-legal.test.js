import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { resolveProfileRoute } from '../scripts/lib/document-profile-registry.js';

const compiler = fs.readFileSync('scripts/compile-skill.js', 'utf8');
const skill = fs.readFileSync('SKILL.md', 'utf8');
const professional = fs.readFileSync('SKILL_PROFESSIONAL.md', 'utf8');
const clinical = fs.existsSync('src/modules/SKILL_CLINICAL.md')
  ? fs.readFileSync('src/modules/SKILL_CLINICAL.md', 'utf8')
  : '';
const legal = fs.existsSync('src/modules/SKILL_LEGAL.md')
  ? fs.readFileSync('src/modules/SKILL_LEGAL.md', 'utf8')
  : '';
const clinicalRef = fs.existsSync('references/clinical.md')
  ? fs.readFileSync('references/clinical.md', 'utf8')
  : '';
const legalRef = fs.existsSync('references/legal.md')
  ? fs.readFileSync('references/legal.md', 'utf8')
  : '';
const governance = fs.readFileSync('src/modules/SKILL_GOVERNANCE.md', 'utf8');
const registry = JSON.parse(
  fs.readFileSync('src/document-intelligence/profile-registry.json', 'utf8')
);

function profile(id) {
  return registry.profiles.find((entry) => entry.id === id);
}

test('compiler emits and routes clinical and legal references', () => {
  assert.match(compiler, /SKILL_CLINICAL\.md/);
  assert.match(compiler, /SKILL_LEGAL\.md/);
  assert.match(compiler, /clinical: 'clinical\.md'/);
  assert.match(compiler, /legal: 'legal\.md'/);
  assert.ok(fs.existsSync('references/clinical.md'), 'references/clinical.md missing');
  assert.ok(fs.existsSync('references/legal.md'), 'references/legal.md missing');
  assert.match(skill, /references\/clinical\.md/);
  assert.match(skill, /references\/legal\.md/);
  assert.match(professional, /references\/clinical\.md/);
  assert.match(professional, /references\/legal\.md/);
});

test('clinical module hard-locks doses, drugs, negation, and AE language', () => {
  for (const source of [clinical, clinicalRef]) {
    assert.match(source, /hard-lock|Hard-lock|locked/i);
    assert.match(source, /dose/i);
    assert.match(source, /unit/i);
    assert.match(source, /drug/i);
    assert.match(source, /brand/i);
    assert.match(source, /generic/i);
    assert.match(source, /negation/i);
    assert.match(source, /serious/i);
    assert.match(source, /severe/i);
    assert.match(source, /CIOMS/);
    assert.match(source, /very common|uncommon|very rare/i);
    assert.match(source, /route/i);
    assert.match(source, /formulation/i);
    assert.match(source, /population/i);
    assert.match(source, /prognostic/i);
  }
});

test('patient-facing clinical text reports FKGL or SMOG and does not silently simplify', () => {
  for (const source of [clinical, clinicalRef]) {
    assert.match(source, /FKGL/);
    assert.match(source, /SMOG/);
    assert.match(source, /Do not silently simplify/i);
    assert.match(source, /key-message|key message/i);
  }
});

test('legal module hard-locks modals, defined terms, carve-outs, and temporal literals', () => {
  for (const source of [legal, legalRef]) {
    assert.match(source, /shall/);
    assert.match(source, /must/);
    assert.match(source, /\bmay\b/);
    assert.match(source, /should/);
    assert.match(source, /\bwill\b/);
    assert.match(source, /defined term/i);
    assert.match(source, /carve-out/i);
    assert.match(source, /30 days/);
    assert.match(source, /one month/);
    assert.match(source, /unverified/i);
    assert.match(source, /omission/i);
    assert.match(source, /invention/i);
  }
});

test('governance points at the legal module instead of duplicating locks', () => {
  assert.match(governance, /legal\.md/);
  assert.doesNotMatch(governance, /### Pattern L1:/);
});

test('profile families load the new clinical and legal references', () => {
  assert.ok(profile('health-research').references.includes('references/clinical.md'));
  assert.ok(profile('clinical-safety').references.includes('references/clinical.md'));
  assert.ok(profile('legal-regulatory').references.includes('references/legal.md'));
  assert.ok(profile('health-research').references.includes('references/academic.md'));
  assert.deepEqual(resolveProfileRoute({ archetype: 'clinical-safety' }).references, [
    'references/core-patterns.md',
    'references/academic.md',
    'references/governance.md',
    'references/clinical.md',
  ]);
  assert.ok(
    resolveProfileRoute({ archetype: 'legal-regulatory' }).references.includes(
      'references/legal.md'
    )
  );
  assert.ok(
    resolveProfileRoute({ archetype: 'health-research' }).references.includes(
      'references/clinical.md'
    )
  );
});

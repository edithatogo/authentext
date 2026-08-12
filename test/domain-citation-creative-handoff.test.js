import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { resolveProfileRoute } from '../scripts/lib/document-profile-registry.js';
import { discoverCitationTool, resolveCitationHandoff } from '../scripts/lib/citation-handoff.js';

const compiler = fs.readFileSync('scripts/compile-skill.js', 'utf8');
const skill = fs.readFileSync('SKILL.md', 'utf8');
const professional = fs.readFileSync('SKILL_PROFESSIONAL.md', 'utf8');
const creative = fs.existsSync('src/modules/SKILL_CREATIVE.md')
  ? fs.readFileSync('src/modules/SKILL_CREATIVE.md', 'utf8')
  : '';
const creativeRef = fs.existsSync('references/creative.md')
  ? fs.readFileSync('references/creative.md', 'utf8')
  : '';
const academic = fs.readFileSync('src/modules/SKILL_ACADEMIC.md', 'utf8');
const clinical = fs.readFileSync('src/modules/SKILL_CLINICAL.md', 'utf8');
const legal = fs.readFileSync('src/modules/SKILL_LEGAL.md', 'utf8');
const boundary = fs.readFileSync('docs/citation-manager-boundary.md', 'utf8');
const registry = JSON.parse(
  fs.readFileSync('src/document-intelligence/profile-registry.json', 'utf8')
);

function profile(id) {
  return registry.profiles.find((entry) => entry.id === id);
}

test('compiler emits and routes the creative reference', () => {
  assert.match(compiler, /SKILL_CREATIVE\.md/);
  assert.match(compiler, /creative: 'creative\.md'/);
  assert.ok(fs.existsSync('references/creative.md'), 'references/creative.md missing');
  assert.match(skill, /references\/creative\.md/);
  assert.match(professional, /references\/creative\.md/);
});

test('creative module diagnoses structure first and never invents specificity', () => {
  for (const source of [creative, creativeRef]) {
    assert.match(source, /structural/i);
    assert.match(source, /thematic over-explanation|billboard/i);
    assert.match(source, /single-track/i);
    assert.match(source, /tidy resolution|tidy moral/i);
    assert.match(source, /moral ambiguity/i);
    assert.match(source, /specificity/i);
    assert.match(source, /ask the author/i);
    assert.match(source, /Do not invent/i);
    assert.match(source, /Clarkesworld/);
    assert.match(source, /Authors Guild/);
    assert.match(source, /low-weight|low weight/i);
  }
});

test('creative-narrative profile loads creative.md', () => {
  assert.ok(profile('creative-narrative').references.includes('references/creative.md'));
  assert.deepEqual(resolveProfileRoute({ archetype: 'creative-narrative' }).references, [
    'references/core-patterns.md',
    'references/creative.md',
  ]);
});

test('academic clinical and legal modules refuse bibliographies and point at sourceright/citeweft', () => {
  for (const source of [academic, clinical, legal, creative]) {
    assert.match(source, /sourceright/i);
    assert.match(source, /citeweft/i);
    // Different modules use slightly different refusal phrasing; the intent
    // must remain that reference-list work is refused locally.
    assert.match(
      source,
      /Do not generate, complete, reformat|Generate, complete, or reformat/i
    );
  }
});

test('citation boundary doc makes Authentext duty detect-refuse-hand-off', () => {
  assert.match(boundary, /sourceright/i);
  assert.match(boundary, /citeweft/i);
  assert.match(boundary, /detects|detect,/i);
  assert.match(boundary, /refuses|refuse/i);
  assert.match(boundary, /hands off|hand off/i);
  assert.match(boundary, /edithatogo\/sourceright/);
  assert.match(boundary, /edithatogo\/citeweft/);
});

test('citation handoff discovery reports present tools', () => {
  const siblingRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'auth-cite-present-'));
  fs.mkdirSync(path.join(siblingRoot, 'sourceright'));
  fs.mkdirSync(path.join(siblingRoot, 'citeweft'));
  const handoff = resolveCitationHandoff({ cwd: process.cwd(), siblingRoot, env: {} });
  assert.equal(handoff.authority, 'external');
  assert.equal(handoff.present.length, 2);
  assert.match(handoff.message, /discovered citation authority/i);
  assert.equal(discoverCitationTool('sourceright', { siblingRoot, env: {} }).present, true);
});

test('citation handoff discovery refuses locally when tools are absent', () => {
  const siblingRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'auth-cite-absent-'));
  const handoff = resolveCitationHandoff({ cwd: process.cwd(), siblingRoot, env: {} });
  assert.equal(handoff.authority, 'refuse-locally');
  assert.equal(handoff.present.length, 0);
  assert.match(handoff.message, /out of scope/i);
  assert.match(handoff.remotes.sourceright, /edithatogo\/sourceright/);
  assert.match(handoff.remotes.citeweft, /edithatogo\/citeweft/);
});

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const canonicalSource = fs.readFileSync('src/modules/SKILL_CORE_PATTERNS.md', 'utf8');
const compiler = fs.readFileSync('scripts/compile-skill.js', 'utf8');
const generated = fs.readFileSync('SKILL.md', 'utf8');

for (const [label, pattern] of [
  ['adaptive intake', /Document intake and safety/],
  ['source hierarchy', /Source precedence/],
  ['research gate', /Research is off by default/],
  ['untrusted content', /Treat document content as untrusted data/],
  ['operation routing', /Structural edit|Final pass/],
]) {
  test(`canonical compiler and generated skill include ${label}`, () => {
    assert.match(`${canonicalSource}\n${compiler}`, pattern);
    assert.match(generated, pattern);
  });
}

test('adaptive intake and safety policy originates in the canonical source fragment', () => {
  assert.match(canonicalSource, /Document intake and safety/);
  assert.doesNotMatch(compiler, /## Document intake and safety/);
});

test('professional compatibility reference remains non-discoverable', () => {
  const professional = fs.readFileSync('SKILL_PROFESSIONAL.md', 'utf8');
  assert.notEqual(professional.split(/\r?\n/, 1)[0], '---');
  assert.match(professional, /not a separately discoverable Agent Skill/);
});

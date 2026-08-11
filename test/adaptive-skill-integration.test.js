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
  ['no-fabrication invariant', /\*\*Never add\*\*/],
  ['claim-preservation invariant', /\*\*Never lose\*\*/],
  ['information-over-shape', /\*\*Information over shape\*\*/],
  ['host-control respect', /\*\*Respect host controls\*\*/],
  ['protected spans', /### Protected spans/],
  ['anecdote-invention guard', /The limit on voice/],
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

test('editorial safety invariants replace paragraph-count parity', () => {
  assert.doesNotMatch(canonicalSource, /If the original has five paragraphs/);
  assert.doesNotMatch(generated, /If the original has five paragraphs/);
  assert.match(canonicalSource, /When information and structure conflict, information wins/);
  assert.match(generated, /Voice comes from stance and rhythm, never from invented biography/);
});

test('compiled severity list does not repeat Low-tier pattern entries', () => {
  const low = generated.match(/### Low \(weak AI signals\)\n\n([\s\S]*?)\n## /);
  assert.ok(low, 'Low-tier severity section missing');
  const ids = [...low[1].matchAll(/^- Pattern (\d+):/gm)].map(([, id]) => id);
  assert.deepEqual(ids, [...new Set(ids)]);
});

test('professional compatibility reference remains non-discoverable', () => {
  const professional = fs.readFileSync('SKILL_PROFESSIONAL.md', 'utf8');
  assert.notEqual(professional.split(/\r?\n/, 1)[0], '---');
  assert.match(professional, /not a separately discoverable Agent Skill/);
});

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const canonicalSource = fs.readFileSync('src/modules/SKILL_CORE_PATTERNS.md', 'utf8');
const generated = fs.readFileSync('SKILL.md', 'utf8');
const coreReference = fs.readFileSync('references/core-patterns.md', 'utf8');

test('compiled skill includes seven-line voice calibration', () => {
  assert.match(canonicalSource, /^## Voice Calibration$/m);
  assert.match(generated, /^## Voice Calibration$/m);
  assert.match(generated, /writing sample/);
  assert.match(generated, /sentence lengths/);
  assert.match(generated, /Without a sample/);
});

test('a user writing sample outranks style rules including the dash ban', () => {
  assert.match(generated, /sample outranks/i);
  assert.match(generated, /Pattern 13/);
  assert.match(generated, /em dashes/);
  assert.match(generated, /does not outrank Never add, Never lose, or protected spans/);
  assert.match(coreReference, /user-provided writing sample uses em dashes/);
});

test('compiled skill documents pasted, file, and embedded invocation', () => {
  assert.match(generated, /^## Invocation Modes$/m);
  assert.match(generated, /\*\*Pasted text \(default\)\.\*\*/);
  assert.match(generated, /\*\*File mode\.\*\*/);
  assert.match(generated, /\*\*Embedded mode\.\*\*/);
  assert.match(generated, /prose, not ceremony/);
  assert.match(generated, /granted write access/);
  assert.match(generated, /Never try to bypass the host application's approval/);
});

test('detection guidance exempts secondhand watched phrases', () => {
  assert.match(generated, /\*\*Secondhand text\.\*\*/);
  assert.match(
    generated,
    /Do not rewrite watched phrases inside quotations, titles, proper names, or examples where the phrase is being discussed rather than used/
  );
  assert.match(canonicalSource, /\*\*Secondhand text\.\*\*/);
});

test('Pattern 7 vocabulary includes quietly', () => {
  assert.match(canonicalSource, /pivotal, quietly, showcase/);
  assert.match(coreReference, /pivotal, quietly, showcase/);
});

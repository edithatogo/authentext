import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { getLocalPatternCount } from '../scripts/lib/repo-config.js';

const canonicalSource = fs.readFileSync('src/modules/SKILL_CORE_PATTERNS.md', 'utf8');
const generated = fs.readFileSync('SKILL.md', 'utf8');
const coreReference = fs.readFileSync('references/core-patterns.md', 'utf8');

test('vague This back-references fold into Pattern 5 and do not mint a new number', () => {
  assert.equal(getLocalPatternCount(), 40);
  assert.doesNotMatch(canonicalSource, /### Pattern 41:/);
  assert.doesNotMatch(canonicalSource, /### Pattern 34: Vague/);
  assert.match(canonicalSource, /### Pattern 5: Vague Attributions and Back-References/);
  assert.match(coreReference, /### Pattern 5: Vague Attributions and Back-References/);
  assert.match(generated, /Pattern 5: Vague attributions and back-references/);
});

test('Pattern 5 still covers unnamed authorities and adds unanchored This', () => {
  assert.match(canonicalSource, /Experts argue/);
  assert.match(canonicalSource, /This ensures/);
  assert.match(canonicalSource, /This means/);
  assert.match(canonicalSource, /This allows/);
  assert.match(canonicalSource, /This is why/);
  assert.match(canonicalSource, /whole preceding clause/);
  assert.match(canonicalSource, /The scheduler batches writes every 200ms/);
  assert.match(canonicalSource, /which keeps the database from being overwhelmed/);
  assert.match(canonicalSource, /Users see updates slightly later/);
  assert.match(coreReference, /The scheduler batches writes every 200ms/);
  assert.match(generated, /Vague attributions and back-references/);
});

test('ordinary anaphoric this with a clear antecedent is not a tell', () => {
  assert.match(canonicalSource, /clear antecedent/);
  assert.match(canonicalSource, /Demonstratives are ordinary English/);
  assert.match(generated, /A single well-anchored "This"/);
  assert.match(generated, /antecedent is unrecoverable/);
  assert.match(coreReference, /A single well-anchored "This"/);
});

test('mechanical pre-return scan covers leftover artifacts, not dashes only', () => {
  assert.match(canonicalSource, /^## Mechanical pre-return scan$/m);
  assert.match(generated, /^## Mechanical pre-return scan$/m);
  assert.match(generated, /annotated-link or definition/);
  assert.match(generated, /Curly quotes/);
  assert.match(generated, /Emoji \(Pattern 17\)/);
  assert.match(generated, /collaborative artifacts/);
  assert.match(generated, /knowledge-cutoff/);
  assert.match(generated, /sycophancy/);
  assert.match(generated, /Patterns 19, 20, 21/);
  assert.match(coreReference, /^## Mechanical pre-return scan$/m);
});

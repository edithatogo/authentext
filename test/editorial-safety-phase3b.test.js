import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { getLocalPatternCount } from '../scripts/lib/repo-config.js';

const canonicalSource = fs.readFileSync('src/modules/SKILL_CORE_PATTERNS.md', 'utf8');
const generated = fs.readFileSync('SKILL.md', 'utf8');
const coreReference = fs.readFileSync('references/core-patterns.md', 'utf8');

test('Pattern 11 covers synonym cycling and repeated sentence openings', () => {
  assert.match(canonicalSource, /### Pattern 11: Elegant Variation and Repeated Sentence Openings/);
  assert.match(coreReference, /### Pattern 11: Elegant Variation and Repeated Sentence Openings/);
  assert.match(canonicalSource, /She noted the door/);
  assert.match(canonicalSource, /She noted the lock on it/);
  assert.match(canonicalSource, /She filed both away/);
  assert.match(canonicalSource, /managing repetition by rule instead of by ear/);
  assert.match(generated, /Pattern 11: Elegant variation and repeated openings/);
});

test('repeated openings stay on Pattern 11 and do not mint a new number', () => {
  assert.equal(getLocalPatternCount(), 40);
  assert.doesNotMatch(canonicalSource, /### Pattern 41:/);
  assert.match(canonicalSource, /### Pattern 34: Over-Polished/);
  assert.match(canonicalSource, /### Pattern 35: Manufactured Punchlines/);
  assert.doesNotMatch(canonicalSource, /### Pattern 34: Uniform/);
  assert.doesNotMatch(canonicalSource, /### Pattern 35: Uniform/);
});

test('detection guidance exempts deliberate anaphora', () => {
  assert.match(canonicalSource, /\*\*Deliberate anaphora\.\*\*/);
  assert.match(generated, /\*\*Deliberate anaphora\.\*\*/);
  assert.match(coreReference, /She came\. She saw\. She conquered/);
  assert.match(canonicalSource, /rhetorical work/);
});

test('uniform length is generative repair with genre limits', () => {
  assert.match(canonicalSource, /### Generative repair: sentence and paragraph length/);
  assert.match(generated, /### Generative repair: sentence and paragraph length/);
  assert.match(coreReference, /### Generative repair: sentence and paragraph length/);
  assert.match(generated, /not only a reason to leave prose alone/);
  assert.match(generated, /Do not only shorten/);
  assert.match(generated, /short-long-short-long/);
  assert.match(generated, /Pattern 35/);
  assert.match(generated, /reference documentation, API docs, procedures, or legal text/);
  assert.match(generated, /\*\*Even sentence or paragraph length in reference material\.\*\*/);
});

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const canonicalSource = fs.readFileSync('src/modules/SKILL_CORE_PATTERNS.md', 'utf8');
const generated = fs.readFileSync('SKILL.md', 'utf8');
const coreReference = fs.readFileSync('references/core-patterns.md', 'utf8');

test('Pattern 13 remains the em dash rule and is not reused for passive voice', () => {
  assert.match(canonicalSource, /### Pattern 13: Em\/En Dash Hard Cut/);
  assert.match(coreReference, /### Pattern 13: Em\/En Dash Hard Cut/);
  assert.doesNotMatch(canonicalSource, /### Pattern 13:.*Passive Voice/);
  assert.match(generated, /Pattern 13: Em dash overuse/);
});

test('catalog adds Pattern 40 for passive voice and subjectless fragments', () => {
  assert.match(canonicalSource, /### Pattern 40: Passive Voice and Subjectless Fragments/);
  assert.match(coreReference, /### Pattern 40: Passive Voice and Subjectless Fragments/);
  assert.match(generated, /Pattern 40: Passive voice and subjectless fragments/);
});

test('Pattern 40 names both technical and humanizing-overcorrection registers', () => {
  assert.match(canonicalSource, /No configuration file needed/);
  assert.match(canonicalSource, /The results are preserved automatically/);
  assert.match(canonicalSource, /humanizing overcorrection/i);
  assert.match(canonicalSource, /Ninety days since/);
  assert.match(coreReference, /humanizing overcorrection/i);
  assert.match(canonicalSource, /Pattern 35/);
  assert.match(canonicalSource, /standard imperative/i);
});

test('Pattern 13 and detection guidance exempt annotated-link and definition dashes', () => {
  assert.match(canonicalSource, /\[Title\]\(url\).*description/);
  assert.match(canonicalSource, /\*\*Term\*\*.*definition/);
  assert.match(canonicalSource, /ask once/i);
  assert.match(canonicalSource, /Embedded mode/);
  assert.match(generated, /Annotated-link or definition/);
  assert.match(coreReference, /\[Title\]\(url\).*description/);
  assert.match(coreReference, /\*\*Term\*\*.*definition/);
});

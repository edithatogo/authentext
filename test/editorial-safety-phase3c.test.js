import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { getLocalPatternCount } from '../scripts/lib/repo-config.js';

const canonicalSource = fs.readFileSync('src/modules/SKILL_CORE_PATTERNS.md', 'utf8');
const generated = fs.readFileSync('SKILL.md', 'utf8');
const coreReference = fs.readFileSync('references/core-patterns.md', 'utf8');

test('shadowboxing and scar tissue fold into Pattern 38 and do not mint a new number', () => {
  assert.equal(getLocalPatternCount(), 40);
  assert.doesNotMatch(canonicalSource, /### Pattern 41:/);
  assert.match(
    canonicalSource,
    /### Pattern 38: Diff-Anchored Writing, Shadowboxing, and Editorial Scar Tissue/
  );
  assert.match(
    coreReference,
    /### Pattern 38: Diff-Anchored Writing, Shadowboxing, and Editorial Scar Tissue/
  );
  assert.match(
    generated,
    /Pattern 38: Diff-anchored writing, shadowboxing, and editorial scar tissue/
  );
});

test('shadowboxing uses in-text signals instead of a cold-reader test', () => {
  assert.match(canonicalSource, /This isn't mainly about prompt length/);
  assert.match(canonicalSource, /I'm not arguing that documentation doesn't matter/);
  assert.match(canonicalSource, /meta-level/);
  assert.match(canonicalSource, /unattributed/);
  assert.match(canonicalSource, /dropped within a sentence/);
  assert.match(canonicalSource, /appears nowhere else/);
  assert.match(canonicalSource, /the API is not thread-safe/);
  assert.doesNotMatch(canonicalSource, /would a cold reader arrive at this objection/i);
  assert.match(canonicalSource, /not operational/i);
  assert.match(coreReference, /This isn't mainly about prompt length/);
});

test('editorial scar tissue names the phantom-alternative tell and restates used claims', () => {
  assert.match(canonicalSource, /A tempting approach would be/);
  assert.match(canonicalSource, /restarting the auth service/);
  assert.match(canonicalSource, /Session tokens are rotated every 24 hours, in place/);
  assert.match(canonicalSource, /restate it affirmatively/);
  assert.match(canonicalSource, /which previous edit caused a sentence to exist/);
  assert.match(coreReference, /A tempting approach would be/);
});

test('Pattern 23 hedging names accumulation from iterative editing', () => {
  assert.match(canonicalSource, /### Pattern 23: Excessive Hedging/);
  assert.match(canonicalSource, /to be fair/);
  assert.match(canonicalSource, /it's also possible/);
  assert.match(canonicalSource, /fairness clause/);
  assert.match(canonicalSource, /one honest qualifier at most/);
  assert.match(coreReference, /fairness clause/);
});

test('false-positive guard keeps seven legitimate not-X uses', () => {
  assert.match(canonicalSource, /This guide does not cover Windows/);
  assert.match(canonicalSource, /legal and safety/i);
  assert.match(canonicalSource, /misconceptions readers actually hold/);
  assert.match(canonicalSource, /attributed/i);
  assert.match(canonicalSource, /FAQs/);
  assert.match(canonicalSource, /self-aware aside/);
  assert.match(canonicalSource, /steelman/i);
  assert.match(generated, /This guide does not cover Windows/);
  assert.match(generated, /steelman/i);
});

test('revision guidance rewrites from the point instead of patching the phrase', () => {
  assert.match(canonicalSource, /re-saying the point/);
  assert.match(canonicalSource, /not by patching the flagged phrase/);
  assert.match(generated, /re-saying the point/);
  assert.match(generated, /not by patching the flagged phrase/);
  assert.match(coreReference, /rewrite the paragraph from its point/);
});

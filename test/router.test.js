import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SKILL_PATH = path.join(ROOT, 'SKILL.md');
const PROFESSIONAL_REFERENCE_PATH = path.join(ROOT, 'SKILL_PROFESSIONAL.md');

test('canonical Authentext routing', async (t) => {
  const skill = fs.readFileSync(SKILL_PATH, 'utf8');
  const professional = fs.readFileSync(PROFESSIONAL_REFERENCE_PATH, 'utf8');

  await t.test('routes by operation and material', () => {
    assert.match(skill, /^## Routing by task and content type$/m);
    assert.match(skill, /rewrite, a review with findings, or both/i);
    assert.match(skill, /review-only requests/i);
    assert.match(skill, /references\/technical\.md/);
    assert.match(skill, /references\/academic\.md/);
    assert.match(skill, /references\/governance\.md/);
    assert.match(skill, /references\/reasoning-failures\.md/);
  });

  await t.test('keeps professional guidance non-discoverable', () => {
    assert.match(professional, /^# Authentext Professional Routing Reference$/m);
    assert.doesNotMatch(professional, /^---\r?\n/);
    assert.match(professional, /authoritative runtime entry point is \[SKILL\.md\]/i);
  });
});

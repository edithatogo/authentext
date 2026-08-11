import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const canonicalSource = fs.readFileSync('src/modules/SKILL_CORE_PATTERNS.md', 'utf8');
const generated = fs.readFileSync('SKILL.md', 'utf8');
const coreReference = fs.readFileSync('references/core-patterns.md', 'utf8');

test('voice calibration documents local file and folder pointers', () => {
  for (const source of [canonicalSource, generated, coreReference]) {
    assert.match(source, /local file/i);
    assert.match(source, /local folder/i);
    assert.match(source, /explicit pointer/i);
    assert.match(source, /consent/i);
    assert.match(source, /Do not invent a voice/i);
    assert.match(source, /never becomes a search query/i);
  }
});

test('voice calibration documents published-work pointers and metadata-only research', () => {
  for (const source of [canonicalSource, generated, coreReference]) {
    assert.match(source, /DOI/);
    assert.match(source, /ORCID/);
    assert.match(source, /institutional-repo/);
    assert.match(source, /metadata-only/);
    assert.match(source, /Never send the current manuscript/);
  }
});

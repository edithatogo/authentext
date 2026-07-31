import test from 'node:test';
import assert from 'node:assert/strict';
import { getDriftedFiles, normalizeGeneratedText } from '../scripts/check-sync-clean.js';

test('generated sync comparison ignores transport line endings', () => {
  const lf = '---\nname: authentext\n---\n';
  const crlf = lf.replaceAll('\n', '\r\n');

  assert.equal(normalizeGeneratedText('SKILL.md', lf), lf);
  assert.equal(normalizeGeneratedText('SKILL.md', crlf), lf);

  const before = new Map([['SKILL.md', crlf]]);
  const after = new Map([['SKILL.md', lf]]);
  assert.deepEqual(getDriftedFiles(before, after), []);
});

test('generated sync comparison ignores only the AGENTS sync date', () => {
  const before = new Map([
    ['AGENTS.md', 'adapter_metadata:\n  skill_version: 3.2.0\n  last_synced: 2026-07-30\n'],
  ]);
  const after = new Map([
    ['AGENTS.md', 'adapter_metadata:\r\n  skill_version: 3.2.0\r\n  last_synced: 2026-07-31\r\n'],
  ]);

  assert.deepEqual(getDriftedFiles(before, after), []);

  after.set('AGENTS.md', 'adapter_metadata:\n  skill_version: 9.9.9\n  last_synced: 2026-07-31\n');
  assert.deepEqual(getDriftedFiles(before, after), ['AGENTS.md']);
});

test('generated sync comparison detects semantic drift', () => {
  const before = new Map([['references/core-patterns.md', '# Pattern 1\n']]);
  const after = new Map([['references/core-patterns.md', '# Pattern 2\n']]);

  assert.deepEqual(getDriftedFiles(before, after), ['references/core-patterns.md']);
});

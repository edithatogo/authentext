import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { inspectRewrite } from '../scripts/verify-rewrite.js';

test('array-valued length modes cannot disable the word budget', () => {
  assert.throws(
    () =>
      inspectRewrite('A five word document here.', 'A five word document here.', {
        readerContract: { schemaVersion: '1.0.0', length: { mode: ['maximum'], maxWords: 4 } },
      }),
    /length mode/
  );
});

test('CLI bounds profile files and never quotes malformed private metadata', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'reader-review-'));
  try {
    const input = path.join(root, 'draft.txt');
    const profile = path.join(root, 'profile.json');
    fs.writeFileSync(input, 'The service needs more staff.');
    const args = [
      'scripts/verify-rewrite.js',
      '--original',
      input,
      '--rewrite',
      input,
      '--profile',
      profile,
      '--json',
    ];
    fs.writeFileSync(
      profile,
      JSON.stringify({ schemaVersion: '1.0.0', extra: 'a'.repeat(16 * 1024 * 1024) })
    );
    const large = spawnSync(process.execPath, args, { encoding: 'utf8' });
    assert.equal(large.status, 2);
    assert.match(large.stderr, /16 MiB/);
    fs.writeFileSync(profile, '{PRIVATE_CORPUS_SECRET');
    const invalid = spawnSync(process.execPath, args, { encoding: 'utf8' });
    assert.equal(invalid.status, 2);
    assert.doesNotMatch(invalid.stderr, /PRIVATE_CORPUS_SECRET/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

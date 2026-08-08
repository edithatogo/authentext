import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

const ROOT = process.cwd();
const CLI = path.join(ROOT, 'scripts', 'build-distribution-packages.js');

test('distribution CLI rejects an output flag without a value', () => {
  const result = spawnSync(process.execPath, [CLI, '--output'], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /--output requires a directory path/);
});

test('distribution CLI reports git discovery failure clearly', () => {
  const outsideRepository = fs.mkdtempSync(path.join(os.tmpdir(), 'authentext-no-git-'));
  const result = spawnSync(process.execPath, [CLI], {
    cwd: outsideRepository,
    encoding: 'utf8',
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Failed to determine git commit/);
});

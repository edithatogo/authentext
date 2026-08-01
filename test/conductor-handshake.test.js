import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

test('Conductor handshake and mapped current or archived track artifacts validate', () => {
  const validator = path.join(process.cwd(), 'scripts', 'validate-conductor.js');
  const result = spawnSync(process.execPath, [validator], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Conductor handshake validation passed/);
});

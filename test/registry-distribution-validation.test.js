import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  GOVERNED_STATUSES,
  REQUIRED_CHANNEL_IDS,
  validateRegistryDistribution,
} from '../scripts/lib/registry-distribution.js';

const ROOT = process.cwd();
const MATRIX_PATH = path.join(ROOT, 'conductor', 'registry-distribution.json');
const VALIDATOR = path.join(ROOT, 'scripts', 'validate-registry-distribution.js');

function currentMatrix() {
  return JSON.parse(fs.readFileSync(MATRIX_PATH, 'utf8'));
}

test('current registry distribution matrix satisfies the governed contract', () => {
  assert.deepEqual(validateRegistryDistribution(currentMatrix()), []);
  assert.deepEqual([...GOVERNED_STATUSES].sort(), [
    'accepted',
    'deferred',
    'listed',
    'not_justified',
    'prepared',
    'rejected',
    'researched',
    'submitted',
    'unsupported',
    'verified',
  ]);
});

test('matrix covers every required portable registry and host channel', () => {
  const channelIds = new Set(currentMatrix().channels.map((channel) => channel.id));
  for (const id of REQUIRED_CHANNEL_IDS) {
    assert.ok(channelIds.has(id), `missing required channel ${id}`);
  }
});

test('validation rejects unknown statuses, missing evidence dates, and copied canonical sources', () => {
  const matrix = currentMatrix();
  matrix.channels[0].status = 'probably-live';
  delete matrix.channels[1].evidence.checked_on;
  matrix.channels[2].source.mode = 'copied_adapter';

  const errors = validateRegistryDistribution(matrix);
  assert.ok(errors.some((error) => error.includes('unknown governed status')));
  assert.ok(errors.some((error) => error.includes('evidence.checked_on')));
  assert.ok(errors.some((error) => error.includes('source.mode')));
});

test('validation rejects channels without pinned capability statements', () => {
  const invalid = currentMatrix();
  invalid.channels[0].capabilities = [];
  assert.match(validateRegistryDistribution(invalid).join('\n'), /capabilities/);
});

test('validation rejects a channel that claims publication without a receipt', () => {
  const matrix = currentMatrix();
  const channel = matrix.channels.find((entry) => entry.id === 'skills-sh');
  channel.status = 'listed';
  delete channel.evidence.receipt_url;

  assert.ok(validateRegistryDistribution(matrix).some((error) => error.includes('receipt_url')));
});

test('registry distribution CLI validates the checked-in matrix', () => {
  const result = spawnSync(process.execPath, [VALIDATOR], { cwd: ROOT, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Registry distribution validation passed/);
});

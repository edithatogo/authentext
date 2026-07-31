import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

test('evaluation runner writes machine-readable trigger and output receipts', () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'authentext-evals-'));
  const result = spawnSync(
    process.execPath,
    ['scripts/run-evaluations.js', '--output-dir', outputDir],
    { encoding: 'utf8' }
  );

  assert.equal(result.status, 0, result.stderr);
  for (const filename of ['trigger-summary.json', 'output-summary.json', 'summary.json']) {
    const receipt = JSON.parse(fs.readFileSync(path.join(outputDir, filename), 'utf8'));
    assert.equal(receipt.failed, 0, filename);
    assert.ok(receipt.total > 0, filename);
  }
});

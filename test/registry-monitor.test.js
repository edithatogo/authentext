import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  monitorRegistryDistribution,
  renderRegistryDriftIssue,
} from '../scripts/lib/registry-monitor.js';

const ROOT = process.cwd();
const CLI = path.join(ROOT, 'scripts', 'monitor-registry-distribution.js');

function fixture() {
  return {
    schema_version: 1,
    as_of: '2026-08-01',
    channels: [
      {
        id: 'listed',
        status: 'verified',
        release_version: '3.2.0',
        manifest_sha256: 'abc123',
        evidence: {
          checked_on: '2026-08-01',
          receipt_url: 'https://example.test/receipt',
          listing_url: 'https://example.test/listing',
        },
      },
      {
        id: 'prepared',
        status: 'prepared',
        evidence: { checked_on: '2026-08-01' },
      },
    ],
  };
}

test('reports registry, release, manifest, listing, and acceptance drift', () => {
  const matrix = fixture();
  matrix.channels[0].evidence.receipt_url = '';
  const report = monitorRegistryDistribution(matrix, {
    asOf: '2026-08-08',
    currentVersion: '3.3.0',
    observations: {
      listed: {
        present: false,
        http_status: 404,
        manifest_sha256: 'changed',
        status: 'listed',
      },
    },
  });

  assert.equal(report.healthy, false);
  assert.deepEqual(
    new Set(report.findings.map((finding) => finding.code)),
    new Set([
      'false_acceptance_claim',
      'stale_release',
      'changed_manifest',
      'broken_listing',
      'removed_package',
      'status_drift',
    ])
  );
});

test('flags stale evidence and produces stable ordering', () => {
  const matrix = fixture();
  const report = monitorRegistryDistribution(matrix, {
    asOf: '2026-12-01',
    maxAgeDays: 30,
  });
  assert.deepEqual(
    report.findings.map((finding) => `${finding.channel}:${finding.code}`),
    ['listed:stale_evidence', 'prepared:stale_evidence']
  );
});

test('does not treat prepared or deferred channels as accepted', () => {
  const matrix = fixture();
  matrix.channels[0].status = 'deferred';
  delete matrix.channels[0].evidence.receipt_url;
  const report = monitorRegistryDistribution(matrix, {
    asOf: '2026-08-08',
    currentVersion: '3.2.0',
  });
  assert.equal(report.healthy, true);
});

test('CLI writes a machine-readable artifact', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'authentext-registry-monitor-'));
  const matrixPath = path.join(temp, 'matrix.json');
  const outputPath = path.join(temp, 'report.json');
  fs.writeFileSync(matrixPath, `${JSON.stringify(fixture())}\n`);

  const result = spawnSync(
    process.execPath,
    [CLI, '--matrix', matrixPath, '--output', outputPath, '--as-of', '2026-08-08'],
    { cwd: ROOT, encoding: 'utf8' }
  );
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
  assert.equal(report.schema_version, 1);
  assert.equal(report.healthy, true);
  assert.match(result.stdout, /Registry monitor report written/);
});

test('issue rendering carries a stable idempotency marker', () => {
  const report = monitorRegistryDistribution(fixture(), { asOf: '2026-08-08' });
  const body = renderRegistryDriftIssue(report);
  assert.match(body, /^<!-- authentext-registry-monitor -->/);
  assert.match(body, /never publishes packages/);
});

test('CLI rejects flags without values with a precise error', () => {
  const result = spawnSync(process.execPath, [CLI, '--output'], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /--output requires a value/);
});

test('listing probes tolerate a malformed matrix without a channels array', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'authentext-registry-malformed-'));
  const matrixPath = path.join(temp, 'matrix.json');
  const outputPath = path.join(temp, 'report.json');
  fs.writeFileSync(matrixPath, '{"schema_version":1}\n');
  const result = spawnSync(
    process.execPath,
    [CLI, '--matrix', matrixPath, '--output', outputPath, '--probe-listings'],
    { cwd: ROOT, encoding: 'utf8' }
  );
  assert.equal(result.status, 0, result.stderr);
});

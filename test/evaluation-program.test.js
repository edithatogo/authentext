import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const modulePath = '../evaluation/preflight.js';
async function implementation() {
  const exists = fs.existsSync('evaluation/preflight.js');
  assert.ok(exists, 'The evaluation preflight implementation is missing');
  return import(modulePath);
}
function candidate() {
  return {
    id: 'example',
    status: 'candidate',
    family: 'editing',
    source: 'https://example.org/paper',
    purpose: 'Compare editing outcomes',
    limits: 'Not a semantic guarantee',
    admission: {
      revision: null,
      sha256: null,
      licence: null,
      rightsReceipt: null,
      splitManifest: null,
      adapterReceipt: null,
    },
  };
}
function completeMetadata() {
  const record = candidate();
  record.status = 'metadata-complete';
  record.admission = {
    revision: 'a'.repeat(40),
    sha256: 'b'.repeat(64),
    licence: 'MIT',
    rightsReceipt: 'receipts/rights.json',
    splitManifest: 'splits/frozen.json',
    adapterReceipt: 'receipts/adapter.json',
  };
  return record;
}
test('catalog candidates cannot be mistaken for completed evaluations', async () => {
  const { assessBenchmark } = await implementation();
  const result = assessBenchmark(candidate());
  assert.equal(result.metadataComplete, false);
  assert.equal(result.executionAuthorised, false);
  assert.equal(result.qualityCertified, false);
  assert.ok(result.missing.includes('revision'));
});
test('complete declarations are still not evidence or execution authority', async () => {
  const { assessBenchmark } = await implementation();
  const result = assessBenchmark(completeMetadata());
  assert.equal(result.metadataComplete, true);
  assert.equal(result.executionAuthorised, false);
  assert.equal(result.qualityCertified, false);
  assert.equal(result.receiptsVerified, false);
});
test('moving refs, malformed hashes and unsafe receipt paths block admission', async () => {
  const { assessBenchmark } = await implementation();
  for (const [field, value] of [
    ['revision', 'main'],
    ['sha256', 'abc'],
    ['splitManifest', '../private.json'],
    ['rightsReceipt', 'C:\\private.json'],
    ['adapterReceipt', 'https://example.org/receipt'],
  ]) {
    const record = completeMetadata();
    record.admission[field] = value;
    assert.equal(assessBenchmark(record).metadataComplete, false, field);
  }
});
test('parser rejects duplicate keys, aliases and unknown YAML tags', async () => {
  const { parseRegistry } = await implementation();
  for (const text of ['id: one\nid: two\n', 'x: &x [1]\ny: *x\n', 'x: !remote file\n']) {
    assert.throws(() => parseRegistry(text));
  }
});
test('registry schema errors and duplicate IDs fail closed', async () => {
  const { validateCatalog } = await implementation();
  assert.throws(() => validateCatalog({ schemaVersion: '2', benchmarks: [] }));
  assert.throws(() =>
    validateCatalog({ schemaVersion: '1.0.0', benchmarks: [candidate(), candidate()] })
  );
  const bad = candidate();
  bad.source = 'file:///private';
  assert.throws(() => validateCatalog({ schemaVersion: '1.0.0', benchmarks: [bad] }));
});
test('publication labels cannot be promoted by a declared catalog status', async () => {
  const { validateCatalog } = await implementation();
  const bad = completeMetadata();
  bad.status = 'externally-validated';
  assert.throws(() => validateCatalog({ schemaVersion: '1.0.0', benchmarks: [bad] }));
});
test('checked-in catalog covers complementary tasks without admitted datasets', async () => {
  const { parseRegistry, validateCatalog } = await implementation();
  const catalog = parseRegistry(fs.readFileSync('evaluation/benchmarks.yaml', 'utf8'));
  const results = validateCatalog(catalog);
  assert.ok(results.length >= 10);
  for (const id of [
    'editeval',
    'asset',
    'salsa',
    'iterater',
    'true',
    'aggrefact',
    'biolaysumm',
    'ifeval',
    'lifebench',
    'liftbench',
    'newsagent',
  ]) {
    assert.ok(
      results.some((row) => row.id === id),
      id
    );
  }
  assert.ok(results.every((row) => !row.metadataComplete && !row.qualityCertified));
});
test('ecosystem records observed immutable revisions without claiming integration', async () => {
  const { parseRegistry } = await implementation();
  const registry = parseRegistry(fs.readFileSync('evaluation/ecosystem.yaml', 'utf8'));
  assert.equal(registry.schemaVersion, '1.0.0');
  for (const row of registry.repositories) {
    assert.match(row.repository, /^edithatogo\/[A-Za-z0-9_-]+$/);
    if (row.observedRevision) assert.match(row.observedRevision, /^[a-f0-9]{40}$/);
    assert.equal(row.compatibilityProven, false);
    assert.ok(row.consume && row.doNotDuplicate && row.gate);
  }
});
test('dependency choices preserve the zero-install runtime boundary', async () => {
  const { parseRegistry } = await implementation();
  const choices = parseRegistry(fs.readFileSync('evaluation/dependencies.yaml', 'utf8'));
  assert.equal(choices.portableRuntimeNewDependencies, 0);
  assert.equal(choices.automaticInstallation, false);
  for (const item of choices.libraries) {
    assert.ok(
      ['existing-development', 'evaluation-candidate', 'parser-candidate'].includes(item.status)
    );
    assert.ok(item.replaces && item.admissionGate && item.source.startsWith('https://'));
  }
});
test('CLI reports only metadata readiness and refuses unknown flags', async () => {
  await implementation();
  const result = spawnSync(process.execPath, ['evaluation/preflight.js', '--json'], {
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.kind, 'catalog-metadata-preflight');
  assert.equal(report.externalExperimentsRun, 0);
  assert.equal(report.qualityCertified, false);
  assert.equal(
    spawnSync(process.execPath, ['evaluation/preflight.js', '--run-model'], { encoding: 'utf8' })
      .status,
    2
  );
});
test('CLI returns a bounded error rather than running a malformed catalog', async () => {
  await implementation();
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'authentext-catalog-'));
  try {
    const filename = path.join(temporary, 'bad.yaml');
    fs.writeFileSync(filename, 'schemaVersion: 1.0.0\nbenchmarks: broken\n');
    const result = spawnSync(process.execPath, ['evaluation/preflight.js', '--catalog', filename], {
      encoding: 'utf8',
    });
    assert.equal(result.status, 2);
    assert.match(result.stderr, /preflight/);
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
});

test('identifier, revision and digest declarations reject coercible arrays', async () => {
  const { validateCatalog, assessBenchmark } = await implementation();
  const bad = candidate();
  bad.id = ['example'];
  assert.throws(() => validateCatalog({ schemaVersion: '1.0.0', benchmarks: [bad] }));
  const metadata = completeMetadata();
  metadata.admission.revision = ['a'.repeat(40)];
  metadata.admission.sha256 = ['b'.repeat(64)];
  assert.equal(assessBenchmark(metadata).metadataComplete, false);
});

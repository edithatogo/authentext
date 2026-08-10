import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const TRACK = path.join(
  process.cwd(),
  'conductor',
  'tracks',
  'archive',
  'agent-registry-plugin-distribution_20260802'
);
const schema = JSON.parse(
  fs.readFileSync(path.join(TRACK, 'package-manifest.schema.json'), 'utf8')
);
const example = JSON.parse(
  fs.readFileSync(path.join(TRACK, 'package-manifest.example.json'), 'utf8')
);
const SHA256 = /^[a-f0-9]{64}$/;

test('distribution manifest schema closes every security-sensitive object', () => {
  assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema');
  assert.equal(schema.additionalProperties, false);
  for (const key of ['package', 'source', 'artifact', 'capabilities', 'sbom', 'provenance']) {
    assert.equal(schema.properties[key].additionalProperties, false, key);
  }
});

test('example package is canonical, deterministic, skill-only, and hash-addressed', () => {
  assert.equal(example.source.repository, 'https://github.com/edithatogo/authentext');
  assert.equal(example.package.generated, true);
  assert.ok(Number.isInteger(example.source.sourceDateEpoch));
  assert.deepEqual(example.capabilities, { apps: [], tools: [], hooks: [], network: [] });

  const hashes = [
    example.artifact.sha256,
    example.sbom.sha256,
    example.provenance.sha256,
    example.provenance.invocationSha256,
    ...example.contents.map((entry) => entry.sha256),
    ...example.provenance.materials.map((entry) => entry.sha256),
  ];
  assert.ok(hashes.every((hash) => SHA256.test(hash)));
});

test('example package records all mandatory exclusion classes', () => {
  assert.deepEqual(
    new Set(example.exclusions),
    new Set([
      'repository-internals',
      'credentials-and-secrets',
      'development-inputs',
      'governance-history',
      'unsafe-filesystem-entries',
    ])
  );
});

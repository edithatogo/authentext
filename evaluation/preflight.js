#!/usr/bin/env node
// Development-only metadata checks. This is not a benchmark runner or a rights verifier.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { parseDocument } from 'yaml';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const STATUSES = new Set(['candidate', 'watch', 'metadata-complete']);
const RECEIPTS = ['rightsReceipt', 'splitManifest', 'adapterReceipt'];
const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const nonempty = (value) => typeof value === 'string' && value.trim().length > 0;
const relativeReceipt = (value) =>
  nonempty(value) &&
  !/[\\:]/u.test(value) &&
  !value.startsWith('/') &&
  !value.split('/').some((part) => part === '..' || part === '.' || part === '');

export function parseRegistry(text) {
  if (typeof text !== 'string' || Buffer.byteLength(text, 'utf8') > 1024 * 1024)
    throw new TypeError('Registry must be UTF-8 text under 1 MiB');
  const document = parseDocument(text, { uniqueKeys: true, schema: 'core', merge: false });
  if (document.errors.length || document.warnings.length)
    throw new TypeError('Invalid registry YAML');
  const result = document.toJS({ maxAliasCount: 0 });
  if (!object(result)) throw new TypeError('Registry must contain an object');
  return result;
}
export function assessBenchmark(record) {
  if (!object(record) || !object(record.admission))
    throw new TypeError('Benchmark admission metadata must be an object');
  const metadata = record.admission;
  const missing = [];
  if (
    typeof metadata.revision !== 'string' ||
    !/^(?:[a-f0-9]{40}|sha256:[a-f0-9]{64})$/u.test(metadata.revision)
  )
    missing.push('revision');
  if (typeof metadata.sha256 !== 'string' || !/^[a-f0-9]{64}$/u.test(metadata.sha256))
    missing.push('sha256');
  if (!nonempty(metadata.licence) || /^(?:unknown|pending|todo)$/iu.test(metadata.licence.trim()))
    missing.push('licence');
  for (const key of RECEIPTS) if (!relativeReceipt(metadata[key])) missing.push(key);
  return {
    id: record.id,
    status: record.status,
    metadataComplete: missing.length === 0,
    missing,
    receiptsVerified: false,
    executionAuthorised: false,
    qualityCertified: false,
  };
}
export function validateCatalog(catalog) {
  if (
    !object(catalog) ||
    catalog.schemaVersion !== '1.0.0' ||
    !Array.isArray(catalog.benchmarks) ||
    catalog.benchmarks.length === 0
  )
    throw new TypeError('Unsupported benchmark catalog schema');
  const ids = new Set();
  return catalog.benchmarks.map((record) => {
    if (
      !object(record) ||
      !nonempty(record.id) ||
      !/^[a-z][a-z0-9-]+$/u.test(record.id) ||
      ids.has(record.id)
    )
      throw new TypeError('Invalid or duplicated benchmark identifier');
    ids.add(record.id);
    for (const key of ['family', 'purpose', 'limits'])
      if (!nonempty(record[key])) throw new TypeError('Missing benchmark field: ' + key);
    if (!nonempty(record.source)) throw new TypeError('Missing benchmark source');
    const source = new URL(record.source);
    if (source.protocol !== 'https:' || source.username || source.password)
      throw new TypeError('Benchmark source must be a public HTTPS reference');
    if (!STATUSES.has(record.status)) throw new TypeError('Unsupported benchmark status');
    const result = assessBenchmark(record);
    if (record.status === 'metadata-complete' && !result.metadataComplete)
      throw new TypeError('Claimed complete metadata has missing fields');
    return result;
  });
}
function main() {
  try {
    const { values } = parseArgs({
      options: {
        catalog: { type: 'string', default: path.join(HERE, 'benchmarks.yaml') },
        json: { type: 'boolean', default: false },
        'require-metadata': { type: 'boolean', default: false },
      },
      strict: true,
    });
    const rows = validateCatalog(parseRegistry(fs.readFileSync(values.catalog, 'utf8')));
    const report = {
      schemaVersion: '1.0.0',
      kind: 'catalog-metadata-preflight',
      metadataComplete: rows.every((row) => row.metadataComplete),
      receiptsVerified: false,
      executionAuthorised: false,
      externalExperimentsRun: 0,
      qualityCertified: false,
      benchmarks: rows,
      limitations: [
        'Declaration checks only; no data, licence terms, receipt files or models were executed or verified',
      ],
    };
    process.stdout.write(JSON.stringify(report, null, values.json ? 0 : 2) + '\n');
    if (values['require-metadata'] && !report.metadataComplete) process.exitCode = 1;
  } catch (error) {
    process.stderr.write('evaluation-preflight: ' + error.message + '\n');
    process.exitCode = 2;
  }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();

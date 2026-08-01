import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeLcov } from '../scripts/run-coverage.js';

test('LCOV summaries are deterministic and machine-readable', () => {
  const lcov = [
    'TN:',
    'SF:a.js',
    'FNF:2',
    'FNH:1',
    'BRF:4',
    'BRH:3',
    'LF:10',
    'LH:8',
    'end_of_record',
    '',
  ].join('\n');
  assert.deepEqual(summarizeLcov(lcov), {
    schemaVersion: 1,
    files: 1,
    lines: { found: 10, hit: 8, percent: 80 },
    functions: { found: 2, hit: 1, percent: 50 },
    branches: { found: 4, hit: 3, percent: 75 },
  });
});

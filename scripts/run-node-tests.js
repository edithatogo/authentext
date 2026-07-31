import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const TEST_DIR = path.join(REPO_ROOT, 'test');

const testFiles = fs
  .readdirSync(TEST_DIR, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith('.test.js'))
  .map((entry) => path.join(TEST_DIR, entry.name))
  .sort();

if (testFiles.length === 0) {
  console.error('No Node test files found under test/*.test.js');
  process.exit(1);
}

function nodeSupportsTestIsolationNone() {
  const help = spawnSync(process.execPath, ['--help'], {
    encoding: 'utf8',
  });
  const output = `${help.stdout ?? ''}${help.stderr ?? ''}`;
  return help.status === 0 && /\btest-isolation\b/.test(output);
}

const nodeArgs = ['--test'];
if (nodeSupportsTestIsolationNone()) {
  nodeArgs.push('--test-isolation=none');
}

function runTests(label, files) {
  console.log(`\n--- ${label} ---`);
  const result = spawnSync(process.execPath, [...nodeArgs, ...files], {
    cwd: REPO_ROOT,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

for (const testFile of testFiles) {
  runTests(`Isolated: ${path.relative(REPO_ROOT, testFile)}`, [testFile]);
}

runTests(`Aggregate: ${testFiles.length} Node test files`, testFiles);

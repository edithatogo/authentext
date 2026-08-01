import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function percent(hit, found) {
  return found === 0 ? 100 : Number(((hit / found) * 100).toFixed(2));
}

export function summarizeLcov(source) {
  const totals = { LF: 0, LH: 0, FNF: 0, FNH: 0, BRF: 0, BRH: 0 };
  for (const line of source.split(/\r?\n/)) {
    const match = /^(LF|LH|FNF|FNH|BRF|BRH):(\d+)$/.exec(line);
    if (match) totals[match[1]] += Number(match[2]);
  }

  return {
    schemaVersion: 1,
    files: (source.match(/^SF:/gm) ?? []).length,
    lines: { found: totals.LF, hit: totals.LH, percent: percent(totals.LH, totals.LF) },
    functions: { found: totals.FNF, hit: totals.FNH, percent: percent(totals.FNH, totals.FNF) },
    branches: { found: totals.BRF, hit: totals.BRH, percent: percent(totals.BRH, totals.BRF) },
  };
}

function main() {
  const testFiles = fs
    .readdirSync(path.join(ROOT, 'test'))
    .filter((file) => file.endsWith('.test.js'))
    .sort()
    .map((file) => path.join('test', file));
  const result = spawnSync(
    process.execPath,
    [
      '--test',
      '--experimental-test-coverage',
      '--test-coverage-include=scripts/**/*.js',
      '--test-coverage-lines=75',
      '--test-coverage-functions=80',
      '--test-coverage-branches=60',
      '--test-reporter=lcov',
      ...testFiles,
    ],
    { cwd: ROOT, encoding: 'utf8' }
  );
  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout);
    process.exit(result.status ?? 1);
  }

  const outputDir = path.join(ROOT, 'coverage');
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'lcov.info'), result.stdout);
  const summary = summarizeLcov(result.stdout);
  fs.writeFileSync(path.join(outputDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify(summary)}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();

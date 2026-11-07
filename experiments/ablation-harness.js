#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseArgs, readText } from '../scripts/lib/frontier-text.js';
import { inspectRewrite } from '../scripts/verify-rewrite.js';
import {
  buildVariants,
  scoreAttempts,
  assertExecutionMode,
} from '../evaluation/ablation-design.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = path.join(root, 'src/modules/SKILL_CORE_PATTERNS.md');
export function parsePatterns(source) {
  const matches = [...source.matchAll(/^### Pattern (\d+):\s*(.+)$/gmu)];
  const patterns = matches.map((m, index) => {
    const start = m.index,
      next = matches[index + 1]?.index ?? source.length;
    const part = source
      .slice(start, next)
      .split(/^## (?!#)/mu)[0]
      .trim();
    return { id: Number(m[1]), name: m[2].trim(), content: part };
  });
  const ids = patterns.map((p) => p.id);
  if (patterns.length !== 40 || new Set(ids).size !== 40 || ids.some((id, i) => id !== i + 1)) {
    throw new Error('Expected each numbered pattern from 1 through 40 exactly once');
  }
  return patterns;
}
export const variants = buildVariants;
function executeProvider(provider, input, prompt, id) {
  // Explicitly selected local adapter. No shell, web request, or source echo in reports.
  const script = path.resolve(provider);
  if (!fs.statSync(script).isFile() || !/\.(mjs|js)$/iu.test(script))
    throw new Error('Provider must be a local Node script');
  const result = spawnSync(process.execPath, [script], {
    cwd: root,
    input: JSON.stringify({ source: input, prompt, id }),
    encoding: 'utf8',
    timeout: 120000,
    maxBuffer: 8 * 1024 * 1024,
    env: { ...process.env, AUTHENTEXT_ABLATION: '1' },
  });
  if (result.status !== 0) throw new Error('Local provider failed for ' + id);
  let response = result.stdout.trim();
  try {
    const parsed = JSON.parse(response);
    if (typeof parsed.output === 'string') response = parsed.output;
  } catch {}
  if (!response) throw new Error('Empty provider result for ' + id);
  return response;
}
export function evaluate({
  source,
  provider,
  original,
  selected = variants(parsePatterns(source)),
}) {
  if (provider && (typeof original !== 'string' || !original.trim()))
    throw new TypeError('A provider requires nonempty source text');
  const result = scoreAttempts(
    selected,
    provider
      ? {
          execute: (run) => executeProvider(provider, original, run.prompt, run.id),
          inspect: (output) => inspectRewrite(original, output, { mode: 'standard' }),
        }
      : {}
  );
  return {
    schemaVersion: '1.1.0',
    kind: 'ablation',
    dryRun: !provider,
    patternCount: 40,
    variantCount: result.rows.length,
    safetyContractFixed: true,
    limitations: [
      'Planning and heuristic checks are not independent editorial evidence',
      'Failed and inconclusive attempts remain in the denominator',
      'Token estimate is UTF-8 bytes divided by four, not model tokenisation',
    ],
    ...result,
  };
}
function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    assertExecutionMode({
      dryRun: args['dry-run'] === true,
      provider: args.provider,
      input: args.input,
    });
    const all = variants(parsePatterns(readText(sourcePath)));
    const report = evaluate({
      source: readText(sourcePath),
      provider: args.provider,
      original: args.input ? readText(args.input) : null,
      selected: all,
    });
    const out = path.resolve(args.output ?? 'experiments/reports/ablation-schema.json');
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(report, null, 2) + '\n');
    process.stdout.write(
      JSON.stringify({
        path: out,
        patternCount: report.patternCount,
        variantCount: report.variantCount,
        dryRun: report.dryRun,
      }) + '\n'
    );
    if (report.summary.providerFailures || report.summary.verifierFailures) process.exitCode = 1;
  } catch (e) {
    process.stderr.write('ablation: ' + e.message + '\n');
    process.exitCode = 2;
  }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();

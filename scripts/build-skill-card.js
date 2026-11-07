#!/usr/bin/env node
import { isDirectExecution } from './lib/local-file-io.js';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { EDITORIAL_RUNTIME, OFFLINE_BUILTINS } from './lib/runtime-surface.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = path.join(ROOT, 'SKILL_CARD.json');
const IGNORE = new Set([
  '.git',
  'node_modules',
  'coverage',
  'distribution-staging',
  'release-artifacts',
  '.cache',
  '.review-toolchain',
  '.local-review',
  '.superpowers',
]);
export const SHA = (text) => crypto.createHash('sha256').update(text).digest('hex');
export function walk(dir) {
  const result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE.has(entry.name)) continue;
    const target = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) result.push(...walk(target));
    else if (entry.isFile()) result.push(target);
  }
  return result.sort();
}
export const relative = (p) => path.relative(ROOT, p).split(path.sep).join('/');
export function securityFindings(source, { runtime = false, promptSurface = false } = {}) {
  const findings = [];
  if (/[\u202A-\u202E\u2066-\u2069\u{E0000}-\u{E007F}]/u.test(source))
    findings.push('hidden-unicode-control');
  if (
    runtime &&
    /(?:\bfetch\s*\(|\bhttps?\.request\s*\(|\bnet\.connect\s*\(|\bXMLHttpRequest\b|\bWebSocket\b|\bexec\s*\([^)]*https?:\/\/)/u.test(
      source
    )
  ) {
    findings.push('network-capable-primitive');
  }
  if (
    runtime &&
    /\b(?:from|require\()\s*['"](?:node:)?(?:http|https|net|tls|dgram)['"]/u.test(source)
  ) {
    findings.push('network-module-import');
  }
  if (runtime) {
    if (/\b(?:eval|import)\s*\(|\bnew\s+Function\s*\(|\brequire\s*\(/u.test(source))
      findings.push('dynamic-code-or-import');
    for (const match of source.matchAll(/\b(?:from\s*|import\s*)['"]([^'"]+)['"]/gu)) {
      if (!match[1].startsWith('.') && !OFFLINE_BUILTINS.includes(match[1]))
        findings.push('unapproved-runtime-import');
    }
  }
  if (
    promptSurface &&
    /\b(?:ignore all previous instructions|reveal your system prompt)\b/iu.test(source)
  ) {
    findings.push('untrusted-prompt-directive');
  }
  return findings;
}
function counts(text) {
  return {
    bytes: Buffer.byteLength(text, 'utf8'),
    words: (text.match(/[\p{L}\p{N}]+/gu) || []).length,
    estimatedTokens: Math.ceil(Buffer.byteLength(text, 'utf8') / 4),
  };
}
export function card(root = ROOT) {
  const artifactPaths = [
    'SKILL.md',
    'SKILL_PROFESSIONAL.md',
    ...fs
      .readdirSync(path.join(root, 'references'))
      .filter((f) => f.endsWith('.md'))
      .map((f) => 'references/' + f),
    ...walk(path.join(root, 'scripts'))
      .filter((f) => f.endsWith('.js') || f.endsWith('.mjs'))
      .map((f) => path.relative(root, f).split(path.sep).join('/')),
  ].sort();
  const artifacts = artifactPaths.map((file) => {
    const data = fs.readFileSync(path.join(root, file));
    const text = data.toString('utf8');
    if (text.includes('\r')) throw new Error('Non-LF line ending in ' + file);
    const problems = securityFindings(text, { runtime: EDITORIAL_RUNTIME.includes(file) });
    if (EDITORIAL_RUNTIME.includes(file)) {
      for (const match of text.matchAll(/\bfrom\s*['"]([^'"]+)['"]/gu)) {
        if (match[1].startsWith('.')) {
          const dependency = path.posix.normalize(
            path.posix.join(path.posix.dirname(file), match[1])
          );
          if (!EDITORIAL_RUNTIME.includes(dependency)) problems.push('unlisted-runtime-dependency');
        }
      }
    }
    if (problems.length) throw new Error('Security scan ' + file + ': ' + problems.join(','));
    return { path: file, sha256: SHA(data), ...counts(text) };
  });
  const markdown = walk(root).filter((f) => f.endsWith('.md'));
  for (const file of markdown) {
    const source = fs.readFileSync(file, 'utf8');
    const problems = securityFindings(source, { promptSurface: true });
    if (problems.length)
      throw new Error('Markdown scan ' + path.relative(root, file) + ': ' + problems.join(','));
  }
  const rootTokens = artifacts.find((x) => x.path === 'SKILL.md').estimatedTokens;
  const ceiling = 8500;
  if (rootTokens > ceiling)
    throw new Error('Root skill token estimate ' + rootTokens + ' > ' + ceiling);
  return {
    schemaVersion: '1.0.0',
    product: 'authentext',
    sourceRepository: 'edithatogo/authentext',
    tokenEstimator:
      'UTF-8 byte length divided by four; conservative approximation, not model tokenisation',
    rootSkillTokenCeiling: ceiling,
    rootSkillEstimatedTokens: rootTokens,
    security: {
      hiddenUnicodeControls: 'rejected',
      runtimeNetworkPrimitives: 'static screening of explicitly allow-listed runtime closure',
      runtimeFiles: [...EDITORIAL_RUNTIME],
      limitation: 'Static heuristics and hashes are not a sandbox or signed provenance',
      nonEgress: 'local scripts only; provider adapters are independent trust boundary',
    },
    artifacts,
  };
}
export function skillCardText(root = ROOT) {
  return JSON.stringify(card(root), null, 2) + '\n';
}
export function writeSkillCard() {
  fs.writeFileSync(OUTPUT, skillCardText(), 'utf8');
}
export function validateSkillCard() {
  if (!fs.existsSync(OUTPUT)) throw new Error('SKILL_CARD.json is missing: run npm run sync');
  const actual = fs.readFileSync(OUTPUT, 'utf8');
  if (actual !== skillCardText()) throw new Error('SKILL_CARD.json has drifted: run npm run sync');
}
function main() {
  try {
    if (process.argv.includes('--check')) validateSkillCard();
    else writeSkillCard();
    process.stdout.write('Skill card validated\n');
  } catch (error) {
    process.stderr.write(error.message + '\n');
    process.exitCode = 1;
  }
}
if (isDirectExecution(import.meta.url)) main();

import fs from 'node:fs';
import path from 'node:path';

export const normalize = (s) => s.replace(/\r\n?/gu, '\n').normalize('NFC');
// Document bytes are not normalised: code and lock spans require exact fidelity.
export const readText = (p) => fs.readFileSync(p, 'utf8');
export function inputFiles(location) {
  const target = path.resolve(location);
  const stat = fs.lstatSync(target);
  if (stat.isSymbolicLink()) throw new Error('Symlinks are not allowed');
  if (stat.isFile()) {
    if (!/\.(md|txt)$/iu.test(target)) throw new Error('Only Markdown or text inputs');
    return [target];
  }
  if (!stat.isDirectory()) throw new Error('Not a regular input');
  const files = [];
  for (const item of fs.readdirSync(target, { withFileTypes: true })) {
    if (item.isSymbolicLink()) throw new Error('Symlinks are not allowed');
    if (item.isDirectory() || (item.isFile() && /\.(md|txt)$/iu.test(item.name))) {
      files.push(...inputFiles(path.join(target, item.name)));
    }
  }
  return files.sort();
}
export function proseOnly(source) {
  const lines = normalize(source).split('\n');
  let front = lines[0] === '---',
    fence = null,
    math = false;
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (front) {
      if (i > 0 && line.trim() === '---') front = false;
      continue;
    }
    const marker = /^\s{0,3}(\x60{3,}|~{3,})/u.exec(line);
    if (fence) {
      if (new RegExp('^\\s{0,3}' + fence[0] + '{' + fence.length + ',}\\s*$').test(line))
        fence = null;
      continue;
    }
    if (marker) {
      fence = marker[1];
      continue;
    }
    if (/^\s*\$\$[^\n]*\$\$\s*$/u.test(line)) {
      out.push('');
      continue;
    }
    if (/^\s*\$\$\s*$/u.test(line)) {
      math = !math;
      continue;
    }
    if (math) continue;
    out.push(line);
  }
  return out
    .join('\n')
    .replace(/\\\[[\s\S]*?\\\]/gu, ' ')
    .replace(/\\\([\s\S]*?\\\)/gu, ' ')
    .replace(/(?<!\\)\$[^$\n]+(?<!\\)\$/gu, ' ')
    .replace(/\x60+[^\x60\n]*\x60+/gu, ' ')
    .replace(/!?\[[^\]]+\]\([^)]+\)/gu, ' ')
    .replace(/^\s*#{1,6}\s+/gmu, '')
    .replace(/^\s*[-*+]\s+/gmu, '');
}
export const words = (s) =>
  [...s.matchAll(/[\p{L}\p{N}]+(?:['-][\p{L}\p{N}]+)*/gu)].map((x) => x[0].toLowerCase());
const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
export function quantile(values, q) {
  if (!values.length) return 0;
  const v = [...values].sort((a, b) => a - b);
  const x = (v.length - 1) * q,
    lo = Math.floor(x),
    hi = Math.ceil(x);
  return v[lo] + (v[hi] - v[lo]) * (x - lo);
}
export function metrics(source) {
  const prose = proseOnly(source);
  const tokens = words(prose);
  const sentences = prose
    .replace(/\n+/gu, ' ')
    .trim()
    .split(/(?<=[.!?])\s+(?=[\p{Lu}\p{N}"'(])/u)
    .map((s) => words(s).length)
    .filter(Boolean);
  const mu = mean(sentences),
    sd = Math.sqrt(mean(sentences.map((n) => (n - mu) ** 2)));
  const paragraphs = prose.split(/\n\s*\n/gu).filter((p) => words(p).length);
  const scale = tokens.length ? 1000 / tokens.length : 0;
  const punct = {
    hyphen: /-/gu,
    enDash: /\u2013/gu,
    emDash: /\u2014/gu,
    semicolon: /;/gu,
    colon: /:/gu,
    parentheses: /\([^)]*\)/gu,
    questionMark: /\?/gu,
  };
  const rhetorical = {
    initialConjunctions: /(?:^|[.!?]\s+)(?:and|but|so|yet|or)\b/gimu,
    hedges: /\b(?:may|might|could|perhaps|possibly|suggests?|appears?|likely|uncertain)\b/gimu,
    firstPerson: /\b(?:I|me|my|mine|we|us|our|ours)\b/gu,
  };
  const rates = (types) =>
    Object.fromEntries(
      Object.entries(types).map(([k, re]) => [k, [...prose.matchAll(re)].length * scale])
    );
  const summarize = (a) => ({
    mean: mean(a),
    p25: quantile(a, 0.25),
    p50: quantile(a, 0.5),
    p75: quantile(a, 0.75),
  });
  return {
    wordCount: tokens.length,
    sentenceCount: sentences.length,
    sentenceLength: {
      mean: mu,
      sd,
      cv: mu ? sd / mu : 0,
      p10: quantile(sentences, 0.1),
      p25: quantile(sentences, 0.25),
      p50: quantile(sentences, 0.5),
      p75: quantile(sentences, 0.75),
      p90: quantile(sentences, 0.9),
    },
    typeTokenRatio: tokens.length ? new Set(tokens).size / tokens.length : 0,
    paragraphs: {
      count: paragraphs.length,
      words: summarize(paragraphs.map((p) => words(p).length)),
      sentences: summarize(paragraphs.map((p) => p.split(/(?<=[.!?])\s+/u).length)),
    },
    punctuationPer1000: rates(punct),
    rhetoricalPer1000: rates(rhetorical),
  };
}
export function invariants(source) {
  const lines = source.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/u, '').split('\n');
  let fence = null,
    buf = [];
  const codeBlocks = [],
    other = [];
  for (const line of lines) {
    const marker = /^\s{0,3}(\x60{3,}|~{3,})/u.exec(line);
    if (!fence && marker) {
      fence = marker[1];
      buf = [line];
      other.push('');
      continue;
    }
    if (fence) {
      buf.push(line);
      other.push('');
      if (new RegExp('^\\s{0,3}' + fence[0] + '{' + fence.length + ',}\\s*$').test(line)) {
        codeBlocks.push(buf.join('\n'));
        fence = null;
        buf = [];
      }
      continue;
    }
    other.push(line);
  }
  if (fence) codeBlocks.push(buf.join('\n'));
  let s = other.join('\n');
  const take = (re) => [...s.matchAll(re)].map((m) => m[0]);
  const inlineCode = take(/\x60+[^\x60\n]+\x60+/gu);
  s = s.replace(/\x60+[^\x60\n]+\x60+/gu, ' ');
  const markdownLinks = take(/!?\[[^\]]+\]\([^)]+\)/gu);
  const urls = take(/https?:\/\/[^\s<>")\]]+/gu);
  const dois = take(/\b10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+/gu);
  const citations = [
    ...take(/\[(?:\d+(?:\s*[-,\u2013]\s*\d+)*|@[A-Za-z0-9_:-]+)\]/gu),
    ...take(/\([A-Z][A-Za-z'. -]+,\s*(?:19|20)\d{2}[a-z]?\)/gu),
  ];
  s = s
    .replace(/https?:\/\/[^\s<>")\]]+/gu, ' ')
    .replace(/\b10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+/gu, ' ')
    .replace(/\[(?:\d+(?:\s*[-,\u2013]\s*\d+)*|@[A-Za-z0-9_:-]+)\]/gu, ' ')
    .replace(/\([A-Z][A-Za-z'. -]+,\s*(?:19|20)\d{2}[a-z]?\)/gu, ' ')
    .replace(/!?\[[^\]]+\]\([^)]+\)/gu, ' ');
  const numbers = [...s.matchAll(/(?<![\p{L}\p{N}])[-+\u2212]?\d+(?:[.,]\d+)*(?:%|\b)/gu)].map(
    (m) => m[0]
  );
  const pValues = [...s.matchAll(/\bp\s*(?:=|<|>|≤|≥)\s*[-+\u2212]?\d+(?:\.\d+)?/giu)].map(
    (m) => m[0]
  );
  const currencies = [
    ...s.matchAll(/(?:[$€£¥]|\b(?:USD|AUD|NZD|EUR|GBP))\s*[-+]?\d+(?:[.,]\d+)*/gu),
  ].map((m) => m[0]);
  const units = [
    ...s.matchAll(
      /(?<![\p{L}\p{N}])[-+\u2212]?\d+(?:\.\d+)?\s*(?:mg|mcg|µg|μg|kg|g|mL|ml|L|mmol|mol|mmHg|cm|mm|km|m|IU|units?|hours?|days?|weeks?|months?|years?)\b/gu
    ),
  ].map((m) => m[0]);
  const dates = [
    ...s.matchAll(
      /\b(?:\d{1,2}\s+)?(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,4}(?:,?\s+\d{4})?\b/gu
    ),
  ].map((m) => m[0]);
  return {
    codeBlocks,
    inlineCode,
    markdownLinks,
    urls,
    dois,
    citations,
    numbers,
    pValues,
    currencies,
    units,
    dates,
  };
}
export function multisetDiff(want, got) {
  const map = new Map();
  for (const s of got) map.set(s, (map.get(s) || 0) + 1);
  const missing = [];
  for (const s of want) {
    const n = map.get(s) || 0;
    if (n) map.set(s, n - 1);
    else missing.push(s);
  }
  const added = [];
  for (const [s, n] of map) for (let j = 0; j < n; j++) added.push(s);
  return { missing, added };
}
export function parseArgs(args, allowed = null) {
  const output = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg.startsWith('--')) throw new Error('Unexpected positional argument');
    const name = arg.slice(2);
    if (allowed && !allowed.includes(name)) throw new Error('Unknown option ' + arg);
    if (Object.hasOwn(output, name)) throw new Error('Duplicate option ' + arg);
    if (
      [
        'json',
        'allow-code-edits',
        'dry-run',
        'allow-duplicate-cites',
        'allow-modality-shift',
      ].includes(name)
    )
      output[name] = true;
    else {
      if (!args[i + 1] || args[i + 1].startsWith('--')) throw new Error('Missing ' + arg);
      output[name] = args[++i];
    }
  }
  return output;
}

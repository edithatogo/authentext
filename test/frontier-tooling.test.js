import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { invariants, metrics, proseOnly, quantile } from '../scripts/lib/frontier-text.js';
import { inspectRewrite } from '../scripts/verify-rewrite.js';
import { calibrate } from '../scripts/calibrate-voice.js';
import { parsePatterns, variants, evaluate } from '../experiments/ablation-harness.js';
import { securityFindings, card, skillCardText } from '../scripts/build-skill-card.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const node = (file, args = []) =>
  spawnSync(process.execPath, [path.join(root, file), ...args], { encoding: 'utf8', cwd: root });
test('prose excludes frontmatter, fenced code, inline code and display math', () => {
  const text = [
    '---',
    'name: sample',
    '---',
    'A short sentence.',
    '~~~js',
    'const x = 7;',
    '~~~',
    'More ordinary writing here.',
    'Use ' + String.fromCharCode(96) + 'api=34' + String.fromCharCode(96) + '.',
    '$$',
    '42',
    '$$',
  ].join('\n');
  const found = proseOnly(text);
  assert.doesNotMatch(found, /const x|api=34|name: sample|42/u);
  assert.match(found, /ordinary writing/u);
});
test('mean, population sigma, quantiles and CV are computed correctly', () => {
  const m = metrics('One word. Two more words. This is a longer sentence.');
  assert.equal(m.sentenceLength.mean, 10 / 3);
  assert.ok(Math.abs(m.sentenceLength.sd - Math.sqrt(14) / 3) < 0.0001);
  assert.equal(quantile([1, 3, 5], 0.5), 3);
  assert.equal(m.sentenceLength.cv, m.sentenceLength.sd / m.sentenceLength.mean);
});
test('invariant verification blocks citation, DOI, p-value, numeric and code drift', () => {
  const plain =
    'A citation [12], DOI 10.1038/abc123 and p = 0.004 showed 29% in 2025.\n\n~~~js\nconst a = 11;\n~~~';
  for (const [needle, replacement] of [
    ['[12]', '[13]'],
    ['10.1038/abc123', '10.1038/abc124'],
    ['0.004', '0.005'],
    ['29%', '30%'],
    ['2025', '2024'],
    ['const a = 11', 'const a = 12'],
  ]) {
    const result = inspectRewrite(plain, plain.replace(needle, replacement));
    assert.equal(result.passed, false, needle);
  }
  const same = inspectRewrite(plain, plain);
  assert.equal(same.passed, true);
  assert.equal(
    same.warnings.some((x) => x.code === 'SEMANTIC_REVIEW_REQUIRED'),
    true
  );
  assert.ok(invariants(plain).codeBlocks.length);
});
test('code edits are only allowed with explicit override', () => {
  const a = '~~~js\nlet x=1;\n~~~';
  const b = '~~~js\nlet x=2;\n~~~';
  assert.equal(inspectRewrite(a, b).passed, false);
  assert.equal(inspectRewrite(a, b, { allowCodeEdits: true }).passed, true);
});
test('CLI has status 1 for drift and 0 for safe rewrite', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'authentext-v33-'));
  try {
    const old = path.join(temp, 'old.md'),
      fresh = path.join(temp, 'new.md');
    fs.writeFileSync(old, 'Evidence [12] supports this in 2025.\n');
    fs.writeFileSync(fresh, 'Evidence [13] supports this in 2025.\n');
    assert.equal(
      node('scripts/verify-rewrite.js', ['--original', old, '--rewrite', fresh, '--json']).status,
      1
    );
    fs.writeFileSync(fresh, 'Evidence [12] supports this in 2025.\n');
    assert.equal(
      node('scripts/verify-rewrite.js', ['--original', old, '--rewrite', fresh, '--json']).status,
      0
    );
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});
test('voice calibration yields only numerical structure, no private corpus text', () => {
  const a = 'My confidential zebra project: I did the work. But it was not easy. I tried again.';
  const b = 'The project was conducted. The work was difficult. The work was repeated.';
  const profile = calibrate([a], { flattened: [b] });
  assert.equal(profile.schemaVersion, '1.0.0');
  assert.ok(profile.contrastive.delta.sentenceLength);
  assert.ok(profile.metrics.punctuationPer1000);
  assert.doesNotMatch(JSON.stringify(profile), /zebra|confidential|project was conducted/iu);
});
test('voice CLI accepts matched filenames and writes governed JSON', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'voice-v33-'));
  try {
    const original = path.join(temp, 'original'),
      flat = path.join(temp, 'flat');
    fs.mkdirSync(original);
    fs.mkdirSync(flat);
    fs.writeFileSync(path.join(original, 'a.md'), 'I wrote it. And then I rewrote it.');
    fs.writeFileSync(path.join(flat, 'a.md'), 'The text was revised. It was rewritten.');
    const out = path.join(temp, 'profile.json');
    assert.equal(
      node('scripts/calibrate-voice.js', [
        '--corpus',
        original,
        '--flattened',
        flat,
        '--output',
        out,
      ]).status,
      0
    );
    assert.equal(JSON.parse(fs.readFileSync(out, 'utf8')).documentCount, 1);
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});
test('all 40 numbered patterns yield 87 distinct ablation variants', () => {
  const source = fs.readFileSync(path.join(root, 'src/modules/SKILL_CORE_PATTERNS.md'), 'utf8');
  const p = parsePatterns(source);
  assert.equal(p.length, 40);
  const v = variants(p);
  assert.equal(v.length, 87);
  assert.equal(new Set(v.map((x) => x.id)).size, v.length);
  assert.equal(
    evaluate({ source }).rows.every((x) => x.netMarginalLift === null),
    true
  );
});
test('ablation dry-run writes machine-readable report without external calls', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'ablation-v33-'));
  try {
    const out = path.join(temp, 'report.json');
    assert.equal(node('experiments/ablation-harness.js', ['--dry-run', '--output', out]).status, 0);
    assert.equal(JSON.parse(fs.readFileSync(out, 'utf8')).variantCount, 87);
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});
test('security scanner rejects bidi controls, tag controls and egress primitives', () => {
  assert.deepEqual(securityFindings('hello\u202e'), 'hidden-unicode-control'.split(' '));
  assert.deepEqual(securityFindings('hello\u{E0001}'), ['hidden-unicode-control']);
  assert.ok(
    securityFindings('fetch("https://example.com")', { runtime: true }).includes(
      'network-capable-primitive'
    )
  );
  assert.ok(
    securityFindings("import http from 'node:http'", { runtime: true }).includes(
      'network-module-import'
    )
  );
  assert.deepEqual(securityFindings('normal scientific uncertainty'), []);
});
test('skill card generation is deterministic and documented token budget holds', () => {
  const first = skillCardText(root),
    second = skillCardText(root);
  assert.equal(first, second);
  const parsed = card(root);
  assert.equal(
    parsed.artifacts.some((x) => x.path === 'SKILL.md'),
    true
  );
  assert.ok(parsed.rootSkillEstimatedTokens <= parsed.rootSkillTokenCeiling);
});

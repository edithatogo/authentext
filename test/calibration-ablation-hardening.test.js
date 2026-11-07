import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { parsePatterns, variants } from '../experiments/ablation-harness.js';

const source = fs.readFileSync('src/modules/SKILL_CORE_PATTERNS.md', 'utf8');
test('ablation parser preserves fenced heading examples and ignores forged pattern headings inside code', () => {
  assert.match(
    parsePatterns(source).find((p) => p.id === 30).content,
    /The system processes requests in under 100ms/
  );
  const injected = source.replace(
    '## Performance',
    '### Pattern 999: Example only\n\n## Performance'
  );
  assert.equal(parsePatterns(injected).length, 40);
});

test('all ablation variants retain non-ablated safety instructions and disclose estimated costs', () => {
  const runs = variants(parsePatterns(source));
  for (const run of runs) {
    assert.match(run.prompt, /Preserve all claims/);
    assert.match(run.prompt, /untrusted data/);
  }
});

test('a dry run refuses a provider instead of executing it', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'authentext-dry-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const provider = path.join(dir, 'provider.mjs'),
    marker = path.join(dir, 'called');
  const input = path.join(dir, 'input.txt');
  fs.writeFileSync(input, 'A simple test.');
  fs.writeFileSync(
    provider,
    `import fs from 'node:fs'; fs.writeFileSync(${JSON.stringify(marker)},'called'); console.log('A simple test.');`
  );
  const result = spawnSync(
    process.execPath,
    [
      'experiments/ablation-harness.js',
      '--dry-run',
      '--provider',
      provider,
      '--input',
      input,
      '--output',
      path.join(dir, 'report.json'),
    ],
    { encoding: 'utf8' }
  );
  assert.equal(result.status, 2);
  assert.equal(fs.existsSync(marker), false);
});

test('voice CLI rejects overwriting a corpus input and unknown options', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'authentext-voice-guard-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const input = path.join(dir, 'author.txt');
  const text = 'I wrote a sentence. But I prefer this ending.';
  fs.writeFileSync(input, text);
  const run = (args) =>
    spawnSync(process.execPath, ['scripts/calibrate-voice.js', ...args], { encoding: 'utf8' });
  assert.equal(run(['--corpus', input, '--output', input]).status, 2);
  assert.equal(fs.readFileSync(input, 'utf8'), text);
  assert.equal(
    run(['--corpus', input, '--output', path.join(dir, 'profile.json'), '--flattend', input])
      .status,
    2
  );
});

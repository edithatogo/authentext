import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { maskDocument, unmaskDocument } from '../scripts/lib/ast-shield.js';
import { inspectRewrite } from '../scripts/verify-rewrite.js';
import * as runtimeIO from '../scripts/lib/runtime-io.js';

test('restored protected spans cannot absorb adjacent prose or each other', () => {
  const typed = maskDocument('The value is #amount today.', 'typ');
  assert.throws(
    () => unmaskDocument(typed.masked.replace(' today', 'today'), typed.lockfile),
    /boundary|boundaries|absorbed|merged/i
  );
  const code = maskDocument('Use `first` and `second` here.', 'md');
  assert.throws(
    () => unmaskDocument(code.masked.replace(' and ', ''), code.lockfile),
    /boundary|boundaries|absorbed|merged/i
  );
  assert.equal(unmaskDocument(typed.masked, typed.lockfile).text, 'The value is #amount today.');
});

test('TeX comments between macro arguments remain inside the protected construct', () => {
  for (const source of [
    '\\newcommand% comment\n{\\foo}{Important literal}\nPublic prose.',
    '\\renewcommand% comment\n\\foo% another comment\n[1]% final comment\n{Important #1 literal}\nPublic prose.',
    '\\DeclareMathOperator% comment\n{\\rank}{Important literal}\nPublic prose.',
    '\\begin% comment\n{align}\na &= b\n\\end{align}\nPublic prose.',
  ]) {
    const { masked, lockfile } = maskDocument(source, 'tex');
    assert.doesNotMatch(masked, /Important|a &= b/);
    assert.equal(unmaskDocument(masked, lockfile).text, source);
  }
});

test('masking failure preserves an existing sidecar and masked document', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'shield-review-'));
  try {
    const input = path.join(directory, 'input.md');
    const lockfile = path.join(directory, 'locked.json');
    const output = path.join(directory, 'output');
    const previous = '{"previous":"private lock"}\n';
    fs.writeFileSync(input, 'The new value is `secret`.');
    fs.writeFileSync(lockfile, previous);
    fs.mkdirSync(output);
    const run = spawnSync(
      process.execPath,
      ['scripts/mask-ast.js', '--input', input, '--output', output, '--lockfile', lockfile],
      { encoding: 'utf8' }
    );
    assert.equal(run.status, 2);
    assert.equal(fs.readFileSync(lockfile, 'utf8'), previous);
    assert.ok(fs.statSync(output).isDirectory());
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('paired private publication rolls back an already replaced destination', (t) => {
  assert.equal(typeof runtimeIO.writePrivateBatch, 'function');
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'shield-pair-'));
  const left = path.join(directory, 'left.md');
  const right = path.join(directory, 'right.json');
  const originalRename = fs.renameSync;
  try {
    fs.writeFileSync(left, 'old left');
    fs.writeFileSync(right, 'old right');
    t.mock.method(fs, 'renameSync', (from, to) => {
      if (to === right && from.endsWith('.tmp')) throw new Error('simulated publication error');
      return originalRename(from, to);
    });
    assert.throws(
      () =>
        runtimeIO.writePrivateBatch([
          { file: left, text: 'new left' },
          { file: right, text: 'new right' },
        ]),
      /simulated publication error/
    );
    assert.equal(fs.readFileSync(left, 'utf8'), 'old left');
    assert.equal(fs.readFileSync(right, 'utf8'), 'old right');
    assert.deepEqual(fs.readdirSync(directory).sort(), ['left.md', 'right.json']);
  } finally {
    t.mock.restoreAll();
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('unchanged equal-anchor claims retain occurrence-specific modality', () => {
  const text = 'The board must approve the purchase. The board may approve the purchase.';
  const report = inspectRewrite(text, text);
  assert.equal(report.passed, true, JSON.stringify(report.epistemicDrift));
  assert.deepEqual(report.epistemicDrift, []);
  assert.deepEqual(report.alignmentIssues, []);
});

test('paired private publication installs complete new pairs and cleans staged files', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'shield-pair-new-'));
  try {
    const output = path.join(directory, 'output.md');
    const lock = path.join(directory, 'lock.json');
    runtimeIO.writePrivateBatch([
      { file: output, text: 'masked' },
      { file: lock, text: 'locked' },
    ]);
    assert.equal(fs.readFileSync(output, 'utf8'), 'masked');
    assert.equal(fs.readFileSync(lock, 'utf8'), 'locked');
    assert.deepEqual(fs.readdirSync(directory).sort(), ['lock.json', 'output.md']);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('paired publication removes newly published output if its partner fails', (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'shield-pair-new-fail-'));
  const first = path.join(directory, 'new.md');
  const second = path.join(directory, 'lock.json');
  const rename = fs.renameSync;
  try {
    t.mock.method(fs, 'renameSync', (from, to) => {
      if (to === second) throw new Error('simulated partner failure');
      return rename(from, to);
    });
    assert.throws(
      () =>
        runtimeIO.writePrivateBatch([
          { file: first, text: 'masked' },
          { file: second, text: 'locked' },
        ]),
      /simulated partner failure/
    );
    assert.deepEqual(fs.readdirSync(directory), []);
  } finally {
    t.mock.restoreAll();
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

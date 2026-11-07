import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

import * as shield from '../scripts/lib/ast-shield.js';
const mask = (...args) => {
  assert.equal(typeof shield?.maskDocument, 'function', 'maskDocument is not implemented');
  return shield.maskDocument(...args);
};
const restore = (...args) => shield.unmaskDocument(...args);
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');

for (const format of ['qmd', 'typ', 'tex']) {
  test(`${format}: exact no-edit round trip and prose-only edits`, () => {
    const source = fs.readFileSync(`test/fixtures/technical/report.${format}`, 'utf8');
    const { masked, lockfile } = mask(source, format);
    assert.equal(lockfile.schemaVersion, '1.0.0');
    assert.equal(lockfile.sourceSha256, sha(source));
    assert.ok(lockfile.entries.length >= 6);
    assert.equal(restore(masked, lockfile).text, source);
    const rewritten = masked.replace('The first finding', 'The initial finding');
    const output = restore(rewritten, lockfile).text;
    assert.match(output, /The initial finding/);
    for (const entry of lockfile.entries) {
      assert.equal(sha(entry.raw), entry.sha256);
      assert.ok(output.includes(entry.raw), entry.token);
      assert.ok(entry.startLine <= entry.endLine);
    }
  });
}

test('roles distinguish clusters, narrative references, inline and block syntax', () => {
  const { masked, lockfile } = mask(
    '---\ntitle: X\n---\n\n@smith2025 [p. 12] wrote this [@smith2025]. See @fig-a. The value $x$ appears.\n',
    'qmd'
  );
  assert.deepEqual(
    new Set(lockfile.entries.map((e) => e.role)),
    new Set(['BLOCK', 'NCITE', 'CITE', 'REF', 'INLINE'])
  );
  assert.doesNotMatch(masked, /@smith|@fig|\$x/);
});

test('CRLF, decomposed Unicode and escaped delimiters survive without normalisation', () => {
  const source = '---\r\ntitle: Cafe\u0301\r\n---\r\nProse \\$5 and `a\r\nb` here.\r\n';
  const { masked, lockfile } = mask(source, 'md');
  assert.equal(restore(masked, lockfile).text, source);
  assert.equal(lockfile.sourceSha256, sha(Buffer.from(source, 'utf8')));
});

test('pre-existing placeholder namespace is rejected', () => {
  assert.throws(() => mask('A [[AST_CITE_0001]] token.', 'md'), /reserved|collision/i);
});

test('missing, mutated, duplicated and invented tokens are rejected', () => {
  const { masked, lockfile } = mask('The finding [@a2025] appears.', 'qmd');
  const token = lockfile.entries[0].token;
  assert.throws(() => restore(masked.replace(token, ''), lockfile), /missing.*AST_CITE_0001/i);
  assert.throws(
    () => restore(masked.replace(token, token.replace('0001', '9999')), lockfile),
    /unknown|missing/i
  );
  assert.throws(() => restore(masked.replace(token, token + token), lockfile), /duplicate/i);
  assert.throws(() => restore(masked + ' [[AST_INLINE_9999]]', lockfile), /unknown/i);
  assert.throws(
    () => restore(masked.replace(token, token.replace('AST_', 'AST-')), lockfile),
    /missing/i
  );
});

test('duplicate-citation override is narrow and recorded', () => {
  const cites = mask('Evidence [@a2025].', 'qmd');
  const token = cites.lockfile.entries[0].token;
  const result = restore(cites.masked + ' Another ' + token, cites.lockfile, {
    allowDuplicateCites: true,
  });
  assert.equal(result.text.match(/\[@a2025\]/g).length, 2);
  assert.ok(result.warnings.some((w) => w.code === 'DUPLICATE_CITATION_AUTHORISED'));
  const code = mask('Use `x`.', 'md');
  assert.throws(
    () =>
      restore(code.masked + code.lockfile.entries[0].token, code.lockfile, {
        allowDuplicateCites: true,
      }),
    /duplicate/i
  );
});

test('edited lockfile raw data and manifest fields fail integrity validation', () => {
  const { masked, lockfile } = mask('Evidence [@a2025].', 'qmd');
  const tampered = structuredClone(lockfile);
  tampered.entries[0].raw = '[@other]';
  assert.throws(() => restore(masked, tampered), /digest|integrity/i);
  const header = structuredClone(lockfile);
  header.sourceSha256 = '0'.repeat(64);
  assert.throws(() => restore(masked, header), /digest|integrity/i);
  assert.throws(
    () => restore(masked, lockfile, { expectedSourceSha256: '0'.repeat(64) }),
    /source.*digest|source.*hash/i
  );
});

test('raw syntax added by a rewrite and broken delimiters are rejected', () => {
  for (const [format, injection] of [
    ['qmd', ' [@new]'],
    ['tex', ' \\cite{new}'],
    ['typ', ' #include "private.typ"'],
  ]) {
    const { masked, lockfile } = mask('Ordinary prose.', format);
    assert.throws(() => restore(masked + injection, lockfile), /unmasked|raw|syntax/i);
  }
  const { masked, lockfile } = mask('Ordinary prose.', 'qmd');
  for (const tail of [' {', ' }', ' $x', '\n```r\nx']) {
    assert.throws(() => restore(masked + tail, lockfile), /delimiter|unclosed|unbalanced|syntax/i);
  }
});

test('nested Typst expressions and LaTeX commands are protected whole', () => {
  const typ = '#figure(rect(fill: rgb("f00")), caption: [A [nested] label]) <fig:a>\nText @fig:a.';
  const tex =
    '\\newcommand{\\x}[2]{\\textbf{#1 {#2}}}\nText \\textcite[see][p. 4]{a,b} and \\verb|{x$}|.';
  for (const [source, format] of [
    [typ, 'typ'],
    [tex, 'tex'],
  ]) {
    const { masked, lockfile } = mask(source, format);
    assert.equal(restore(masked, lockfile).text, source);
    assert.ok(
      lockfile.entries.some((e) => e.raw.includes(format === 'typ' ? '[nested]' : '#1 {#2}'))
    );
  }
});

test('unclosed constructs and context-changing TeX primitives fail closed', () => {
  for (const [source, format] of [
    ['```{r}\nx<-1', 'qmd'],
    ['#figure(rect(', 'typ'],
    ['\\begin{align}x=1', 'tex'],
    ['\\catcode`\\@=11', 'tex'],
  ]) {
    assert.throws(() => mask(source, format), /unclosed|unsupported|unbalanced/i);
  }
});

test('structural block reordering is not silently accepted', () => {
  const { masked, lockfile } = mask('::: {.note}\nProse.\n:::\n', 'qmd');
  const [a, b] = lockfile.entries.map((e) => e.token);
  const swapped = masked.replace(a, 'TEMP').replace(b, a).replace('TEMP', b);
  assert.throws(() => restore(swapped, lockfile), /order|structural/i);
});

test('CLI round-trip, exit 1 on token loss, and no overwrite on failure', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'ast-shield-'));
  try {
    const input = path.join(temp, 'input.qmd');
    const masked = path.join(temp, 'masked.txt');
    const lock = path.join(temp, 'input.ast-lock.json');
    const output = path.join(temp, 'restored.qmd');
    const source = 'Evidence [@author2025] supports this.\n';
    fs.writeFileSync(input, source);
    const run = (file, args) => spawnSync(process.execPath, [file, ...args], { encoding: 'utf8' });
    const first = run('scripts/mask-ast.js', [
      '--input',
      input,
      '--output',
      masked,
      '--lockfile',
      lock,
    ]);
    assert.equal(first.status, 0, first.stderr);
    const next = run('scripts/unmask-ast.js', [
      '--input',
      masked,
      '--lockfile',
      lock,
      '--output',
      output,
      '--json',
    ]);
    assert.equal(next.status, 0, next.stderr);
    assert.equal(fs.readFileSync(output, 'utf8'), source);
    const parsed = JSON.parse(fs.readFileSync(lock, 'utf8'));
    fs.writeFileSync(masked, fs.readFileSync(masked, 'utf8').replace(parsed.entries[0].token, ''));
    const bad = run('scripts/unmask-ast.js', [
      '--input',
      masked,
      '--lockfile',
      lock,
      '--output',
      output,
      '--json',
    ]);
    assert.equal(bad.status, 1);
    assert.match(bad.stdout, /AST_CITE_0001/);
    assert.equal(fs.readFileSync(output, 'utf8'), source);
    assert.equal(
      run('scripts/mask-ast.js', ['--input', input, '--output', input, '--lockfile', lock]).status,
      2
    );
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});

test('an extra closing brace after a balanced pair is rejected', () => {
  assert.throws(() => mask('{} }', 'md'), /unbalanced/i);
});

test('runtime I/O rejects invalid UTF-8 and does not overwrite a source alias', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'ast-io-'));
  try {
    const bad = path.join(temp, 'bad.qmd');
    fs.writeFileSync(bad, Buffer.from([0xff, 0x61]));
    const args = [
      'scripts/mask-ast.js',
      '--input',
      bad,
      '--output',
      path.join(temp, 'out'),
      '--lockfile',
      path.join(temp, 'lock'),
    ];
    const result = spawnSync(process.execPath, args, { encoding: 'utf8' });
    assert.equal(result.status, 2);
    assert.equal(fs.existsSync(path.join(temp, 'out')), false);
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});

test('shipped portable package can execute masking without repository dependencies', async () => {
  const { buildDistributionPackage, validatePortablePackage } =
    await import('../scripts/lib/distribution-builder.js');
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'ast-package-'));
  try {
    const receipt = buildDistributionPackage({
      root: process.cwd(),
      output: temp,
      target: 'portable',
      sourceCommit: 'a'.repeat(40),
    });
    const skill = path.join(receipt.packageRoot, 'skills', 'authentext');
    for (const file of [
      'scripts/mask-ast.js',
      'scripts/unmask-ast.js',
      'scripts/lib/ast-shield.js',
      'scripts/lib/runtime-io.js',
      'scripts/lib/epistemic-discourse.js',
    ]) {
      assert.ok(fs.existsSync(path.join(skill, file)), file);
    }
    assert.deepEqual(validatePortablePackage(receipt.packageRoot), []);
    const source = path.join(temp, 'source.qmd');
    fs.writeFileSync(source, 'Evidence [@one2025].');
    const run = spawnSync(
      process.execPath,
      [
        path.join(skill, 'scripts/mask-ast.js'),
        '--input',
        source,
        '--output',
        path.join(temp, 'masked'),
        '--lockfile',
        path.join(temp, 'lock'),
      ],
      { cwd: temp, encoding: 'utf8' }
    );
    assert.equal(run.status, 0, run.stderr);
    // A scripts directory outside the explicit installed surface is forbidden.
    fs.mkdirSync(path.join(receipt.packageRoot, 'scripts'));
    fs.writeFileSync(path.join(receipt.packageRoot, 'scripts', 'unapproved.js'), '');
    assert.ok(
      validatePortablePackage(receipt.packageRoot).some((e) => /unapproved|forbidden/i.test(e))
    );
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});

test('TeX preamble ignores document markers inside comments and macro bodies', () => {
  const source = String.raw`\documentclass{article}
% Example only: \begin{document}
\newcommand{\example}{\begin{document}}
\begin{document}
Editable prose here.
\end{document}`;
  const result = mask(source, 'tex');
  assert.equal(result.lockfile.entries[0].raw, source.slice(0, source.indexOf('\nEditable')));
  assert.match(result.masked, /Editable prose here/);
  assert.equal(restore(result.masked, result.lockfile).text, source);
});

test('Typst math strings do not terminate the surrounding math span', () => {
  const source = 'A cost $ "cost $5" + x $ is reported.';
  const result = mask(source, 'typ');
  assert.equal(result.lockfile.entries.length, 1);
  assert.equal(result.lockfile.entries[0].raw, '$ "cost $5" + x $');
  assert.equal(restore(result.masked, result.lockfile).text, source);
});

test('direct masking rejects lone surrogate text rather than changing source bytes', () => {
  assert.throws(() => mask('Bad \uD800 text.', 'md'), /UTF|Unicode|well-formed/i);
});

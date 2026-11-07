import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const api = () => import('../scripts/lib/ast-shield.js');
const digest = (s) => crypto.createHash('sha256').update(s).digest('hex');

for (const format of ['qmd', 'rmd', 'typ', 'tex']) {
  test(`${format}: deterministically shields and restores each protected span byte-for-byte`, async () => {
    const { maskDocument, unmaskDocument } = await api();
    const filename = `test/fixtures/scientific/manuscript.${format === 'rmd' ? 'Rmd' : format}`;
    const source = fs.readFileSync(filename, 'utf8');
    const first = maskDocument(source, format);
    assert.deepEqual(maskDocument(source, format), first);
    assert.equal(unmaskDocument(first.masked, first.lockfile).text, source);
    assert.equal(first.lockfile.sourceSha256, digest(source));
    assert.ok(first.lockfile.locks.length >= 3);
    const revised = first.masked.replace(
      'The intervention may improve outcomes',
      'Outcomes may improve with the intervention'
    );
    const result = unmaskDocument(revised, first.lockfile);
    for (const lock of first.lockfile.locks) {
      assert.equal(digest(lock.raw), lock.sha256);
      assert.ok(result.text.includes(lock.raw));
    }
    assert.equal(result.passed, true);
    assert.doesNotMatch(result.text, /\[\[AST_/);
  });
}

test('stand-off locks preserve CRLF and decomposed Unicode without normalisation', async () => {
  const { maskDocument, unmaskDocument } = await api();
  const source = '---\r\ntitle: "cafe\u0301"\r\n---\r\nText [@key].\r\n';
  const { masked, lockfile } = maskDocument(source, 'qmd');
  assert.equal(unmaskDocument(masked, lockfile).text, source);
});

test('inline citations carry separate narrative, parenthetical and reference roles', async () => {
  const { maskDocument } = await api();
  const { lockfile } = maskDocument(
    'According to @study [p. 4], see @fig-a [@other; @last].',
    'qmd'
  );
  assert.deepEqual(
    lockfile.locks.map((x) => x.role),
    ['NCITE', 'REF', 'CITE']
  );
});

test('nested Typst arguments, strings and comments are masked as whole expressions', async () => {
  const { maskDocument, unmaskDocument } = await api();
  const source =
    '#figure(box[Text [nested]], caption: [A "quote".])\n#let a = (\n text("a ) ] string"),\n /* (nested /* comment */) */\n)\nProse.';
  const result = maskDocument(source, 'typ');
  assert.doesNotMatch(result.masked, /nested|caption|text\(/);
  assert.equal(unmaskDocument(result.masked, result.lockfile).text, source);
});

test('escaped delimiters and currency are not mistaken for unclosed maths', async () => {
  const { maskDocument, unmaskDocument } = await api();
  const source = 'The fee is $25. The expression is \\(x + 1\\). A literal \\$ stays literal.';
  const result = maskDocument(source, 'md');
  assert.equal(unmaskDocument(result.masked, result.lockfile).text, source);
});

test('missing, duplicate, mutated and unknown lock tokens are rejected', async () => {
  const { maskDocument, unmaskDocument } = await api();
  const { masked, lockfile } = maskDocument('Evidence [@study2025].', 'qmd');
  const token = lockfile.locks[0].token;
  for (const edited of [
    masked.replace(token, ''),
    masked + token,
    masked.replace(token, token.replace('0001', '9999')),
    masked + ' [[AST_REF_9999]]',
  ]) {
    assert.throws(() => unmaskDocument(edited, lockfile), /token|lock/i);
  }
  assert.equal(
    unmaskDocument(masked + token, lockfile, { allowDuplicateCites: true }).passed,
    true
  );
});

test('citation duplicate override never permits duplicated executable blocks', async () => {
  const { maskDocument, unmaskDocument } = await api();
  const { masked, lockfile } = maskDocument('~~~python\nprint(1)\n~~~\n', 'qmd');
  assert.throws(
    () => unmaskDocument(masked + masked, lockfile, { allowDuplicateCites: true }),
    /duplicate|token/i
  );
});

test('new raw citations, executable syntax and unbalanced delimiters fail closed', async () => {
  const { maskDocument, unmaskDocument } = await api();
  for (const [format, attacks] of [
    ['qmd', [' [@injected]', ' @fig-new', ' $x', ' {', '\n~~~r\nmalicious\n~~~']],
    ['typ', [' #let changed = 1', ' @new', ' <new-label>', ' $x']],
    ['tex', [' \\cite{new}', ' \\directlua{print(1)}', ' {', ' $x']],
  ]) {
    const { masked, lockfile } = maskDocument('Original prose.', format);
    for (const suffix of attacks)
      assert.throws(
        () => unmaskDocument(masked + suffix, lockfile),
        /syntax|delimiter|unclosed|raw/i,
        suffix
      );
  }
});

test('lockfile content edits and digest edits are rejected', async () => {
  const { maskDocument, unmaskDocument } = await api();
  const { masked, lockfile } = maskDocument('Text [@key].', 'qmd');
  const altered = structuredClone(lockfile);
  altered.locks[0].raw = '[@other]';
  assert.throws(() => unmaskDocument(masked, altered), /digest|hash|integrity/i);
  const alteredSource = structuredClone(lockfile);
  alteredSource.sourceSha256 = '0'.repeat(64);
  assert.throws(() => unmaskDocument(masked, alteredSource), /digest|hash|integrity/i);
});

test('block relocation, collision and unsupported formats are rejected', async () => {
  const { maskDocument, unmaskDocument } = await api();
  assert.throws(() => maskDocument('[[AST_CITE_0001]]', 'md'), /reserved|collision/i);
  assert.throws(() => maskDocument('Text', 'docx'), /format/i);
  assert.throws(() => maskDocument('```r\nx=1', 'qmd'), /unclosed/i);
  const { masked, lockfile } = maskDocument('~~~r\nx=1\n~~~\n\n~~~r\nx=2\n~~~', 'qmd');
  const reversed = masked
    .replace(lockfile.locks[0].token, 'TEMP')
    .replace(lockfile.locks[1].token, lockfile.locks[0].token)
    .replace('TEMP', lockfile.locks[1].token);
  assert.throws(() => unmaskDocument(reversed, lockfile), /order|block/i);
  assert.throws(() => unmaskDocument('prefix ' + masked, lockfile), /standalone|block/i);
});

test('CLI restores valid input and fails without writing output on a missing token', async (t) => {
  const { maskDocument } = await api();
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ast-shield-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const source = path.join(dir, 'input.qmd'),
    masked = path.join(dir, 'masked.txt');
  const lockfile = path.join(dir, 'locks.json'),
    output = path.join(dir, 'restored.qmd');
  const text = 'The study suggests benefit [@study2025].\n';
  fs.writeFileSync(source, text);
  const mask = spawnSync(
    process.execPath,
    ['scripts/mask-ast.js', '--input', source, '--output', masked, '--lockfile', lockfile],
    { encoding: 'utf8' }
  );
  assert.equal(mask.status, 0, mask.stderr);
  const unmaskArgs = [
    'scripts/unmask-ast.js',
    '--input',
    masked,
    '--lockfile',
    lockfile,
    '--output',
    output,
    '--json',
  ];
  const ok = spawnSync(process.execPath, unmaskArgs, { encoding: 'utf8' });
  assert.equal(ok.status, 0, ok.stderr);
  assert.equal(fs.readFileSync(output, 'utf8'), text);
  assert.doesNotMatch(ok.stdout, /study2025/);
  fs.rmSync(output);
  fs.writeFileSync(masked, 'The study suggests benefit.');
  const fail = spawnSync(process.execPath, unmaskArgs, { encoding: 'utf8' });
  assert.equal(fail.status, 1, fail.stderr);
  assert.match(fail.stdout + fail.stderr, /AST_CITE_0001/);
  assert.equal(fs.existsSync(output), false);
  assert.ok(maskDocument(text, 'qmd').lockfile.locks.length);
});

test('TeX environment boundaries cannot be reordered into an invalid document', async () => {
  const { maskDocument, unmaskDocument } = await api();
  const { masked, lockfile } = maskDocument('\\begin{document}\nProse.\n\\end{document}', 'tex');
  const [first, last] = lockfile.locks;
  const changed = masked
    .replace(first.token, 'TEMP')
    .replace(last.token, first.token)
    .replace('TEMP', last.token);
  assert.throws(() => unmaskDocument(changed, lockfile), /environment|structure|order/i);
});

test('HTML executable blocks and attributes are shielded and cannot be injected', async () => {
  const { maskDocument, unmaskDocument } = await api();
  const source = '<script>doNotExecute("<br>");</script>\nProse <span class="term">term</span>.';
  const result = maskDocument(source, 'qmd');
  assert.doesNotMatch(result.masked, /doNotExecute|class=/);
  assert.equal(unmaskDocument(result.masked, result.lockfile).text, source);
  assert.throws(
    () => unmaskDocument(result.masked + '<script>newCode()</script>', result.lockfile),
    /raw syntax/i
  );
});

test('source hash checking and output alias rejection protect originals', async (t) => {
  const { maskDocument, unmaskDocument } = await api();
  const result = maskDocument('Text [@key].', 'qmd');
  assert.throws(
    () => unmaskDocument(result.masked, result.lockfile, { original: 'Another text.' }),
    /source hash/i
  );
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ast-alias-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const file = path.join(dir, 'input.qmd');
  fs.writeFileSync(file, 'Text [@key].');
  const run = spawnSync(
    process.execPath,
    [
      'scripts/mask-ast.js',
      '--input',
      file,
      '--output',
      file,
      '--lockfile',
      path.join(dir, 'lock.json'),
    ],
    { encoding: 'utf8' }
  );
  assert.equal(run.status, 2);
  assert.equal(fs.readFileSync(file, 'utf8'), 'Text [@key].');
});

test('Typst cite and ref functions have typed roles, while multiline TeX arguments stay locked', async () => {
  const { maskDocument, unmaskDocument } = await api();
  const typ = maskDocument('See #cite(<key>) and #ref(<fig:a>).', 'typ');
  assert.deepEqual(
    typ.lockfile.locks.map((x) => x.role),
    ['CITE', 'REF']
  );
  const tex = maskDocument(
    'Read \\directlua\n{print("private code")} and \\input private-file.tex\nDone.',
    'tex'
  );
  assert.doesNotMatch(tex.masked, /private code|private-file/);
  assert.equal(
    unmaskDocument(tex.masked, tex.lockfile).text,
    'Read \\directlua\n{print("private code")} and \\input private-file.tex\nDone.'
  );
});

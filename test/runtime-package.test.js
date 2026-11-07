import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import {
  buildDistributionPackage,
  validatePortablePackage,
} from '../scripts/lib/distribution-builder.js';
import { securityFindings } from '../scripts/build-skill-card.js';

test('every host package runs the complete offline protection pipeline without npm install', (t) => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'authentext-installed-'));
  t.after(() => fs.rmSync(temp, { recursive: true, force: true }));
  for (const target of ['portable', 'claude', 'codex', 'gemini', 'opencode']) {
    const { packageRoot } = buildDistributionPackage({
      root: process.cwd(),
      output: temp,
      target,
      sourceCommit: 'd'.repeat(40),
    });
    const skill = path.join(packageRoot, 'skills', 'authentext');
    const input = path.join(temp, 'source.qmd'),
      masked = path.join(temp, 'masked.md');
    const lock = path.join(temp, 'lock.json'),
      restored = path.join(temp, 'restored.qmd');
    fs.copyFileSync('test/fixtures/scientific/manuscript.qmd', input);
    const invoke = (command, args) => {
      const result = spawnSync(process.execPath, [path.join(skill, 'scripts', command), ...args], {
        cwd: skill,
        encoding: 'utf8',
      });
      assert.equal(result.status, 0, `${target}/${command}: ${result.stderr}`);
      assert.ok(
        result.stdout.trim(),
        `${target}/${command}: no JSON output; stderr=${result.stderr}`
      );
      return JSON.parse(result.stdout);
    };
    invoke('mask-ast.js', ['--input', input, '--output', masked, '--lockfile', lock, '--json']);
    invoke('unmask-ast.js', [
      '--input',
      masked,
      '--lockfile',
      lock,
      '--original',
      input,
      '--output',
      restored,
      '--json',
    ]);
    assert.equal(
      invoke('verify-rewrite.js', ['--original', input, '--rewrite', restored, '--json']).passed,
      true
    );
    assert.equal(fs.existsSync(path.join(skill, 'node_modules')), false);
    assert.deepEqual(validatePortablePackage(packageRoot), []);
  }
});

test('runtime security screening rejects shell, dynamic import and external packages', () => {
  for (const source of [
    "import { exec } from 'node:child_process';",
    "import axios from 'axios';",
    'const mod = await import(name);',
    'eval(source);',
    'new Function(source);',
  ]) {
    assert.ok(securityFindings(source, { runtime: true }).length, source);
  }
});

test('package validation rejects manifest traversal, duplicate entries and undeclared runtime', (t) => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'authentext-manifest-'));
  t.after(() => fs.rmSync(temp, { recursive: true, force: true }));
  const { packageRoot } = buildDistributionPackage({
    root: process.cwd(),
    output: temp,
    target: 'portable',
    sourceCommit: 'e'.repeat(40),
  });
  const file = path.join(packageRoot, 'authentext-package.json');
  const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
  manifest.files.push({ path: '../outside.txt', sha256: '0'.repeat(64) }, manifest.files[0]);
  fs.writeFileSync(file, JSON.stringify(manifest));
  const errors = validatePortablePackage(packageRoot);
  assert.ok(errors.some((x) => /path|traversal/.test(x)));
  assert.ok(errors.some((x) => /duplicate/.test(x)));
});

test('release packaging ships runtime scripts and downloadable host packages', () => {
  const release = fs.readFileSync('.github/workflows/release.yml', 'utf8');
  assert.match(release, /distribution-staging\/portable\/skills\/authentext/);
  assert.match(release, /scripts\/mask-ast\.js/);
  assert.match(release, /authentext-distributions\.tar\.gz/);
});

test('installed CLIs run through directory aliases without executing on import', (t) => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'authentext-path-alias-'));
  t.after(() => fs.rmSync(temp, { recursive: true, force: true }));
  const { packageRoot } = buildDistributionPackage({
    root: process.cwd(),
    output: temp,
    target: 'portable',
    sourceCommit: 'f'.repeat(40),
  });
  const skill = fs.realpathSync(path.join(packageRoot, 'skills', 'authentext'));
  const alias = path.join(temp, 'alias');
  fs.symlinkSync(skill, alias, process.platform === 'win32' ? 'junction' : 'dir');
  const source = path.join(temp, 'source.md');
  fs.writeFileSync(source, 'The study may suggest a benefit [12].\n');
  const masked = path.join(temp, 'masked.md');
  const lock = path.join(temp, 'source.ast-lock.json');
  const restored = path.join(temp, 'restored.md');
  const profile = path.join(temp, 'voice-profile.json');
  const commands = [
    ['mask-ast.js', ['--input', source, '--output', masked, '--lockfile', lock, '--json']],
    ['unmask-ast.js', ['--input', masked, '--lockfile', lock, '--output', restored, '--json']],
    ['verify-rewrite.js', ['--original', source, '--rewrite', restored, '--json']],
    ['calibrate-voice.js', ['--corpus', source, '--output', profile]],
  ];
  for (const [command, args] of commands) {
    const script = path.join(alias, 'scripts', command);
    const result = spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' });
    assert.equal(result.status, 0, `${command}: ${result.stderr}`);
    assert.ok(result.stdout.trim(), `${command}: aliased invocation produced no JSON`);
    assert.doesNotThrow(() => JSON.parse(result.stdout), command);
    const imported = spawnSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        `import { pathToFileURL } from 'node:url'; await import(pathToFileURL(${JSON.stringify(script)}));`,
      ],
      { encoding: 'utf8' }
    );
    assert.equal(imported.status, 0, `${command} import: ${imported.stderr}`);
    assert.equal(imported.stdout, '', `${command} must not execute on import`);
    assert.equal(imported.stderr, '', `${command} must not report CLI errors on import`);
  }
  assert.equal(fs.readFileSync(restored, 'utf8'), fs.readFileSync(source, 'utf8'));
  assert.equal(JSON.parse(fs.readFileSync(profile, 'utf8')).schemaVersion, '1.0.0');
});

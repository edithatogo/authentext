import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import YAML from 'yaml';

import {
  buildDistributionPackage,
  validateHostPackage,
} from '../scripts/lib/distribution-builder.js';

test('Codex package preserves the generated OpenAI overlay without app dependencies', (t) => {
  const output = fs.mkdtempSync(path.join(os.tmpdir(), 'authentext-codex-'));
  t.after(() => fs.rmSync(output, { recursive: true, force: true }));
  const receipt = buildDistributionPackage({
    root: process.cwd(),
    output,
    target: 'codex',
    sourceCommit: 'a'.repeat(40),
  });

  assert.deepEqual(validateHostPackage(receipt.packageRoot, 'codex'), []);
  const overlayPath = path.join(receipt.packageRoot, 'agents', 'openai.yaml');
  const overlay = YAML.parse(fs.readFileSync(overlayPath, 'utf8'));
  assert.equal(overlay.interface.display_name, 'Authentext');
  assert.equal(overlay.policy.allow_implicit_invocation, true);
  assert.equal(fs.readFileSync(overlayPath, 'utf8'), fs.readFileSync('agents/openai.yaml', 'utf8'));
  assert.deepEqual(receipt.capabilities, { apps: [], tools: [], hooks: [], network: [] });
});

test('Codex validation rejects portable frontmatter extensions and app declarations', (t) => {
  const output = fs.mkdtempSync(path.join(os.tmpdir(), 'authentext-codex-invalid-'));
  t.after(() => fs.rmSync(output, { recursive: true, force: true }));
  const { packageRoot } = buildDistributionPackage({
    root: process.cwd(),
    output,
    target: 'codex',
    sourceCommit: '9'.repeat(40),
  });
  const skillPath = path.join(packageRoot, 'skills', 'authentext', 'SKILL.md');
  fs.writeFileSync(
    skillPath,
    fs.readFileSync(skillPath, 'utf8').replace('license: MIT', 'allowed-tools: "*"')
  );
  const overlayPath = path.join(packageRoot, 'agents', 'openai.yaml');
  fs.appendFileSync(overlayPath, '\napps:\n  required: true\n');
  const errors = validateHostPackage(packageRoot, 'codex');
  assert.ok(errors.some((error) => error.includes('portable-field isolation')));
  assert.ok(errors.some((error) => error.includes('prohibited OpenAI app')));
});

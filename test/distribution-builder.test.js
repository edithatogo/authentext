import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  buildDistributionPackage,
  discoverInstalledSkill,
  inspectCatalogResponse,
  validatePortablePackage,
} from '../scripts/lib/distribution-builder.js';

function temporaryDirectory(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'authentext-distribution-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  return directory;
}

test('portable staging contains only the canonical skill surface', (t) => {
  const output = temporaryDirectory(t);
  const receipt = buildDistributionPackage({
    root: process.cwd(),
    output,
    target: 'portable',
    sourceCommit: 'f'.repeat(40),
  });

  assert.deepEqual(validatePortablePackage(receipt.packageRoot), []);
  assert.equal(receipt.capabilities.apps.length, 0);
  assert.equal(receipt.capabilities.tools.length, 0);
  assert.ok(receipt.files.every((entry) => /^[a-f0-9]{64}$/.test(entry.sha256)));
  assert.ok(receipt.files.some((entry) => entry.path === 'skills/authentext/SKILL.md'));
  assert.ok(receipt.files.every((entry) => !entry.path.includes('conductor')));
});

test('clean host layouts discover the same canonical skill hash', (t) => {
  const output = temporaryDirectory(t);
  const receipt = buildDistributionPackage({
    root: process.cwd(),
    output,
    target: 'portable',
    sourceCommit: 'e'.repeat(40),
  });
  const expected = receipt.files.find((entry) => entry.path.endsWith('/SKILL.md')).sha256;

  for (const host of [
    'claude-code',
    'codex',
    'github-copilot',
    'gemini-cli',
    'opencode',
    'cursor',
    'windsurf',
    'cline',
    'aiderdesk',
    'amp',
  ]) {
    assert.deepEqual(discoverInstalledSkill(receipt.packageRoot, host), {
      host,
      name: 'authentext',
      sha256: expected,
      discovered: true,
    });
  }
});

test('portable validation rejects stale identity and unlisted files', (t) => {
  const output = temporaryDirectory(t);
  const { packageRoot } = buildDistributionPackage({
    root: process.cwd(),
    output,
    target: 'portable',
    sourceCommit: 'd'.repeat(40),
  });
  fs.writeFileSync(path.join(packageRoot, 'skills', 'authentext', 'legacy-humanizer.txt'), 'stale');
  const errors = validatePortablePackage(packageRoot);
  assert.ok(errors.some((error) => error.includes('legacy identity')));
  assert.ok(errors.some((error) => error.includes('undeclared')));
});

test('catalog inspection distinguishes HTTP success from an application 404', () => {
  assert.deepEqual(inspectCatalogResponse(200, '<h1>authentext isn’t available</h1>'), {
    listed: false,
    reason: 'application-not-found',
  });
  assert.deepEqual(inspectCatalogResponse(200, '<h1>authentext</h1><code>npx skills add</code>'), {
    listed: true,
    reason: 'install-receipt-present',
  });
});

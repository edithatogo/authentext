import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  buildDistributionPackage,
  evaluateCatalogCandidate,
  evaluateOpenCodePluginGate,
  simulateHostLifecycle,
  validateHostPackage,
} from '../scripts/lib/distribution-builder.js';

function temporaryDirectory(t, prefix) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  return directory;
}

for (const target of ['gemini', 'opencode']) {
  test(`${target} package preserves the canonical bundled skill hash`, (t) => {
    const output = temporaryDirectory(t, `authentext-${target}-`);
    const receipt = buildDistributionPackage({
      root: process.cwd(),
      output,
      target,
      sourceCommit: 'a'.repeat(40),
    });

    assert.deepEqual(validateHostPackage(receipt.packageRoot, target), []);
    const packagedSkill = receipt.files.find(
      (entry) => entry.path === 'skills/authentext/SKILL.md'
    );
    assert.match(packagedSkill.sha256, /^[a-f0-9]{64}$/);
    assert.deepEqual(receipt.capabilities, { apps: [], tools: [], hooks: [], network: [] });
  });
}

test('Gemini extension is minimal and supports a reversible clean lifecycle', (t) => {
  const output = temporaryDirectory(t, 'authentext-gemini-lifecycle-');
  const { packageRoot } = buildDistributionPackage({
    root: process.cwd(),
    output,
    target: 'gemini',
    sourceCommit: 'b'.repeat(40),
  });
  const manifest = JSON.parse(
    fs.readFileSync(path.join(packageRoot, 'gemini-extension.json'), 'utf8')
  );

  assert.deepEqual(manifest.skills, [{ name: 'authentext', path: 'skills/authentext' }]);
  assert.deepEqual(simulateHostLifecycle(packageRoot, 'gemini', { localConflict: false }), {
    installed: true,
    activated: true,
    reloaded: true,
    update: 'immutable-version',
    precedence: 'extension',
    uninstalled: true,
  });
  assert.equal(
    simulateHostLifecycle(packageRoot, 'gemini', { localConflict: true }).precedence,
    'local'
  );
});

test('OpenCode package exposes native discovery and HTTP catalog metadata', (t) => {
  const output = temporaryDirectory(t, 'authentext-opencode-catalog-');
  const { packageRoot } = buildDistributionPackage({
    root: process.cwd(),
    output,
    target: 'opencode',
    sourceCommit: 'c'.repeat(40),
  });
  const catalog = JSON.parse(fs.readFileSync(path.join(packageRoot, 'opencode.json'), 'utf8'));

  assert.equal(catalog.skills[0].path, 'skills/authentext');
  assert.equal(catalog.skills[0].activation, 'explicit');
  assert.deepEqual(catalog.permissions, { network: 'deny', shell: 'deny', write: 'deny' });
  assert.equal(simulateHostLifecycle(packageRoot, 'opencode').activated, true);
});

test('OpenCode npm plugin is rejected when native skills satisfy the use case', () => {
  assert.deepEqual(evaluateOpenCodePluginGate({ hooks: [], tools: [] }), {
    justified: false,
    decision: 'not-justified',
    reason: 'native-agent-skill-satisfies-use-case',
  });
  assert.equal(
    evaluateOpenCodePluginGate({ hooks: ['event'] }).decision,
    'security-review-required'
  );
});

test('emerging catalogs must pass every provenance and lifecycle control', () => {
  const trustworthy = {
    ownership: true,
    maintenance: true,
    submission: true,
    update: true,
    removal: true,
    license: true,
    nativeSkills: true,
    hiddenTelemetry: false,
    durableReceipt: true,
    provenance: true,
    monitorable: true,
  };
  assert.deepEqual(evaluateCatalogCandidate('reviewed-catalog', trustworthy), {
    catalog: 'reviewed-catalog',
    included: true,
    failed: [],
  });
  assert.deepEqual(
    evaluateCatalogCandidate('OpenClaw/ClawHub', { ...trustworthy, nativeSkills: false }),
    { catalog: 'OpenClaw/ClawHub', included: false, failed: ['nativeSkills'] }
  );
});

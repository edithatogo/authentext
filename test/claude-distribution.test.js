import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  buildDistributionPackage,
  evaluatePackageTransition,
  validateHostPackage,
} from '../scripts/lib/distribution-builder.js';

test('Claude package is skill-only, canonical, and marketplace-addressable', (t) => {
  const output = fs.mkdtempSync(path.join(os.tmpdir(), 'authentext-claude-'));
  t.after(() => fs.rmSync(output, { recursive: true, force: true }));
  const receipt = buildDistributionPackage({
    root: process.cwd(),
    output,
    target: 'claude',
    sourceCommit: 'c'.repeat(40),
  });

  assert.deepEqual(validateHostPackage(receipt.packageRoot, 'claude'), []);
  const plugin = JSON.parse(
    fs.readFileSync(path.join(receipt.packageRoot, '.claude-plugin', 'plugin.json'), 'utf8')
  );
  const marketplace = JSON.parse(
    fs.readFileSync(path.join(receipt.packageRoot, '.claude-plugin', 'marketplace.json'), 'utf8')
  );
  assert.equal(plugin.name, 'authentext');
  assert.equal(plugin.version, '3.2.0');
  assert.equal(marketplace.plugins[0].source, './');
  assert.deepEqual(receipt.capabilities, { apps: [], tools: [], hooks: [], network: [] });
});

test('Claude lifecycle rejects rename and mutable versions while permitting rollback', () => {
  assert.deepEqual(evaluatePackageTransition('3.2.0', '3.3.0', 'authentext', 'authentext'), {
    allowed: true,
    operation: 'update',
  });
  assert.deepEqual(evaluatePackageTransition('3.3.0', '3.2.0', 'authentext', 'authentext'), {
    allowed: true,
    operation: 'rollback',
  });
  assert.equal(
    evaluatePackageTransition('3.2.0', '3.2.0', 'authentext', 'authentext').allowed,
    false
  );
  assert.equal(
    evaluatePackageTransition('3.2.0', '3.3.0', 'humanizer', 'authentext').allowed,
    false
  );
});

test('Claude validation rejects executable capabilities and copied instruction drift', (t) => {
  const output = fs.mkdtempSync(path.join(os.tmpdir(), 'authentext-claude-invalid-'));
  t.after(() => fs.rmSync(output, { recursive: true, force: true }));
  const { packageRoot } = buildDistributionPackage({
    root: process.cwd(),
    output,
    target: 'claude',
    sourceCommit: 'b'.repeat(40),
  });
  const pluginPath = path.join(packageRoot, '.claude-plugin', 'plugin.json');
  const plugin = JSON.parse(fs.readFileSync(pluginPath, 'utf8'));
  plugin.hooks = ['./hook.js'];
  fs.writeFileSync(pluginPath, JSON.stringify(plugin));
  fs.appendFileSync(path.join(packageRoot, 'skills', 'authentext', 'SKILL.md'), '\ndrift');
  const errors = validateHostPackage(packageRoot, 'claude');
  assert.ok(errors.some((error) => error.includes('prohibited capability')));
  assert.ok(errors.some((error) => error.includes('digest mismatch')));
});

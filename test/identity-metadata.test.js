import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DEFAULT_LOCAL_REPO } from '../scripts/lib/repo-config.js';

test('canonical manifests share Authentext identity, version, and MIT license', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const python = fs.readFileSync('pyproject.toml', 'utf8');
  const readme = fs.readFileSync('README.md', 'utf8');
  const distribution = fs.readFileSync('docs/skill-distribution.md', 'utf8');

  assert.equal(pkg.name, 'authentext');
  assert.equal(pkg.version, '3.2.0');
  assert.equal(pkg.license, 'MIT');
  assert.equal(pkg.workspaces, undefined, 'legacy packages must not be active npm workspaces');
  assert.equal(
    pkg.scripts['install:mcp-server'],
    undefined,
    'legacy MCP installation must not be an active maintenance command'
  );
  assert.match(pkg.scripts.release, /Authentext ships Agent Skill artifacts/);
  assert.doesNotMatch(pkg.scripts.release, /humanizer/i);

  assert.match(python, /^name = "authentext"$/m);
  assert.match(python, /^version = "3\.2\.0"$/m);
  assert.match(python, /^license = \{ text = "MIT" \}$/m);
  assert.doesNotMatch(python, /humanizer/i);

  assert.match(readme, /^# Authentext$/m);
  assert.doesNotMatch(readme, /Authentext-next|compiled skill pair/i);
  assert.match(distribution, /maintained Authentext Agent Skill package/);
  assert.doesNotMatch(distribution, /humanizer-next|--skill humanizer|create `humanizer\/`/i);
});

test('canonical modules use the package version and Authentext identity', () => {
  for (const filename of [
    'SKILL_CORE_PATTERNS.md',
    'SKILL_TECHNICAL.md',
    'SKILL_ACADEMIC.md',
    'SKILL_GOVERNANCE.md',
    'SKILL_REASONING.md',
  ]) {
    const source = fs.readFileSync(`src/modules/${filename}`, 'utf8');
    assert.match(source, /^version: 3\.2\.0$/m, filename);
  }
  assert.doesNotMatch(
    fs.readFileSync('src/modules/SKILL_REASONING.md', 'utf8'),
    /Humanizer Reasoning Module/
  );
});

test('maintenance tooling falls back to the current Authentext repository identity', () => {
  assert.equal(DEFAULT_LOCAL_REPO, 'edithatogo/authentext');
});

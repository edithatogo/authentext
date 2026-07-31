import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';

const ROOT = process.cwd();
const WORKFLOW_DIR = path.join(ROOT, '.github', 'workflows');
const WORKFLOW_FILES = fs
  .readdirSync(WORKFLOW_DIR)
  .filter((file) => file.endsWith('.yml') || file.endsWith('.yaml'))
  .sort();

/**
 * @param {unknown} value
 * @param {(uses: string, parent: Record<string, unknown>) => void} visit
 */
function visitActions(value, visit) {
  if (Array.isArray(value)) {
    for (const item of value) {
      visitActions(item, visit);
    }
    return;
  }

  if (!value || typeof value !== 'object') {
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    if (key === 'uses' && typeof child === 'string') {
      visit(child, value);
    } else {
      visitActions(child, visit);
    }
  }
}

function assertPinnedAction(uses, step, context) {
  assert.match(
    uses,
    /^[^/]+\/[^/@]+(?:\/[^@]+)?@[0-9a-f]{40}$/,
    `${context} should pin ${uses} to a full commit SHA`
  );
  if (uses.startsWith('actions/checkout@')) {
    assert.equal(
      step.with?.['persist-credentials'],
      false,
      `${context} should not persist checkout credentials`
    );
  }
}

test('GitHub workflow YAML parses and local actions resolve', async (t) => {
  for (const file of WORKFLOW_FILES) {
    await t.test(file, () => {
      const source = fs.readFileSync(path.join(WORKFLOW_DIR, file), 'utf8');
      const workflow = parseYaml(source);

      assert.ok(workflow?.on, `${file} should declare triggers`);
      assert.ok(workflow?.jobs, `${file} should declare jobs`);
      assert.ok(
        workflow?.permissions || Object.values(workflow.jobs).every((job) => job?.permissions),
        `${file} should declare workflow or per-job token permissions`
      );
      visitActions(workflow, (uses, step) => {
        if (uses.startsWith('./')) {
          assert.ok(
            fs.existsSync(path.join(ROOT, uses)),
            `${file} references missing local action ${uses}`
          );
          return;
        }

        assertPinnedAction(uses, step, file);
      });
    });
  }
});

test('composite action dependencies are commit-pinned', () => {
  const actionPath = path.join(ROOT, '.github', 'actions', 'setup-maintainer-env', 'action.yml');
  const action = parseYaml(fs.readFileSync(actionPath, 'utf8'));

  visitActions(action, (uses, step) => {
    assertPinnedAction(uses, step, 'setup-maintainer-env/action.yml');
  });
});

test('Vale archives are extracted outside the checked-out repository', () => {
  const actionPath = path.join(ROOT, '.github', 'actions', 'setup-maintainer-env', 'action.yml');
  const source = fs.readFileSync(actionPath, 'utf8');

  assert.match(source, /RUNNER_TEMP/);
  assert.doesNotMatch(source, /^\s*tar -xzf vale\.tar\.gz\s*$/m);
  assert.doesNotMatch(source, /^\s*sudo mv vale \/usr\/local\/bin\/vale\s*$/m);
});

test('release workflow packages only maintained, existing paths', () => {
  const source = fs.readFileSync(path.join(WORKFLOW_DIR, 'release.yml'), 'utf8');

  for (const requiredPath of [
    'SKILL.md',
    'SKILL_PROFESSIONAL.md',
    'README.md',
    'LICENSE',
    'references',
  ]) {
    assert.ok(
      fs.existsSync(path.join(ROOT, requiredPath)),
      `Release source should exist: ${requiredPath}`
    );
  }

  assert.doesNotMatch(source, /\badapters\//);
  assert.doesNotMatch(source, /docs\/install-matrix\.md/);
  assert.doesNotMatch(source, /humanizer-next/);
});

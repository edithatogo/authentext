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

test('maintained automation and tooling require Node.js 24 or newer', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  assert.equal(packageJson.engines?.node, '>=24', 'package engines should declare Node.js 24');

  const actionPath = path.join(ROOT, '.github', 'actions', 'setup-maintainer-env', 'action.yml');
  const action = parseYaml(fs.readFileSync(actionPath, 'utf8'));
  assert.equal(action.inputs?.['node-version']?.default, '24');

  for (const file of WORKFLOW_FILES) {
    const source = fs.readFileSync(path.join(WORKFLOW_DIR, file), 'utf8');
    assert.doesNotMatch(source, /node-version:\s*['"]?20['"]?/, `${file} must not select Node 20`);
  }
});

test('Vale archives are extracted outside the checked-out repository', () => {
  const actionPath = path.join(ROOT, '.github', 'actions', 'setup-maintainer-env', 'action.yml');
  const source = fs.readFileSync(actionPath, 'utf8');

  assert.match(source, /RUNNER_TEMP/);
  assert.doesNotMatch(source, /^\s*tar -xzf vale\.tar\.gz\s*$/m);
  assert.doesNotMatch(source, /^\s*sudo mv vale \/usr\/local\/bin\/vale\s*$/m);
});

test('CodeQL excludes only frozen legacy and experimental trees', () => {
  const workflow = fs.readFileSync(path.join(WORKFLOW_DIR, 'codeql.yml'), 'utf8');
  const configPath = path.join(ROOT, '.github', 'codeql', 'codeql-config.yml');
  assert.ok(fs.existsSync(configPath), 'CodeQL scope configuration should exist');
  assert.match(workflow, /config-file:\s*\.\/\.github\/codeql\/codeql-config\.yml/);
  assert.doesNotMatch(
    workflow,
    /^\s+category:/m,
    'shared CodeQL gate must receive only supported inputs'
  );

  const config = parseYaml(fs.readFileSync(configPath, 'utf8'));
  assert.deepEqual(config['paths-ignore'], ['skills/**', 'experiments/**']);
});

test('release workflow packages only maintained, existing paths', () => {
  const source = fs.readFileSync(path.join(WORKFLOW_DIR, 'release.yml'), 'utf8');

  assert.match(
    source,
    /softprops\/action-gh-release@3d0d9888cb7fd7b750713d6e236d1fcb99157228\s+# v3\.0\.2/,
    'release publication must use the current Node.js 24 action release'
  );

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

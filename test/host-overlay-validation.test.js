import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const VALIDATOR = path.join(ROOT, 'scripts', 'validate-host-overlays.js');

function validate(root) {
  return spawnSync(process.execPath, [VALIDATOR, '--root', root], {
    encoding: 'utf8',
  });
}

test('current optional host overlay validates independently', () => {
  const result = validate(ROOT);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /validation passed/);
});

test('host validation rejects dependencies and portable-field leakage', () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'authentext-host-overlay-'));
  fs.mkdirSync(path.join(fixture, 'agents'));
  fs.writeFileSync(
    path.join(fixture, 'agents', 'openai.yaml'),
    `interface:\n  display_name: Authentext\n  short_description: Rewrite prose\ndependencies:\n  tools: []\n`
  );
  fs.writeFileSync(
    path.join(fixture, 'SKILL.md'),
    `---\nname: authentext\ndescription: Rewrite prose\npolicy:\n  allow_implicit_invocation: true\n---\n`
  );

  const result = validate(fixture);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /dependencies are unsupported/);
  assert.match(result.stderr, /must not appear in SKILL.md frontmatter/);
});

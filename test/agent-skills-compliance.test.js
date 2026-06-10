import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SKILL_PATH = path.join(ROOT, 'SKILL.md');
const PRO_PATH = path.join(ROOT, 'SKILL_PROFESSIONAL.md');
const REFERENCES_DIR = path.join(ROOT, 'references');

/**

* @param {string} filePath
* @returns {Record<string, string>}
 */
function parseFrontmatter(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  assert.ok(match, `${filePath} should have YAML frontmatter`);

  const frontmatter = {};
  for (const line of match[1].split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    frontmatter[key] = value;
  }

  return frontmatter;
}

test('Agent Skills package layout', async (t) => {
  await t.test('SKILL.md body stays under 500 lines', () => {
    const lines = fs.readFileSync(SKILL_PATH, 'utf8').split('\n').length;
    assert.ok(lines <= 500, `SKILL.md is ${lines} lines; spec limit is 500`);
  });

  await t.test('SKILL_PROFESSIONAL.md body stays under 500 lines', () => {
    const lines = fs.readFileSync(PRO_PATH, 'utf8').split('\n').length;
    assert.ok(lines <= 500, `SKILL_PROFESSIONAL.md is ${lines} lines; spec limit is 500`);
  });

  await t.test('SKILL.md frontmatter is spec-compliant', () => {
    const fm = parseFrontmatter(SKILL_PATH);
    assert.equal(fm.name, 'humanizer');
    assert.ok(fm.description, 'description is required');
    assert.ok(fm.description.length <= 1024, 'description must be <= 1024 chars');
    assert.equal(fm.license, 'MIT');
    assert.ok(fm.compatibility, 'compatibility is required');
  });

  await t.test('references tree exists with core patterns', () => {
    assert.ok(fs.existsSync(REFERENCES_DIR), 'references/ directory should exist');
    assert.ok(
      fs.existsSync(path.join(REFERENCES_DIR, 'core-patterns.md')),
      'references/core-patterns.md should exist'
    );
    assert.ok(
      fs.existsSync(path.join(REFERENCES_DIR, 'reasoning-failures.md')),
      'references/reasoning-failures.md should exist'
    );
  });

  await t.test('SKILL.md links to references', () => {
    const content = fs.readFileSync(SKILL_PATH, 'utf8');
    assert.match(content, /references\/core-patterns\.md/);
  });
});

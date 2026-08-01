import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { load as parseWithJsYaml } from 'js-yaml';
import { parse as parseWithYaml } from 'yaml';

const ROOT = process.cwd();
const SKILL_PATH = path.join(ROOT, 'SKILL.md');
const PRO_PATH = path.join(ROOT, 'SKILL_PROFESSIONAL.md');
const REFERENCES_DIR = path.join(ROOT, 'references');
const OPENAI_METADATA_PATH = path.join(ROOT, 'agents', 'openai.yaml');
const PACKAGE = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const PORTABLE_FIELDS = ['description', 'license', 'metadata', 'name'];

/**
 * @param {string} filePath
 * @returns {string}
 */
function readFrontmatter(filePath) {
  const content = fs.readFileSync(filePath, 'utf8').replace(/\r\n?/g, '\n');
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  assert.ok(match, `${filePath} should have YAML frontmatter`);
  return match[1];
}

/**
 * Parse the same frontmatter with independent YAML implementations so syntax
 * accepted accidentally by one parser cannot enter generated output.
 *
 * @param {string} filePath
 * @returns {Record<string, unknown>}
 */
function parseFrontmatter(filePath) {
  const source = readFrontmatter(filePath);
  const yamlResult = parseWithYaml(source);
  const jsYamlResult = parseWithJsYaml(source);

  assert.deepEqual(yamlResult, jsYamlResult, 'YAML parsers should agree on frontmatter');
  assert.ok(yamlResult && typeof yamlResult === 'object' && !Array.isArray(yamlResult));
  return yamlResult;
}

/**
 * @param {string} directory
 * @returns {string[]}
 */
function findSkillFiles(directory) {
  const ignoredDirectories = new Set(['.git', 'node_modules']);
  const matches = [];

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) {
      continue;
    }

    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      matches.push(...findSkillFiles(entryPath));
    } else if (entry.name === 'SKILL.md') {
      matches.push(path.relative(ROOT, entryPath).replaceAll(path.sep, '/'));
    }
  }

  return matches;
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
    assert.equal(fm.name, 'authentext');
    assert.ok(fm.description, 'description is required');
    assert.ok(fm.description.length <= 1024, 'description must be <= 1024 chars');
    assert.equal(fm.license, 'MIT');
    assert.deepEqual(Object.keys(fm).sort(), PORTABLE_FIELDS);
    assert.deepEqual(fm.metadata, { version: PACKAGE.version });
    assert.equal(fm.compatibility, undefined);
    assert.equal(fm['allowed-tools'], undefined);
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

  await t.test('one runtime skill owns professional routing', () => {
    assert.deepEqual(findSkillFiles(ROOT), ['SKILL.md']);

    const skill = fs.readFileSync(SKILL_PATH, 'utf8');
    assert.match(skill, /^## Routing by task and content type$/m);
    assert.match(skill, /references\/technical\.md/);
    assert.match(skill, /references\/academic\.md/);
    assert.match(skill, /references\/governance\.md/);
    assert.match(skill, /references\/reasoning-failures\.md/);

    const professional = fs.readFileSync(PRO_PATH, 'utf8');
    assert.doesNotMatch(professional, /^---\r?\n/);
    assert.match(professional, /^# Authentext Professional Routing Reference$/m);
    assert.match(professional, /not a separately discoverable Agent Skill/i);
  });

  await t.test('optional OpenAI metadata is generated and scoped to the skill', () => {
    assert.ok(fs.existsSync(OPENAI_METADATA_PATH), 'agents/openai.yaml should exist');

    const metadata = parseWithYaml(fs.readFileSync(OPENAI_METADATA_PATH, 'utf8'));
    assert.deepEqual(metadata, {
      interface: {
        display_name: 'Authentext',
        short_description: 'Rewrite prose naturally while preserving meaning and literals',
        default_prompt:
          'Use $authentext to rewrite this text naturally while preserving its meaning and technical literals.',
      },
      policy: {
        products: ['CHAT', 'CODEX'],
        allow_implicit_invocation: true,
      },
    });
    assert.equal(metadata.dependencies, undefined);
  });
});

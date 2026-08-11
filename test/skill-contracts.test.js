import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import {
  AGENT_SKILLS_PORTABLE_SCHEMA,
  CONTRACT_DIR,
  EVALUATION_FIXTURE_SCHEMA,
  FORBIDDEN_PORTABLE_FIELDS,
  PATTERN_SCHEMA,
  PORTABLE_FIELDS,
  PROTECTED_SPAN_CATALOG,
  PROTECTED_SPAN_SCHEMA,
  collectContractErrors,
  loadContractJson,
  parsePortableFrontmatter,
  validateAgainstSchema,
  validatePackagedSkillLayout,
  validatePatternRecord,
  validatePatternRecords,
  validatePortableFrontmatter,
} from '../scripts/lib/skill-contracts.js';

const ROOT = process.cwd();
const VALIDATOR = path.join(ROOT, 'scripts', 'validate-skill-contracts.js');

function validPattern(overrides = {}) {
  return {
    schema_version: 1,
    id: 'pattern-1',
    number: 1,
    title: 'Undue Emphasis on Significance',
    severity: 'high',
    domain_applicability: ['all'],
    mode_carve_outs: [],
    trigger_terms: ['stands as', 'pivotal moment'],
    false_positive_guards: ['Do not flatten accurate technical emphasis.'],
    problem: 'LLM writing puffs up importance.',
    before: 'The institute was established in 1989, marking a pivotal moment.',
    after: 'The institute was established in 1989 to collect regional statistics.',
    ...overrides,
  };
}

function runValidator(root) {
  return spawnSync(process.execPath, [VALIDATOR, '--root', root], { encoding: 'utf8' });
}

test('contract schemas are checked in, closed, and name required fields', () => {
  const pattern = loadContractJson(ROOT, PATTERN_SCHEMA);
  const span = loadContractJson(ROOT, PROTECTED_SPAN_SCHEMA);
  const fixtures = loadContractJson(ROOT, EVALUATION_FIXTURE_SCHEMA);
  const portable = loadContractJson(ROOT, AGENT_SKILLS_PORTABLE_SCHEMA);

  for (const schema of [pattern, span, fixtures, portable]) {
    assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema');
    assert.ok(schema.$id.includes('src/document-intelligence/'));
  }

  assert.deepEqual(pattern.required, [
    'schema_version',
    'id',
    'number',
    'title',
    'severity',
    'domain_applicability',
    'mode_carve_outs',
    'trigger_terms',
    'false_positive_guards',
  ]);
  assert.deepEqual(pattern.$defs.severity.enum, ['critical', 'high', 'medium', 'low']);
  assert.equal(pattern.additionalProperties, false);

  assert.deepEqual(span.$defs.classId.enum, [
    'quantity',
    'citation',
    'negation',
    'epistemic',
    'scope',
    'proper-name',
  ]);

  assert.deepEqual(Object.keys(portable.properties).sort(), [...PORTABLE_FIELDS].sort());
  assert.equal(portable.additionalProperties, false);
  for (const field of FORBIDDEN_PORTABLE_FIELDS) {
    assert.equal(portable.properties[field], undefined);
  }
});

test('valid pattern records pass and missing or illegal fields fail', () => {
  const schema = loadContractJson(ROOT, PATTERN_SCHEMA);
  assert.deepEqual(validatePatternRecord(validPattern(), schema), []);

  const missing = validatePatternRecord({ title: 'Incomplete' }, schema).join('\n');
  assert.match(missing, /id is required/);
  assert.match(missing, /severity is required/);

  const badSeverity = validatePatternRecord(validPattern({ severity: 'urgent' }), schema).join(
    '\n'
  );
  assert.match(badSeverity, /severity/);

  const extra = validatePatternRecord(validPattern({ host_only: true }), schema).join('\n');
  assert.match(extra, /host_only/);
});

test('pattern IDs and numbers must be unique and aligned', () => {
  const schema = loadContractJson(ROOT, PATTERN_SCHEMA);
  const duplicate = validatePatternRecords(
    [validPattern(), validPattern({ title: 'Copy' })],
    schema
  ).join('\n');
  assert.match(duplicate, /not unique: pattern-1/);

  const mismatch = validatePatternRecord(validPattern({ id: 'pattern-2', number: 1 }), schema).join(
    '\n'
  );
  assert.match(mismatch, /pattern-1/);
});

test('protected-span catalog and evaluation fixtures satisfy their schemas', () => {
  const spanSchema = loadContractJson(ROOT, PROTECTED_SPAN_SCHEMA);
  const catalog = loadContractJson(ROOT, PROTECTED_SPAN_CATALOG);
  assert.deepEqual(validateAgainstSchema(catalog, spanSchema, 'catalog'), []);
  assert.equal(catalog.classes.length, 6);

  const fixtureSchema = loadContractJson(ROOT, EVALUATION_FIXTURE_SCHEMA);
  for (const filename of [
    'trigger-evaluations.json',
    'output-evaluations.json',
    'adaptive-document-evaluations.json',
  ]) {
    const fixture = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'test', 'fixtures', filename), 'utf8')
    );
    assert.deepEqual(validateAgainstSchema(fixture, fixtureSchema, filename), [], filename);
  }
});

test('portable frontmatter rejects allowed-tools and compatibility', () => {
  const schema = loadContractJson(ROOT, AGENT_SKILLS_PORTABLE_SCHEMA);
  const good = parsePortableFrontmatter(
    'name: authentext\ndescription: Rewrite prose naturally.\nlicense: MIT\nmetadata:\n  version: "3.2.0"'
  );
  assert.deepEqual(validatePortableFrontmatter(good, schema), []);

  const withTools = validatePortableFrontmatter(
    { name: 'authentext', description: 'Rewrite prose.', 'allowed-tools': 'Read Write' },
    schema
  ).join('\n');
  assert.match(withTools, /allowed-tools/);

  const withCompat = validatePortableFrontmatter(
    { name: 'authentext', description: 'Rewrite prose.', compatibility: 'claude-code' },
    schema
  ).join('\n');
  assert.match(withCompat, /compatibility/);
});

test('packaged skills must use skills/<name>/SKILL.md', () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'authentext-skill-package-'));
  fs.writeFileSync(path.join(fixture, 'SKILL.md'), '---\nname: authentext\ndescription: x\n---\n');
  assert.match(validatePackagedSkillLayout(fixture).join('\n'), /skills\/authentext\/SKILL.md/);

  fs.mkdirSync(path.join(fixture, 'skills', 'authentext'), { recursive: true });
  fs.writeFileSync(
    path.join(fixture, 'skills', 'authentext', 'SKILL.md'),
    '---\nname: authentext\ndescription: Rewrite prose.\n---\n'
  );
  assert.deepEqual(validatePackagedSkillLayout(fixture), []);
});

test('repo contracts validate and the CLI names the Agent Skills spec', () => {
  assert.deepEqual(collectContractErrors(ROOT), []);

  const result = runValidator(ROOT);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Skill contract validation passed/);
  assert.match(result.stdout, /https:\/\/agentskills\.io\/specification/);
});

test('CLI fails on a known-bad portable field', () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'authentext-bad-skill-'));
  fs.cpSync(path.join(ROOT, CONTRACT_DIR), path.join(fixture, CONTRACT_DIR), { recursive: true });
  fs.cpSync(path.join(ROOT, 'test', 'fixtures'), path.join(fixture, 'test', 'fixtures'), {
    recursive: true,
  });
  fs.writeFileSync(
    path.join(fixture, 'SKILL.md'),
    '---\nname: authentext\ndescription: Rewrite prose.\nallowed-tools: Read\n---\n'
  );

  const result = runValidator(fixture);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /allowed-tools/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import {
  AGENT_SKILLS_PORTABLE_SCHEMA,
  CONTRACT_DIR,
  CORE_PATTERNS_MODULE,
  EVALUATION_FIXTURE_SCHEMA,
  FORBIDDEN_PORTABLE_FIELDS,
  PATTERN_SCHEMA,
  PATTERNS_REGISTRY,
  PATTERNS_REGISTRY_SCHEMA,
  PORTABLE_FIELDS,
  PROTECTED_SPAN_CATALOG,
  PROTECTED_SPAN_SCHEMA,
  collectContractErrors,
  loadContractJson,
  parseFrontmatterPatternCount,
  parsePortableFrontmatter,
  parseSeverityTable,
  renderSeverityClassification,
  replaceSeveritySection,
  validateAgainstSchema,
  validatePackagedSkillLayout,
  validatePatternRecord,
  validatePatternRecords,
  validatePatternRegistryConcordance,
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
  const registrySchema = loadContractJson(ROOT, PATTERNS_REGISTRY_SCHEMA);
  const span = loadContractJson(ROOT, PROTECTED_SPAN_SCHEMA);
  const fixtures = loadContractJson(ROOT, EVALUATION_FIXTURE_SCHEMA);
  const portable = loadContractJson(ROOT, AGENT_SKILLS_PORTABLE_SCHEMA);

  for (const schema of [pattern, registrySchema, span, fixtures, portable]) {
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

test('checked-in registry matches core-pattern headings and counts', () => {
  const registry = loadContractJson(ROOT, PATTERNS_REGISTRY);
  const source = fs.readFileSync(path.join(ROOT, CORE_PATTERNS_MODULE), 'utf8');
  assert.deepEqual(
    validateAgainstSchema(registry, loadContractJson(ROOT, PATTERNS_REGISTRY_SCHEMA)),
    []
  );
  assert.deepEqual(validatePatternRegistryConcordance(registry, source), []);
  assert.equal(registry.patterns.length, 40);
  const preserved = registry.patterns.find((pattern) => pattern.number === 27);
  assert.equal(preserved?.severity, 'critical');
  assert.equal(preserved?.must_preserve, true);
});

test('a heading mismatch, duplicate severity-table ID, or count drift fails', () => {
  const registry = structuredClone(loadContractJson(ROOT, PATTERNS_REGISTRY));
  const source = fs.readFileSync(path.join(ROOT, CORE_PATTERNS_MODULE), 'utf8');

  const retitled = structuredClone(registry);
  retitled.patterns[0].title = 'Wrong Title';
  assert.match(
    validatePatternRegistryConcordance(retitled, source).join('\n'),
    /does not match heading/
  );

  const duplicated = source.replace(
    '- Pattern 39: Hyphenated word pair overuse (narrowed, upstream)',
    '- Pattern 9: Negative parallelisms\n- Pattern 39: Hyphenated word pair overuse (narrowed, upstream)'
  );
  assert.match(
    validatePatternRegistryConcordance(registry, duplicated).join('\n'),
    /duplicate Pattern 9/
  );

  const recount = source.replace(/^patterns: 40$/m, 'patterns: 39');
  assert.match(validatePatternRegistryConcordance(registry, recount).join('\n'), /frontmatter=39/);
});

test('concordance reports missing headings, table gaps, and severity drift', () => {
  const registry = structuredClone(loadContractJson(ROOT, PATTERNS_REGISTRY));
  const source = fs.readFileSync(path.join(ROOT, CORE_PATTERNS_MODULE), 'utf8');

  assert.deepEqual(validatePatternRegistryConcordance({}), [
    'pattern registry must contain a patterns array',
  ]);
  assert.deepEqual(parseSeverityTable('# No table\n'), []);
  assert.equal(parseFrontmatterPatternCount('# no yaml\n'), null);
  assert.equal(parseFrontmatterPatternCount('---\nmodule_id: x\n---\n'), null);

  const missingHeading = structuredClone(registry);
  missingHeading.patterns = missingHeading.patterns.filter((pattern) => pattern.number !== 1);
  const missingHeadingErrors = validatePatternRegistryConcordance(missingHeading, source).join(
    '\n'
  );
  assert.match(missingHeadingErrors, /missing heading Pattern 1/);

  const orphan = structuredClone(registry);
  orphan.patterns.push({
    schema_version: 1,
    number: 99,
    title: 'Ghost',
    severity: 'low',
  });
  const orphanErrors = validatePatternRegistryConcordance(orphan, source).join('\n');
  assert.match(orphanErrors, /heading is missing registry pattern-99/);
  assert.match(orphanErrors, /severity table is missing pattern-99/);

  const drifted = structuredClone(registry);
  drifted.patterns[0].severity = 'low';
  const driftedErrors = validatePatternRegistryConcordance(drifted, source).join('\n');
  assert.match(driftedErrors, /severity does not match body/);
  assert.match(driftedErrors, /severity does not match table/);

  const unmarked = structuredClone(registry);
  unmarked.patterns.find((pattern) => pattern.number === 27).must_preserve = false;
  assert.match(
    validatePatternRegistryConcordance(unmarked, source).join('\n'),
    /must_preserve does not match body/
  );

  const unknownTable = source.replace('- Pattern 39:', '- Pattern 98:');
  const tableErrors = validatePatternRegistryConcordance(registry, unknownTable).join('\n');
  assert.match(tableErrors, /unknown Pattern 98/);
  assert.match(tableErrors, /severity table is missing pattern-39/);

  assert.deepEqual(validatePatternRegistryConcordance(registry.patterns, source), []);
});

test('severity tables compile from the registry without duplicate IDs', () => {
  const registry = loadContractJson(ROOT, PATTERNS_REGISTRY);
  const rendered = renderSeverityClassification(registry.patterns);
  const ids = [...rendered.matchAll(/^- Pattern (\d+):/gm)].map((match) => match[1]);
  assert.equal(ids.length, 40);
  assert.equal(new Set(ids).size, 40);
  assert.match(rendered, /### Critical \(immediate AI detection\)/);
  assert.match(rendered, /Pattern 27: Technical Literal Preservation \(must preserve\)/);
  assert.throws(() => renderSeverityClassification({}), /must be an array/);

  const source = fs.readFileSync(path.join(ROOT, CORE_PATTERNS_MODULE), 'utf8');
  const replaced = replaceSeveritySection(source, rendered);
  assert.match(replaced, /Pattern 13: Em\/En Dash Hard Cut/);
  assert.doesNotMatch(replaced, /Pattern 13: Em dash overuse/);
  assert.throws(() => replaceSeveritySection('# no table\n', rendered), /missing ## SEVERITY/);
});

test('collectContractErrors fails when the registry file is missing', () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'authentext-no-registry-'));
  fs.cpSync(path.join(ROOT, CONTRACT_DIR), path.join(fixture, CONTRACT_DIR), { recursive: true });
  fs.cpSync(path.join(ROOT, 'test', 'fixtures'), path.join(fixture, 'test', 'fixtures'), {
    recursive: true,
  });
  fs.writeFileSync(
    path.join(fixture, 'SKILL.md'),
    '---\nname: authentext\ndescription: Rewrite prose.\n---\n'
  );
  fs.rmSync(path.join(fixture, CONTRACT_DIR, PATTERNS_REGISTRY));
  assert.match(collectContractErrors(fixture).join('\n'), /missing pattern registry/);
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

import fs from 'node:fs';
import path from 'node:path';

export const CONTRACT_DIR = 'src/document-intelligence';
export const PATTERN_SCHEMA = 'pattern.schema.json';
export const PATTERNS_REGISTRY = 'patterns.json';
export const PATTERNS_REGISTRY_SCHEMA = 'patterns-registry.schema.json';
export const PROTECTED_SPAN_SCHEMA = 'protected-span.schema.json';
export const EVALUATION_FIXTURE_SCHEMA = 'evaluation-fixture.schema.json';
export const AGENT_SKILLS_PORTABLE_SCHEMA = 'agent-skills-portable.schema.json';
export const PROTECTED_SPAN_CATALOG = 'protected-span-classes.json';
export const CORE_PATTERNS_MODULE = 'src/modules/SKILL_CORE_PATTERNS.md';
export const FORBIDDEN_PORTABLE_FIELDS = Object.freeze(['allowed-tools', 'compatibility']);
export const PORTABLE_FIELDS = Object.freeze(['name', 'description', 'license', 'metadata']);

const SCHEMA_FILES = [
  PATTERN_SCHEMA,
  PATTERNS_REGISTRY_SCHEMA,
  PROTECTED_SPAN_SCHEMA,
  EVALUATION_FIXTURE_SCHEMA,
  AGENT_SKILLS_PORTABLE_SCHEMA,
];

const SEVERITY_ALIASES = Object.freeze({
  critical: 'critical',
  high: 'high',
  medium: 'medium',
  low: 'low',
});

/**
 * @param {string} root
 * @param {string} filename
 * @returns {unknown}
 */
export function loadContractJson(root, filename) {
  return JSON.parse(fs.readFileSync(path.join(root, CONTRACT_DIR, filename), 'utf8'));
}

/**
 * @param {Record<string, unknown>} schema
 * @param {string} ref
 * @returns {Record<string, unknown>}
 */
function resolveRef(schema, ref) {
  if (!ref.startsWith('#/$defs/')) {
    throw new TypeError(`unsupported $ref: ${ref}`);
  }
  const key = ref.slice('#/$defs/'.length);
  const defs = schema.$defs;
  if (!defs || typeof defs !== 'object' || !(key in defs)) {
    throw new TypeError(`unresolved $ref: ${ref}`);
  }
  return /** @type {Record<string, unknown>} */ (defs[key]);
}

function typeOf(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

function isInteger(value) {
  return typeof value === 'number' && Number.isInteger(value);
}

/**
 * Validate an instance against the JSON Schema subset used by these contracts.
 * @param {unknown} instance
 * @param {Record<string, unknown>} schema
 * @param {string} [label]
 * @param {Record<string, unknown>} [root]
 * @returns {string[]}
 */
export function validateAgainstSchema(instance, schema, label = '$', root = schema) {
  if (schema.$ref) {
    return validateAgainstSchema(
      instance,
      resolveRef(root, /** @type {string} */ (schema.$ref)),
      label,
      root
    );
  }

  if (Array.isArray(schema.oneOf)) {
    const matches = schema.oneOf
      .map((branch) =>
        validateAgainstSchema(
          instance,
          /** @type {Record<string, unknown>} */ (branch),
          label,
          root
        )
      )
      .filter((errors) => errors.length === 0);
    if (matches.length !== 1) {
      return [`${label} must match exactly one schema branch`];
    }
    return [];
  }

  const errors = [];
  if (Object.hasOwn(schema, 'const') && instance !== schema.const) {
    errors.push(`${label} must equal ${JSON.stringify(schema.const)}`);
  }
  if (Array.isArray(schema.enum) && !schema.enum.includes(instance)) {
    errors.push(`${label} must be one of ${schema.enum.join(', ')}`);
  }

  const expectedType = schema.type;
  if (expectedType === 'integer') {
    if (!isInteger(instance)) errors.push(`${label} must be an integer`);
  } else if (typeof expectedType === 'string' && typeOf(instance) !== expectedType) {
    errors.push(`${label} must be ${expectedType}`);
  }

  if (expectedType === 'string' && typeof instance === 'string') {
    if (typeof schema.minLength === 'number' && instance.length < schema.minLength) {
      errors.push(`${label} must be at least ${schema.minLength} characters`);
    }
    if (typeof schema.maxLength === 'number' && instance.length > schema.maxLength) {
      errors.push(`${label} must be at most ${schema.maxLength} characters`);
    }
    if (typeof schema.pattern === 'string' && !new RegExp(schema.pattern, 'u').test(instance)) {
      errors.push(`${label} must match ${schema.pattern}`);
    }
  }

  if (
    (expectedType === 'number' || expectedType === 'integer') &&
    typeof instance === 'number' &&
    typeof schema.minimum === 'number' &&
    instance < schema.minimum
  ) {
    errors.push(`${label} must be >= ${schema.minimum}`);
  }

  if (expectedType === 'array' && Array.isArray(instance)) {
    if (typeof schema.minItems === 'number' && instance.length < schema.minItems) {
      errors.push(`${label} must contain at least ${schema.minItems} items`);
    }
    if (schema.uniqueItems) {
      const seen = new Set(instance.map((item) => JSON.stringify(item)));
      if (seen.size !== instance.length) errors.push(`${label} items must be unique`);
    }
    if (schema.items && typeof schema.items === 'object') {
      for (const [index, item] of instance.entries()) {
        errors.push(
          ...validateAgainstSchema(
            item,
            /** @type {Record<string, unknown>} */ (schema.items),
            `${label}[${index}]`,
            root
          )
        );
      }
    }
  }

  if (expectedType === 'object' && instance && typeOf(instance) === 'object') {
    const object = /** @type {Record<string, unknown>} */ (instance);
    const properties =
      schema.properties && typeof schema.properties === 'object'
        ? /** @type {Record<string, Record<string, unknown>>} */ (schema.properties)
        : {};
    for (const key of schema.required ?? []) {
      if (!Object.hasOwn(object, key)) errors.push(`${label}.${key} is required`);
    }
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(object)) {
        if (!Object.hasOwn(properties, key)) {
          errors.push(`${label}.${key} is not allowed`);
        }
      }
    }
    for (const [key, value] of Object.entries(object)) {
      if (properties[key]) {
        errors.push(...validateAgainstSchema(value, properties[key], `${label}.${key}`, root));
      } else if (
        schema.additionalProperties &&
        typeof schema.additionalProperties === 'object' &&
        schema.additionalProperties !== null
      ) {
        errors.push(
          ...validateAgainstSchema(
            value,
            /** @type {Record<string, unknown>} */ (schema.additionalProperties),
            `${label}.${key}`,
            root
          )
        );
      }
    }
  }

  return errors;
}

/**
 * @param {unknown} record
 * @param {Record<string, unknown>} schema
 * @returns {string[]}
 */
export function validatePatternRecord(record, schema) {
  const errors = validateAgainstSchema(record, schema, 'pattern');
  if (record && typeof record === 'object' && !Array.isArray(record)) {
    const pattern = /** @type {{ id?: string, number?: number }} */ (record);
    if (typeof pattern.id === 'string' && typeof pattern.number === 'number') {
      const expected = `pattern-${pattern.number}`;
      if (pattern.id !== expected) {
        errors.push(`pattern.id must be ${expected}`);
      }
    }
  }
  return errors;
}

/**
 * @param {unknown[]} records
 * @param {Record<string, unknown>} schema
 * @returns {string[]}
 */
export function parseCorePatternHeadings(source) {
  const headings = [];
  const text = source.replace(/\r\n?/g, '\n');
  const headingRe = /^### Pattern (\d+):\s*(.+)$/gm;
  let match;
  while ((match = headingRe.exec(text))) {
    headings.push({ number: Number(match[1]), title: match[2].trim() });
  }
  return headings;
}

/**
 * @param {string} source
 * @returns {{ number: number, severity: string, must_preserve: boolean }[]}
 */
export function parsePatternBodySeverities(source) {
  const text = source.replace(/\r\n?/g, '\n');
  const headingRe = /^### Pattern (\d+):\s*(.+)$/gm;
  const headings = [];
  let match;
  while ((match = headingRe.exec(text))) {
    headings.push({ number: Number(match[1]), index: match.index });
  }
  return headings.map((heading, index) => {
    const block = text.slice(heading.index, headings[index + 1]?.index ?? text.length);
    const severityLine = block.match(/\*\*Severity:\*\*\s*(.+)/);
    const raw = severityLine ? severityLine[1].trim() : '';
    return {
      number: heading.number,
      severity: normalizeSeverity(raw),
      must_preserve: /must preserve/i.test(raw),
    };
  });
}

/**
 * @param {string} source
 * @returns {{ number: number, title: string, severity: string }[]}
 */
export function parseSeverityTable(source) {
  const text = source.replace(/\r\n?/g, '\n');
  const section = text.match(/^## SEVERITY CLASSIFICATION\n([\s\S]*?)(?=\n---\n|\n## )/m);
  if (!section) return [];
  const rows = [];
  let severity = null;
  for (const line of section[1].split('\n')) {
    const tier = line.match(/^### (Critical|High|Medium|Low)\b/);
    if (tier) {
      severity = normalizeSeverity(tier[1]);
      continue;
    }
    const row = line.match(/^- Pattern (\d+):\s*(.+)$/);
    if (row && severity) {
      rows.push({ number: Number(row[1]), title: row[2].trim(), severity });
    }
  }
  return rows;
}

/**
 * @param {string} source
 * @returns {number|null}
 */
export function parseFrontmatterPatternCount(source) {
  const yaml = extractFrontmatterSource(source);
  if (!yaml) return null;
  const match = yaml.match(/^patterns:\s*(\d+)\s*$/m);
  return match ? Number(match[1]) : null;
}

/**
 * @param {string} raw
 * @returns {string}
 */
function normalizeSeverity(raw) {
  const token = raw
    .trim()
    .toLowerCase()
    .split(/[\s(/]/, 1)[0];
  return SEVERITY_ALIASES[token] ?? token;
}

/**
 * @param {unknown} registry
 * @param {string} source
 * @returns {string[]}
 */
export function validatePatternRegistryConcordance(registry, source) {
  const errors = [];
  const records = Array.isArray(registry) ? registry : registry?.patterns;
  if (!Array.isArray(records)) return ['pattern registry must contain a patterns array'];

  const headings = parseCorePatternHeadings(source);
  const bodies = parsePatternBodySeverities(source);
  const table = parseSeverityTable(source);
  const frontmatterCount = parseFrontmatterPatternCount(source);

  if (frontmatterCount !== records.length) {
    errors.push(
      `pattern count mismatch: registry=${records.length} frontmatter=${frontmatterCount ?? 'missing'}`
    );
  }
  if (headings.length !== records.length) {
    errors.push(`pattern count mismatch: registry=${records.length} headings=${headings.length}`);
  }

  const byNumber = new Map();
  for (const record of records) {
    if (record && typeof record === 'object' && typeof record.number === 'number') {
      byNumber.set(record.number, record);
    }
  }

  const headingNumbers = new Set();
  for (const heading of headings) {
    headingNumbers.add(heading.number);
    const record = byNumber.get(heading.number);
    if (!record) {
      errors.push(`registry is missing heading Pattern ${heading.number}: ${heading.title}`);
      continue;
    }
    if (record.title !== heading.title) {
      errors.push(
        `pattern-${heading.number} title does not match heading: registry=${JSON.stringify(record.title)} heading=${JSON.stringify(heading.title)}`
      );
    }
  }
  for (const record of records) {
    if (record && typeof record.number === 'number' && !headingNumbers.has(record.number)) {
      errors.push(`heading is missing registry ${record.id ?? `pattern-${record.number}`}`);
    }
  }

  for (const body of bodies) {
    const record = byNumber.get(body.number);
    if (!record) continue;
    if (record.severity !== body.severity) {
      errors.push(
        `pattern-${body.number} severity does not match body: registry=${record.severity} body=${body.severity}`
      );
    }
    if (Boolean(record.must_preserve) !== body.must_preserve) {
      errors.push(
        `pattern-${body.number} must_preserve does not match body: registry=${Boolean(record.must_preserve)} body=${body.must_preserve}`
      );
    }
  }

  const tableNumbers = new Set();
  for (const row of table) {
    if (tableNumbers.has(row.number)) {
      errors.push(`severity table has duplicate Pattern ${row.number}`);
    }
    tableNumbers.add(row.number);
    const record = byNumber.get(row.number);
    if (!record) {
      errors.push(`severity table lists unknown Pattern ${row.number}`);
      continue;
    }
    if (record.severity !== row.severity) {
      errors.push(
        `pattern-${row.number} severity does not match table: registry=${record.severity} table=${row.severity}`
      );
    }
  }
  for (const record of records) {
    if (record && typeof record.number === 'number' && !tableNumbers.has(record.number)) {
      errors.push(`severity table is missing ${record.id ?? `pattern-${record.number}`}`);
    }
  }

  return errors;
}

/**
 * @param {unknown[]} records
 * @param {Record<string, unknown>} schema
 * @returns {string[]}
 */
export function validatePatternRecords(records, schema) {
  if (!Array.isArray(records)) return ['pattern records must be an array'];
  const errors = [];
  const ids = new Set();
  const numbers = new Set();
  for (const [index, record] of records.entries()) {
    const prefixed = validatePatternRecord(record, schema).map((error) =>
      error.replace(/^pattern/, `pattern[${index}]`)
    );
    errors.push(...prefixed);
    const id = record && typeof record === 'object' ? record.id : undefined;
    const number = record && typeof record === 'object' ? record.number : undefined;
    if (typeof id === 'string') {
      if (ids.has(id)) errors.push(`pattern id is not unique: ${id}`);
      ids.add(id);
    }
    if (typeof number === 'number') {
      if (numbers.has(number)) errors.push(`pattern number is not unique: ${number}`);
      numbers.add(number);
    }
  }
  return errors;
}

/**
 * @param {string} source
 * @returns {string|null}
 */
export function extractFrontmatterSource(source) {
  const match = source.replace(/\r\n?/g, '\n').match(/^---\n([\s\S]*?)\n---/);
  return match ? match[1] : null;
}

function unquote(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    try {
      return JSON.parse(trimmed.startsWith("'") ? `"${trimmed.slice(1, -1)}"` : trimmed);
    } catch {
      return trimmed.slice(1, -1);
    }
  }
  return trimmed;
}

/**
 * Parse the simple portable frontmatter shape used by SKILL.md.
 * @param {string} yaml
 * @returns {Record<string, unknown>}
 */
export function parsePortableFrontmatter(yaml) {
  const result = /** @type {Record<string, unknown>} */ ({});
  let currentKey = null;
  for (const line of yaml.split('\n')) {
    if (/^\s*$/.test(line)) continue;
    const nested = line.match(/^  ([A-Za-z0-9_-]+):\s*(.*)$/);
    if (nested && currentKey !== null && typeOf(result[currentKey]) === 'object') {
      const currentMap = /** @type {Record<string, unknown>} */ (result[currentKey]);
      currentMap[nested[1]] = unquote(nested[2]);
      continue;
    }
    const top = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!top) {
      result.__parse_error = `unparseable frontmatter line: ${line}`;
      return result;
    }
    currentKey = top[1];
    const value = top[2];
    result[currentKey] = value === '' ? {} : unquote(value);
  }
  return result;
}

/**
 * @param {Record<string, unknown>} frontmatter
 * @param {Record<string, unknown>} schema
 * @returns {string[]}
 */
export function validatePortableFrontmatter(frontmatter, schema) {
  const errors = [];
  for (const field of FORBIDDEN_PORTABLE_FIELDS) {
    if (Object.hasOwn(frontmatter, field)) {
      errors.push(`portable frontmatter must not include ${field}`);
    }
  }
  if (frontmatter.__parse_error) {
    errors.push(String(frontmatter.__parse_error));
    return errors;
  }
  const portable = { ...frontmatter };
  delete portable.__parse_error;
  errors.push(...validateAgainstSchema(portable, schema, 'frontmatter'));
  return errors;
}

/**
 * Packaged skills must live at skills/<name>/SKILL.md and the name must match.
 * @param {string} packageRoot
 * @param {string} [skillName]
 * @returns {string[]}
 */
export function validatePackagedSkillLayout(packageRoot, skillName = 'authentext') {
  const skillPath = path.join(packageRoot, 'skills', skillName, 'SKILL.md');
  if (!fs.existsSync(skillPath)) {
    return [`packaged skill must exist at skills/${skillName}/SKILL.md`];
  }
  const yaml = extractFrontmatterSource(fs.readFileSync(skillPath, 'utf8'));
  if (!yaml) return [`skills/${skillName}/SKILL.md is missing YAML frontmatter`];
  const frontmatter = parsePortableFrontmatter(yaml);
  if (frontmatter.name !== skillName) {
    return [`skills/${skillName}/SKILL.md name must be ${skillName}`];
  }
  return [];
}

/**
 * @param {string} root
 * @returns {string[]}
 */
export function collectContractErrors(root) {
  const errors = [];
  for (const filename of SCHEMA_FILES) {
    try {
      const schema = loadContractJson(root, filename);
      if (!schema || typeof schema !== 'object') {
        errors.push(`${filename} must be a JSON object`);
      }
    } catch (error) {
      errors.push(`${filename} is not parseable JSON: ${error.message}`);
    }
  }
  if (errors.length > 0) return errors;

  const patternSchema = /** @type {Record<string, unknown>} */ (
    loadContractJson(root, PATTERN_SCHEMA)
  );
  const spanSchema = /** @type {Record<string, unknown>} */ (
    loadContractJson(root, PROTECTED_SPAN_SCHEMA)
  );
  const fixtureSchema = /** @type {Record<string, unknown>} */ (
    loadContractJson(root, EVALUATION_FIXTURE_SCHEMA)
  );
  const portableSchema = /** @type {Record<string, unknown>} */ (
    loadContractJson(root, AGENT_SKILLS_PORTABLE_SCHEMA)
  );

  const catalog = loadContractJson(root, PROTECTED_SPAN_CATALOG);
  errors.push(...validateAgainstSchema(catalog, spanSchema, 'protected-span-classes'));

  const fixtures = [
    ['test/fixtures/trigger-evaluations.json', 'trigger-evaluations'],
    ['test/fixtures/output-evaluations.json', 'output-evaluations'],
    ['test/fixtures/adaptive-document-evaluations.json', 'adaptive-document-evaluations'],
  ];
  for (const [relativePath, label] of fixtures) {
    const fixturePath = path.join(root, relativePath);
    if (!fs.existsSync(fixturePath)) {
      errors.push(`missing evaluation fixture: ${relativePath}`);
      continue;
    }
    const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
    errors.push(...validateAgainstSchema(fixture, fixtureSchema, label));
  }

  const skillPath = path.join(root, 'SKILL.md');
  if (!fs.existsSync(skillPath)) {
    errors.push('SKILL.md is missing');
  } else {
    const yaml = extractFrontmatterSource(fs.readFileSync(skillPath, 'utf8'));
    if (!yaml) {
      errors.push('SKILL.md is missing YAML frontmatter');
    } else {
      errors.push(...validatePortableFrontmatter(parsePortableFrontmatter(yaml), portableSchema));
    }
  }

  const registryPath = path.join(root, CONTRACT_DIR, PATTERNS_REGISTRY);
  if (!fs.existsSync(registryPath)) {
    errors.push(`missing pattern registry: ${CONTRACT_DIR}/${PATTERNS_REGISTRY}`);
  } else {
    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    const registrySchema = /** @type {Record<string, unknown>} */ (
      loadContractJson(root, PATTERNS_REGISTRY_SCHEMA)
    );
    errors.push(...validateAgainstSchema(registry, registrySchema, 'patterns-registry'));
    const records = Array.isArray(registry) ? registry : registry.patterns;
    errors.push(...validatePatternRecords(records, patternSchema));

    const modulePath = path.join(root, CORE_PATTERNS_MODULE);
    if (fs.existsSync(modulePath)) {
      errors.push(
        ...validatePatternRegistryConcordance(registry, fs.readFileSync(modulePath, 'utf8'))
      );
    }
  }

  return errors;
}

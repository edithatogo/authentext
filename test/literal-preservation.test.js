import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { isolateProse } = require('../skills/authentext-next/lib/prose-isolator.js');
const { FIX_REGISTRY } = require('../skills/authentext-next/lib/fix-registry.js');

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = JSON.parse(
  fs.readFileSync(path.join(TEST_DIR, 'fixtures', 'literal-preservation.json'), 'utf8')
);
const SAFE_FIXES = FIX_REGISTRY.filter((fix) => fix.risk === 'safe');

/**
 * @param {string} text
 * @returns {string}
 */
function applySafeFixes(text) {
  return SAFE_FIXES.reduce((current, fix) => fix.apply(current), text);
}

/**
 * @param {string} text
 * @param {string} literal
 * @returns {number}
 */
function countOccurrences(text, literal) {
  return text.split(literal).length - 1;
}

test('literal-preservation fixtures survive safe rewrites byte-for-byte', async (t) => {
  for (const fixture of FIXTURES) {
    await t.test(fixture.name, () => {
      const { prose, restore } = isolateProse(fixture.input);
      const result = restore(applySafeFixes(prose));

      for (const literal of fixture.literals) {
        assert.equal(
          countOccurrences(result, literal),
          1,
          `Expected exactly one unchanged occurrence of ${JSON.stringify(literal)}`
        );
      }
    });
  }
});

test('literal-preservation property holds across generated mixed inputs', () => {
  let state = 0x5eed1234;
  const next = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state;
  };

  const literalFactories = [
    (id) => `\`client-facing-${id}\``,
    (id) => `https://example.com/data-driven/${id}?mode=client-facing`,
    (id) => `C:\\client-facing\\fixture-${id}.json`,
    (id) => `/srv/data-driven/fixture-${id}.yaml`,
    (id) => `parseFrontmatter_${id}()`,
    (id) => `[@source${id}, p. ${id}]`,
    (id) => `${id.toString(16).padStart(8, 'a')}99ba10e1`,
    (id) => `authentext --dry-run --fixture=${id}`,
    (id) => `'FixtureError${id}: client-facing mode denied'`,
    (id) => `{"fixture":${id},"mode":"data-driven"}`,
  ];

  for (let iteration = 0; iteration < 100; iteration += 1) {
    const id = next() % 10000;
    const literal = literalFactories[next() % literalFactories.length](id);
    const input = `A synergy-heavy, client-facing sentence before ${literal} and after it.`;
    const { prose, restore } = isolateProse(input);
    const result = restore(applySafeFixes(prose));

    assert.equal(
      countOccurrences(result, literal),
      1,
      `Iteration ${iteration} changed ${JSON.stringify(literal)}`
    );
  }
});

test('restoration fails closed when a rewrite corrupts a placeholder', () => {
  const { prose, restore } = isolateProse('Keep `critical_identifier` unchanged.');
  const withoutPlaceholder = prose.replace(/\uE000\d+\uE001/u, '');
  const duplicatedPlaceholder = prose.replace(
    /(\uE000\d+\uE001)/u,
    (_match, placeholder) => `${placeholder}${placeholder}`
  );

  assert.throws(() => restore(withoutPlaceholder), /placeholder integrity failure/);
  assert.throws(() => restore(duplicatedPlaceholder), /placeholder integrity failure/);
});

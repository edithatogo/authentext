import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const AUTHENTEXT_CODES = new Set(['in-skill', 'integrated', 'planned', 'out-of-scope', 'refused']);
const COMPETITOR_CODES = new Set(['present', 'absent', 'unverified', 'n/a']);
const REQUIRED_TOOLS = [
  'authentext',
  'blader-humanizer',
  'aboudjem-humanizer-skill',
  'matt-payne-content-humanizer',
  'width-ai-skill',
  'softaworks-agent-toolkit-humanizer',
];
const REQUIRED_REFUSALS = ['detector-evasion', 'typo-injection', 'anecdote-fabrication'];

function readUtf8(relativePath) {
  return fs.readFileSync(relativePath, 'utf8');
}

const matrix = JSON.parse(readUtf8('docs/humanizer-feature-matrix.json'));
const markdown = readUtf8('docs/humanizer-feature-matrix.md');

test('feature matrix JSON uses explicit UTF-8 and a stable schema', () => {
  assert.equal(matrix.schema_version, 1);
  assert.equal(matrix.issue, 280);
  assert.match(matrix.thesis, /directly or by handoff/);
  assert.ok(matrix.coverage_codes.refused);
  assert.ok(matrix.coverage_codes['out-of-scope']);
});

test('feature matrix names every required competitor and the DAMAGE set', () => {
  const ids = new Set(matrix.tools.map((tool) => tool.id));
  for (const id of REQUIRED_TOOLS) {
    assert.ok(ids.has(id), `missing tool ${id}`);
  }
  assert.equal(matrix.damage_tools.length, 19);
  assert.ok(matrix.damage_tools.every((tool) => tool.authentext_coverage === 'refused'));
  assert.ok(matrix.damage_tools.every((tool) => tool.verification === 'named-in-damage'));
});

test('Authentext coverage codes stay in the honest set', () => {
  for (const capability of matrix.capabilities) {
    assert.ok(
      AUTHENTEXT_CODES.has(capability.authentext),
      `${capability.id} has illegal Authentext code ${capability.authentext}`
    );
    for (const [toolId, code] of Object.entries(capability.competitors)) {
      assert.ok(
        COMPETITOR_CODES.has(code),
        `${capability.id}.${toolId} has illegal competitor code ${code}`
      );
    }
  }
});

test('refused capabilities include detector evasion, typos, and anecdote fabrication', () => {
  const refused = new Set(
    matrix.capabilities.filter((item) => item.authentext === 'refused').map((item) => item.id)
  );
  for (const id of REQUIRED_REFUSALS) {
    assert.ok(refused.has(id), `missing refusal ${id}`);
  }
  assert.equal(
    matrix.capabilities.find((item) => item.id === 'numeric-ai-smell-score')?.authentext,
    'refused'
  );
  assert.equal(
    matrix.capabilities.find((item) => item.id === 'citation-verification')?.authentext,
    'integrated'
  );
  assert.equal(
    matrix.capabilities.find((item) => item.id === 'marketing-seo-mode')?.authentext,
    'out-of-scope'
  );
});

test('markdown companion exists and does not claim unverified DAMAGE product behaviour', () => {
  assert.match(markdown, /Humanizer feature matrix/);
  assert.match(markdown, /directly or by handoff/);
  assert.match(markdown, /named in DAMAGE/);
  assert.doesNotMatch(markdown, /we tested all 19 products/i);
  assert.doesNotMatch(markdown, /\u2014/);
});

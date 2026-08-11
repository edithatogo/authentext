import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const academic = fs.readFileSync('src/modules/SKILL_ACADEMIC.md', 'utf8');
const academicRef = fs.existsSync('references/academic.md')
  ? fs.readFileSync('references/academic.md', 'utf8')
  : '';
const skill = fs.readFileSync('SKILL.md', 'utf8');
const product = fs.readFileSync('conductor/product.md', 'utf8');
const compiler = fs.readFileSync('scripts/compile-skill.js', 'utf8');

const TORTURED_SEEDS = [
  /vegetative electron microscop/i,
  /bosom peril/i,
  /kidney disappointment/i,
  /fake neural organizations/i,
  /lactose bigotry/i,
];

test('product and compiled skill refuse detector evasion', () => {
  assert.match(product, /editorial\s+defect repair with verified diffs/i);
  assert.match(product, /not detector evasion/i);
  assert.match(product, /Optimising against detector scores/i);
  assert.match(product, /claiming undetectability/i);
  assert.match(compiler, /STANDARD_DESCRIPTION/);
  assert.match(compiler, /verified diffs/);
  assert.match(compiler, /detector scores|undetectability/);
  assert.match(skill, /^description: "/m);
  assert.match(skill, /verified diffs/);
  assert.match(skill, /detector scores|undetectability/);
  const description = skill.match(/^description: "([\s\S]*?)"$/m)?.[1] ?? '';
  assert.ok(description.length > 0, 'compiled skill description missing');
  assert.ok(description.length <= 1024, `description is ${description.length} chars`);
});

test('academic module branches disclosure by publisher', () => {
  for (const source of [academic, academicRef]) {
    assert.match(source, /Elsevier/);
    assert.match(source, /Springer Nature/);
    assert.match(source, /Wiley/);
    assert.match(source, /ICMJE/);
    assert.match(source, /substantive changes to sentence structure or organization/i);
    assert.match(source, /AI assisted copy editing|AI-assisted copy editing/i);
    assert.match(source, /spelling, grammar, and general editing/i);
    assert.match(source, /cover letter/i);
    assert.match(source, /2026-08/);
  }
});

test('academic module treats interface artefacts as hard errors', () => {
  for (const source of [academic, academicRef]) {
    assert.match(source, /hard error/i);
    assert.match(source, /regenerate response/i);
    assert.match(source, /as an AI language model/i);
    assert.match(source, /as of my last knowledge update/i);
  }
});

test('academic module ships a tortured-phrase lexicon at the PPS threshold', () => {
  for (const source of [academic, academicRef]) {
    assert.match(source, /tortured/i);
    assert.match(source, /5 or more|threshold of 5/i);
    assert.match(source, /Problematic Paper Screener/i);
    for (const seed of TORTURED_SEEDS) {
      assert.match(source, seed);
    }
  }
  assert.ok(TORTURED_SEEDS.length >= 5);
});

test('academic module keeps reference lists out of scope', () => {
  for (const source of [academic, academicRef]) {
    assert.match(source, /out of scope/i);
    assert.match(source, /Do not generate, complete, reformat/i);
    assert.doesNotMatch(source, /Verify every citation against real databases/);
  }
  assert.doesNotMatch(
    academic,
    /Smith et al\. \(2023\) found that climate change reduced local biodiversity/
  );
});

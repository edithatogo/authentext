import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const CORE_REFERENCE_PATH = 'references/core-patterns.md';
const SKILL_PRO_PATH = 'SKILL_PROFESSIONAL.md';

test('references/core-patterns.md integrity', async (t) => {
  assert.ok(fs.existsSync(CORE_REFERENCE_PATH), 'references/core-patterns.md should exist');
  const content = fs.readFileSync(CORE_REFERENCE_PATH, 'utf8');

  await t.test('contains general patterns 1 through 24', () => {
    for (let i = 1; i <= 24; i++) {
      const patternHeading = new RegExp(`### Pattern ${i}:`, 'm');
      assert.ok(
        patternHeading.test(content),
        `Pattern #${i} heading missing in core-patterns reference`
      );
    }
  });

  await t.test('contains upstream style patterns 35 through 39', () => {
    for (let i = 35; i <= 39; i++) {
      const patternHeading = new RegExp(`### Pattern ${i}:`, 'm');
      assert.ok(
        patternHeading.test(content),
        `Pattern #${i} heading missing in core-patterns reference`
      );
    }
  });

  await t.test('does not contain placeholders', () => {
    assert.ok(!content.includes('<<<<['), 'Found unreplaced template placeholders');
  });
});

test('Professional SKILL_PROFESSIONAL.md integrity', async (t) => {
  assert.ok(fs.existsSync(SKILL_PRO_PATH), 'SKILL_PROFESSIONAL.md should exist');
  const content = fs.readFileSync(SKILL_PRO_PATH, 'utf8');

  await t.test('contains Router Logic', () => {
    assert.ok(content.includes('Humanizer Pro'), 'Pro header identity missing');
    assert.ok(content.includes('ROUTING LOGIC'), 'Routing logic missing');
  });

  await t.test('includes reference module links', () => {
    assert.ok(content.includes('references/core-patterns.md'), 'Link to core reference missing');
    assert.ok(content.includes('references/technical.md'), 'Link to technical reference missing');
    assert.ok(content.includes('references/academic.md'), 'Link to academic reference missing');
    assert.ok(content.includes('references/governance.md'), 'Link to governance reference missing');
    assert.ok(
      content.includes('references/reasoning-failures.md'),
      'Link to reasoning reference missing'
    );
  });
});

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

  await t.test('contains upstream style patterns 35 through 40', () => {
    for (let i = 35; i <= 40; i++) {
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

test('Professional routing reference integrity', async (t) => {
  assert.ok(fs.existsSync(SKILL_PRO_PATH), 'SKILL_PROFESSIONAL.md should exist');
  const content = fs.readFileSync(SKILL_PRO_PATH, 'utf8');

  await t.test('contains Router Logic', () => {
    assert.ok(
      content.includes('Authentext Professional Routing Reference'),
      'Professional reference identity missing'
    );
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

test('long generated references provide deterministic navigation', () => {
  for (const filename of ['core-patterns.md', 'technical.md', 'academic.md', 'governance.md']) {
    const content = fs.readFileSync(`references/${filename}`, 'utf8');
    const navigation = content.match(/## Navigation\n\n([\s\S]*?)\n\n## /);

    assert.ok(navigation, `${filename} should include navigation before its first section`);
    const sectionHeadings = [...content.matchAll(/^## (?!Navigation$)(.+)$/gm)].map(
      ([, heading]) => heading
    );
    for (const heading of sectionHeadings) {
      const anchor = heading
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      assert.match(
        navigation[1],
        new RegExp(
          `^- \\[${heading.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\]\\(#${anchor}\\)$`,
          'm'
        ),
        `${filename} should link section ${heading}`
      );
    }
  }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { createFoioEditorialReceipt } from '../scripts/lib/foio-editorial.js';

const base = {
  prompt: 'Review scientific prose without weakening its meaning.',
  authentextVersion: '3.2.0',
  tool: { name: 'regression-test', version: '1' },
};
const fixtures = [
  ['citation range', 'Evidence supports this [11–13].', 'Evidence supports this [11,13].'],
  ['confidence interval', 'The 95% CI was 0.8–1.2.', 'The 95% CI was 0.8,1.2.'],
  ['date range', 'Samples covered 2017–2023.', 'Samples covered 2017,2023.'],
  ['named month range', 'Samples covered May–October 2023.', 'Samples covered May,October 2023.'],
  ['stereochemical name', "Measure trans-3'-hydroxycotinine.", "Measure trans 3' hydroxycotinine."],
  ['ISO date', 'Samples arrived 2026-10-19.', 'Samples arrived 2026,10,19.'],
  ['minus sign', 'The change was −2.5%.', 'The change was 2.5%.'],
  [
    'chemical nomenclature',
    'Measure N-nitrosonornicotine and 1,3-butadiene.',
    'Measure N nitrosonornicotine and 1,3 butadiene.',
  ],
  [
    'qualifiers',
    'This may suggest exposure; it is associated with use but cannot exclude confounding.',
    'This proves exposure and use.',
  ],
];
for (const [name, input, mutation] of fixtures) {
  test(`receipt preserves ${name} through a surrounding prose edit`, () => {
    const receipt = createFoioEditorialReceipt({
      ...base,
      input: `In summary, ${input}`,
      output: input,
    });
    assert.equal(receipt.protected_items.passed, true);
  });
  test(`receipt detects ${name} mutation`, () => {
    const receipt = createFoioEditorialReceipt({ ...base, input, output: mutation });
    assert.equal(receipt.protected_items.passed, false);
    assert.ok(receipt.protected_items.differences.length);
  });
}

import test from 'node:test';
import assert from 'node:assert/strict';
import { createFoioEditorialReceipt } from '../scripts/lib/foio-editorial.js';

const base = {
  prompt: 'Make the final prose less formulaic without changing meaning.',
  authentextVersion: '3.2.0',
  tool: { name: 'test-editor', version: '1.0.0' },
};

test('FOI-O receipt passes a style-only edit and retains human gates', () => {
  const receipt = createFoioEditorialReceipt({
    ...base,
    input: 'The reported estimate may be 14.2% (Smith, 2024), subject to section 8.',
    output: 'The reported estimate may be 14.2% (Smith, 2024), subject to section 8.',
  });

  assert.equal(receipt.protected_items.passed, true);
  assert.equal(receipt.human_gate.editorial_acceptance, 'pending');
  assert.equal(receipt.human_gate.publication_approval, 'pending');
  assert.match(receipt.prompt_sha256, /^[a-f0-9]{64}$/);
  assert.equal(JSON.stringify(receipt).includes(base.prompt), false);
});

test('FOI-O receipt blocks numerical, citation, qualifier, and legal-boundary drift', () => {
  const receipt = createFoioEditorialReceipt({
    ...base,
    input:
      'The result may be 14.2% (Smith, 2024). The appendix is confidential and not for publication.',
    output: 'The result is 16.2% (Jones, 2025). The appendix is available.',
  });

  assert.equal(receipt.protected_items.passed, false);
  assert.deepEqual(
    receipt.protected_items.differences.map(({ type }) => type),
    ['citation', 'number', 'qualifier', 'legal_boundary']
  );
  assert.equal(JSON.stringify(receipt).includes('Smith'), false);
  assert.equal(JSON.stringify(receipt).includes('confidential'), false);
  assert.match(receipt.protected_items.differences[0].before_sha256, /^[a-f0-9]{64}$/);
});

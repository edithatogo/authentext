import test from 'node:test';
import assert from 'node:assert/strict';
import { applyReconciliation, reconcileMapping } from '../scripts/lib/conductor-reconciliation.js';

const mapping = {
  verification: {},
  tracks: [
    {
      track_id: 'track',
      parent_issue: { number: 1, url: 'https://example.test/1', state: 'open' },
      phases: [{ issue: { number: 2, url: 'https://example.test/2', state: 'open' } }],
    },
  ],
};
const snapshots = {
  issues: [
    { number: 1, state: 'OPEN' },
    { number: 2, state: 'CLOSED' },
  ],
  projectItems: [
    { content: { url: 'https://example.test/1' } },
    { content: { url: 'https://example.test/2' } },
  ],
};

test('reconciliation is deterministic and reports hosted state drift', () => {
  const report = reconcileMapping(structuredClone(mapping), snapshots);
  assert.deepEqual(report, {
    mappedNodes: 2,
    missingIssues: [],
    missingProjectItems: [],
    stateUpdates: [{ number: 2, from: 'open', to: 'closed' }],
    clean: true,
  });
});

test('applying the same reconciliation twice is idempotent apart from receipt time', () => {
  const report = reconcileMapping(structuredClone(mapping), snapshots);
  const first = applyReconciliation(structuredClone(mapping), report, '2026-08-01T00:00:00.000Z');
  const secondReport = reconcileMapping(first, snapshots);
  const second = applyReconciliation(first, secondReport, '2026-08-01T00:00:00.000Z');
  assert.deepEqual(secondReport.stateUpdates, []);
  assert.deepEqual(second, first);
});

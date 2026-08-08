import assert from 'node:assert/strict';
import test from 'node:test';

import { createGuidanceDriftReceipt, reviewGuidanceDrift } from '../scripts/lib/guidance-drift.js';

const sources = [
  {
    id: 'current-source',
    freshness: { expires_at: '2026-12-31' },
    drift: { state: 'unchanged', current_hash: `sha256:${'a'.repeat(64)}` },
  },
  {
    id: 'changed-source',
    freshness: { expires_at: '2026-12-31' },
    drift: { state: 'changed', current_hash: `sha256:${'b'.repeat(64)}` },
  },
  {
    id: 'expired-source',
    freshness: { expires_at: '2026-01-01' },
    drift: { state: 'unchanged', current_hash: `sha256:${'c'.repeat(64)}` },
  },
];

test('drift receipt is metadata-only, deterministic, and never publishes', () => {
  const receipt = createGuidanceDriftReceipt(sources, '2026-08-08');
  assert.equal(receipt.schema_version, 1);
  assert.deepEqual(receipt.summary, { current: 1, review_required: 2 });
  assert.deepEqual(receipt.controls, {
    publishing_allowed: false,
    automatic_guidance_update: false,
    human_review_required: true,
  });
  assert.deepEqual(
    receipt.sources.map((source) => [source.id, source.state, source.reason]),
    [
      ['changed-source', 'review-required', 'source-drift-detected'],
      ['current-source', 'current', 'within-freshness-window'],
      ['expired-source', 'review-required', 'freshness-window-expired'],
    ]
  );
  assert.equal(JSON.stringify(receipt).includes('content'), false);
});

test('review workflow requires every changed or stale source to be decided', () => {
  const receipt = createGuidanceDriftReceipt(sources, '2026-08-08');
  assert.throws(
    () =>
      reviewGuidanceDrift(receipt, [
        {
          source_id: 'changed-source',
          decision: 'accept',
          rationale: 'Reviewed upstream change.',
        },
      ]),
    /Missing review decisions/u
  );
});

test('review decisions remain advisory and cannot publish or silently activate guidance', () => {
  const receipt = createGuidanceDriftReceipt(sources, '2026-08-08');
  const review = reviewGuidanceDrift(receipt, [
    { source_id: 'changed-source', decision: 'accept', rationale: 'Reviewed upstream change.' },
    { source_id: 'expired-source', decision: 'defer', rationale: 'Await refreshed metadata.' },
  ]);
  assert.equal(review.status, 'reviewed');
  assert.equal(review.publishing_allowed, false);
  assert.equal(review.guidance_activation_allowed, false);
  assert.equal(review.decisions.length, 2);
  assert.throws(
    () =>
      reviewGuidanceDrift(receipt, [
        { source_id: 'changed-source', decision: 'publish', rationale: 'Ship it.' },
        { source_id: 'expired-source', decision: 'defer', rationale: 'Later.' },
      ]),
    /Unsupported review decision/u
  );
});

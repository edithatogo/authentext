import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createGuidanceSourceRecord,
  evaluateSourceFreshness,
} from '../scripts/lib/guidance-source-record.js';

const BASE_SOURCE = {
  id: 'govuk-content-design',
  title: 'Content design guidance',
  publisher: 'Government Digital Service',
  url: 'https://www.gov.uk/guidance/content-design',
  retrieved_at: '2026-08-03',
  source_class: 'government',
  authority: 'general',
  scope: 'public web content',
  license: 'Open Government Licence v3.0',
  supported_checks: ['user-need', 'plain-language'],
  max_age_days: 180,
  content_hash: 'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
};

test('creates a complete metadata-only governed source record', () => {
  const record = createGuidanceSourceRecord(BASE_SOURCE);
  assert.equal(record.schema_version, 1);
  assert.deepEqual(record.supported_checks, ['plain-language', 'user-need']);
  assert.deepEqual(record.freshness, {
    max_age_days: 180,
    expires_at: '2027-01-30',
  });
  assert.deepEqual(record.drift, {
    state: 'unknown',
    checked_at: null,
    previous_hash: null,
    current_hash: BASE_SOURCE.content_hash,
  });
  assert.equal(Object.hasOwn(record, 'content'), false);
});

test('source records require governed authority, scope, licence decision, and checks', () => {
  for (const override of [
    { authority: 'popular' },
    { scope: '' },
    { license: undefined },
    { supported_checks: [] },
    { max_age_days: 0 },
    { content_hash: 'not-a-hash' },
  ]) {
    assert.throws(() => createGuidanceSourceRecord({ ...BASE_SOURCE, ...override }));
  }
});

test('freshness evaluation is deterministic and reports invalidation', () => {
  const record = createGuidanceSourceRecord(BASE_SOURCE);
  assert.deepEqual(evaluateSourceFreshness(record, '2027-01-29'), {
    status: 'current',
    invalidated: false,
    reason: 'within-freshness-window',
  });
  assert.deepEqual(evaluateSourceFreshness(record, '2027-01-31'), {
    status: 'stale',
    invalidated: true,
    reason: 'freshness-window-expired',
  });
});

test('drift comparison records hashes without storing source payloads', () => {
  const record = createGuidanceSourceRecord({
    ...BASE_SOURCE,
    previous_hash: BASE_SOURCE.content_hash,
    checked_at: '2026-08-03',
  });
  assert.equal(record.drift.state, 'unchanged');

  const changed = createGuidanceSourceRecord({
    ...BASE_SOURCE,
    previous_hash: BASE_SOURCE.content_hash,
    content_hash: 'sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    checked_at: '2026-08-03',
  });
  assert.equal(changed.drift.state, 'changed');
});

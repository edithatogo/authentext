import { evaluateSourceFreshness } from './guidance-source-record.js';

const REVIEW_DECISIONS = new Set(['accept', 'defer', 'reject']);

function requireText(value, field) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new TypeError(`${field} must be non-empty text`);
  }
  return value.trim();
}

/** Create a deterministic, metadata-only receipt for guidance review. */
export function createGuidanceDriftReceipt(records, asOf) {
  if (!Array.isArray(records)) throw new TypeError('records must be an array');
  const ids = new Set();
  const sources = records.map((record) => {
    const id = requireText(record?.id, 'source id');
    if (ids.has(id)) throw new TypeError(`Duplicate source id: ${id}`);
    ids.add(id);
    const freshness = evaluateSourceFreshness(record, asOf);
    return {
      id,
      state: freshness.invalidated ? 'review-required' : 'current',
      reason: freshness.reason,
      expires_at: record.freshness.expires_at,
      drift_state: record.drift.state,
      current_hash: requireText(record.drift.current_hash, 'current hash'),
    };
  });
  sources.sort((left, right) => left.id.localeCompare(right.id));
  const reviewRequired = sources.filter((source) => source.state === 'review-required').length;
  return {
    schema_version: 1,
    assessed_at: asOf,
    controls: {
      publishing_allowed: false,
      automatic_guidance_update: false,
      human_review_required: reviewRequired > 0,
    },
    summary: { current: sources.length - reviewRequired, review_required: reviewRequired },
    sources,
  };
}

/** Record review decisions without granting publication or activation authority. */
export function reviewGuidanceDrift(receipt, decisions) {
  if (!Array.isArray(decisions)) throw new TypeError('decisions must be an array');
  const required = receipt?.sources
    ?.filter((source) => source.state === 'review-required')
    .map((source) => source.id);
  if (!Array.isArray(required)) throw new TypeError('receipt must contain source assessments');

  const bySource = new Map();
  for (const decision of decisions) {
    const sourceId = requireText(decision?.source_id, 'source_id');
    if (bySource.has(sourceId)) throw new TypeError(`Duplicate review decision: ${sourceId}`);
    if (!REVIEW_DECISIONS.has(decision?.decision)) {
      throw new TypeError(`Unsupported review decision: ${decision?.decision}`);
    }
    bySource.set(sourceId, {
      source_id: sourceId,
      decision: decision.decision,
      rationale: requireText(decision.rationale, 'rationale'),
    });
  }
  const missing = required.filter((sourceId) => !bySource.has(sourceId));
  if (missing.length > 0) throw new TypeError(`Missing review decisions: ${missing.join(', ')}`);
  const unexpected = [...bySource.keys()].filter((sourceId) => !required.includes(sourceId));
  if (unexpected.length > 0) {
    throw new TypeError(`Unexpected review decisions: ${unexpected.join(', ')}`);
  }

  return {
    schema_version: 1,
    status: 'reviewed',
    assessed_at: receipt.assessed_at,
    publishing_allowed: false,
    guidance_activation_allowed: false,
    decisions: [...bySource.values()].sort((left, right) =>
      left.source_id.localeCompare(right.source_id)
    ),
  };
}

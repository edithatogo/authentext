import { GUIDANCE_PRECEDENCE } from './document-intelligence.js';
import { isApprovedSourceClass } from './research-governance.js';

const HASH_PATTERN = /^sha256:[a-f0-9]{64}$/u;
const ID_PATTERN = /^[a-z0-9][a-z0-9._-]+$/u;

function requireText(value, field) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new TypeError(`${field} must be non-empty text`);
  }
  return value.trim();
}

function parseIsoDate(value, field) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/u.test(value)) {
    throw new TypeError(`${field} must be an ISO date`);
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new TypeError(`${field} must be a valid ISO date`);
  }
  return parsed;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}

/** Create a closed, metadata-only guidance source record. */
export function createGuidanceSourceRecord(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new TypeError('source input must be an object');
  }
  const id = requireText(input.id, 'id');
  if (!ID_PATTERN.test(id)) throw new TypeError('id must use the governed identifier format');
  if (!isApprovedSourceClass(input.source_class)) {
    throw new TypeError('source_class must be approved');
  }
  if (!GUIDANCE_PRECEDENCE.includes(input.authority)) {
    throw new TypeError('authority must use the guidance hierarchy');
  }
  if (!Object.hasOwn(input, 'license')) throw new TypeError('license decision is required');
  if (
    input.license !== null &&
    (typeof input.license !== 'string' || input.license.trim() === '')
  ) {
    throw new TypeError('license must be non-empty text or null');
  }
  if (!Array.isArray(input.supported_checks) || input.supported_checks.length === 0) {
    throw new TypeError('supported_checks must be non-empty');
  }
  const supportedChecks = [
    ...new Set(input.supported_checks.map((check) => requireText(check, 'check'))),
  ];
  if (!Number.isInteger(input.max_age_days) || input.max_age_days < 1) {
    throw new TypeError('max_age_days must be a positive integer');
  }
  if (!HASH_PATTERN.test(input.content_hash)) throw new TypeError('content_hash must be SHA-256');
  const hasPreviousHash = input.previous_hash !== null && input.previous_hash !== undefined;
  const hasCheckedAt = input.checked_at !== null && input.checked_at !== undefined;
  if (hasPreviousHash && !HASH_PATTERN.test(input.previous_hash)) {
    throw new TypeError('previous_hash must be SHA-256 or null');
  }
  if (hasPreviousHash !== hasCheckedAt) {
    throw new TypeError('previous_hash and checked_at must be supplied together');
  }

  const retrievedAt = parseIsoDate(input.retrieved_at, 'retrieved_at');
  if (hasCheckedAt) parseIsoDate(input.checked_at, 'checked_at');
  const url = new URL(input.url);
  if (url.protocol !== 'https:' || url.username || url.password) {
    throw new TypeError('url must be a public HTTPS URL');
  }
  const driftState = !hasPreviousHash
    ? 'unknown'
    : input.previous_hash === input.content_hash
      ? 'unchanged'
      : 'changed';

  return {
    schema_version: 1,
    id,
    title: requireText(input.title, 'title'),
    publisher: requireText(input.publisher, 'publisher'),
    url: url.href,
    retrieved_at: input.retrieved_at,
    source_class: input.source_class,
    authority: input.authority,
    scope: requireText(input.scope, 'scope'),
    license: typeof input.license === 'string' ? input.license.trim() : null,
    status: 'current',
    supported_checks: supportedChecks.sort(),
    freshness: {
      max_age_days: input.max_age_days,
      expires_at: addDays(retrievedAt, input.max_age_days),
    },
    drift: {
      state: driftState,
      checked_at: input.checked_at ?? null,
      previous_hash: input.previous_hash ?? null,
      current_hash: input.content_hash,
    },
  };
}

/** Evaluate a source cache record against an explicit date. */
export function evaluateSourceFreshness(record, asOf) {
  const currentDate = parseIsoDate(asOf, 'asOf').toISOString().slice(0, 10);
  const expiresAt = parseIsoDate(record?.freshness?.expires_at, 'expires_at')
    .toISOString()
    .slice(0, 10);
  const invalidated = currentDate > expiresAt || record?.drift?.state === 'changed';
  return invalidated
    ? {
        status: 'stale',
        invalidated: true,
        reason:
          record?.drift?.state === 'changed' ? 'source-drift-detected' : 'freshness-window-expired',
      }
    : { status: 'current', invalidated: false, reason: 'within-freshness-window' };
}

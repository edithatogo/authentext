export const GOVERNED_STATUSES = new Set([
  'researched',
  'prepared',
  'submitted',
  'accepted',
  'listed',
  'verified',
  'rejected',
  'deferred',
  'unsupported',
  'not_justified',
]);

export const REQUIRED_CHANNEL_IDS = new Set([
  'skills-sh',
  'voltagent-awesome-agent-skills',
  'claude-plugin-marketplace',
  'codex-plugin',
  'chatgpt-plugin',
  'github-copilot-skill',
  'gemini-cli-extension',
  'opencode-skill',
]);

const ALLOWED_SOURCE_MODES = new Set(['canonical', 'generated_from_canonical']);
const RECEIPT_STATUSES = new Set(['submitted', 'accepted', 'listed', 'verified']);
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim() !== '';
}

export function validateRegistryDistribution(matrix) {
  const errors = [];
  if (matrix?.schema_version !== 1) errors.push('schema_version must equal 1');
  if (!ISO_DATE.test(matrix?.as_of ?? '')) errors.push('as_of must be an ISO date');

  const canonical = matrix?.canonical_source;
  if (!nonEmptyString(canonical?.repository)) {
    errors.push('canonical_source.repository must be a non-empty string');
  }
  if (!Array.isArray(canonical?.paths) || canonical.paths.length === 0) {
    errors.push('canonical_source.paths must contain canonical skill paths');
  }
  if (canonical?.generated_artifacts_committed !== false) {
    errors.push('canonical_source.generated_artifacts_committed must be false');
  }

  if (!Array.isArray(matrix?.channels)) {
    return [...errors, 'channels must be an array'];
  }

  const seen = new Set();
  for (const [index, channel] of matrix.channels.entries()) {
    const label = nonEmptyString(channel?.id) ? channel.id : `channels[${index}]`;
    if (!nonEmptyString(channel?.id)) errors.push(`${label}.id must be a non-empty string`);
    if (seen.has(channel?.id)) errors.push(`${label}.id must be unique`);
    seen.add(channel?.id);
    if (!nonEmptyString(channel?.host)) errors.push(`${label}.host must be a non-empty string`);
    if (!nonEmptyString(channel?.channel_type)) {
      errors.push(`${label}.channel_type must be a non-empty string`);
    }
    if (
      !Array.isArray(channel?.capabilities) ||
      channel.capabilities.length === 0 ||
      channel.capabilities.some((item) => !nonEmptyString(item))
    ) {
      errors.push(`${label}.capabilities must contain dated, non-empty capability statements`);
    }
    if (!GOVERNED_STATUSES.has(channel?.status)) {
      errors.push(`${label}.status uses unknown governed status ${String(channel?.status)}`);
    }
    if (!ALLOWED_SOURCE_MODES.has(channel?.source?.mode)) {
      errors.push(`${label}.source.mode must be canonical or generated_from_canonical`);
    }
    if (!nonEmptyString(channel?.source?.path)) {
      errors.push(`${label}.source.path must be a non-empty string`);
    }
    if (!ISO_DATE.test(channel?.evidence?.checked_on ?? '')) {
      errors.push(`${label}.evidence.checked_on must be an ISO date`);
    }
    if (!nonEmptyString(channel?.evidence?.spec_url)) {
      errors.push(`${label}.evidence.spec_url must be a non-empty string`);
    }
    if (RECEIPT_STATUSES.has(channel?.status) && !nonEmptyString(channel?.evidence?.receipt_url)) {
      errors.push(`${label}.evidence.receipt_url is required for ${channel.status} status`);
    }
    if (channel?.publication_requires_approval !== true) {
      errors.push(`${label}.publication_requires_approval must be true`);
    }
  }

  for (const id of REQUIRED_CHANNEL_IDS) {
    if (!seen.has(id)) errors.push(`required channel ${id} is missing`);
  }
  return errors;
}

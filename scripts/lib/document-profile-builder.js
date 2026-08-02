import { createHash } from 'node:crypto';
import { validateDocumentProfile } from './document-intelligence.js';

function field(value, explicit, confidence = 0.25) {
  return {
    value,
    confidence: explicit ? 1 : confidence,
    provenance: explicit ? 'user' : 'heuristic',
  };
}

function has(input, key) {
  return Object.hasOwn(input, key) && input[key] !== undefined;
}

function profileId(profile) {
  const canonical = JSON.stringify(profile);
  return `profile-${createHash('sha256').update(canonical).digest('hex').slice(0, 16)}`;
}

/**
 * Build a deterministic, conservative document profile from approved intake
 * metadata. This function does not inspect document content or perform research.
 * @param {Record<string, unknown>} input
 * @returns {Record<string, unknown>}
 */
export function buildDocumentProfile(input = {}) {
  const components = Array.isArray(input.components) ? input.components : [];
  const composite = components.length > 0;
  const archetype = composite ? 'composite' : has(input, 'archetype') ? input.archetype : 'unknown';
  const profile = {
    schema_version: 1,
    operation: field(has(input, 'operation') ? input.operation : 'review', has(input, 'operation')),
    delivery_mode: field(
      has(input, 'delivery_mode') ? input.delivery_mode : 'pasted',
      has(input, 'delivery_mode')
    ),
    archetype: field(archetype, composite || has(input, 'archetype')),
    subtypes: (Array.isArray(input.subtypes) ? input.subtypes : []).map((value) =>
      field(value, true)
    ),
    purpose: field(has(input, 'purpose') ? input.purpose : 'not specified', has(input, 'purpose')),
    audience: field(has(input, 'audience') ? input.audience : [], has(input, 'audience')),
    stakes: field(has(input, 'stakes') ? input.stakes : 'high', has(input, 'stakes')),
    authorities: Array.isArray(input.authorities) ? [...input.authorities] : [],
    lifecycle: field(has(input, 'lifecycle') ? input.lifecycle : 'draft', has(input, 'lifecycle')),
    constraints: Array.isArray(input.constraints) ? [...input.constraints] : [],
    editing_strength: field(
      has(input, 'editing_strength') ? input.editing_strength : 'conservative',
      has(input, 'editing_strength')
    ),
    research_permission: field(
      has(input, 'research_permission') ? input.research_permission : 'not_requested',
      has(input, 'research_permission')
    ),
    composite,
    components: components.map(({ archetype: componentArchetype, subtype }) => ({
      archetype: componentArchetype,
      subtype,
    })),
  };
  profile.profile_id = profileId(profile);

  const errors = validateDocumentProfile(profile);
  if (errors.length > 0) throw new TypeError(`Invalid document profile: ${errors.join('; ')}`);
  return profile;
}

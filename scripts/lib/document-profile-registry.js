import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const REGISTRY_PATH = path.join(ROOT, 'src', 'document-intelligence', 'profile-registry.json');
const FALLBACK_REFERENCE = 'references/core-patterns.md';

function readRegistry() {
  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  if (registry.schema_version !== 1 || !Array.isArray(registry.profiles)) {
    throw new TypeError('Invalid document profile registry');
  }
  return registry;
}

/** @returns {Array<Record<string, unknown>>} */
export function listDocumentProfiles() {
  return readRegistry().profiles.map((profile) => structuredClone(profile));
}

function findProfile(registry, archetype) {
  return registry.profiles.find((profile) => profile.id === archetype);
}

/**
 * Resolve progressive-disclosure references and profile metadata without
 * embedding or copying referenced module content.
 * @param {{archetype?: string, components?: Array<{archetype?: string, subtype?: string}>}} profile
 * @returns {Record<string, unknown>}
 */
export function resolveProfileRoute(profile = {}) {
  const registry = readRegistry();
  const archetypes =
    profile.archetype === 'composite'
      ? (profile.components ?? []).map((component) => component.archetype)
      : [profile.archetype];
  const selected = archetypes.map((archetype) => findProfile(registry, archetype)).filter(Boolean);

  if (selected.length === 0) {
    return {
      status: 'fallback',
      profile_ids: [],
      references: [FALLBACK_REFERENCE],
      checks: [],
      safe_boundaries: [],
      source_resolvers: [],
    };
  }

  const union = (key) => [...new Set(selected.flatMap((entry) => entry[key]))];
  return {
    status: 'resolved',
    profile_ids: selected.map((entry) => entry.id),
    references: union('references'),
    checks: union('checks'),
    safe_boundaries: union('safe_boundaries'),
    source_resolvers: union('source_resolvers'),
  };
}

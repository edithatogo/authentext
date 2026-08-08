import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildMetadataQuery } from './research-governance.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const REGISTRY_PATH = path.join(
  ROOT,
  'src',
  'document-intelligence',
  'source-resolver-registry.json'
);

function readRegistry() {
  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  if (registry.schema_version !== 1 || !Array.isArray(registry.resolvers)) {
    throw new TypeError('Invalid source resolver registry');
  }
  return registry.resolvers;
}

function isSafeProjectRelativePath(value) {
  if (typeof value !== 'string' || value.trim() === '') return false;
  const normalized = value.trim().replace(/\\/gu, '/');
  if (
    /^[A-Za-z]:\//u.test(normalized) ||
    normalized.startsWith('/') ||
    normalized.includes('://')
  ) {
    return false;
  }
  const segments = normalized.split('/');
  return !segments.includes('..') && !segments.includes('') && normalized !== '.';
}

export function listSourceResolvers() {
  return readRegistry()
    .map((resolver) => resolver.id)
    .sort();
}

/** Resolve governed local or metadata-only source requests. */
export function resolveSourceRequests(resolverIds, context = {}) {
  if (!Array.isArray(resolverIds)) throw new TypeError('resolverIds must be an array');
  const registry = new Map(readRegistry().map((resolver) => [resolver.id, resolver]));
  const requests = [];
  const unresolved = [];

  for (const resolverId of [...new Set(resolverIds)]) {
    const resolver = registry.get(resolverId);
    if (!resolver) throw new TypeError(`Unknown resolver: ${resolverId}`);
    const missingFields = resolver.required_fields.filter(
      (field) => typeof context[field] !== 'string' || context[field].trim() === ''
    );
    if (missingFields.length > 0) {
      unresolved.push({
        resolver: resolverId,
        reason:
          resolver.mode === 'project-local'
            ? 'explicit-project-source-required'
            : 'required-metadata-missing',
        missing_fields: missingFields,
      });
      continue;
    }

    if (resolver.mode === 'project-local') {
      if (!isSafeProjectRelativePath(context.project_style_source)) {
        unresolved.push({ resolver: resolverId, reason: 'unsafe-project-source' });
        continue;
      }
      requests.push({
        resolver: resolverId,
        mode: resolver.mode,
        source: context.project_style_source,
        authority: resolver.authority,
        supported_checks: resolver.supported_checks,
      });
      continue;
    }

    const queryInput = {};
    for (const field of [...resolver.required_fields, ...resolver.optional_fields]) {
      if (typeof context[field] === 'string' && context[field].trim() !== '') {
        queryInput[field] = context[field];
      }
    }
    const query = buildMetadataQuery(queryInput);
    if (!query.safe) {
      unresolved.push({ resolver: resolverId, reason: query.reason });
      continue;
    }
    requests.push({
      resolver: resolverId,
      mode: resolver.mode,
      source_class: resolver.source_class,
      authority: resolver.authority,
      supported_checks: resolver.supported_checks,
      metadata: queryInput,
      query: query.query,
    });
  }
  return { requests, unresolved };
}

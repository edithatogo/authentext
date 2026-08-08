import assert from 'node:assert/strict';
import test from 'node:test';

import { listSourceResolvers, resolveSourceRequests } from '../scripts/lib/source-resolver.js';

test('registry covers every governed Phase 3 resolver family', () => {
  assert.deepEqual(listSourceResolvers(), [
    'academic-venue',
    'health-study-type',
    'named-jurisdiction',
    'organisation-template',
    'project-style',
    'public-content-guidance',
    'technical-product-guidance',
  ]);
});

test('project style loads only an explicitly supplied local source', () => {
  const result = resolveSourceRequests(['project-style'], {
    project_style_source: 'docs/style-guide.md',
  });
  assert.deepEqual(result.requests, [
    {
      resolver: 'project-style',
      mode: 'project-local',
      source: 'docs/style-guide.md',
      authority: 'project',
      supported_checks: ['style', 'terminology'],
    },
  ]);
  assert.deepEqual(result.unresolved, []);
});

test('project style never guesses a conventional file path', () => {
  const result = resolveSourceRequests(['project-style'], {});
  assert.deepEqual(result.requests, []);
  assert.equal(result.unresolved[0].reason, 'explicit-project-source-required');
});

test('project style rejects URLs, absolute paths, and parent traversal', () => {
  for (const source of [
    'https://example.org/style.md',
    'C:\\private\\style.md',
    '/private/style.md',
    '../private/style.md',
    'docs/../../private/style.md',
  ]) {
    const result = resolveSourceRequests(['project-style'], { project_style_source: source });
    assert.deepEqual(result.requests, [], source);
    assert.equal(result.unresolved[0].reason, 'unsafe-project-source', source);
  }
});

test('external resolvers emit bounded metadata requests for each governed family', () => {
  const result = resolveSourceRequests(
    [
      'technical-product-guidance',
      'public-content-guidance',
      'academic-venue',
      'health-study-type',
      'named-jurisdiction',
      'organisation-template',
    ],
    {
      document_type: 'technical reference',
      product: 'Example API',
      venue: 'Example Journal',
      study_type: 'systematic review',
      jurisdiction: 'New Zealand',
      organisation: 'Example Agency',
    }
  );
  assert.equal(result.requests.length, 6);
  assert.equal(
    result.requests.every((request) => request.mode === 'metadata-query'),
    true
  );
  assert.equal(JSON.stringify(result).includes('document_content'), false);
  assert.deepEqual(result.unresolved, []);
});

test('named resolvers fail closed when their governing name is absent', () => {
  const result = resolveSourceRequests(
    ['academic-venue', 'health-study-type', 'named-jurisdiction', 'organisation-template'],
    {}
  );
  assert.equal(result.requests.length, 0);
  assert.equal(result.unresolved.length, 4);
  assert.equal(
    result.unresolved.every((item) => item.reason === 'required-metadata-missing'),
    true
  );
});

test('unknown resolvers are rejected instead of silently ignored', () => {
  assert.throws(() => resolveSourceRequests(['internet-popularity'], {}), /Unknown resolver/u);
});

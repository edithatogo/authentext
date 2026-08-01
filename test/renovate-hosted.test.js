import test from 'node:test';
import assert from 'node:assert/strict';
import { runRenovateHostedCheck, summarizeRenovateHosted } from '../scripts/lib/renovate-hosted.js';

test('Renovate Dashboard or bot PR proves hosted health', () => {
  const summary = summarizeRenovateHosted({
    issues: [
      {
        number: 10,
        state: 'open',
        title: 'Dependency Dashboard',
        user: { login: 'renovate[bot]' },
        html_url: 'https://example.test/10',
      },
    ],
    pulls: [],
  });
  assert.equal(summary.healthy, true);
  assert.equal(summary.dashboardIssues[0].number, 10);
});

test('absence of Renovate artifacts remains an explicit unhealthy result', () => {
  const summary = summarizeRenovateHosted({
    issues: [
      {
        number: 11,
        state: 'open',
        title: '[Track] Renovate',
        user: { login: 'edithatogo' },
        html_url: 'https://example.test/11',
      },
    ],
    pulls: [],
  });
  assert.equal(summary.healthy, false);
  assert.deepEqual(summary.botPulls, []);
});

test('hosted check fetches both issue and pull request snapshots', async () => {
  const originalFetch = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (url) => {
    requests.push(url);
    return {
      ok: true,
      async json() {
        return url.includes('/issues?')
          ? [
              {
                number: 12,
                title: 'Dependency Dashboard',
                user: { login: 'renovate[bot]' },
                html_url: 'https://example.test/12',
              },
            ]
          : [];
      },
    };
  };

  try {
    const summary = await runRenovateHostedCheck({
      repository: 'edithatogo/authentext',
      token: 'test-token',
    });
    assert.equal(summary.healthy, true);
    assert.equal(requests.length, 2);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

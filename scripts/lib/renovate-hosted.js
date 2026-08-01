/**
 * Summarize hosted Renovate evidence without treating local configuration as
 * proof that the GitHub App is operating.
 * @param {{issues?: Array, pulls?: Array}} snapshot
 * @returns {{healthy: boolean, dashboardIssues: Array, botPulls: Array, checkedAt: string}}
 */
export function summarizeRenovateHosted(snapshot) {
  const issues = snapshot.issues ?? [];
  const pulls = snapshot.pulls ?? [];
  const isBot = (item) =>
    String(item.user?.login ?? '')
      .toLowerCase()
      .includes('renovate');
  const dashboardIssues = issues.filter(
    (item) =>
      String(item.title ?? '')
        .toLowerCase()
        .includes('dashboard') &&
      (isBot(item) ||
        String(item.title ?? '')
          .toLowerCase()
          .includes('renovate'))
  );
  const botPulls = pulls.filter((item) => isBot(item));

  return {
    healthy: dashboardIssues.length > 0 || botPulls.length > 0,
    dashboardIssues: dashboardIssues.map(({ number, state, title, html_url: url }) => ({
      number,
      state,
      title,
      url,
    })),
    botPulls: botPulls.map(({ number, state, title, html_url: url }) => ({
      number,
      state,
      title,
      url,
    })),
    checkedAt: new Date().toISOString(),
  };
}

async function fetchGitHub(path, token) {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (!response.ok) throw new Error(`GitHub API ${path} returned HTTP ${response.status}`);
  return response.json();
}

export async function runRenovateHostedCheck({ repository, token }) {
  if (!repository || !token) throw new Error('GITHUB_REPOSITORY and GITHUB_TOKEN are required');
  const [owner, repo] = repository.split('/');
  const [issues, pulls] = await Promise.all([
    fetchGitHub(`/repos/${owner}/${repo}/issues?state=all&per_page=100`, token),
    fetchGitHub(`/repos/${owner}/${repo}/pulls?state=all&per_page=100`, token),
  ]);
  return summarizeRenovateHosted({ issues, pulls });
}

if (process.env.RENOVATE_HOSTED_MAIN === '1') {
  const repository = process.env.GITHUB_REPOSITORY;
  const token = process.env.GITHUB_TOKEN;
  runRenovateHostedCheck({ repository, token })
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}

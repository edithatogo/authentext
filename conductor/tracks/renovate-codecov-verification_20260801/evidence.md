# Hosted Verification Evidence

Verified on 2026-08-01 against `edithatogo/authentext`.

## Repository and Codecov

- Pull request [#233](https://github.com/edithatogo/authentext/pull/233) merged
  commit `780d07ff953bbe6b6d323eaa4428fb71edab5860` after the complete pull-request
  matrix passed: CI, CodeQL, workflow lint, behavioral evaluation, portable
  specification validation, GitHub publication preview, and skill validation on
  Ubuntu, macOS, and Windows.
- The PR CI run
  [30687665180](https://github.com/edithatogo/authentext/actions/runs/30687665180)
  ran the pinned `codecov/codecov-action` commit with `use_oidc: true`, found
  `coverage/lcov.info`, acquired the OIDC upload token, and queued the upload
  successfully. The hosted `codecov/patch` check completed successfully.
- The default-branch CI run
  [30687786382](https://github.com/edithatogo/authentext/actions/runs/30687786382)
  repeated the OIDC upload for merge commit `780d07f`; Codecov accepted 23,377
  bytes and returned the commit result URL.
- Native LCOV/JSON evidence, local thresholds, and the GitHub Actions coverage
  artifact remain in place.

## Renovate

- `renovate.json` inherits the public
  [`github>edithatogo/renovate-config`](https://github.com/edithatogo/renovate-config)
  preset and enables the Dependency Dashboard.
- On 2026-08-01 the repository owner reported that the Renovate GitHub App had
  been installed. The repository API now reaches the GitHub-App installation
  boundary, but a normal repository token cannot enumerate the installation or
  prove bot execution; GitHub returns the expected JWT-authentication error for
  that endpoint.
- A paginated search of all repository issues and pull requests found no item
  authored by `renovate[bot]` or another Renovate bot identity.
- The merged `renovate-hosted-monitor.yml` workflow now checks daily and on
  demand, publishes a JSON evidence artifact, and emits a warning without
  blocking normal CI when the Dashboard/PR proof is absent. Its local unit
  coverage is included in the repository's enforced thresholds.
- The authenticated GitHub CLI token can administer the repository but cannot
  install or enumerate user-account GitHub App installations. GitHub returned
  `403` for the user-installations endpoint because it requires a GitHub-App
  authorized user token. The repository-installation endpoint requires an App
  JWT and therefore cannot establish the Renovate installation from a normal
  repository token.
- Browser-assisted installation was attempted at
  <https://github.com/apps/renovate/installations/new>, but the available
  browser-control bridge could not initialize in this session. No installation
  click or authorization is claimed.

## Remaining gate

The remaining hosted gate is first-run proof: wait for or trigger Renovate's
onboarding and verify a Renovate-authored Dependency Dashboard or pull request.
Until that evidence exists, `.github/dependabot.yml` remains the fail-closed
update path and this track remains in progress.

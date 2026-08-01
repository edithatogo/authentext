# Phase 3 Security Evidence

Date: 2026-08-01

## Repository context

- Private vulnerability reporting is enabled.
- `SECURITY.md` now points to the current repository's private advisory form and
  states the supported surface without unsupported response promises.
- Contribution, pull request, bug, and feature context reflects the Node 24
  validation path and portable skill boundary.
- CODEOWNERS was removed because a mandatory or implied second-reviewer gate is
  inappropriate for this solo-maintainer repository.

## Hosted controls

Default GitHub Actions permissions are now read-only and workflows cannot approve
pull requests. Individual jobs continue to declare narrower or explicitly
warranted permissions.

Active ruleset `20171596` (`Authentext main safeguards`) targets the default
branch and blocks branch deletion and non-fast-forward pushes. It requires
up-to-date `test` and `portable-spec` checks, which run on every pull request.
`actionlint` remains enforced by its path-filtered workflow when workflow files
change, but is not a global required context because it does not run on
Conductor-only changes. Repository
administrators retain an explicit recovery bypass; no review count, team,
CODEOWNERS, or human approval is required.

## Dependency automation gate

`renovate.json` exists, but the current GitHub credential cannot enumerate app
installations (`403` requires a GitHub App-authorized token). Renovate access is
therefore unverified. Dependabot remains enabled and must not be removed until a
hosted Renovate run proves repository access and update behavior.

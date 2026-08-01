# Phase 6 verification

Verified locally: 2026-08-01

## Passed gates

- `npm run sync`
- `npm run validate`
- `npm run validate:hosts`
- `npm run validate:conductor`
- `npm run lint:all`
- `npm test` (72 aggregate tests, isolated execution, integration checks)
- `uvx --from skills-ref==0.1.1 agentskills.exe validate <absolute repo path>`
- `gh skill publish --dry-run` against a staged temporary skill repository
- `npm run conductor:reconcile -- --live` (153 mapped nodes and 123 native
  subissue relationships, no drift after receipt refresh)

## Hosted verification

Draft PR [#218](https://github.com/edithatogo/authentext/pull/218) verified
implementation commit `8f6e799` with these hosted runs:

- CI: run `30671283008`, passed.
- Skill distribution validation: run `30671283070`; behavioral evaluations,
  publish preview, portable spec, and Linux/macOS/Windows validation passed.
- CodeQL: run `30671283013`, JavaScript/TypeScript analysis passed after the
  scan was scoped to maintained surfaces.
- Workflow lint: run `30671283011`, passed on targeted rerun after the first
  attempt encountered a GitHub API connection timeout.

Hosted failures found and corrected before this receipt:

- Vale archives had been extracted in the checkout root, overwriting
  `README.md`; `30c00fb` isolates extraction under `RUNNER_TEMP`.
- CodeQL was scanning frozen `skills/**` and `experiments/**` history;
  `8f6e799` adds an exact, regression-tested maintained-surface scope.

## Remaining gates

- Public tag, release, merge, and publication remain explicitly unapproved.
- The publish preview reports no active tag-protection ruleset.

Release notes are prepared at `docs/release-candidate-3.2.0.md`. This receipt is
not a release authorization.

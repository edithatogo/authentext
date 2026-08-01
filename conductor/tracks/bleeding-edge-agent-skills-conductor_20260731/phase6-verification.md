# Phase 6 verification

Verified locally: 2026-08-01

## Passed gates

- `npm run sync`
- `npm run validate`
- `npm run validate:hosts`
- `npm run validate:conductor`
- `npm run lint:all`
- `npm test` (73 aggregate tests, isolated execution, integration checks)
- `uvx --from skills-ref==0.1.1 agentskills.exe validate <absolute repo path>`
- `gh skill publish --dry-run` against a staged temporary skill repository
- `npm run conductor:reconcile -- --live` (153 mapped nodes and 123 native
  subissue relationships, no drift after receipt refresh)

## Hosted verification

PR [#218](https://github.com/edithatogo/authentext/pull/218) verified the
release candidate and was squash-merged as `eaef2c1` on 2026-08-01. Its final
candidate commit was `8fe16da`.

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

The first default-branch CodeQL run then exposed two maintained-source
incomplete-sanitization alerts in the upstream-triage Markdown table formatter.
PR [#220](https://github.com/edithatogo/authentext/pull/220) added regression
coverage, escaped existing backslashes before table separators, and removed an
obsolete shared-gate input. It was squash-merged as `4243d6d`.

The exact final `main` revision `4243d6d` passed:

- CI: run `30683241535`.
- Skill distribution validation: run `30683241550`.
- Workflow lint: run `30683241565`.
- CodeQL and the blocking alert gate: run `30683241551`.

CodeQL alerts 13 and 14 report their most recent instances as `fixed`. Their
top-level records remained open while GitHub processed the default-branch
state transition.

## Remaining gates

- Public tag, release, and publication remain explicitly unapproved. Repository
  integration is complete through merged PRs #218 and #220.
- The publish preview reports no active tag-protection ruleset.

Release notes are prepared at `docs/release-candidate-3.2.0.md`. This receipt is
not a release authorization.

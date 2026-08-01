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

## Published release

- The user explicitly authorized the supported release scope in direct response
  to the Phase 6 authorization question.
- Annotated tag `v3.2.0` targets verified `main` commit `58d8ad1`.
- Release run `30684012674` passed build, validation, packaging, artifact-surface
  verification, artifact upload, and GitHub Release publication.
- [Authentext 3.2.0](https://github.com/edithatogo/authentext/releases/tag/v3.2.0)
  is public with ZIP and TAR.GZ assets and GitHub-recorded SHA-256 digests.
- npm publication and separate skill-registry submission were not authorized
  and did not occur; the npm package remains private.

The successful release run warned that the pinned release action declared
deprecated Node.js 20. Formal review upgraded it to upstream v3.0.2 at immutable
commit `3d0d9888cb7fd7b750713d6e236d1fcb99157228`, which uses Node.js 24. The
regression failed on the old pin and passed with the new pin; commit `49ea366`
also passed the full 73-test and integration gate.

Final release notes are recorded at `docs/release-3.2.0.md`.

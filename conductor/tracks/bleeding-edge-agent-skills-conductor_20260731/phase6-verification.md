# Phase 6 verification

Verified locally: 2026-08-01

## Passed gates

- `npm run sync`
- `npm run validate`
- `npm run validate:hosts`
- `npm run validate:conductor`
- `npm run lint:all`
- `npm test` (70 aggregate tests, isolated execution, integration checks)
- `uvx --from skills-ref==0.1.1 agentskills.exe validate <absolute repo path>`
- `gh skill publish --dry-run` against a staged temporary skill repository
- `npm run conductor:reconcile -- --live` (153 mapped nodes and 123 native
  subissue relationships, no drift after receipt refresh)

## Remaining gates

- Hosted CI cannot verify the exact candidate revision until the branch is
  pushed. Push remains an external state change requiring authority.
- Public tag, release, merge, and publication remain explicitly unapproved.
- The publish preview reports no active tag-protection ruleset.

Release notes are prepared at `docs/release-candidate-3.2.0.md`. This receipt is
not a release authorization.

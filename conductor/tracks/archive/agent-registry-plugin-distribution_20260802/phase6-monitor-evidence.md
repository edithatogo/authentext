# Phase 6 registry-monitor evidence

Date: 2026-08-08

## Implemented boundary

- Added a deterministic monitor for stale evidence and releases, changed
  manifests, broken or removed listings, observed status drift, and acceptance
  claims without hosted receipts.
- Added a scheduled GitHub Actions workflow that performs only read operations
  against registry listings, uploads a JSON artifact, and maintains one
  marker-addressed drift issue.
- Kept publication credentials and package publication operations out of the
  workflow.
- Added rollback, deprecation, rename, removal, compromise-response, and
  maintainer-handoff procedures.

## Verification

The focused Node tests cover healthy state, every governed drift class, stable
finding order, false-acceptance protection, CLI JSON output, and the idempotent
issue marker. JavaScript lint and formatting checks are run before checkpoint
handoff.

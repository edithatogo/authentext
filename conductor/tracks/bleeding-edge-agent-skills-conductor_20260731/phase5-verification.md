# Phase 5 verification

Verified: 2026-08-01

## Repository evidence

- `e6bb7ea`: executable Conductor handshake validation covers required assets,
  setup state, unique mappings, and the active requirements/design/plan/spec.
- `9d9b5db` and `4841402`: reconciliation is no-op by default, bounded live with
  `--live`, receipt-writing only with `--apply`, idempotency-tested, and safe on
  Windows.
- `53a6808`: live reconciliation also verifies native parent/subissue links.
- `npm test`: 70 aggregate tests passed after reconciliation work, with every
  Node test file also passing in isolation and integration checks passing.

## Hosted evidence

- All 30 track issues and 123 phase issues exist.
- All 153 mapped nodes are Project 36 members.
- All 123 phase issues are native subissues of their mapped track issue.
- A live dry run after applying state receipts returned no missing issues,
  missing Project items, missing subissue relationships, or state drift.
- Project 36 fields for Phases 3 and 4 are Done/Complete/Verified; Phase 5 was
  advanced to In Progress while active.
- Project views created: Current roadmap, History, Must requirements, and
  Experimental work. GitHub's view-creation API does not expose saved-filter
  configuration, so only the supported view objects were created.

## Upstream and experimental profile

- Conductor main: `99ba10e1a11130fc159f681b7ba8803489239cbf`.
- Main `VERSION`: `0.3.0`.
- Latest extension release: `conductor-v0.4.1`.
- Gemini CLI: `0.54.0-preview.0`.
- Upstream issue #176 remains open.
- `.gemini/settings.json` matches the documented experimental options, and
  `conductor/experimental-features.md` now records a reversible rollback path.

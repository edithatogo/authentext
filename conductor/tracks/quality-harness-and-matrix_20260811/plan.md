# Implementation Plan: Quality Harness and Feature Matrix

## Evidence programme extension (2026-11-08)

The [implementation plan](implementation-20261108.md) adds reader outcomes,
operation-aware claim preservation, external benchmark admission, third-party
library reuse and first-party integration contracts. Its bounded metadata and
ablation slice is separate from unexecuted scientific comparisons.

## Phase 1: Humanizer feature matrix

- [x] Task: Verify each named tool still exists and record licence, pattern
      count, scoring, and last update.
- [x] Task: Add `docs/humanizer-feature-matrix.md` plus JSON or CSV. Mark
      in-skill / integrated / refused / planned.
- [ ] Task: Phase Verification & Checkpoint (Refer to `workflow.md`).

## Phase 2: Vale, self-compliance, UTF-8

- [x] Task: Write a failing self-compliance test that plants an em dash in
      non-example `SKILL.md` prose.
- [x] Task: Expand Vale to the maintained surface with exceptions for
      pattern examples.
- [x] Task: Audit Python and Node file reads for explicit UTF-8.
- [ ] Task: Phase Verification & Checkpoint (Refer to `workflow.md`).

## Phase 3: Scored harness and optional metrics CLI

- [ ] Task: Add golden before/after fixtures per domain and a runner that
      scores claim preservation, locked spans, and restraint.
- [ ] Task: Ratchet a CI threshold on those fixtures. No live LLM in
      default CI.
- [ ] Task: Optional `scripts/` metrics CLI (burstiness, MATTR, trigram,
      vocab), decoupled from `SKILL.md`.
- [ ] Task: Phase Verification & Checkpoint (Refer to `workflow.md`).

## Phase 4: Watcher and hygiene

- [ ] Task: Replace `humanizer-next` examples in `gather-repo-data.js`.
- [ ] Task: Small follow-up PRs for rename drift, orphan changeset, and
      duplicated self-improvement docs. Do not mix them into one dump.
- [ ] Task: Phase Verification & Checkpoint (Refer to `workflow.md`).

## Handoff artifacts

- `docs/humanizer-feature-matrix.md`
- Self-compliance CI
- Evaluation runner with a ratchet
- Optional metrics CLI

## Bounded protected-literal properties (2026-11-20)

This test-only extension covers the existing shielding and rewrite verification
boundaries. It does not complete the scored-harness, reader-outcome or external
benchmark acceptance tasks above.

- [x] Add four fast-check properties for Unicode and CRLF/LF round trips through
      serialized lockfiles, missing/duplicate token rejection, protected-code
      mutation rejection, and typed refusal or exact reconstruction of arbitrary
      bounded syntax.
- [x] Pin fast-check as a development dependency. Existing PR test discovery
      runs 256 cases per property with seed `20261120`.
- [x] Add a weekly/manual 2,000-case profile with a recorded varying seed and
      retained shrinking output. Inputs are synthetic and limited to 256 Unicode
      code points; valid protected payloads are limited to 128.
- [x] Record full local suite, formatting and lint results.
- [ ] Verify the new PR head in hosted CI. Scheduled execution requires merge
      to the default branch or a manual run.

Replay a campaign with:

```sh
AUTHENTEXT_FUZZ_RUNS=2000 AUTHENTEXT_FUZZ_SEED=20261120 node --test test/ast-shield.property.test.js
```

Keep any minimized failure as a deterministic regression case before fixing
the implementation; fast-check reports the seed and shrink path for replay.

Local evidence on base `e270dc637f372655ef90d73e4bdbb1dd6b8803de`:
Node `v24.22.3`, fast-check `4.10.3`; all four properties passed at 2,000 cases
each with seed `20261120`. `npm test` passed isolated discovery across 63 Node
test files, all 400 aggregate tests and both integration checks. Targeted ESLint,
Prettier and `npm run validate:conductor` passed. No production implementation,
generated skill or benchmark acceptance criterion changed.

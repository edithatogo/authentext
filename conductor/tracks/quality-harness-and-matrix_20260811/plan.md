# Implementation Plan: Quality Harness and Feature Matrix

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

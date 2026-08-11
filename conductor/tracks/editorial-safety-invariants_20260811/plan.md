# Implementation Plan: Editorial Safety Invariants

## Delivery rule

One theme per PR. Do not mix remaining pattern adoptions into PR #275.

## Phase 1: Core claim-preservation invariants

GitHub: [#276](https://github.com/edithatogo/authentext/issues/276),
[PR #275](https://github.com/edithatogo/authentext/pull/275)

- [x] Task: Replace paragraph-count parity with never-add, never-lose, and
      information-over-shape. Add protected spans, host-control respect, and
      the anecdote-invention guard. Deduplicate the Low-tier severity list.
      (commit: 678bcd7)
- [x] Task: Add regression tests for the invariants and unique Low-tier IDs.
      (commit: 678bcd7)
- [x] Task: Merge PR #275 once Actions are green.
      (merged: 141e1ed)
- [x] Task: Phase Verification & Checkpoint (Refer to `workflow.md`).
      [checkpoint: 141e1ed]

## Phase 2: Voice, modes, and cheap catalogue fixes

Separate PRs unless two fixes are one-line each.

- [x] Task: Write failing tests for voice-sample precedence, including the
      dash-ban override, and for pasted/file/embedded delivery wording in
      `SKILL.md`. (commit: 3331078)
- [x] Task: Add the seven-line voice calibration section and the sample
      outranks style rule. (commit: 3331078)
- [x] Task: Add invocation modes and keep the host-controls wording from
      [upstream PR #213](https://github.com/blader/humanizer/pull/213).
      (commit: 3331078)
- [x] Task: Add the secondhand-text false-positive guard (v2.8.1).
      (commit: 3331078)
- [x] Task: Add `quietly` to Pattern 7
      ([PR #192](https://github.com/blader/humanizer/pull/192)).
      (commit: 3331078)
- [x] Task: Phase Verification & Checkpoint (Refer to `workflow.md`).
      [checkpoint: 34f156d]

## Phase 3: Remaining upstream patterns

Prefer extending an existing number over minting a new one.

- [x] Task: Add passive voice and subjectless fragments (upstream §13) with
      the humanizing-overcorrection register
      ([#146](https://github.com/blader/humanizer/issues/146)).
      (commit: 7ea274c)
- [ ] Task: Add shadowboxing and editorial scar tissue
      ([PR #207](https://github.com/blader/humanizer/pull/207)), including
      rewrite-from-the-point guidance.
- [ ] Task: Add vague "This" back-references and a mechanical pre-return
      scan ([PR #196](https://github.com/blader/humanizer/pull/196)).
- [ ] Task: Add uniform sentence and paragraph length as generative repair,
      with genre limits ([PR #211](https://github.com/blader/humanizer/pull/211)).
- [ ] Task: Fold repeated sentence openings into Pattern 11
      ([PR #209](https://github.com/blader/humanizer/pull/209)).
- [x] Task: Add the annotated-link / definition em dash exception
      ([PR #190](https://github.com/blader/humanizer/pull/190)).
      (commit: 7ea274c)
- [ ] Task: Phase Verification & Checkpoint (Refer to `workflow.md`).

## Phase 4: Upstream decision-log refresh

- [ ] Task: Rewrite `conductor/self-improvement/upstream-decision-log.md` so
      it names `edithatogo/authentext`, records v2.9.0, and triages the open
      upstream queue. Keep archived DEFER rows as history.
- [ ] Task: Confirm `scripts/gather-repo-data.js` examples use
      `edithatogo/authentext`. If they still say `humanizer-next`, leave the
      code change to `quality-harness-and-matrix_20260811` and record the
      pointer.
- [ ] Task: Phase Verification & Checkpoint (Refer to `workflow.md`).

## Handoff artifacts

- Compiled `SKILL.md` / `references/core-patterns.md` with invariants and
  adopted patterns.
- Fresh upstream decision log.
- Opened and merged PRs, one theme each.

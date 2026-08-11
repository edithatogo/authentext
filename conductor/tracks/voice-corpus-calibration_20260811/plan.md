# Implementation Plan: Voice and Corpus Calibration

## Phase 1: Local corpus intake contract

- [x] Task: Write failing tests for local file/folder pointers, consent,
      unreadable paths, and insufficient samples. (commit: 286195c)
- [x] Task: Extend `document-intake-policy.js` so a local corpus produces
      the same feature record as a pasted sample. (commit: 286195c)
- [x] Task: Document the pointer syntax in the compiled skill.
      (commit: 286195c)
- [x] Task: Phase Verification & Checkpoint (Refer to `workflow.md`).
      [checkpoint: d5a0d98]

## Phase 2: Published-work metadata intake

- [x] Task: Write failing tests for DOI, URL, ORCID, and institutional-repo
      identifiers. Queries must be metadata-only. (commit: 2a2768f)
- [x] Task: Implement permissioned fetch of public metadata and, when the
      user grants it, the public full text. Never send the current document.
      (commit: 2a2768f)
- [x] Task: Phase Verification & Checkpoint (Refer to `workflow.md`).
      [checkpoint: 6f2fb87]

## Phase 3: Optional plugin sources

- [x] Task: Write failing tests that email and other plugins are off by
      default and require a named grant. (commit: 488a3af)
- [x] Task: Add a thin adapter interface. Do not ship a mail client.
      (commit: 488a3af)
- [x] Task: Phase Verification & Checkpoint (Refer to `workflow.md`).
      [checkpoint: fa40812]

## Phase 4: Precedence wiring

- [x] Task: Write failing tests that a calibrated sample outranks the dash
      ban and that corpus facts cannot be inserted into the current draft.
      (commit: 6077fe1)
- [x] Task: Wire precedence in skill prose and in the intake/diagnostic
      contracts. (commit: 6077fe1)
- [x] Task: Phase Verification & Checkpoint (Refer to `workflow.md`).
      [checkpoint: 577ae9d]

## Handoff artifacts

- Extended intake policy
- Skill prose for corpus pointers
- Tests for consent and non-fabrication

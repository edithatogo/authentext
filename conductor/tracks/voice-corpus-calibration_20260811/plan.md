# Implementation Plan: Voice and Corpus Calibration

## Phase 1: Local corpus intake contract

- [~] Task: Write failing tests for local file/folder pointers, consent,
      unreadable paths, and insufficient samples.
- [~] Task: Extend `document-intake-policy.js` so a local corpus produces
      the same feature record as a pasted sample.
- [~] Task: Document the pointer syntax in the compiled skill.
- [ ] Task: Phase Verification & Checkpoint (Refer to `workflow.md`).

## Phase 2: Published-work metadata intake

- [ ] Task: Write failing tests for DOI, URL, ORCID, and institutional-repo
      identifiers. Queries must be metadata-only.
- [ ] Task: Implement permissioned fetch of public metadata and, when the
      user grants it, the public full text. Never send the current document.
- [ ] Task: Phase Verification & Checkpoint (Refer to `workflow.md`).

## Phase 3: Optional plugin sources

- [ ] Task: Write failing tests that email and other plugins are off by
      default and require a named grant.
- [ ] Task: Add a thin adapter interface. Do not ship a mail client.
- [ ] Task: Phase Verification & Checkpoint (Refer to `workflow.md`).

## Phase 4: Precedence wiring

- [ ] Task: Write failing tests that a calibrated sample outranks the dash
      ban and that corpus facts cannot be inserted into the current draft.
- [ ] Task: Wire precedence in skill prose and in the intake/diagnostic
      contracts.
- [ ] Task: Phase Verification & Checkpoint (Refer to `workflow.md`).

## Handoff artifacts

- Extended intake policy
- Skill prose for corpus pointers
- Tests for consent and non-fabrication

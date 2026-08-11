# Implementation Plan: Domain and Citation Coverage

## Phase 1: Positioning and academic upgrade

- [ ] Task: Write failing tests for detector-evasion refusal wording and for
      academic disclosure / interface-artefact / tortured-phrase / bibliography
      refuse rules.
- [ ] Task: Update `conductor/product.md` and the compiled skill description
      so Authentext is editorial defect repair with verified diffs, not a
      humanizer that chases detector scores.
- [ ] Task: Upgrade `src/modules/SKILL_ACADEMIC.md` with publisher-branching
      disclosure, interface-artefact hard errors, tortured-phrase lexicon,
      and out-of-scope reference lists.
- [ ] Task: Phase Verification & Checkpoint (Refer to `workflow.md`).

## Phase 2: Clinical reference

- [ ] Task: Write failing compile, routing, and locked-span tests for
      clinical material, including patient-facing FKGL report-not-rewrite.
- [ ] Task: Add `src/modules/SKILL_CLINICAL.md` and teach the compiler to
      emit `references/clinical.md`.
- [ ] Task: Phase Verification & Checkpoint (Refer to `workflow.md`).

## Phase 3: Legal reference

- [ ] Task: Write failing tests for modal, defined-term, carve-out, temporal,
      and citation-unverified locks, plus omission-versus-invention reporting.
- [ ] Task: Add `src/modules/SKILL_LEGAL.md` and emit `references/legal.md`.
- [ ] Task: Phase Verification & Checkpoint (Refer to `workflow.md`).

## Phase 4: Creative reference

- [ ] Task: Write failing tests that creative routing loads the new module
      and that specificity gaps prompt the author instead of inventing detail.
- [ ] Task: Add `src/modules/SKILL_CREATIVE.md` and emit
      `references/creative.md`. Keep surface tells low-weight.
- [ ] Task: Phase Verification & Checkpoint (Refer to `workflow.md`).

## Phase 5: Profile registry routing

- [ ] Task: Point `health-research` and `clinical-safety` at `clinical.md`,
      `legal-regulatory` at `legal.md`, and `creative-narrative` at
      `creative.md`. Update registry tests.
- [ ] Task: Phase Verification & Checkpoint (Refer to `workflow.md`).

## Phase 6: Sourceright and citeweft handoff

- [ ] Task: Locate `edithatogo/sourceright` and citeweft skills (GitHub and
      any local clone). Record what Authentext may hand off: citation
      verification, DOI/PMID resolution, reference-list edits, source
      disclosure.
- [ ] Task: Write failing tests for refuse-and-point behaviour when the
      tools are present and when they are absent.
- [ ] Task: Update `docs/citation-manager-boundary.md` and the academic /
      clinical / legal modules. Do not import citation-manager code.
- [ ] Task: Phase Verification & Checkpoint (Refer to `workflow.md`).

## Handoff artifacts

- `references/clinical.md`, `references/legal.md`, `references/creative.md`
- Updated `references/academic.md` and profile registry
- Updated citation-manager boundary doc

# Implementation Plan: Domain and Citation Coverage

## Phase 1: Positioning and academic upgrade [checkpoint: aa18c2b]

- [x] Task: Write failing tests for detector-evasion refusal wording and for
      academic disclosure / interface-artefact / tortured-phrase / bibliography
      refuse rules. [aa18c2b]
- [x] Task: Update `conductor/product.md` and the compiled skill description
      so Authentext is editorial defect repair with verified diffs, not a
      humanizer that chases detector scores. `product.md` already stated the
      refusal; the compiled skill description now matches. [aa18c2b]
- [x] Task: Upgrade `src/modules/SKILL_ACADEMIC.md` with publisher-branching
      disclosure, interface-artefact hard errors, tortured-phrase lexicon,
      and out-of-scope reference lists. [aa18c2b]
- [x] Task: Phase Verification & Checkpoint (Refer to `workflow.md`). [aa18c2b]
      Evidence: merged as PR #297. Local command `CI=true npm test` green on
      the clinical/legal follow-on branch after rebase onto main.

## Phase 2: Clinical reference [checkpoint: faebf1a]

- [x] Task: Write failing compile, routing, and locked-span tests for
      clinical material, including patient-facing FKGL report-not-rewrite. [122b772]
- [x] Task: Add `src/modules/SKILL_CLINICAL.md` and teach the compiler to
      emit `references/clinical.md`. [122b772]
- [x] Task: Phase Verification & Checkpoint (Refer to `workflow.md`). [faebf1a]
      Evidence: `npm run sync`; `CI=true npm test` — 286 pass, integration green.

## Phase 3: Legal reference [checkpoint: faebf1a]

- [x] Task: Write failing tests for modal, defined-term, carve-out, temporal,
      and citation-unverified locks, plus omission-versus-invention reporting. [122b772]
- [x] Task: Add `src/modules/SKILL_LEGAL.md` and emit `references/legal.md`. [122b772]
- [x] Task: Phase Verification & Checkpoint (Refer to `workflow.md`). [faebf1a]
      Evidence: same as Phase 2; governance pointer to `legal.md` only.

## Phase 4: Creative reference

- [ ] Task: Write failing tests that creative routing loads the new module
      and that specificity gaps prompt the author instead of inventing detail.
- [ ] Task: Add `src/modules/SKILL_CREATIVE.md` and emit
      `references/creative.md`. Keep surface tells low-weight.
- [ ] Task: Phase Verification & Checkpoint (Refer to `workflow.md`).

## Phase 5: Profile registry routing

- [~] Task: Point `health-research` and `clinical-safety` at `clinical.md`,
      `legal-regulatory` at `legal.md`, and `creative-narrative` at
      `creative.md`. Update registry tests.
      Clinical and legal family routing landed in [122b772]; creative remains
      for Phase 4 / PR 3.
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

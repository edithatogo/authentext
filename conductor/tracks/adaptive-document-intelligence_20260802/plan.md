# Implementation Plan: Adaptive Document Intelligence

## Phase 1: Contracts, evidence, and migration boundary

GitHub subissue: [#255](https://github.com/edithatogo/authentext/issues/255)

- [x] Task: Review the original `blader/humanizer` and selected current
      Humanizer skills at pinned revisions; incorporate compatible operational
      ideas and record explicit reject decisions. (M-016, M-017, M-018, M-019,
      M-020, M-021, W-006, W-007, W-008, W-009) (commit: cff27cc)

- [ ] Task: Write failing tests for one-runtime-skill ownership, profile schema,
      unknown/composite types, confidence, provenance, and source precedence.
      (M-001, M-002, M-003, M-005)
- [ ] Task: Inventory existing canonical, generated, legacy-looking, and
      non-discoverable source files; resolve `humanizer` identity remnants
      without deleting historical evidence. (M-001, M-011)
- [ ] Task: Define the machine-readable document-profile, guidance-source,
      conflict, and diagnostic-receipt schemas. (M-002, M-005, M-007, M-014)
- [ ] Task: Verify and record the first-party evidence baseline, scope,
      licensing, freshness, and authority classifications. (M-007)
- [ ] Task: Document the `SKILL_PROFESSIONAL.md` compatibility and retirement
      boundary with downstream checks. (M-001, W-001)
- [ ] Task: Mirror the track and phases as native GitHub issues/subissues in
      Project 36 and update `conductor/github-mapping.json`.
- [ ] Task: Phase Verification & Checkpoint (Refer to `workflow.md`).

## Phase 2: Confidence-aware intake and routing

GitHub subissue: [#256](https://github.com/edithatogo/authentext/issues/256)

- [ ] Task: Write failing classifier tests for operation, type, subtype,
      purpose, audience, stakes, authority, lifecycle, constraints, strength,
      permission, ambiguity, and composite documents. (M-002, M-003, M-008)
- [ ] Task: Write failing tests for pasted, file, and embedded delivery modes,
      capability boundaries, voice-sample calibration, and non-inference.
      (M-016, M-017)
- [ ] Task: Implement the deterministic profile builder with field-level
      confidence and provenance. (M-002, M-003)
- [ ] Task: Implement material-question logic and conservative fallback without
      mandatory questionnaires. (M-004)
- [ ] Task: Implement the source-precedence and conflict resolver. (M-005)
- [ ] Task: Seed correspondence, workplace, public, technical, product,
      academic, health-research, governance, legal, clinical, commercial,
      employment, and narrative profile families. (S-001)
- [ ] Task: Convert existing domain routing to registry-backed progressive
      disclosure without duplicating module content. (M-011)
- [ ] Task: Phase Verification & Checkpoint (Refer to `workflow.md`).

## Phase 3: Governed research and source intelligence

GitHub subissue: [#257](https://github.com/edithatogo/authentext/issues/257)

- [ ] Task: Write failing privacy tests for research-off defaults, allow-listed
      metadata queries, embedded instructions, secrets, names, citations, and
      sensitive document content. (M-006, M-010)
- [ ] Task: Implement the material-need and permission research gate. (M-006)
- [ ] Task: Implement metadata-only query construction and fail-closed source
      ingestion. (M-006, M-010)
- [ ] Task: Implement source records with authority, scope, licensing,
      retrieval date, freshness, drift, and supported-check mappings. (M-007,
      S-005)
- [ ] Task: Add governed resolvers for project style, technical documentation,
      public content, academic venue, health study type, and named
      jurisdiction or organisation. (S-002, S-003, S-004)
- [ ] Task: Add a non-publishing guidance-drift receipt and review workflow.
      (C-005)
- [ ] Task: Phase Verification & Checkpoint (Refer to `workflow.md`).

## Phase 4: Diagnostics, editing strength, and safety

GitHub subissue: [#258](https://github.com/edithatogo/authentext/issues/258)

- [ ] Task: Write failing tests for profile-specific dimensions, source-linked
      findings, safe-fix decisions, and non-applicable checks. (S-007)
- [ ] Task: Write failing tests for structure-first ordering, cluster evidence,
      short-sample limits, language-aware typography, and bounded audit
      termination. (M-018, M-019, M-020, M-021)
- [ ] Task: Implement the diagnostic pipeline for completeness, structure,
      evidence, accessibility, tone, safety, AI patterns, and preservation.
      (S-007)
- [ ] Task: Implement review, rewrite, structural, final-pass, and
      research-assisted operations with distinct output contracts. (M-008)
- [ ] Task: Define and implement conservative, standard, and strong change
      budgets. (M-009)
- [ ] Task: Extend protected-item checks for required sections, sourced rules,
      legal/clinical boundaries, and high-stakes fail-closed behaviour. (M-013)
- [ ] Task: Implement concise assumptions, conflicts, unresolved findings, and
      optional diagnostic receipts. (M-014, S-006)
- [ ] Task: Phase Verification & Checkpoint (Refer to `workflow.md`).

## Phase 5: Evaluation and document-profile quality

GitHub subissue: [#259](https://github.com/edithatogo/authentext/issues/259)

- [ ] Task: Build positive, near-miss, negative, ambiguous, composite, and
      adversarial fixtures for at least ten representative subtypes. (M-012)
- [ ] Task: Add task/concept/reference/troubleshooting technical evaluations.
      (S-002)
- [ ] Task: Add study-type routing and minimum-reporting evaluations without
      claiming submission compliance. (S-003, W-004)
- [ ] Task: Add prompt-injection, privacy, source-conflict, and stale-guidance
      adversarial cases. (M-006, M-010, M-013)
- [ ] Task: Add detector-evasion, authorship-inference, invented-specificity,
      artificial-disfluency, and universal-punctuation negative fixtures.
      (W-006, W-007, W-008)
- [ ] Task: Measure restraint, false positives, preservation, requirement
      coverage, change density, and classification calibration separately.
      (S-008)
- [ ] Task: Run supported-host routing and output-similarity evaluations and
      record bounded variance. (M-015)
- [ ] Task: Phase Verification & Checkpoint (Refer to `workflow.md`).

## Phase 6: Portable skill integration and closeout

GitHub subissue: [#260](https://github.com/edithatogo/authentext/issues/260)

- [ ] Task: Update canonical skill fragments with adaptive intake, source
      hierarchy, research gate, untrusted-document boundary, and operation
      routing. (M-001, M-004, M-006, M-008, M-010)
- [ ] Task: Regenerate `SKILL.md`, references, host metadata, and the temporary
      professional compatibility reference. (M-001)
- [ ] Task: Update documentation with profile examples, research disclosures,
      privacy behaviour, migration guidance, and limitations.
- [ ] Task: Decide whether evidence supports retiring
      `SKILL_PROFESSIONAL.md`; retain it if any discovery or downstream gate is
      unresolved. (W-001)
- [ ] Task: Run sync, validation, lint, coverage, tests, official Agent Skills
      validation, cross-platform CI, CodeQL, and hosted exact-revision checks.
- [ ] Task: Reconcile GitHub issues/subissues and Project fields, conduct a
      formal review, and archive the track only after hosted evidence passes.
- [ ] Task: Phase Verification & Checkpoint (Refer to `workflow.md`).

## Handoff artifacts

- Validated document-profile and guidance-source registries.
- Profile classifier and source-precedence resolver.
- Privacy-preserving research gate and source receipts.
- Profile-specific diagnostic and editing contracts.
- Document-type, ambiguity, prompt-injection, and cross-host evaluation corpus.
- Migration evidence for the former Standard/Pro split.

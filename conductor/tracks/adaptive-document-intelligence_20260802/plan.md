# Implementation Plan: Adaptive Document Intelligence

## Phase 1: Contracts, evidence, and migration boundary [checkpoint: 03c6b0b]

GitHub subissue: [#255](https://github.com/edithatogo/authentext/issues/255)

- [x] Task: Review the original `blader/humanizer` and selected current
      Humanizer skills at pinned revisions; incorporate compatible operational
      ideas and record explicit reject decisions. (M-016, M-017, M-018, M-019,
      M-020, M-021, W-006, W-007, W-008, W-009) (commit: cff27cc)

- [x] Task: Write failing tests for one-runtime-skill ownership, profile schema,
      unknown/composite types, confidence, provenance, and source precedence.
      (M-001, M-002, M-003, M-005) (commit: 5391ef6)
- [x] Task: Inventory existing canonical, generated, legacy-looking, and
      non-discoverable source files; resolve `humanizer` identity remnants
      without deleting historical evidence. (M-001, M-011) (commit: 6d49d89)
- [x] Task: Define the machine-readable document-profile, guidance-source,
      conflict, and diagnostic-receipt schemas. (M-002, M-005, M-007, M-014)
      (commit: 5391ef6)
- [x] Task: Verify and record the first-party evidence baseline, scope,
      licensing, freshness, and authority classifications. (M-007)
      (commit: ccfd224)
- [x] Task: Document the `SKILL_PROFESSIONAL.md` compatibility and retirement
      boundary with downstream checks. (M-001, W-001) (commit: 6d49d89)
- [x] Task: Mirror the track and phases as native GitHub issues/subissues in
      Project 36 and update `conductor/github-mapping.json`. (commit: 4d66e01)
- [x] Task: Phase Verification & Checkpoint (Refer to `workflow.md`).
      (commit: 03c6b0b)

## Phase 2: Confidence-aware intake and routing [checkpoint: 7591b8c]

GitHub subissue: [#256](https://github.com/edithatogo/authentext/issues/256)

- [x] Task: Write failing classifier tests for operation, type, subtype,
      purpose, audience, stakes, authority, lifecycle, constraints, strength,
      permission, ambiguity, and composite documents. (M-002, M-003, M-008)
      (commit: b8132fa)
- [x] Task: Write failing tests for pasted, file, and embedded delivery modes,
      capability boundaries, voice-sample calibration, and non-inference.
      (M-016, M-017) (commit: 0830d0b)
- [x] Task: Implement the deterministic profile builder with field-level
      confidence and provenance. (M-002, M-003) (commit: b8132fa)
- [x] Task: Implement material-question logic and conservative fallback without
      mandatory questionnaires. (M-004) (commit: 994a5bb)
- [x] Task: Implement the source-precedence and conflict resolver. (M-005)
      (commit: 5b9bccf)
- [x] Task: Seed correspondence, workplace, public, technical, product,
      academic, health-research, governance, legal, clinical, commercial,
      employment, and narrative profile families. (S-001) (commit: 528f8ec)
- [x] Task: Convert existing domain routing to registry-backed progressive
      disclosure without duplicating module content. (M-011) (commit: 7591b8c)
- [x] Task: Phase Verification & Checkpoint (Refer to `workflow.md`).
      (commit: 7591b8c)

## Phase 3: Governed research and source intelligence [checkpoint: 0aa4149]

GitHub subissue: [#257](https://github.com/edithatogo/authentext/issues/257)

- [x] Task: Write failing privacy tests for research-off defaults, allow-listed
      metadata queries, embedded instructions, secrets, names, citations, and
      sensitive document content. (M-006, M-010) (commit: 0104c54)
- [x] Task: Implement the material-need and permission research gate. (M-006)
      (commit: 0104c54)
- [x] Task: Implement metadata-only query construction and fail-closed source
      ingestion. (M-006, M-010) (commit: 4e11b4f)
- [x] Task: Implement source records with authority, scope, licensing,
      retrieval date, freshness, drift, and supported-check mappings. (M-007,
      S-005) (commit: 18c0b1d)
- [x] Task: Add governed resolvers for project style, technical documentation,
      public content, academic venue, health study type, and named
      jurisdiction or organisation. (S-002, S-003, S-004) (commit: 78f89a9)
- [x] Task: Add a non-publishing guidance-drift receipt and review workflow.
      (C-005) (commit: d6494de)
- [x] Task: Phase Verification & Checkpoint (Refer to `workflow.md`).
      (commit: 0aa4149)

## Phase 4: Diagnostics, editing strength, and safety [checkpoint: 8a2a905]

GitHub subissue: [#258](https://github.com/edithatogo/authentext/issues/258)

- [x] Task: Write failing tests for profile-specific dimensions, source-linked
      findings, safe-fix decisions, and non-applicable checks. (S-007)
      (commit: 8a2a905)
- [x] Task: Write failing tests for structure-first ordering, cluster evidence,
      short-sample limits, language-aware typography, and bounded audit
      termination. (M-018, M-019, M-020, M-021) (commit: 8a2a905)
- [x] Task: Implement the diagnostic pipeline for completeness, structure,
      evidence, accessibility, tone, safety, AI patterns, and preservation.
      (S-007) (commit: 8a2a905)
- [x] Task: Implement review, rewrite, structural, final-pass, and
      research-assisted operations with distinct output contracts. (M-008)
      (commit: 8a2a905)
- [x] Task: Define and implement conservative, standard, and strong change
      budgets. (M-009) (commit: 8a2a905)
- [x] Task: Extend protected-item checks for required sections, sourced rules,
      legal/clinical boundaries, and high-stakes fail-closed behaviour. (M-013)
      (commit: 8a2a905)
- [x] Task: Implement concise assumptions, conflicts, unresolved findings, and
      optional diagnostic receipts. (M-014, S-006)
      (commit: 8a2a905)
- [x] Task: Phase Verification & Checkpoint (Refer to `workflow.md`).
      (commit: 8a2a905)

## Phase 5: Evaluation and document-profile quality [checkpoint: f070702]

GitHub subissue: [#259](https://github.com/edithatogo/authentext/issues/259)

- [x] Task: Build positive, near-miss, negative, ambiguous, composite, and
      adversarial fixtures for at least ten representative subtypes. (M-012)
      (commit: f070702)
- [x] Task: Add task/concept/reference/troubleshooting technical evaluations.
      (S-002)
      (commit: f070702)
- [x] Task: Add study-type routing and minimum-reporting evaluations without
      claiming submission compliance. (S-003, W-004)
      (commit: f070702)
- [x] Task: Add prompt-injection, privacy, source-conflict, and stale-guidance
      adversarial cases. (M-006, M-010, M-013)
      (commit: f070702)
- [x] Task: Add detector-evasion, authorship-inference, invented-specificity,
      artificial-disfluency, and universal-punctuation negative fixtures.
      (W-006, W-007, W-008)
      (commit: f070702)
- [x] Task: Measure restraint, false positives, preservation, requirement
      coverage, change density, and classification calibration separately.
      (S-008)
      (commit: f070702)
- [x] Task: Run supported-host routing and output-similarity evaluations and
      record bounded variance. (M-015)
      (commit: f070702)
- [x] Task: Phase Verification & Checkpoint (Refer to `workflow.md`).
      (commit: f070702)

## Phase 6: Portable skill integration and closeout

GitHub subissue: [#260](https://github.com/edithatogo/authentext/issues/260)

- [x] Task: Update canonical skill fragments with adaptive intake, source
      hierarchy, research gate, untrusted-document boundary, and operation
      routing. (M-001, M-004, M-006, M-008, M-010)
      (commit: 2f1824f)
- [x] Task: Regenerate `SKILL.md`, references, host metadata, and the temporary
      professional compatibility reference. (M-001)
      (commit: 2f1824f)
- [x] Task: Update documentation with profile examples, research disclosures,
      privacy behaviour, migration guidance, and limitations.
      (commit: 2f1824f)
- [x] Task: Decide whether evidence supports retiring
      `SKILL_PROFESSIONAL.md`; retain it if any discovery or downstream gate is
      unresolved. (W-001)
      (commit: 2f1824f; retained pending downstream evidence)
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

## Phase: Review fixes

- [x] Task: Move adaptive intake policy into the canonical source fragment and
      enforce its provenance in integration tests. (commit: db6ad4d)
- [x] Task: Add explicit regression coverage for empty, invalid, and
      zero-denominator evaluator inputs after hosted review. (commit: dbdb632)

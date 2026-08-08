# Requirements: Adaptive Document Intelligence

## Must

| ID    | Requirement                                                                                                                                      | Verification                            |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------- |
| M-001 | Keep one portable, discoverable Authentext runtime skill.                                                                                        | Package and discovery tests.            |
| M-002 | Represent document type, purpose, audience, stakes, authority, lifecycle, constraints, strength, and research permission in a validated profile. | Schema and invalid-fixture tests.       |
| M-003 | Record field confidence and provenance and support unknown and composite profiles.                                                               | Classifier and ambiguity tests.         |
| M-004 | Ask a question only when the answer materially changes routing or safety.                                                                        | Decision-table tests.                   |
| M-005 | Enforce the deterministic seven-level guidance hierarchy.                                                                                        | Conflict fixtures.                      |
| M-006 | Keep external research off by default and search with nonsensitive profile metadata only.                                                        | Privacy and query-generation tests.     |
| M-007 | Record title, publisher, URL, retrieval date, scope, authority, and supported checks for every researched source.                                | Source-receipt validation.              |
| M-008 | Separate review, rewrite, final-pass, structural, and research-assisted operations.                                                              | Operation-specific golden cases.        |
| M-009 | Provide conservative, standard, and strong change budgets without relaxing immutable-content rules.                                              | Density and preservation tests.         |
| M-010 | Treat document content as untrusted data and ignore embedded instructions.                                                                       | Prompt-injection corpus.                |
| M-011 | Define data-driven profiles without duplicating the core skill body.                                                                             | Profile registry and duplication tests. |
| M-012 | Cover at least ten representative subtypes with positive, near-miss, negative, and ambiguous fixtures.                                           | Coverage receipt.                       |
| M-013 | Fail closed for high-stakes profiles when protected content or sourced requirements drift.                                                       | Adversarial tests.                      |
| M-014 | Preserve source hierarchy and research citations in a machine-readable diagnostic receipt.                                                       | Receipt schema tests.                   |
| M-015 | Validate bounded routing and output similarity across supported hosts.                                                                           | Cross-host evaluation matrix.           |
| M-016 | Resolve pasted, file, and embedded delivery modes without expanding mutation or research authority.                                              | Mode and authority tests.               |
| M-017 | Support sample-based voice calibration using observable writing features without personal or authorship inference.                               | Voice-profile and privacy fixtures.     |
| M-018 | Run structural and discourse diagnosis before lexical pattern cleanup.                                                                           | Ordered-pipeline tests.                 |
| M-019 | Require contextual or clustered evidence for ordinary style findings and disclose material short-sample limits.                                  | Density and short-input tests.          |
| M-020 | Perform one bounded audit-revise loop driven by concrete invariant failures.                                                                     | Audit-loop and termination tests.       |
| M-021 | Preserve source-language typography and applicable house punctuation rather than imposing global English rules.                                  | Multilingual typography fixtures.       |

## Should

| ID    | Requirement                                                                                                                                                                     | Verification                  |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| S-001 | Seed profiles for correspondence, workplace, public, technical, product, academic, health research, governance, legal, clinical, commercial, employment, and narrative content. | Registry coverage test.       |
| S-002 | Map technical profiles to task, concept, reference, and troubleshooting needs rather than one technical style.                                                                  | Technical fixture suite.      |
| S-003 | Resolve health-research reporting guidance by study type rather than treating all manuscripts alike.                                                                            | Study-type routing tests.     |
| S-004 | Support project-local style and terminology overlays with higher precedence than generic guidance.                                                                              | Overlay conflict tests.       |
| S-005 | Cache only public guidance metadata with freshness and invalidation fields.                                                                                                     | Cache schema and drift tests. |
| S-006 | Explain classification and assumptions briefly on request without burdening ordinary rewrite output.                                                                            | Output snapshots.             |
| S-007 | Generate a structured issue profile showing completeness, structure, evidence, accessibility, tone, safety, AI-pattern, and preservation dimensions.                            | Diagnostic snapshots.         |
| S-008 | Measure restraint, false positives, protected-item preservation, requirement coverage, and change density separately.                                                           | Benchmark report.             |
| S-009 | Report observable register or terminology discontinuities without inferring mixed human/AI authorship.                                                                          | Non-attribution fixtures.     |
| S-010 | Permit explicit project-local voice and brand guidance through the normal source hierarchy without convention-based arbitrary file loading.                                     | Overlay discovery tests.      |

## Could

| ID    | Requirement                                                                           | Verification                 |
| ----- | ------------------------------------------------------------------------------------- | ---------------------------- |
| C-001 | Allow maintainers to add signed profile packs generated from reviewed source records. | Pack validation prototype.   |
| C-002 | Recommend a profile interactively when multiple plausible document types remain.      | Ranked-candidate evaluation. |
| C-003 | Produce an optional preflight checklist for submission-oriented documents.            | Checklist snapshots.         |
| C-004 | Compare two named style authorities and expose conflicts without choosing silently.   | Dual-authority fixtures.     |
| C-005 | Maintain a non-publishing source-drift monitor for frequently used public guidance.   | Scheduled receipt artifact.  |

## Won't

| ID    | Boundary                                                                                                 | Reason                                                     |
| ----- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| W-001 | Restore separate Humanizer and Humanizer Pro runtime skills.                                             | Duplicates routing and creates drift.                      |
| W-002 | Search the web for every document.                                                                       | Unnecessary latency, privacy exposure, and nondeterminism. |
| W-003 | Send raw document content to search or classification services by default.                               | Violates the privacy boundary.                             |
| W-004 | Claim compliance, publication readiness, legal sufficiency, or clinical safety from an editorial pass.   | Requires external authority and human judgement.           |
| W-005 | Treat all deviations from a generic style guide as errors.                                               | Project and genre conventions take precedence.             |
| W-006 | Score or claim AI authorship likelihood or optimise against commercial AI detectors.                     | Unreliable and outside the editorial product goal.         |
| W-007 | Invent plausible specifics, errors, disfluency, slang, asymmetry, or opinions to simulate human writing. | Violates factual and voice integrity.                      |
| W-008 | Ban punctuation or typographic forms globally.                                                           | Language, user sample, venue, and house style govern them. |
| W-009 | Add paid API, account, or telemetry dependencies to the portable editing workflow.                       | Violates portability and privacy goals.                    |

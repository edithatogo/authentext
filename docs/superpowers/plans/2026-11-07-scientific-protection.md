# Scientific protection implementation plan

> Agentic workers: execute with superpowers:executing-plans, test first, and preserve the verification ledger.

**Goal:** Deliver offline structural protection and bounded discourse review on top of a working v3.3 foundation.

**Architecture:** Format-aware lexical span locking, independent prose telemetry and claim-alignment heuristics. All source skill changes are compiled; runtime files are explicitly allow-listed for packaging and static checks.

**Tech stack:** Node.js 24, built-in modules, existing Node tests and GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-11-07-scientific-protection-design.md`

## Global constraints

No runtime installation, no document egress, no model calls by default, LF repository files and POSIX manifest paths. Preserve document bytes. No new uncalibrated em dash in guidance. No automated publication or unreviewed self-modification.

## Review focus

1. Nested delimiters, quoted code, escaped dollars and comments must not reveal executable content.
2. Token collisions, missing/unknown/duplicate tokens, raw syntax injection and modified sidecars must fail before output is written.
3. Negated or hedged causal expressions must not be classified as unconditional certainty; split/merged and ambiguous claims need explicit handling.
4. CRLF, decomposed Unicode, relative paths, symlinks and output/input aliases must not corrupt inputs or private evidence.
5. Built package CLIs must work without node_modules; manifest traversal and stale generated content must be rejected.

## Tasks and gates

- [ ] Foundation: reproduce and fix PR #325 metadata, lint, metric and packaging failures. Add regressions for byte fidelity, units/currency and CLI misuse. Run the full suite.
- [ ] Protect: implement `maskDocument` / `unmaskDocument` and CLI wrappers. Test qmd/rmd/md/typ/tex round trips, nested syntax, injected syntax, collisions, checksum drift and non-destructive failures.
- [ ] Verify: implement sentence spans, conservative alignment, epistemic/scope/negation checks, concessive polarity and line-accurate density telemetry. Test the user examples plus low-confidence, no-edit and split/merged cases.
- [ ] Calibrate/Learn: validate structural profiles, pair documents, maintain safety instructions in each ablation and document unmeasured quality. Test real adapter plumbing with a local mock only.
- [ ] Govern/Distribute: regenerate all skill surfaces and card; package the reviewed runtime closure; test hostile manifests and invoke installed tools. Reconcile canonical and legacy distribution documentation.
- [ ] Review and publish changes: run all local and hosted gates, record evidence, merge only verified PR heads. No release tag.

## Execution slicing

PR #325 already combines Tracks 1-4. Finish and verify that existing foundation
rather than discard its review history. Put Tracks 5-6 in a separate follow-on PR,
then use a final calibration/distribution closeout PR where necessary. This is an
implementation ruling, not a claim that the initial PR was already verified.

# Authentext document safety implementation plan

> Execute using superpowers:executing-plans, with regression tests before fixes.

**Goal:** Complete the unmerged frontier tooling and add format-aware protection
and auditable discourse checks.

**Architecture:** Keep generated skill guidance separate from optional offline
runtime tools. Use a conservative lexical shield and deterministic diagnostics.

**Tech stack:** Node.js 24, built-in modules, node:test, existing CI toolchain.

**Spec:** ../specs/2026-11-07-document-safety-design.md

## Global constraints

No new runtime packages, no egress, LF source files and POSIX manifest paths.
No new decorative em dashes. Preserve exact protected document bytes.

## Review focus

Nested/escaped syntax; tampered and duplicated placeholders; ambiguous claim
alignment; negated and qualified causal language; private data in profiles and
packaged artifacts. Add negative and round-trip tests for each.

## Task 1: Stabilise inherited PR 325 (Slice A foundation)

- [x] Reproduce all inherited lint, version and test failures.
- [x] Correct source/manifests and version assertions without weakening checks.
- [x] Run sync, validate, full tests, lint and generated-drift check.
- [x] Record scope and validation; commit the repaired foundation.

## Task 2: Scientific/technical masking (Slice B)

Create scripts/lib/ast-shield.js, scripts/mask-ast.js, scripts/unmask-ast.js,
fixtures and test/ast-shield.test.js. Interfaces: maskDocument(text, format)
returns masked/lockfile; unmaskDocument(masked, lockfile, options) returns text.

- [x] Write and run failing round-trip, nested grammar, tamper and CLI tests.
- [x] Implement bounded scanning, role tokens, SHA-256 and integrity checks.
- [x] Pass tests and include all runtime closure files in package allowlists.

## Task 3: Discourse and local density (Slice B)

Create scripts/lib/epistemic-discourse.js and test/epistemic-discourse.test.js;
modify verify-rewrite.js. Interface: inspectDiscourse(original, rewrite)
returns epistemicDrift, polarityInversion, flatEntropySpans and alignment notes.

- [x] Fail tests on associative-to-causal, concession inversion and scope loss.
- [x] Add positive controls for retained hedges and negated causal statements.
- [x] Implement transparent heuristics and line-accurate density warnings.
- [x] Wire sources, schema, compiler, runtime packaging and documentation.

## Task 4: Calibration and evaluation hardening (Slice C)

Harden calibrate-voice.js, frontier-text.js, experiments/ablation-harness.js and
SKILL_CARD.json governance. Preserve fixture/real-execution distinctions.

- [ ] Test privacy, malformed profiles, pair matching and no-op controls.
- [ ] Test actual pattern slices, safety-prefix retention and local adapters.
- [ ] Add benchmark protocol and honest metric/uncertainty reporting.
- [ ] Enforce transitive runtime allowlist and test security/budget failures.

## Task 5: Review and integration

- [ ] Run full local and hosted checks on the exact candidate revisions.
- [ ] Review full branch diff, generated outputs and built package contents.
- [ ] Merge only passing PRs; update the distribution compatibility README.
- [ ] Report exact merged commits and limitations; do not tag a release.

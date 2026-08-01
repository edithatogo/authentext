# Implementation Plan: Post-Release Security and Quality Frontier

- Track: `post-release-security-quality-frontier_20260801`
- Requirements: [`requirements.md`](./requirements.md)
- Design: [`design.md`](./design.md)
- Portfolio issue: [#65](https://github.com/edithatogo/authentext/issues/65)

Tasks move from `[ ]` to `[~]` to `[x]` only with repository and hosted
evidence. Each phase is mirrored by a native GitHub subissue.

## Phase 1: Dependency and runtime consolidation [checkpoint: 4417398]

- [x] Add failing guardrails for Node 24 and dependency-engine compatibility.
      (M-001, M-008)
- [x] Update maintained workflows and declared tooling baseline to Node 24.
      (M-001, M-004)
- [x] Reproduce and review PR #219's dependency set on current `main`.
      (M-002, M-003)
- [x] Run audit, sync, validation, lint, type, tests, and host/portable checks.
      (M-003–M-006, S-001)
- [x] Verify the exact revision on Linux, macOS, Windows, and CodeQL.
- [x] Close or supersede overlapping PRs #50, #53, and #62 with evidence.
      (M-002)
- [x] Phase verification and checkpoint per `conductor/workflow.md`.

## Phase 2: Measured quality frontier [checkpoint: 4417398]

- [x] Inventory existing property, contract, behavioral, and integration tests.
      (M-007, S-002, S-003, C-003)
- [x] Add a failing test for deterministic machine-readable coverage output.
- [x] Implement Node-native coverage across the real aggregate test corpus.
      (M-007)
- [x] Extend property tests where current invariant coverage is weak. (S-003)
- [x] Evaluate mutation tooling against maintained JavaScript and record a
      bounded adopt/exclude decision. (S-002, C-004)
- [x] Upload a quality summary artifact; add Codecov OIDC only if hosted setup
      is verified. (S-005, C-002)
- [x] Phase verification and checkpoint per `conductor/workflow.md`.

## Phase 3: Solo-maintainer security controls [checkpoint: 4417398]

- [x] Inventory current rulesets, automation actors, templates, and security
      context. (M-009, S-004)
- [x] Add failing validation for warranted repository-owned context files.
- [x] Add missing contribution/issue/PR context without legacy installer claims.
      (S-004)
- [x] Implement the least restrictive ruleset that blocks destructive pushes
      and requires stable automated checks without human approvals. (M-010)
- [x] Verify hosted ruleset behavior and owner recovery.
- [x] Verify Renovate access before any Dependabot removal; otherwise retain
      Dependabot and record the external gate. (M-011, S-006)
- [x] Phase verification and checkpoint per `conductor/workflow.md`.

## Phase 4: Backlog, roadmap, and GitHub reconciliation [checkpoint: 4417398]

- [x] Reconcile issue #54 against the final audit and install-surface contract.
- [x] Reconcile issues #57–#59 against merged files, tests, and hosted runs.
      (M-012)
- [x] Keep or route issue #61 based on its product-scope evidence.
- [x] Rewrite `conductor/roadmap.md` for the post-3.2.0 frontier. (S-007)
- [x] Verify native issue/subissue hierarchy and Project 36 fields. (M-013)
- [x] Refresh the deterministic GitHub mapping receipt.
- [x] Phase verification and checkpoint per `conductor/workflow.md`.

## Phase 5: Final verification and governed handoff [checkpoint: 4417398]

- [x] Run full local, official Agent Skills, audit, coverage, and Conductor
      gates.
- [x] Run formal Conductor review and resolve findings.
- [x] Verify hosted CI on the exact final revision.
- [x] Record external gates for Renovate, Codecov, publication, or credentials.
      (M-014)
- [x] Archive the track only after repository and hosted evidence agree.
- [x] Phase verification and checkpoint per `conductor/workflow.md`.

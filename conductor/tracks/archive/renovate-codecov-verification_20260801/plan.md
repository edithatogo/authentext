# Plan: Renovate and Codecov Verification

## Phase 1: Repository integration [checkpoint: ed741b8]

- [x] Add failing integrity tests for Renovate fallback and Codecov OIDC.
- [x] Inherit the shared Renovate preset and remove obsolete legacy rules.
- [x] Add pinned Codecov OIDC upload without replacing native evidence.
- [x] Run validation, coverage, audit, and full tests.
- [x] Phase verification and checkpoint per `conductor/workflow.md`.

## Phase 2: Hosted verification (deferred by owner)

- [x] Verify the pull-request matrix and Codecov upload result.
- [x] Record owner-reported Renovate App installation and repository onboarding
      state.
- [x] Add a scheduled, non-blocking hosted-evidence monitor with deterministic
      tests and artifact output.
- [x] Defer Renovate App onboarding verification by owner decision; retain Dependabot as the supported updater.
- [x] Retain Dependabot because Renovate is not yet proven healthy.
- [x] Record external authorization blockers without overstating completion.
- [x] Formal review and governed archive.
- [x] Phase verification and checkpoint per `conductor/workflow.md`.

Hosted receipts and the owner decision to defer Mend Renovate are recorded in
[`evidence.md`](./evidence.md). Dependabot remains the active repository-controlled
dependency update path.

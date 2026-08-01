# Plan: Renovate and Codecov Verification

## Phase 1: Repository integration

- [ ] Add failing integrity tests for Renovate fallback and Codecov OIDC.
- [ ] Inherit the shared Renovate preset and remove obsolete legacy rules.
- [ ] Add pinned Codecov OIDC upload without replacing native evidence.
- [ ] Run validation, coverage, audit, and full tests.
- [ ] Phase verification and checkpoint per `conductor/workflow.md`.

## Phase 2: Hosted verification

- [ ] Verify the pull-request matrix and Codecov upload result.
- [ ] Verify Renovate app access and a Dashboard or pull request.
- [ ] Remove Dependabot only if Renovate is proven healthy.
- [ ] Record external authorization blockers without overstating completion.
- [ ] Formal review and governed archive.
- [ ] Phase verification and checkpoint per `conductor/workflow.md`.

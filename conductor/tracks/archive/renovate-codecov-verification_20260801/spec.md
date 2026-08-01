# Specification: Renovate and Codecov Verification

## Outcome

Convert the two external options left by the security frontier into verified
integrations or explicit hosted blockers without creating an update-coverage
gap or weakening repository-controlled coverage evidence.

## Requirements

- Inherit `github>edithatogo/renovate-config` using a current valid repository
  configuration.
- Retain Dependabot until Renovate proves access with a Dependency Dashboard or
  pull request.
- Upload existing LCOV through pinned Codecov v5 using GitHub OIDC and minimum
  job permissions, while retaining local thresholds and CI artifacts.
- Treat app installation, organization authorization, and hosted onboarding as
  external state that must be verified before completion.
- Do not release or publish the Authentext skill.

## Acceptance

- Tests fail if OIDC, the pinned action, the inherited preset, or the fallback
  update bot is removed prematurely.
- Local validation, audit, coverage, and hosted CI pass.
- Renovate and Codecov hosted state is evidenced, or the exact remaining UI
  authorization step is recorded without a false completion claim.

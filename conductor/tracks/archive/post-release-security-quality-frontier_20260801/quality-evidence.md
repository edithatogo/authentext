# Phase 2 Quality Evidence

Date: 2026-08-01

## Test inventory

The maintained suite contains contract tests for Agent Skills and host overlays,
behavioral trigger/output evaluations, golden and taxonomy fixtures, deterministic
generation and reconciliation tests, workflow integrity checks, upstream triage,
integration checks, and generated mixed-input literal-preservation properties.

The aggregate Node suite exercises 19 test files after adding the coverage
contract. Python-era compatibility checks remain in the integration runner, but
the maintained implementation and quality tooling are Node-based.

## Coverage baseline

`npm run test:coverage` uses Node 24's native test coverage, writes LCOV and a
stable JSON summary under the ignored `coverage/` directory, and fails below
these non-regression floors:

- lines: 75%
- functions: 80%
- branches: 60%

Observed baseline on 2026-08-01:

- 8 maintained script files
- lines: 511/658 (77.66%)
- functions: 30/36 (83.33%)
- branches: 70/107 (65.42%)

CI uploads the LCOV and JSON files as the `node-coverage` artifact.

## Property and mutation decision

Literal preservation already has generated mixed-input property coverage and a
fail-closed placeholder corruption case. The remaining tools primarily compile,
validate, reconcile, or render repository files, for which their existing
contract and fixture tests provide clearer failure evidence than additional
random generators.

Mutation tooling is not adopted in this phase. The executable surface is small,
filesystem-heavy, and includes process-spawning integration scripts; introducing
a third-party mutation runtime would materially expand the dependency and
configuration surface before identifying a mutation-specific blind spot. This
decision should be revisited if maintained transformation logic grows.

Codecov is also not enabled. Native LCOV, JSON, threshold enforcement, and a
hosted artifact provide repository-controlled evidence without an external app
or token/OIDC configuration. Codecov remains an optional future enhancement if
cross-PR trend visualization becomes worth that external dependency.

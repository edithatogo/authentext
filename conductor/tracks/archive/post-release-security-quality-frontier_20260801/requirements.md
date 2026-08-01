# MoSCoW Requirements: Post-Release Security and Quality Frontier

## Must

| ID    | Requirement                                                                                       | Evidence                                   |
| ----- | ------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| M-001 | Use a supported Node 24 LTS maintenance and CI baseline.                                          | Manifests, workflows, hosted matrix.       |
| M-002 | Treat PR #219 and overlapping dependency PRs as one dependency graph.                             | PR decision record and final lockfile.     |
| M-003 | Resolve supported npm audit fixes without `--force`.                                              | Before/after audit receipts.               |
| M-004 | Preserve deterministic generated outputs across platforms.                                        | Sync and cross-platform checks.            |
| M-005 | Preserve portable Agent Skills and host-overlay validation.                                       | Official validator and host checks.        |
| M-006 | Run every existing test in isolation and aggregate.                                               | Test receipts.                             |
| M-007 | Measure coverage from the real Node test corpus.                                                  | Machine-readable coverage artifact.        |
| M-008 | Test dependency/runtime guardrails before implementing changes.                                   | Red/green regression evidence.             |
| M-009 | Inventory automation actors before changing rulesets or dependency bots.                          | Hosted inventory receipt.                  |
| M-010 | Preserve solo-maintainer operation without mandatory reviewers.                                   | Ruleset inspection and hosted validation.  |
| M-011 | Keep dependency-update coverage continuous during bot rationalization.                            | Hosted Dependabot/Renovate evidence.       |
| M-012 | Reconcile issues #54 and #57–#59 using repository and hosted evidence.                            | Issue comments/states and mapping receipt. |
| M-013 | Mirror the track and phases as native GitHub issues/subissues in Project 36.                      | Mapping and relationship receipt.          |
| M-014 | Keep release, publication, app installation, and credential decisions as explicit external gates. | Plan and handoff receipt.                  |

## Should

| ID    | Requirement                                                          | Evidence                             |
| ----- | -------------------------------------------------------------------- | ------------------------------------ |
| S-001 | Reach zero npm audit findings.                                       | `npm audit --json`.                  |
| S-002 | Add actionable mutation testing for maintained JavaScript.           | Mutation report and bounded runtime. |
| S-003 | Extend property tests for compiler and literal invariants.           | Deterministic property suite.        |
| S-004 | Add missing issue and pull-request contribution context.             | Templates and validation.            |
| S-005 | Upload coverage with Codecov OIDC if hosted setup is available.      | Hosted status, not YAML alone.       |
| S-006 | Adopt inherited Renovate configuration after app access is verified. | Dependency Dashboard or real PR.     |
| S-007 | Refresh the roadmap around the post-3.2.0 frontier.                  | Updated roadmap and Project fields.  |

## Could

| ID    | Requirement                                                             | Evidence                  |
| ----- | ----------------------------------------------------------------------- | ------------------------- |
| C-001 | Add a scheduled dependency/audit drift receipt.                         | Scheduled hosted run.     |
| C-002 | Add a compact quality summary artifact to CI.                           | Downloadable receipt.     |
| C-003 | Add contract tests for generated host metadata and workflow interfaces. | Contract suite.           |
| C-004 | Add mutation thresholds after a stable baseline is measured.            | Reviewed baseline.        |
| C-005 | Add a Project view for current security and quality work.               | Hosted view verification. |

## Won't this track

| ID    | Exclusion                                                | Reason                                   |
| ----- | -------------------------------------------------------- | ---------------------------------------- |
| W-001 | Use `npm audit fix --force`.                             | Avoid unreviewed breaking graph changes. |
| W-002 | Require a second reviewer, CODEOWNERS, or team approval. | Preserve solo-maintainer operation.      |
| W-003 | Remove Dependabot before Renovate is proven active.      | Avoid an update-coverage gap.            |
| W-004 | Reintroduce legacy adapters/installers.                  | Outside maintained product contract.     |
| W-005 | Release or publish a new version automatically.          | Requires a separate explicit gate.       |

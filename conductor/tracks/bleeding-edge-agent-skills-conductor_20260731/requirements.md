# MoSCoW Requirements

These requirements are normative for
`bleeding-edge-agent-skills-conductor_20260731` and are coordinated through
[GitHub track #66](https://github.com/edithatogo/authentext/issues/66).

## Must

| ID    | Requirement                                                                                                                                                 | Verification                                                  |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| M-001 | The compiler must emit parseable YAML frontmatter on every generated skill.                                                                                 | Parse generated files with at least two YAML implementations. |
| M-002 | Portable frontmatter must use standard keys and store version as `metadata.version`.                                                                        | Official Agent Skills validation passes.                      |
| M-003 | The portable skill must not declare broad or host-specific `allowed-tools`; any future use must be a space-separated experimental string in a host overlay. | Frontmatter snapshot and negative test.                       |
| M-004 | `compatibility` must be omitted unless a concrete runtime dependency is required and tested.                                                                | Manifest assertion.                                           |
| M-005 | Exactly one discoverable Authentext runtime skill must be authoritative; professional routing must be internal or separately packaged.                      | Package tree and discovery test.                              |
| M-006 | Generated output must preserve code, URLs, paths, identifiers, citations, hashes, commands, flags, and quoted error text exactly.                           | Property and fixture-based output tests.                      |
| M-007 | Every test file must run both in isolation and in the aggregate without process-wide early exits masking failures.                                          | Isolated and aggregate test matrix.                           |
| M-008 | LF/CRLF differences must not make a clean generated tree appear dirty.                                                                                      | Windows and Linux sync checks.                                |
| M-009 | CI and release workflows must parse as YAML and reference only maintained paths.                                                                            | Workflow parser and path-integrity test.                      |
| M-010 | Trigger evaluations must cover positive requests, paraphrases, ambiguous near-misses, and unrelated negatives.                                              | Versioned trigger-eval report.                                |
| M-011 | Output evaluations must exercise actual rewriting, restraint on human text, voice/stance preservation, and literal invariants.                              | Versioned output-eval report.                                 |
| M-012 | Progressive disclosure must route by task and give long references navigation without loading the full catalog by default.                                  | Reference-size and routing assertions.                        |
| M-013 | Package name, skill name, versions, license, and distribution docs must agree or explicitly document distinct roles.                                        | Cross-file identity test.                                     |
| M-014 | Official Agent Skills validation and `gh skill publish --dry-run` must be CI gates.                                                                         | Hosted run evidence.                                          |
| M-015 | Conductor must have an index, registry, roadmap, specification, MoSCoW requirements, Mermaid design, plan, metadata, and track index.                       | Conductor integrity check.                                    |
| M-016 | Every historical Conductor track and phase must map idempotently to a GitHub issue/native subissue and Project 36 item.                                     | Mapping registry plus GraphQL reconciliation.                 |
| M-017 | Tags, releases, registry publication, and other public distribution must remain explicit approval gates.                                                    | Workflow permissions and release checklist.                   |

## Should

| ID    | Requirement                                                                                                           | Verification                                        |
| ----- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| S-001 | Generate optional OpenAI presentation metadata in `agents/openai.yaml` without MCP dependencies.                      | Schema and snapshot test.                           |
| S-002 | Add `.gitattributes` and compiler newline normalization for deterministic generated artifacts.                        | Cross-platform clean-sync matrix.                   |
| S-003 | Add a durable, dry-run-first script for Conductor/GitHub issue and Project reconciliation.                            | Idempotency test against fixtures and live dry run. |
| S-004 | Add tables of contents to reference files over 100 lines.                                                             | Documentation validation.                           |
| S-005 | Separate portable validation, host-overlay validation, and distribution-preview jobs.                                 | CI job graph inspection.                            |
| S-006 | Align npm and Python maintenance metadata with the Authentext identity and MIT license, or remove an unused manifest. | Package metadata test.                              |
| S-007 | Record exact upstream Conductor main commit, release tag, Gemini CLI version, and experimental flags.                 | Compatibility-profile freshness check.              |
| S-008 | Publish machine-readable evaluation summaries as CI artifacts.                                                        | Hosted artifact inspection.                         |

## Could

| ID    | Requirement                                                                                                                         | Verification                               |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| C-001 | Generate host-specific argument hints where supported.                                                                              | Overlay schema tests.                      |
| C-002 | Package a separate long-document audit skill with isolated context only if evaluations justify it.                                  | Comparative context and quality benchmark. |
| C-003 | Provide Claude, Cursor, Gemini, and Codex overlays from the same canonical source without maintaining adapter bundles in this repo. | Generated overlay equivalence tests.       |
| C-004 | Add mutation and property testing for the compiler and literal-preservation logic.                                                  | Scheduled quality-lane evidence.           |
| C-005 | Add Project views for current roadmap, history, Must requirements, and experimental work.                                           | Project view inspection.                   |
| C-006 | Automate upstream-spec drift detection with pinned, reviewable update pull requests.                                                | Scheduled dry-run report.                  |
| C-007 | Add a benchmark dashboard for trigger precision, restraint, and invariant preservation.                                             | Reproducible benchmark artifact.           |

## Won't in this track

| ID    | Requirement                                                                                     | Reason                                                      |
| ----- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| W-001 | Adopt the proposed `skills.json` manifest.                                                      | It is an RFC, not the current Agent Skills standard.        |
| W-002 | Put `context: fork` in the core skill.                                                          | It is host-specific and costly for normal rewrites.         |
| W-003 | Put Claude-only model, effort, agent, background, hook, or path fields in portable frontmatter. | These would break portability.                              |
| W-004 | Restore legacy adapter bundles or installation shims to the maintained surface.                 | The repository contract excludes compatibility bundles.     |
| W-005 | Treat `allowed-tools` as a stable cross-host permission contract.                               | The field is explicitly experimental.                       |
| W-006 | Automatically tag, release, publish, or submit the skill.                                       | External publication requires a separate explicit approval. |

## Audit traceability

| Finding                                                    | Covered by                        |
| ---------------------------------------------------------- | --------------------------------- |
| Invalid generated YAML and misplaced version               | M-001, M-002                      |
| Invalid/broad `allowed-tools` and misleading compatibility | M-003, M-004                      |
| Two root skill files and discovery ambiguity               | M-005                             |
| Literal-preservation contract                              | M-006                             |
| Stale tests, CRLF drift, and masked process exits          | M-007, M-008                      |
| Invalid/stale release workflow                             | M-009                             |
| Weak trigger and output evaluation                         | M-010, M-011                      |
| Weak progressive disclosure                                | M-012, S-004                      |
| Name/version/license/documentation drift                   | M-013, S-006                      |
| Missing official and GitHub preview gates                  | M-014                             |
| Partial Conductor setup and missing hosted hierarchy       | M-015, M-016                      |
| Optional OpenAI metadata and host overlays                 | S-001, C-001, C-003               |
| Experimental Agent Skills and Gemini options               | M-003, S-007, W-002, W-003, W-005 |
| Proposed dependency manifest                               | W-001                             |
| External release boundary                                  | M-017, W-006                      |

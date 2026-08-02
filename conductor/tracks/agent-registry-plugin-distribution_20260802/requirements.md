# MoSCoW Requirements: Agent Registry and Plugin Distribution

## Must

| ID    | Requirement                                                                                                                       | Verification                                     |
| ----- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| M-001 | Keep `src/` and generated root skill artifacts as the only editorial source of truth.                                             | Sync-clean test and package hash receipt.        |
| M-002 | Maintain a dated registry/host matrix with explicit package and publication types.                                                | Schema validation and review.                    |
| M-003 | Validate the portable skill with the reference validator, GitHub publication dry-run, and skills CLI discovery.                   | CI logs and receipts.                            |
| M-004 | Update the stale VoltAgent `blader/humanizer` entry or record a durable maintainer disposition.                                   | External PR/issue URL.                           |
| M-005 | Establish and verify the `edithatogo/authentext` listing on skills.sh.                                                            | Catalog URL, install receipt, and snapshot hash. |
| M-006 | Publish/verify Authentext through GitHub's native Agent Skills channel for Copilot.                                               | `gh skill publish` and preview/install evidence. |
| M-007 | Generate and validate a skill-only Claude plugin and marketplace entry without apps, hooks, MCP, or telemetry.                    | Claude validator and clean-install test.         |
| M-008 | Generate and validate a skill-only Codex/ChatGPT plugin/import package using current supported tooling.                           | Package validator/import receipt.                |
| M-009 | Generate and validate a Gemini CLI extension that bundles the canonical skill.                                                    | Gemini extension validation/install receipt.     |
| M-010 | Verify OpenCode native skill discovery and explicitly gate npm plugin creation on added runtime value.                            | OpenCode smoke test and feasibility decision.    |
| M-011 | Verify portable installation on Cursor, Windsurf, Cline, AiderDesk, AMP, and other supported targets without checked-in adapters. | Installer matrix receipt.                        |
| M-012 | Submit to approved secondary directories only after validation and explicit publication approval.                                 | Submission and acceptance receipts.              |
| M-013 | Add deterministic drift tests for identity, version, links, manifests, licenses, hashes, and status claims.                       | Failing-then-passing tests.                      |
| M-014 | Keep external submissions, uploads, npm publication, tags, and releases behind explicit approval gates.                           | Workflow permissions and plan checkpoints.       |
| M-015 | Mirror the track and each phase as a GitHub issue/native subissue in Project 36.                                                  | Mapping and relationship receipt.                |
| M-016 | Repair stale Conductor links and reconcile the previous Renovate track's archived/closed state.                                   | Conductor validation and mapping receipt.        |

## Should

| ID    | Requirement                                                                                     | Verification                                  |
| ----- | ----------------------------------------------------------------------------------------------- | --------------------------------------------- |
| S-001 | Use a dedicated generated distribution repository or release-staging process for host packages. | Architecture decision and reproducible build. |
| S-002 | Pin marketplace packages to immutable tags or SHAs where supported.                             | Manifest inspection.                          |
| S-003 | Add registry badges and install commands only after the corresponding listing is verified.      | Link checker and hosted receipt.              |
| S-004 | Submit to one reviewed independent directory plus selected auto-sync directories.               | Registry matrix disposition.                  |
| S-005 | Add a scheduled non-publishing drift monitor with a JSON artifact.                              | Hosted workflow run.                          |
| S-006 | Provide removal, deprecation, rename, and compromised-release procedures.                       | Distribution runbook review.                  |
| S-007 | Record security-audit results without treating third-party scans as endorsements.               | Evidence document.                            |

## Could

| ID    | Requirement                                                                                 | Verification                                       |
| ----- | ------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| C-001 | Submit the Claude skill-only plugin to Anthropic's official directory.                      | Submission receipt.                                |
| C-002 | Submit the Gemini extension to the official Gemini extension gallery.                       | Gallery receipt.                                   |
| C-003 | Publish to SkillsMD, skillsdir.dev, agentskill.sh, and skills.re when trust checks pass.    | Accepted listing URLs.                             |
| C-004 | Add OpenCode HTTP catalog metadata for teams that do not use generic skills installers.     | Catalog smoke test.                                |
| C-005 | Add supply-chain attestations or signed provenance to generated distribution artifacts.     | Attestation verification.                          |
| C-006 | Publish an OpenCode npm plugin if the feasibility gate identifies necessary hooks or tools. | Approved design, npm provenance, and install test. |

## Won't

| ID    | Requirement                                                                      | Rationale                                               |
| ----- | -------------------------------------------------------------------------------- | ------------------------------------------------------- |
| W-001 | Maintain copied skill bodies in host adapter directories.                        | Violates the canonical generated architecture.          |
| W-002 | Create apps, MCP servers, hooks, or broad permissions for a skill-only workflow. | Adds unjustified capability and risk.                   |
| W-003 | Publish an OpenCode npm package solely as an installation shim.                  | Native Agent Skills already satisfy the use case.       |
| W-004 | Submit to every scraped or newly launched registry.                              | Creates unverifiable supply-chain and maintenance debt. |
| W-005 | Treat a prepared package, submitted form, or open PR as an accepted listing.     | Hosted acceptance evidence is required.                 |
| W-006 | Rewrite archived historical evidence to imply current publication.               | Historical receipts remain immutable.                   |

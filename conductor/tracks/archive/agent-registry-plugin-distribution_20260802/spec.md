# Track Specification: Agent Registry and Plugin Distribution

## Overview

Distribute Authentext as a current, portable Agent Skill and, where a host has
a genuine plugin system, as a host-native skill-only plugin or extension. The
canonical `SKILL.md` and `references/` remain generated from `src/`; registry
metadata, plugin manifests, marketplace entries, and submission receipts must
never become competing editorial sources.

The track covers discovery, packaging, validation, submission, update
automation, and hosted proof across the relevant Agent Skills and plugin
ecosystems. It also replaces the stale `blader/humanizer` directory identity
with `edithatogo/authentext` wherever maintainers permit updates.

## Classification

- **Type:** Chore / distribution
- **Priority:** P1
- **Track ID:** `agent-registry-plugin-distribution_20260802`
- **GitHub Project:** Authentext Conductor Roadmap, Project 36

## Problem Statement

Authentext 3.2.0 is released and directly installable from GitHub, but external
discovery is fragmented:

- VoltAgent's curated entry still points to `blader/humanizer`.
- `skills.sh` can resolve the repository through its CLI, but Authentext lacks
  a verified current catalog receipt.
- no durable submission receipts exist for the other reviewed directories;
- Claude, Codex/ChatGPT, Gemini CLI, GitHub Copilot, and OpenCode use different
  meanings of “skill,” “plugin,” “extension,” and “marketplace”;
- no governed process currently refreshes listings when Authentext releases.

## Goals

1. Publish the canonical portable skill through the principal cross-agent
   discovery channels.
2. Package it as a skill-only plugin for hosts where plugins are the supported
   distribution unit.
3. Submit generated host packages to official directories when a documented
   third-party submission route exists.
4. Record unsupported or closed publication channels explicitly.
5. Add deterministic validation, drift detection, and release-time update
   receipts.
6. Keep all public claims evidence-bound and reversible.

## Functional Requirements

### Portable distribution

- Preserve the repository root as the canonical Agent Skills package.
- Validate with the Agent Skills reference validator, `gh skill publish
--dry-run`, and `npx skills add ... --list`.
- Publish or update listings in the approved registry matrix.
- Replace predecessor naming only when the destination accepts updates or
  redirects; do not claim control of `blader/humanizer`.

### Host-native distribution

- **Claude:** produce and validate a skill-only Claude plugin plus marketplace
  metadata, test independent installation, and prepare official-directory and
  self-hosted marketplace paths.
- **Codex/ChatGPT:** produce a skill-only Codex plugin package compatible with
  the current local/workspace import path. Treat a public Codex marketplace as
  conditional until OpenAI documents a third-party submission route.
- **GitHub Copilot:** use native Agent Skills publication via `gh skill`; do
  not create a GitHub App or Copilot Extension merely to wrap instructions.
- **Gemini CLI:** provide native skill installation and a generated extension
  package that bundles the skill; validate extension installation and prepare
  gallery publication.
- **OpenCode:** publish through native Agent Skills discovery/catalogs. Create
  an npm plugin only if a reviewed design demonstrates necessary hooks or
  tools beyond the portable skill.
- **Cursor, Windsurf, Cline, AiderDesk, AMP, and compatible hosts:** verify
  installation through the portable installer matrix; do not maintain cloned
  adapter directories.

### Governance and synchronization

- Maintain a registry inventory containing owner, destination, package type,
  submission URL, current identity, release version, sync policy, trust tier,
  and last verified receipt.
- Generate host packages from canonical output in a temporary/release staging
  directory or a dedicated distribution repository.
- Add tests that fail on stale versions, old names, broken links, invalid
  manifests, missing licenses, or unsupported publication claims.
- Require explicit approval immediately before each external submission,
  registry mutation, npm publication, marketplace upload, or release.

## Non-Functional Requirements

- No secrets or browser session material in generated packages or receipts.
- No telemetry added by Authentext plugin wrappers.
- No adapter bundle becomes part of the maintained root surface.
- Packages must install from immutable tags or commit SHAs where supported.
- Validation must run on Windows and Linux; host-specific smoke tests run only
  where the corresponding CLI is available.
- Submission status must distinguish `prepared`, `submitted`, `accepted`,
  `listed`, `verified`, `rejected`, `deferred`, and `unsupported`.

## Acceptance Criteria

- [ ] The canonical skill passes all existing and distribution-specific tests.
- [ ] The registry matrix has a verified disposition for every in-scope host
      and directory.
- [ ] VoltAgent no longer presents the stale predecessor as the current
      Authentext listing, or a maintainer rejection/deferment receipt exists.
- [ ] A working, current Authentext page and install receipt exist on
      `skills.sh`.
- [ ] GitHub/Copilot publication is verified with hosted `gh skill` evidence.
- [ ] Claude and Gemini plugin/extension packages validate and install from a
      clean environment.
- [ ] Codex/ChatGPT packaging is verified through the currently supported
      import/workspace channel; public marketplace status is not overstated.
- [ ] OpenCode native skill installation is verified; npm publication occurs
      only if the plugin feasibility gate passes.
- [ ] Approved secondary directories have accepted listings or durable
      rejection/deferment receipts.
- [ ] Release/update automation detects registry drift without silently
      publishing externally.
- [ ] Every submission, acceptance, listing, and verification claim links to a
      hosted receipt.

## Out of Scope

- Adding a hosted rewriting service, API, or MCP server solely for marketing.
- Duplicating `SKILL.md` across checked-in host adapter trees.
- Publishing an OpenCode npm plugin that provides no behavior beyond loading
  the portable skill.
- Building VS Code, JetBrains, browser, or desktop extensions merely to wrap
  instructions.
- Claiming official endorsement from a directory or host.
- Submitting to abandoned, bulk-scraped, paywalled, unverifiable, or
  weak-provenance registries.

## Risks and Mitigations

| Risk                                                      | Likelihood | Impact | Mitigation                                                                                  |
| --------------------------------------------------------- | ---------- | ------ | ------------------------------------------------------------------------------------------- |
| Registry formats change during implementation             | High       | Medium | Pin researched versions, recheck official docs before submission, and store dated receipts. |
| Host wrappers drift from canonical content                | Medium     | High   | Generate packages from release artifacts and compare hashes in CI.                          |
| Stale Humanizer listings confuse users                    | High       | Medium | Submit explicit replacement text and retain redirect/rejection evidence.                    |
| A plugin wrapper requests unnecessary permissions         | Low        | High   | Default to skill-only packages with no apps, MCP, hooks, or telemetry.                      |
| Duplicate marketplace submissions create maintenance debt | Medium     | Medium | Apply trust/relevance thresholds and maintain one authoritative matrix.                     |
| Submission is mistaken for acceptance                     | Medium     | High   | Use the governed status vocabulary and require hosted acceptance evidence.                  |
| External maintainers reject or delay updates              | Medium     | Medium | Record the outcome, retain direct GitHub installation, and avoid blocking core releases.    |

## Source References

- <https://agentskills.io/specification>
- <https://www.skills.sh/docs>
- <https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills>
- <https://code.claude.com/docs/en/discover-plugins>
- <https://code.claude.com/docs/en/plugin-marketplaces>
- <https://help.openai.com/en/articles/20001256-plugins-in-codex/>
- <https://geminicli.com/docs/extensions/>
- <https://geminicli.com/docs/cli/using-agent-skills/>
- <https://opencode.ai/docs/skills>
- <https://opencode.ai/docs/plugins/>

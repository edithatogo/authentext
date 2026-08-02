# Project Tracks

This file tracks all major tracks for the project. Each track has its own detailed plan in its respective folder.

**Track Conventions:** See [`docs/conventions.md`](./docs/conventions.md) for status values, priority levels, dependency syntax, and artifact flow patterns.

---

## Active Tracks

- [ ] **agent-registry-plugin-distribution_20260802** (P1) - Distribute
      Authentext through credible Agent Skills registries and justified
      host-native plugin or extension channels while preserving a single
      canonical skill and governed publication receipts. See
      [`tracks/agent-registry-plugin-distribution_20260802/`](./tracks/agent-registry-plugin-distribution_20260802/index.md).

---

## Completed Track Retained at Legacy Path

- [x] **rename_deferred** (P1) - Repository/skill rename to Authentext. The
      completed record remains at its historical path:
      [`tracks/rename_deferred/`](./tracks/rename_deferred/spec.md).

---

## Archived Tracks

**Total archived track directories:** 28

**Latest archives:**

- [x] **renovate-codecov-verification_20260801** - Codecov OIDC and repository
      dependency-update safeguards verified; Mend Renovate onboarding deferred
      by owner and Dependabot retained. See
      [`tracks/archive/renovate-codecov-verification_20260801/`](./tracks/archive/renovate-codecov-verification_20260801/index.md)
      and GitHub [#234](https://github.com/edithatogo/authentext/issues/234).

- [x] **foio-editorial-workflow_20260801** - Portable, fail-closed FOI-O final
      editorial workflow with privacy-conscious evidence receipts and retained
      human acceptance/publication gates. See
      [`tracks/archive/foio-editorial-workflow_20260801/`](./tracks/archive/foio-editorial-workflow_20260801/index.md)
      and GitHub [#237](https://github.com/edithatogo/authentext/issues/237).

- [x] **post-release-security-quality-frontier_20260801** - Node 24 and audited
      dependencies, native coverage evidence, solo-maintainer safeguards, and
      reconciled hosted/backlog state. See
      [`tracks/archive/post-release-security-quality-frontier_20260801/`](./tracks/archive/post-release-security-quality-frontier_20260801/index.md)
      and GitHub [#224](https://github.com/edithatogo/authentext/issues/224).

- [x] **bleeding-edge-agent-skills-conductor_20260731** - Portable Agent Skills
      conformance, behavioral evaluation, current Conductor/GitHub control plane,
      governed experimental layers, and release `v3.2.0`. See
      [`tracks/archive/bleeding-edge-agent-skills-conductor_20260731/`](./tracks/archive/bleeding-edge-agent-skills-conductor_20260731/index.md)
      and [GitHub #66](https://github.com/edithatogo/authentext/issues/66).
- modernization_20260610 (Bleeding-edge modernization: upstream v2.8.0, sourceright extraction, Agent Skills migration)
- v4-architecture_20260415 (Modular V4 Architecture & Ecosystem Overhaul)
- upstream-pr-adoption_20260304 (Patterns 28-30 adopted)
- self-improvement-cycle2_20260304 (Ralph Loop automation scheduled)

---

## Completed Tracks Summary

### P0 Critical - Bleeding-Edge Modernization (Latest)

- [x] **modernization_20260610** - Bleeding-edge modernization
  - **Duration:** 1 day (2026-06-10)
  - **Achievements:**
    - Upstream v2.8.0 sync (patterns 31-33 as local 35-37, detection guidance, LICENSE)
    - Sourceright citation surface extracted
    - Agent Skills standard package (`SKILL.md` + `references/`), `.agent/` removed, npm workspaces
    - Sync machinery parameterized (`scripts/lib/repo-config.js`, `conductor/self-improvement/`)
    - Repo health: version sync via compile, test-runner fix, tracks registry reconciled
  - **Deliverables:** See [`tracks/archive/modernization_20260610/`](./tracks/archive/modernization_20260610/spec.md)

### P0 Critical - V4 Architecture & Ecosystem Overhaul

- [x] **v4-architecture_20260415** [041fb68] - Modular V4 Architecture & Ecosystem Overhaul
  - **Duration:** 11 days
  - **Achievements:**
    - Modular V4 skill split delivered
    - MCP server and orchestrator implemented
    - Renovate migration and benchmark pipeline added
    - Final validation complete
  - **Deliverables:** 29/29 tasks complete

### P0 Critical - Upstream Adoption

- [x] **upstream-pr-adoption_20260304** [84df0b8] - Upstream PR adoption (Patterns 28-30)
  - **Duration:** 1 hour
  - **Achievements:**
    - PR #39 adopted (3 new patterns)
    - Patterns 28-30 added (persuasive tropes, signposting, fragmented headers)
    - Version 3.1.0 released
  - **Deferred:** PR #49, #16, #17, #44 to future cycles

### P1 Recurring - Self-Improvement

- [x] **self-improvement-cycle2_20260304** [84df0b8] - Ralph Loop self-improvement cycle #2
  - **Duration:** 30 minutes
  - **Achievements:**
    - Ralph Loop workflow documented
    - Weekly automation scheduled (Mondays 9 AM)
    - Manual alternative documented

### P0 Implementation (Previous)

- [x] **adr-implementation-upstream_20260303** [cea2151] - ADR-001 modular architecture implementation
  - **Duration:** 1 day
  - **Achievements:**
    - 5 modules created (CORE, TECHNICAL, ACADEMIC, GOVERNANCE, REASONING)
    - Compile script assembles SKILL.md from modules
    - Version bumped to 3.0.0
    - All tests passing
  - **Deliverables:** 5 module files, updated compile script

### P1 Maintenance & Improvement (Previous)

- [x] **repo-self-improvement_20260303** [70b0b88] - Repository self-improvement cycle #1
  - **Duration:** 1 day
  - **Achievements:**
    - Dependabot backlog merged
    - SECURITY.md created
    - Upstream PR assessment workflow
    - ADR-001 created (hybrid modular architecture)
    - Self-improvement workflow scheduled
  - **Deliverables:** 18 documentation files

### Superseded / Extracted Tracks

- [x] **citation_ref_20260216** - Citation/reference management module
  - **Status:** **Superseded by sourceright extraction** (Phase 2 of `modernization_20260610`)
  - **Note:** Citation manager tooling and MCP cite skill removed from this repo; academic citation _patterns_ (A9/A10) remain in `SKILL_ACADEMIC.md`. Permanent home: sourceright project.

---

## Completed Tracks Summary (Previous)

### P0 Critical Path (Sequential)

- [x] reasoning-failures-stream_20260215 [c623d3e] - LLM reasoning failures taxonomy
- [x] reasoning-stream-implementation_20260215 - Productize reasoning stream
- [x] conductor-review-skill_20260215 - Review skill with severity ordering
- [x] conductor-humanizer-templates_20260215 - Conductor-compatible templates
- [x] systematic-refactor-hardening_20260215 - Modular refactor and guardrails

### P1 Parallel-Safe Tracks

- [x] repo-hardening-release-ops_20260215 [r8s9t0u] - CI/CD and release policy
- [x] repo-hardening-skill-distribution_20260215 [8712e9c] - Repository structure cleanup
- [x] skill-distribution_20260131 [3817230] - Skillshare/AIX distribution
- [x] adopt-upstream-prs_20260131 [6987b16] - Adopt PRs #3, #4, #5
- [x] repo-tooling-enhancements_20260214 [6987b16] - Vale, Renovate, npx skills

### P2 Enhancement Tracks

- [x] downstream-skill-sync-automation_20260215 [q7r8s9t] - Auto-sync downstream repos
- [x] skill-expansion_20260201 [34ebfe2] - SOTA tiered architecture
- [x] humanizer-adapters_20260125 - Adapter expansion
- [x] migrate-warp-to-agentsmd_20260131 - Migrate to AGENTS.md

### Legacy Adapter Tracks (All Complete)

- [x] adapters-expansion_20260131
- [x] antigravity-rules-workflows_20260131
- [x] antigravity-skills_20260131
- [x] devops-quality_20260131
- [x] gemini-extension_20260131
- [x] source-verification_20260131
- [x] universal-automated-adapters_20260131

---

## Archive Location

All completed tracks are archived in `conductor/tracks/archive/`.

Live self-improvement outputs (not a track): `conductor/self-improvement/`

---

## Key Deliverables

### Skills

- `SKILL.md` - Agent Skills standard manifest (~180 lines, under 500)
- `SKILL_PROFESSIONAL.md` - Pro router variant
- `references/` - Progressive disclosure modules (39-pattern catalog in `core-patterns.md`)

### Documentation

- `docs/llm-reasoning-failures-humanizer.md`
- `docs/reasoning-failures-taxonomy.md`
- `docs/TAXONOMY_CHANGELOG.md`
- `docs/skill-distribution.md`
- `docs/citation-manager-boundary.md` (sourceright home)

### Scripts

- `scripts/compile-skill.js` - Skill compilation and version sync
- `scripts/lib/repo-config.js` - Upstream/local repo configuration
- `scripts/check-upstream.js` - Upstream triage and pattern diff
- `scripts/check-sync-clean.js` - Sync drift check
- `scripts/validate-docs.js` - Documentation validation
- `scripts/gather-repo-data.js` / `scripts/render-self-improvement-issue.js` - Self-improvement cycle

### Workflows

- `.github/workflows/ci.yml` - CI/CD pipeline
- `.github/workflows/self-improvement.yml` - Weekly self-improvement
- Pre-commit hooks for validation

---

Last updated: 2026-07-31.

Active P0 track: post-release security and quality frontier.

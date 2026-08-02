# Implementation Plan: Agent Registry and Plugin Distribution

Every external mutation remains gated by explicit publication approval. Tasks
prepare, validate, and verify packages before submission.

## Phase 1: Baseline, architecture, and reconciliation [checkpoint: 44d617d]

GitHub subissue: [#246](https://github.com/edithatogo/authentext/issues/246)

- [x] Task: Repair stale Conductor links and reconcile the archived Renovate
      track and closed GitHub issues. (M-016) (commit: 1898570)
- [x] Task: Write failing schema and integrity tests for the registry matrix,
      governed status vocabulary, host coverage, and canonical-source rules.
      (M-001, M-002, M-013) (commit: 97b1ad8)
- [x] Task: Recheck current official specifications and pin dated host/channel
      capabilities in the matrix. (M-002) (commit: 97b1ad8)
- [x] Task: Decide between a dedicated generated distribution repository and
      release-staged host packages; document the ADR and threat boundary.
      (S-001) (commit: d4392c1)
- [x] Task: Define deterministic package manifests, hashes, SBOM/provenance
      fields, inclusion lists, and exclusion rules. (M-001, M-013, C-005)
      (commit: 44d617d)
- [x] Task: Mirror this track and all phases as native GitHub issues/subissues
      in Project 36 and update `conductor/github-mapping.json`. (M-015)
      (commit: 1898570)
- [x] Task: Phase Verification & Checkpoint (Refer to `workflow.md`).
      (evidence: 44d617d)

## Phase 2: Portable registries and cross-host installation

GitHub subissue: [#247](https://github.com/edithatogo/authentext/issues/247)

- [~] Task: Write failing tests for reference validation, `gh skill`, skills
  CLI discovery, clean installation, update provenance, and stale-name
  detection. (M-003, M-004, M-005, M-006, M-011)
- [ ] Task: Run the Agent Skills reference validator and current `gh skill
publish --dry-run`; resolve only portable-contract findings. (M-003)
- [ ] Task: Verify `gh skill preview`, publish, install, and update behavior for
      GitHub Copilot and supported target agents. (M-006)
- [ ] Task: Establish a current skills.sh Authentext catalog entry, verify its
      content hash, and add a badge only after the listing is live. (M-005,
      S-003)
- [ ] Task: Submit a replacement/update PR to VoltAgent for the stale
      `blader/humanizer` listing after explicit approval. (M-004, M-014)
- [ ] Task: Run clean install/discovery tests for Claude Code, Codex, GitHub
      Copilot, Gemini CLI, OpenCode, Cursor, Windsurf, Cline, AiderDesk, and AMP
      using generic installers without checked-in adapters. (M-011)
- [ ] Task: Prepare, approve, and submit reviewed secondary-directory entries;
      store submission and acceptance receipts separately. (M-012, S-004,
      C-003)
- [ ] Task: Phase Verification & Checkpoint (Refer to `workflow.md`).

## Phase 3: Claude plugin and marketplace distribution

GitHub subissue: [#248](https://github.com/edithatogo/authentext/issues/248)

- [ ] Task: Write failing tests for Claude plugin identity, manifest schema,
      marketplace schema, version/hash pinning, package contents, and absence of
      apps, hooks, MCP, telemetry, or broad permissions. (M-007, S-002)
- [ ] Task: Generate the skill-only Claude plugin from canonical release
      artifacts and create the Authentext marketplace entry. (M-001, M-007)
- [ ] Task: Validate with `claude plugin validate`, add the marketplace from a
      clean environment, install the plugin, and verify Authentext discovery.
      (M-007)
- [ ] Task: Test marketplace update, rollback, uninstall, rename, and immutable
      version behavior. (S-002, S-006)
- [ ] Task: Prepare the official Anthropic plugin-directory submission and
      complete it only after explicit approval. (C-001, M-014)
- [ ] Task: Record submission, review, acceptance/rejection, listing, and clean
      install receipts without conflating states. (M-013)
- [ ] Task: Phase Verification & Checkpoint (Refer to `workflow.md`).

## Phase 4: Codex, ChatGPT, and GitHub Copilot distribution

GitHub subissue: [#249](https://github.com/edithatogo/authentext/issues/249)

- [ ] Task: Write failing tests for Codex skill-only plugin packaging, OpenAI
      overlay consistency, portable-field isolation, and prohibited app/tool
      dependencies. (M-008, M-013)
- [ ] Task: Generate a Codex/ChatGPT skill-only plugin/import archive from the
      canonical package with no required apps. (M-008)
- [ ] Task: Validate local Codex discovery and supported ChatGPT/workspace skill
      upload/import paths in eligible test surfaces. (M-008)
- [ ] Task: Verify workspace sharing, refresh/update, uninstall, and version
      behavior where permissions permit. (S-006)
- [ ] Task: Recheck OpenAI's official third-party plugin publication route;
      prepare a submission only if a documented self-service or partner channel
      exists. Otherwise record `unsupported` or `deferred`. (M-014)
- [ ] Task: Reverify GitHub Copilot cloud agent, CLI, code review, and VS Code
      use from the same GitHub-published Agent Skill. (M-006)
- [ ] Task: Phase Verification & Checkpoint (Refer to `workflow.md`).

## Phase 5: Gemini CLI, OpenCode, and extended host channels

GitHub subissue: [#250](https://github.com/edithatogo/authentext/issues/250)

- [ ] Task: Write failing tests for Gemini extension manifests, bundled skill
      hashes, OpenCode discovery/catalog metadata, and the OpenCode npm-plugin
      value gate. (M-009, M-010, M-013)
- [ ] Task: Generate and validate a minimal Gemini CLI extension that bundles
      Authentext without copying an independently maintained skill body.
      (M-009)
- [ ] Task: Clean-install the Gemini native skill and extension, verify
      activation, reload/update, conflict precedence, and uninstall behavior.
      (M-009)
- [ ] Task: Prepare and, after explicit approval, submit the extension to the
      Gemini extension gallery. (C-002, M-014)
- [ ] Task: Verify OpenCode native skill discovery, permissions, explicit
      activation, update behavior, and optional HTTP catalog installation.
      (M-010, C-004)
- [ ] Task: Decide the OpenCode npm plugin gate. If no unique hooks/tools are
      required, record `not justified`; if approved, design, test, provenance-
      sign, and separately authorize npm publication. (C-006, W-003)
- [ ] Task: Evaluate OpenClaw/ClawHub and emerging catalogs against the trust,
      security, licensing, and canonical-source checklist. (W-004)
- [ ] Task: Phase Verification & Checkpoint (Refer to `workflow.md`).

## Phase 6: Update automation, release, and governed closeout

GitHub subissue: [#251](https://github.com/edithatogo/authentext/issues/251)

- [ ] Task: Write failing tests for registry drift, stale releases, changed
      manifests, broken listings, removed packages, and false acceptance
      claims. (M-013)
- [ ] Task: Add a scheduled, non-publishing registry monitor that emits a JSON
      artifact and opens or updates one idempotent drift issue. (S-005)
- [ ] Task: Integrate package generation and dry-run validation into release CI
      without granting registry write credentials to pull-request workflows.
      (M-014)
- [ ] Task: Publish approved packages/submissions sequentially, verify hosted
      receipts, and update badges/docs only after acceptance. (M-012, S-003)
- [ ] Task: Document update, rollback, deprecation, removal, compromised-
      release, and registry-maintainer handoff procedures. (S-006)
- [ ] Task: Run sync, validation, lint, audit, coverage, tests, host smoke tests,
      official validators, and hosted workflow verification. (M-003, M-013)
- [ ] Task: Reconcile all issue/subissue states and Project fields, conduct a
      formal review, archive the track, and retain any external channel gaps as
      explicit follow-up issues. (M-015)
- [ ] Task: Phase Verification & Checkpoint (Refer to `workflow.md`).

## Handoff Artifacts

- Authoritative registry/host matrix and dated evidence receipts.
- Reproducible portable, Claude, Codex/ChatGPT, and Gemini packages.
- GitHub/Copilot publication evidence and cross-host install matrix.
- External submission and acceptance/rejection URLs.
- Scheduled drift-monitor artifacts.
- Distribution security, rollback, deprecation, and compromise runbook.

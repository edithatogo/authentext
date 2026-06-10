# Implementation Plan: Bleeding-Edge Modernization

Track: `modernization_20260610` - see `spec.md` for acceptance criteria.

Workflow: each task gets its own commit; the task line gets the 7-char SHA appended on completion. Each phase ends with verification and review before a checkpoint commit.

## Phase 1: Upstream Sync (blader/humanizer v2.8.0)

- [x] Task: Fetch upstream SKILL.md (v2.8.0) and produce a structured diff against the local pattern catalog in `src/modules/` [4d208c3]
- [x] Task: Adopt patterns 31-33 (manufactured punchlines/staccato cadence, aphorism formulas, conversational rhetorical openers) into `src/modules/SKILL_CORE_PATTERNS.md` [64b8dc7]
- [x] Task: Port v2.5-v2.8 refinements (em/en-dash hard cut, gap-filling tell, diff-anchored writing, narrowed hyphen rule, content-preservation guarantees) into the relevant modules [1532ac9]
- [x] Task: Port upstream Detection Guidance (false positives, human-writing signs, LLM idiolects) into `src/modules/` [708908c]
- [x] Task: Add `LICENSE` at repo root (match upstream license family) [7079494]
- [x] Task: Evaluate upstream issues #137, #130, #93 and record adopt/defer decisions in `conductor/tracks/modernization_20260610/upstream-decisions.md` [50a9994]
- [x] Task: Recompile (`npm run sync`), update pattern counts in README/docs, run `npm run validate` [d8fb560]
- [x] Task: Conductor - Phase Verification and Review of Phase 1

## Phase 2: Sourceright Extraction

- [x] Task: Remove `humanizer-cite` registration from `skills/humanizer-orchestrate/lib/mcp-server.js` and update orchestrate tests (8 tools to 7) [2bfd5aa]
- [~] Task: Delete `skills/humanizer-cite/` (package.json, lib, tests)
- [ ] Task: Delete `experiments/citation_ref_manager/` (entire tree)
- [ ] Task: Delete `scripts/research/citation-normalize.js` and remove its listing from `conductor/tracks.md` key deliverables
- [ ] Task: Remove `src/references.json` and `src/research_references.md` (content lives in sourceright); fix any compile/validate references to them
- [ ] Task: Rewrite `docs/citation-manager-boundary.md` to record sourceright as the permanent home; sweep remaining mentions in `.github/copilot-instructions.md`, `conductor/product.md`, `conductor/product-guidelines.md`
- [ ] Task: Conductor - Phase Verification and Review of Phase 2

## Phase 3: Agent Skills Standard Migration

- [ ] Task: Restructure canonical `SKILL.md` to Agent Skills spec: conformant frontmatter (name, description <=1024 chars tuned for auto-discovery, license, compatibility), body under 500 lines, long material moved to `references/`
- [ ] Task: Update `scripts/compile-skill.js` to emit the spec-compliant package (standard + pro variants) and the `references/` tree
- [ ] Task: Remove `.agent/` adapter bundles (skills/humanizer, skills/humanizer-pro, workflows, rules) and all doc references to them
- [ ] Task: Remove instruction-only sub-skill npm stubs (`humanizer-structure`, `humanizer-factcheck`, `humanizer-inclusive`); keep code packages (`humanizer-next`, `humanizer-logic`, `humanizer-read`, `humanizer-orchestrate`)
- [ ] Task: Add npm `workspaces` to root `package.json` over the surviving packages; verify install and tests
- [ ] Task: Update MCP server tool registry and swarmer tests to the surviving skill set
- [ ] Task: Document plugin-bundle layout and skills.sh-style installation in `docs/skill-distribution.md`
- [ ] Task: Update `renovate.json` with per-directory packageRules / additionalBranchPrefix for the workspace
- [ ] Task: Conductor - Phase Verification and Review of Phase 3

## Phase 4: Sync Machinery Modernization

- [ ] Task: Create `scripts/lib/repo-config.js` (upstream owner/repo, local repo, output paths) and refactor `scripts/check-upstream.js` and `scripts/gather-repo-data.js` to use it
- [ ] Task: Retarget self-improvement outputs from `conductor/tracks/repo-self-improvement_20260303/` to `conductor/self-improvement/`; update `.github/workflows/self-improvement.yml` paths and artifact uploads
- [ ] Task: Upgrade `scripts/check-upstream.js` to triage upstream PRs/issues via `gh` (open PR list, pattern-count diff, adopt/defer table output)
- [ ] Task: Refresh `docs/SELF_IMPROVEMENT_WORKFLOW.md` and `docs/RALPH_LOOP_WORKFLOW.md` (current pattern counts, remove QWEN.md and stale PR references, drop 12/12-adapter assumptions)
- [ ] Task: Conductor - Phase Verification and Review of Phase 4

## Phase 5: Repo Health and Registry Reconciliation

- [ ] Task: Align versions - bump root `package.json` to match skill version and make the compile script the single version source
- [ ] Task: Fix `scripts/run-node-tests.js` - make `--test-isolation=none` conditional on Node support (or remove)
- [ ] Task: Reconcile `conductor/tracks.md` totals with the 24 on-disk archives; mark `citation_ref_20260216` superseded by sourceright
- [ ] Task: Register deferred-rename follow-on track stub (`conductor/tracks/rename_deferred/spec.md`) with vetted candidates and blast-radius notes
- [ ] Task: Final validation gate - `npm run sync && npm run validate && npm test && npm run lint:all`
- [ ] Task: Conductor - Phase Verification and Review of Phase 5

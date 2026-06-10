# Track Specification: Bleeding-Edge Modernization

**Track ID:** `modernization_20260610`

**Priority:** P0

**Type:** Upstream Adoption, Architecture Migration, Cleanup

**Created:** 2026-06-10

---

## Overview

Bring the repository to mid-2026 state of the art across four fronts:

1. **Upstream sync.** `blader/humanizer` moved from 30 to 33 patterns (v2.8.0, pushed 2026-06-07) since the last adoption cycle (2026-03-04). All previously deferred PRs (#49, #16, #17, #44) were closed unmerged upstream on 2026-04-01 and are dropped from consideration. The adoptable delta is patterns 31-33, the v2.5-v2.8 refinements (em/en-dash hard cut, gap-filling tell, diff-anchored writing, narrowed hyphen rule, content preservation), Detection Guidance, and a LICENSE.
2. **Sourceright extraction.** Citation/reference management was separated into the standalone `sourceright` project. All remaining citation-manager surface in this repo must be removed. The academic skill-content patterns about fixing fake AI citations (A9/A10) stay - they are humanizer content, not the manager.
3. **Agent Skills standard migration.** The SKILL.md "Agent Skills" format is now a cross-vendor standard supported natively by Claude Code, Cursor, Codex, Gemini CLI, Copilot, and 25+ tools. Per-platform adapter bundles (`.agent/`) are legacy and are removed. The canonical output becomes a spec-compliant Agent Skills package. Per-sub-skill npm stubs collapse into npm workspaces containing only real code packages. The MCP server remains for tool-backed capabilities only.
4. **Machinery and health.** Upstream sync scripts and the weekly self-improvement workflow hardcode the archived `repo-self-improvement_20260303` track and fork names; these are parameterized and retargeted. Version skew (package.json 2.3.0 vs SKILL 3.x), the broken `--test-isolation=none` test flag, and the tracks registry mismatch (21 listed vs 24 archived) are fixed.

A rename away from "humanizer" is **deferred** to a follow-on track; vetted low-collision candidates (TellStrip, Authentext, HumanWeave, SlopScrub, DeAIify) are recorded in a track stub.

## Acceptance Criteria

- [x] Pattern catalog reflects upstream v2.8.0 (33 upstream patterns mapped into the local module structure) with adopt/defer decisions recorded for upstream issues #137, #130, #93.
- [x] `LICENSE` exists at repo root.
- [x] No citation-manager code remains: `skills/humanizer-cite/`, `experiments/citation_ref_manager/`, `scripts/research/citation-normalize.js` deleted; MCP server registers 4 tool-backed skills.
- [x] Canonical `SKILL.md` conforms to the Agent Skills spec (frontmatter name/description/license, body under 500 lines, long material in `references/`).
- [x] `.agent/` adapter bundles removed; distribution documented for skills.sh-style installers.
- [x] Root `package.json` declares npm workspaces over the surviving code packages only.
- [ ] `scripts/check-upstream.js` and `scripts/gather-repo-data.js` take repo identifiers from shared config; no references to `conductor/tracks/repo-self-improvement_20260303` outside the archive.
- [ ] `npm run sync`, `npm run validate`, `npm test`, and `npm run lint:all` pass.
- [ ] `conductor/tracks.md` totals match on-disk archives; `citation_ref_20260216` marked superseded by sourceright.

## Out of Scope

- The rename itself (follow-on track).
- Publishing to registries (skills.sh listing is documented, not executed).
- Adopting upstream voice-calibration internals beyond what the local module structure already covers.

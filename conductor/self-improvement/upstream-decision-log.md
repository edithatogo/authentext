# Self-Improvement Decision Record

**Location:** `conductor/self-improvement/`

**Generated:** 2026-08-03T12:26:03.754Z

**Local Repository:** edithatogo/authentext

**Upstream Repository:** blader/humanizer

---

## How to use this file

- This file is the maintainer-owned decision record for the weekly self-improvement workflow.
- The workflow refreshes candidate decisions from live repository data.
- Maintainers should edit the decision text only when making an explicit final call, rather than rewriting the whole file from scratch.
- Suggested decisions are not final approvals. They are triage inputs.

## Maintainer Decision Rubric

- Evidence quality: prefer changes grounded in reproducible examples or clear user pain, not vibes.
- Pattern overlap: avoid adding new rules that duplicate existing Humanizer patterns without meaningfully improving coverage.
- False-positive risk: reject changes that are likely to flatten legitimate human style or technical writing.
- Distribution impact: prefer improvements that do not increase sync complexity or runtime dependencies across the Agent Skills package and MCP surface.

## Local Repository Decisions

- None

## Upstream Repository Decisions

- upstream #209: Extend pattern 11 to cover repeated sentence openings (v2.9.2)
  Decision: DEFER
  Why: Review against the evidence rubric: overlap with the local catalog, false-positive risk, and maintainer burden.
- upstream #208: Add pattern #34 for invisible-context defenses
  Decision: DEFER
  Why: Review against the evidence rubric: overlap with the local catalog, false-positive risk, and maintainer burden.
- upstream #207: Add shadowboxing and editorial scar tissue patterns (v2.10.0)
  Decision: DEFER
  Why: Review against the evidence rubric: overlap with the local catalog, false-positive risk, and maintainer burden.
- upstream #205: Add pluggable language packs, starting with Arabic (v2.10.0)
  Decision: REJECT
  Why: Non-English language versions and translations are out of scope for this core English Agent Skills package.
- upstream #204: docs: add Localization section stating the separate-repo policy
  Decision: DEFER
  Why: No automation rule matched. Review manually against the modernization track rubric.
- upstream #201: feat: add pattern 34 for abrupt idea shifts
  Decision: DEFER
  Why: Review against the evidence rubric: overlap with the local catalog, false-positive risk, and maintainer burden.
- upstream #200: Add advanced anti-detector exploits section to SKILL.md
  Decision: DEFER
  Why: No automation rule matched. Review manually against the modernization track rubric.
- upstream #196: Add pattern 34 (vague "This" back-references) and a mechanical final scan (v2.10.0)
  Decision: DEFER
  Why: Review against the evidence rubric: overlap with the local catalog, false-positive risk, and maintainer burden.

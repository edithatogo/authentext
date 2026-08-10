# Self-Improvement Decision Record

**Location:** `conductor/self-improvement/`

**Generated:** 2026-08-10T10:17:42.578Z

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

- local #270: chore(deps): bump js-yaml from 5.2.2 to 5.2.3 in the dev-dependencies group
  Decision: DEFER
  Why: No repo-specific automation rule exists for this PR yet. Review manually.

## Upstream Repository Decisions

- upstream #213: Eliminated ChatGPT complaint
  Decision: DEFER
  Why: No automation rule matched. Review manually against the modernization track rubric.
- upstream #211: Add patterns 34-35: uniform sentence and paragraph length
  Decision: DEFER
  Why: Review against the evidence rubric: overlap with the local catalog, false-positive risk, and maintainer burden.
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

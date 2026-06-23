# Self-Improvement Decision Record

**Location:** `conductor/self-improvement/`

**Generated:** 2026-06-21T14:47:31.697Z

**Local Repository:** edithatogo/humanizer-next

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

- local #51: chore(deps): bump the dev-dependencies group across 1 directory with 5 updates
  Decision: DEFER
  Why: No repo-specific automation rule exists for this PR yet. Review manually.
- local #50: chore(deps): bump markdown-it and markdownlint-cli
  Decision: DEFER
  Why: No repo-specific automation rule exists for this PR yet. Review manually.

## Upstream Repository Decisions

- upstream #159: Add pattern #34: hallucinated data, fake citations, and fabricated links
  Decision: DEFER
  Why: Review against the evidence rubric: overlap with the local catalog, false-positive risk, and maintainer burden.
- upstream #155: Add pattern #34: casual intensifiers and dismissive amplifiers
  Decision: DEFER
  Why: Review against the evidence rubric: overlap with the local catalog, false-positive risk, and maintainer burden.
- upstream #154: Add secondhand-text exemption to Detection Guidance
  Decision: DEFER
  Why: No automation rule matched. Review manually against the modernization track rubric.
- upstream #151: Add Spanish pattern catalog with automatic language detection (v2.9.0)
  Decision: REJECT
  Why: Non-English language versions and translations are out of scope for this core English Agent Skills package.
- upstream #147: Extend §13 to cover subjectless fragments from humanizing overcorrection
  Decision: DEFER
  Why: Review grammar refinement pattern against the core pattern definitions for potential overcorrection or false-positive risks.
- upstream #145: Revise README for Humanizer installation instructions
  Decision: DEFER
  Why: Compare with our custom Agent Skills installation guidelines (docs/skill-distribution.md) before adopting.

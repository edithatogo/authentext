# Self-Improvement Decision Record

**Location:** `conductor/self-improvement/`

**Generated:** 2026-08-12

**Local Repository:** edithatogo/authentext

**Upstream Repository:** blader/humanizer

**Upstream skill version recorded:** v2.9.0

**Local skill version:** 3.2.0 (40-pattern catalog)

---

## How to use this file

- This file is the maintainer-owned decision record for the weekly
  self-improvement workflow.
- The workflow can refresh candidate rows from live repository data. Do not
  let that wipe a final Adopt / Defer / Reject call.
- Edit a decision only when making an explicit final call.
- Suggested decisions from automation are triage inputs, not approvals.

## Maintainer Decision Rubric

- Evidence quality: prefer changes grounded in reproducible examples or
  clear user pain, not vibes.
- Pattern overlap: avoid adding new rules that duplicate existing Authentext
  patterns without improving coverage.
- False-positive risk: reject changes that flatten legitimate human style or
  technical writing.
- Distribution impact: prefer improvements that do not add sync complexity
  or runtime dependencies.

## Adopted in editorial-safety-invariants_20260811

These are final calls. Local PRs #275 through #287 landed the substance.
Upstream PRs may still be open on `blader/humanizer`.

- upstream #187 / v2.9.0 never-add and information-over-shape
  Decision: ADOPT
  Why: Landed in local #275. Coverage is claims, not paragraph count.
- upstream #212 ranking, superlative, and simultaneity loss
  Decision: ADOPT
  Why: Landed in local #275 as Never lose. Ordinary words still carry claims.
- upstream #213 host-control / ChatGPT safety wording
  Decision: ADOPT
  Why: Landed in local #275 and #282. Do not bypass host approval, logging,
  or write grants.
- upstream #154 / v2.8.1 secondhand-text exemption
  Decision: ADOPT
  Why: Landed in local #282. Quoted, titled, or discussed watched phrases
  stay put.
- upstream #192 extend Pattern 7 with "quietly"
  Decision: ADOPT
  Why: Landed in local #282.
- upstream #146 / #147 subjectless fragments and overcorrection register
  Decision: ADOPT
  Why: Landed in local #284 as Pattern 40, not a clash with Pattern 13.
- upstream #190 annotated-link and definition em dash exception
  Decision: ADOPT
  Why: Landed in local #284 on Pattern 13.
- upstream #209 repeated sentence openings
  Decision: ADOPT
  Why: Landed in local #285 by extending Pattern 11. No new number.
- upstream #211 uniform sentence and paragraph length
  Decision: ADOPT
  Why: Landed in local #285 as generative repair with genre limits. Did not
  mint upstream's Pattern 34/35 numbers.
- upstream #207 / #198 shadowboxing, scar tissue, invisible-context defenses
  Decision: ADOPT
  Why: Landed in local #286 inside Pattern 38. Pattern 23 gained hedging
  accumulation. Catalog stayed at 40.
- upstream #196 vague "This" back-references and mechanical pre-return scan
  Decision: ADOPT
  Why: Landed in local #287 inside Pattern 5, plus the scan. No Pattern 41.

## Local Repository Decisions

No open local pull requests on 2026-08-12.

## Remaining open upstream PRs

Fetched with `gh pr list -R blader/humanizer --state open` on 2026-08-12.

- upstream #214: fix: read package files as UTF-8 in validate-package.py
  Decision: DEFER
  Why: Windows encoding belongs to `quality-harness-and-matrix_20260811`
  Phase 2. Authentext does not ship that Python validator.
- upstream #213: Eliminated ChatGPT complaint
  Decision: ADOPT
  Why: Host-control wording already shipped in local #275 and #282.
- upstream #211: Add patterns 34-35: uniform sentence and paragraph length
  Decision: ADOPT
  Why: Substance shipped in local #285 as repair guidance, not new numbers.
- upstream #209: Extend pattern 11 to cover repeated sentence openings
  Decision: ADOPT
  Why: Substance shipped in local #285.
- upstream #208: Add pattern #34 for invisible-context defenses
  Decision: ADOPT
  Why: #198 substance shipped in local #286 inside Pattern 38. The extra
  UTF-8 hunk is the same defer as #214.
- upstream #207: Add shadowboxing and editorial scar tissue patterns
  Decision: ADOPT
  Why: Substance shipped in local #286.
- upstream #205: Add pluggable language packs, starting with Arabic
  Decision: REJECT
  Why: Non-English packs are out of scope for this English Agent Skills
  package.
- upstream #204: docs: add Localization section stating the separate-repo policy
  Decision: REJECT
  Why: Upstream README only. Authentext already keeps non-English variants
  out of the portable skill.
- upstream #201: feat: add pattern 34 for abrupt idea shifts
  Decision: DEFER
  Why: New structural pattern. Overlaps Pattern 28, 29, and 30. Needs a
  later catalog pass, not this safety track.
- upstream #200: Add advanced anti-detector exploits section to SKILL.md
  Decision: REJECT
  Why: Detector evasion is a product non-goal.
- upstream #196: Add pattern 34 (vague "This") and a mechanical final scan
  Decision: ADOPT
  Why: Substance shipped in local #287.
- upstream #192: Extend §7 AI vocabulary with "quietly"
  Decision: ADOPT
  Why: Substance shipped in local #282.
- upstream #191: Split pattern examples into PATTERNS.md; trim description
  Decision: DEFER
  Why: Authentext already splits examples into `references/`. Do not copy
  upstream's file layout.
- upstream #190: Add annotated-link / definition exception to the em dash rule
  Decision: ADOPT
  Why: Substance shipped in local #284.

## Historical archive

Rows below are the 2026-06-21 humanizer-next snapshot. Keep them as history.
Later final calls in the sections above win.

- local #51: chore(deps): bump the dev-dependencies group across 1 directory with 5 updates
  Decision: DEFER
  Why: No repo-specific automation rule exists for this PR yet. Review manually.
- local #50: chore(deps): bump markdown-it and markdownlint-cli
  Decision: DEFER
  Why: No repo-specific automation rule exists for this PR yet. Review manually.
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
  Decision: DEFER
  Why: Review against the evidence rubric: overlap with the local catalog, false-positive risk, and maintainer burden.
- upstream #147: Extend §13 to cover subjectless fragments from humanizing overcorrection
  Decision: DEFER
  Why: No automation rule matched. Review manually against the modernization track rubric.
- upstream #145: Revise README for Humanizer installation instructions
  Decision: DEFER
  Why: No automation rule matched. Review manually against the modernization track rubric.

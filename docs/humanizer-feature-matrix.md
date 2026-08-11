# Humanizer feature matrix

Checked on 2026-08-12. Machine-readable copy:
[humanizer-feature-matrix.json](./humanizer-feature-matrix.json).

Authentext covers the editorial humanizer set directly or by handoff. Detector
evasion, typo injection, and anecdote fabrication are refused, not missing.

This file records what is shipped, what is a handoff, what is planned, and
what Authentext will not do. It does not claim that a score proves human
authorship.

## Coverage codes

| Code | Meaning |
| --- | --- |
| `in-skill` | Shipped in the compiled Authentext skill or its references. |
| `integrated` | Handoff to sourceright, citeweft, or a host plugin. Not compiled into `SKILL.md`. |
| `planned` | On an Authentext track. Not shipped. |
| `out-of-scope` | Not shipped and not on a current Authentext track. |
| `refused` | Will not implement. |
| `present` | Verified in that competitor on the check date. |
| `absent` | Not found in that competitor's public skill on the check date. |
| `unverified` | Named in a source, but this pass did not confirm current product behaviour. |

## Tools checked

| Tool | Kind | Licence | Version | Last update verified | Patterns | Scoring |
| --- | --- | --- | --- | --- | --- | --- |
| [Authentext](https://github.com/edithatogo/authentext) | Agent skill | MIT | 3.2.0 | 2026-08-11 | 40 | None in the skill |
| [blader/humanizer](https://github.com/blader/humanizer) | Agent skill | MIT | 2.9.1 | 2026-07-22 | 33 numbered sections | None in the skill |
| [Aboudjem/humanizer-skill](https://github.com/Aboudjem/humanizer-skill) | Agent skill | MIT | not pinned here | 2026-07-15 | 53 claimed | 0-100 "Pure AI smell" |
| [Matt-Payne/content-humanizer](https://github.com/Matt-Payne/content-humanizer) | Agent skill | MIT | 2.10.0 claimed in changelog | 2026-08-04 | 33 | None in the skill |
| [Width.ai article skill](https://www.width.ai/post/the-claude-humanizer-skill-we-built-for-content-that-has-to-keep-ranking) | Article plus the Matt-Payne repo | MIT | same as Matt-Payne | 2026-08-10 article | 33 | None in the skill |
| [softaworks/agent-toolkit humanizer](https://github.com/softaworks/agent-toolkit/blob/main/skills/humanizer/README.md) | Toolkit skill | MIT | 2.1.1 | toolkit push 2026-03-05 | 24 | None |

Width.ai's public install path clones `Matt-Payne/content-humanizer`. Treat
those two rows as one published skill, not two independent products.

softaworks still tells users to clone `blader/humanizer`. The checked README
is a 24-pattern snapshot, not the current upstream catalog.

## Capability matrix

| Capability | Authentext | blader | Aboudjem | Matt-Payne / Width.ai | softaworks |
| --- | --- | --- | --- | --- | --- |
| Wikipedia AI-writing catalog | in-skill | present | present | present | present |
| Voice matching from a sample | in-skill | present | present | present | absent |
| Claim preservation / no invented facts | in-skill | present | unverified | present | absent |
| Literal, URL, path, identifier locks | in-skill | present | unverified | present | absent |
| Academic, technical, governance, reasoning, FOI-O modules | in-skill | absent | absent | absent | absent |
| Density-aware restraint | in-skill | unverified | present | unverified | absent |
| Citation verification / bibliography | integrated ([sourceright](https://github.com/edithatogo/sourceright)) | absent | absent | absent | absent |
| Citeweft citation weaving | integrated (not a published standalone skill) | absent | absent | absent | absent |
| Clinical, legal, creative references | planned | absent | absent | absent | absent |
| Scored golden harness in CI | planned | absent | present (optional CLI / Action) | absent | absent |
| Marketing mode with SEO locks | out-of-scope | absent | absent | present | absent |
| 0-100 Pure AI smell score | refused | absent | present | absent | absent |
| Detector evasion / undetectable claims | refused | absent | absent | present (Width.ai FAQ) | absent |
| Typo injection | refused | absent | absent | absent | absent |
| Burstiness injection to game detectors | refused | absent | present | absent | absent |
| Anecdote or biography fabrication | refused | absent | unverified | absent | absent |

## What Authentext ships

These are in the compiled skill or its references today:

- Forty named core patterns, including the Wikipedia catalog plus later
  Authentext and upstream work (voice calibration, length repair, scar tissue,
  dash exceptions).
- Domain modules for academic, technical, governance, reasoning, and FOI-O
  final editorial passes.
- Hard editorial rules: do not invent facts, do not drop claims, keep
  technical literals, keep citations that are already in the source.
- Density-aware restraint on low-tell prose.
- A mechanical leftover-artifact scan for dashes, curly-quote tells, emoji,
  and chatbot residue. That scan is not a detector.

Citation *patterns* that catch fake or malformed AI citations stay in the
academic module. Citation *management* does not. That work belongs to
[sourceright](https://github.com/edithatogo/sourceright). Citeweft is still
inside sourceright's extraction plan. It is not a published sibling skill.

## What Authentext refuses

Authentext will not:

- Optimise for detector scores or claim that text is undetectable.
- Inject typos, fake hesitation, or other artificial disfluency.
- Invent anecdotes, biography, customers, studies, or statistics to "sound
  human."
- Adopt Aboudjem's 0-100 "Pure AI smell" branding.

The DAMAGE paper studies exactly the refused class: tools sold to rewrite
AI text so detectors miss it. That is a different job from editorial defect
repair.

## DAMAGE paper tools

Source: Masrour, Emi, and Spero, [DAMAGE: Detecting Adversarially Modified AI
Generated Text](https://arxiv.org/html/2501.03437), Table 1. The paper names
19 tools. This pass verified the names against that table. It did not run the
products, check current pricing, or confirm that each site still ships the
2025 behaviour.

| Name | Paper category | This pass | Authentext stance |
| --- | --- | --- | --- |
| DIPPER | paraphraser | named in DAMAGE Table 1 and Table 9 | refused |
| Grammarly | paraphraser | named in DAMAGE Table 1 and Table 9 | refused |
| Quillbot | paraphraser | named in DAMAGE Table 1 and Table 9 | refused |
| GPTInf | humanizer | named in DAMAGE Table 9 only | refused |
| Bypass GPT | humanizer | named in DAMAGE | refused |
| Ghost AI | humanizer | named in DAMAGE | refused |
| HIX Bypass | humanizer | named in DAMAGE | refused |
| Humbot AI | humanizer | named in DAMAGE | refused |
| HumanizeAI.io | humanizer | named in DAMAGE | refused |
| HumanizeAI.pro | humanizer | named in DAMAGE | refused |
| Humanizer.com | humanizer | named in DAMAGE Table 1; Table 9 says AIHumanizer.com | refused |
| Phrasly.ai | humanizer | named in DAMAGE | refused |
| Semihuman AI | humanizer | named in DAMAGE | refused |
| StealthGPT | humanizer | named in DAMAGE | refused |
| StealthWriter.AI | humanizer | named in DAMAGE | refused |
| Surfer SEO | humanizer | named in DAMAGE | refused |
| Undetectable AI | humanizer | named in DAMAGE | refused |
| Twixify | humanizer | named in DAMAGE | refused |
| WriteHuman.ai | humanizer | named in DAMAGE | refused |

Count: Table 1 HTML lists 18 names while the paper says 19. Appendix Table 9
adds GPTInf and lists AIHumanizer.com where Table 1 says Humanizer.com.
This matrix keeps Humanizer.com as one row and adds GPTInf so the named
set is 19.

The paper also groups those tools by fluency (L1 / L2 / L3). That ranking is
DAMAGE's audit, not an Authentext claim. Unverified here: whether each
product still exists, what licence it uses, and what it does to text today.

## Competitor notes

### blader/humanizer

Upstream Wikipedia skill. MIT. Version `2.9.1` in `SKILL.md` on 2026-07-22.
Thirty-three numbered pattern sections in the fetched root skill. Voice
calibration and a no-invented-facts rule are present. No domain modules, no
citation handoff, no score. Authentext forked this lineage and added
modules, invariants, and host packaging.

### Aboudjem/humanizer-skill

MIT. Last push 2026-07-15. README claims 53 patterns, five voices, a 0-100
score, an over-edit guard, and an optional Node metrics CLI plus GitHub
Action. It also advertises burstiness injection. Authentext will not copy
the score brand or the injection tactic. A later track may add a
deterministic metrics CLI that does not live in skill prose.

### Matt-Payne/content-humanizer and Width.ai

Same public skill. Width.ai's 2026-08-10 article points at the Matt-Payne
repo. Marketing mode keeps keywords, headings, links, images, and the CTA.
Reference mode applies all 33 patterns at full strength. The article's FAQ
says the skill beats detectors. That claim is recorded as present on their
side and refused on Authentext's side. Structure locks overlap Authentext
literal and heading preservation. A dedicated marketing-SEO mode does not.

### softaworks/agent-toolkit humanizer

MIT toolkit skill. README version 2.1.1. Twenty-four Wikipedia patterns with
before/after examples. Recommended install still clones `blader/humanizer`.
No scoring, no voice-sample pass, no domain modules in the checked README.

## Planned, not shipped

Do not read these as coverage:

- Clinical, legal, and creative references:
  [`domain-and-citation_20260811`](../conductor/tracks/domain-and-citation_20260811/index.md).
- Scored golden harness and optional metrics CLI: this track, later PRs.
- Vale expansion and self-compliance CI: this track, later PRs.

## Related files in this repo

`src/ai_feature_matrix.csv` and `src/pattern_matrix.md` map linguistic
features to detectors and papers. They are not a competitor product matrix.
This document is the product comparison.

## Sources

- [DAMAGE: Detecting Adversarially Modified AI Generated Text](https://arxiv.org/html/2501.03437) (Jan 2025)
- [blader/humanizer](https://github.com/blader/humanizer) (checked 2026-08-12)
- [Aboudjem/humanizer-skill](https://github.com/Aboudjem/humanizer-skill) (checked 2026-08-12)
- [Matt-Payne/content-humanizer](https://github.com/Matt-Payne/content-humanizer) (checked 2026-08-12)
- [Width.ai Claude humanizer article](https://www.width.ai/post/the-claude-humanizer-skill-we-built-for-content-that-has-to-keep-ranking) (Aug 2026)
- [softaworks agent-toolkit humanizer README](https://github.com/softaworks/agent-toolkit/blob/main/skills/humanizer/README.md) (checked 2026-08-12)
- [edithatogo/sourceright](https://github.com/edithatogo/sourceright) (checked 2026-08-12)
- [edithatogo/authentext](https://github.com/edithatogo/authentext) (this repository)

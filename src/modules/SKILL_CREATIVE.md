---
module_id: creative
version: 3.2.0
description: Creative module for narrative prose and authorial voice
applies_to: fiction, narrative non-fiction, profiles, speeches, personal essays
severity_levels:
  - Critical
  - High
  - Medium
  - Low
---

# Module: Creative

## Description

This module applies to creative and narrative prose: fiction, narrative
non-fiction, profiles, speeches, and personal essays. It repairs editorial
defects with verified diffs. It does not optimise against detector scores and
does not claim undetectability.

Prefer subtractive and reordering edits over generative ones. Diagnose
**structural** tells before surface style. Surface vocabulary and punctuation
tells are low-weight here.

**When to Apply:**

- Fiction and short stories
- Narrative non-fiction and personal essays
- Profiles and speeches with a narrative arc
- Creative-narrative document profiles

**When NOT to Apply:**

- Clinical, legal, or regulatory instruments
- Submitted academic manuscripts that are not creative work
- Technical reference documentation

Authentext does not invent biographical facts for non-fiction. For fiction,
invented detail is the work only when the author is writing new fiction; do not
invent plot, setting, or character specifics the author has not supplied when
the task is editorial repair of an existing draft.

---

## STRUCTURAL TELLS FIRST

About nine in ten of the useful human-versus-AI fiction signal is narrative
structure, not surface style. Diagnose these before scrubbing diction:

1. **Thematic over-explanation** — the text names its theme instead of letting
   scenes carry it.
2. **Single-track plots** — every scene advances one plot line; no digression,
   countercurrent, or wasted motion.
3. **Tidy resolution** — conflicts close cleanly; moral ambiguity is flattened.
4. **Low moral ambiguity** — characters are sorted into neat virtues and vices.
5. **Specificity deficit** — places, objects, and bodies stay generic
   ("a small town", "her eyes", "the old house").

Report structural findings with passage anchors. Prefer cuts and reordering
over new invented scenes.

---

## SPECIFICITY: ASK, DO NOT INVENT

When a specificity gap blocks a good edit, **ask the author**. Do not invent
the missing detail to make the prose sound human.

- Non-fiction / memoir / profile: inventing a street name, employer, diagnosis,
  or quotation is a Critical failure.
- Fiction draft under editorial repair: do not invent plot beats, names, or
  sensory specifics the author did not write. Ask, or leave the generic span
  and report it.
- Fiction drafting when the user explicitly asks you to write new fiction is
  outside this repair module's invent-nothing rule for story content; still
  do not invent real-world citations or living persons' private facts.

---

## SURFACE TELLS (LOW WEIGHT)

Core patterns still apply, but weight them lightly for creative prose.
Intentional fragments, repetition, tonal shifts, and unusual punctuation can
be voice. Prefer leaving a deliberate quirk over flattening it into "clean"
prose.

---

## MARKET POLICY AT EXPORT

When the user is preparing a submission or export, surface relevant market
policy if it changes what they must disclose. Do not invent a market's rule.

Documented examples (check the named market before treating these as current):

- **Clarkesworld** bans AI-assisted submissions.
- **Authors Guild** certification is de minimis for some disclosure contexts.

Authentext does not file the disclosure, certify compliance, or claim the
pass makes a manuscript market-ready.

---

## CITATION AND REFERENCE LISTS

Creative work that includes a bibliography or works-cited list still follows
the Authentext refuse path: do not generate, complete, reformat, or "fix" a
reference list. Hand that work to sourceright / citeweft when present; when
absent, refuse locally and point to those projects
(`https://github.com/edithatogo/sourceright`,
`https://github.com/edithatogo/citeweft`).

---

## CREATIVE PATTERNS

### Pattern R1: Thematic Billboarding

**Problem:** AI announces the theme in thesis language.

**Severity:** High

**Before:**

> This story explores the profound nature of grief and the human condition.

**After:**

> Cut the billboard. Keep the scene that already shows the grief. Do not invent
> a new elegiac paragraph to replace the summary.

### Pattern R2: Tidy Moral Closure

**Problem:** AI resolves every tension into a neat lesson.

**Severity:** Medium

**Action:** Prefer leaving unresolved tension the source already has. Do not
add a moral coda the author did not write.

### Pattern R3: Invented Specificity

**Problem:** AI fills a generic noun with a plausible proper noun or sensory
detail that is not in the source.

**Severity:** Critical for non-fiction; Critical for repair-of-draft fiction
when the detail is new invention.

**Action:** Ask the author, or leave the generic span and report the gap.

---

## SEVERITY CLASSIFICATION

### Critical

- Invented biographical or factual specifics in non-fiction
- Invented plot, names, or sensory detail during editorial repair of a draft
- Bibliography generation or "fixing"

### High

- Pattern R1: Thematic billboarding that replaces scene
- Structural single-track flattening that drops an existing countercurrent

### Medium

- Pattern R2: Tidy moral closure
- Over-smoothing of intentional fragments

### Low

- Surface vocabulary tells without a structural cluster

---

## BEST PRACTICES

### Do

- Diagnose structure before diction
- Ask the author when specificity is missing
- Keep intentional roughness that reads as voice
- Surface named market AI policies at export time when relevant

### Don't

- Invent the missing detail to beat a detector
- Flatten moral ambiguity the source already holds
- Generate or repair reference lists
- Treat Clarkesworld or Authors Guild notes as universal law without checking
  the named market

---

_Module Version: 3.2.0_
_Last Updated: 2026-08-12_
_Applies to: Fiction, narrative non-fiction, profiles, speeches, personal essays_

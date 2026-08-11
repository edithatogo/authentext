# Specification: Domain and Citation Coverage

## Overview

The profile registry already names `health-research`, `clinical-safety`,
`legal-regulatory`, and `creative-narrative`. Those families currently load
`academic.md` and `governance.md`, or core patterns only. This track adds the
missing references, upgrades academic disclosure, and makes citation work a
handoff rather than an Authentext feature.

## Problem

- Clinical and legal text share some locked spans with the core invariants,
  but they need extra locks: doses, drug names, CIOMS frequency language,
  modal verbs, defined terms, carve-outs, temporal literals.
- Creative prose is listed under "when NOT to apply" in academic and
  governance modules. StoryScope found that about 93% of the human-versus-AI
  fiction signal is narrative structure, not surface style.
- Academic disclosure thresholds differ by publisher. Elsevier treats
  substantive sentence-structure changes as disclosable; Springer Nature
  exempts copy-editing.
- Citation-manager work was extracted to sourceright
  (`docs/citation-manager-boundary.md`). Authentext must not rebuild it.

## Functional requirements

### Positioning

1. State in `product.md` and the compiled skill that Authentext repairs
   editorial defects with verified diffs. It does not optimise against
   detector scores and does not claim to make text undetectable.
2. Prefer subtractive and reordering edits over generative ones.

### Academic

1. Add publisher-branching disclosure guidance for Elsevier, Springer
   Nature, Wiley, and ICMJE. Warn when an edit crosses Elsevier's
   "substantive changes to sentence structure or organization" line.
2. Treat interface artefacts as hard errors: `regenerate response`,
   `as an AI language model`, `as of my last knowledge update`, and close
   relatives.
3. Add a tortured-phrase lexicon with a document threshold of 5 or more,
   matching the Problematic Paper Screener. Seed with documented phrases
   such as `vegetative electron microscop*`.
4. Reference lists are out of scope. Do not generate, complete, reformat,
   or "fix" a bibliography.

### Clinical

1. New `src/modules/SKILL_CLINICAL.md` compiled to `references/clinical.md`.
2. Hard-lock: doses, units and their modifiers, drug names (no brand/generic
   swap, no spelling "correction"), route and formulation, negation,
   adverse-event language (`serious` is not `severe`; CIOMS frequency words
   have defined meanings), population scope, prognostic framing.
3. For patient-facing material, report FKGL/SMOG. Do not silently simplify.
   Confirm key-message retention.

### Legal

 1. New `src/modules/SKILL_LEGAL.md` compiled to `references/legal.md`.
 2. Hard-lock: modal verbs (`shall` / `must` / `may` / `should` / `will`),
    defined terms, carve-out markers, temporal literals (never normalise
    `30 days` to `one month`), citations and quoted holdings.
 3. Citations are unverified by construction. Report omission-versus-invention
    direction for any proposed edit set.

### Creative

 1. New `src/modules/SKILL_CREATIVE.md` compiled to `references/creative.md`.
 2. Diagnose structural tells first: thematic over-explanation, single-track
    plots, tidy resolution, low moral ambiguity, specificity deficit.
 3. When specificity is missing, ask the author. Do not invent the detail.
 4. Surface market policy at export time when relevant (Clarkesworld bans
    AI-assisted submissions; Authors Guild certification is de minimis).

### Routing and citation handoff

 1. Point `health-research` and `clinical-safety` at `clinical.md` in
    addition to academic/governance as appropriate. Point
    `legal-regulatory` at `legal.md`. Point `creative-narrative` at
    `creative.md`.
 2. Discover sourceright and citeweft if present (local clone, configured
    skill, or `edithatogo/sourceright`). When present they are the citation
    authority. When absent, Authentext still refuses bibliography edits
    and tells the user where that work lives.
 3. Do not duplicate `docs/citation-manager-boundary.md`. Update it so the
    home is sourceright/citeweft and the remaining Authentext duty is
    "detect, refuse, hand off."

## Non-goals

- Installing sourceright or citeweft into this repository.
- Legal, clinical, or submission compliance certificates.
- Detector-score optimisation.
- Rebuilding a citation database.

## Acceptance criteria

- Each new module compiles through `scripts/compile-skill.js` and is linked
  from `SKILL.md` routing.
- Profile registry families load the new files.
- Tests cover routing, locked-span examples, and the bibliography refuse
  path with and without sourceright present.
- `product.md` states the detector-evasion refusal.

## Risks

| Risk                                                    | Likelihood | Impact | Mitigation                                               |
| ------------------------------------------------------- | ---------- | ------ | -------------------------------------------------------- |
| Clinical/legal modules grow past progressive disclosure | Medium     | Medium | Keep SKILL.md to routing; details stay in references     |
| Handoff to missing tools looks like a broken feature    | Medium     | Low    | Document optional integration; refuse locally either way |
| Disclosure guidance goes stale                          | High       | Medium | Date the publisher table; research remains permissioned  |

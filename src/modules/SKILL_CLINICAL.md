---
module_id: clinical
version: 3.2.0
description: Clinical module for health research and patient-safety prose
applies_to: trial reports, guidelines, handovers, incident reviews, patient materials
severity_levels:
  - Critical
  - High
  - Medium
  - Low
---

# Module: Clinical

## Description

This module applies to health-research manuscripts and clinical-safety prose: trial reports, observational studies, protocols, guidelines, handovers, incident reviews, and patient-facing material. It repairs editorial defects with verified diffs. It does not certify clinical safety, submission readiness, or detector evasion.

Load this reference with academic and governance guidance when the document is a study report. Load it with governance guidance when the document is a guideline, handover, or incident review.

**When to Apply:**

- Randomised trials, observational studies, systematic reviews, protocols, case reports
- Clinical guidelines and safety notices
- Handovers and incident reviews
- Patient information and consent materials

**When NOT to Apply:**

- Creative writing
- Purely technical software documentation
- Marketing or commercial claims about products

Authentext does not prove that a protocol, label, or patient leaflet is safe or compliant.

---

## HARD-LOCKED SPANS

These spans cannot be edited as prose. Changing them changes the clinical claim.

### Doses, units, and modifiers

Lock the numeral, the unit, and any modifier that changes the dose:

- `5 mg`, `5mg`, `5 mg/kg`, `once daily`, `bd`, `PRN`
- Frequency words tied to a dose (`every 8 hours`, `three times daily`)
- Concentration and strength (`1:1000`, `0.9%`, `1000 micrograms`)

Do not normalise `micrograms` to `mcg` or `µg` unless the source already uses that form. Do not convert `5 mg/kg` into a flat milligram figure.

### Drug names

Do not swap brand and generic names. Do not "correct" spelling of a drug token. If the source says `adrenaline`, keep `adrenaline`; do not silently write `epinephrine`. If two names appear, keep both in the order given.

### Route and formulation

Lock route and formulation tokens: `IV`, `IM`, `PO`, `subcutaneous`, `modified-release`, `oral solution`, `nebulised`. Do not infer a missing route.

### Negation

Lock polarity. `no evidence of infection` is not `evidence of no infection`. `should not` is not `may`. Do not drop `not`, `never`, `absent`, or `negative`.

### Adverse-event language

`serious` is not `severe`. CIOMS frequency words have defined meanings and are locked:

| Word        | Meaning in CIOMS frequency language |
| ----------- | ----------------------------------- |
| very common | ≥ 1/10                              |
| common      | ≥ 1/100 to < 1/10                   |
| uncommon    | ≥ 1/1,000 to < 1/100                |
| rare        | ≥ 1/10,000 to < 1/1,000             |
| very rare   | < 1/10,000                          |

Do not replace `uncommon` with `rare`, or `serious` with `severe`, to sound more natural.

### Population scope and prognostic framing

Lock who the claim applies to (`adults ≥18 years`, `children under 5`, `pregnant people`) and prognostic framing (`associated with`, `predicts`, `does not predict`, `median survival`). Do not widen a subgroup into a general population.

---

## PATIENT-FACING MATERIAL

For patient-facing subtypes (`patient-material` and close relatives), **report** Flesch–Kincaid Grade Level (FKGL) and SMOG. Do not silently simplify. If a reading-age target exists, say whether the text meets it. Confirm key-message retention: every instruction, dose, warning, and "when to seek help" claim in the source must survive. If simplification would drop a warning, leave the sentence and report the conflict.

---

## CLINICAL PATTERNS

### Pattern C1: Softened Safety Language

**Problem:** AI hedges a locked clinical instruction until it no longer tells anyone what to do.

**Severity:** Critical

**Before:**

> Staff should generally consider escalating if the patient might potentially deteriorate.

**After:**

> Escalate if the source already names the trigger. Keep the named observation, threshold, and action. Do not invent a NEWS2 cut-off.

---

### Pattern C2: Brand/Generic Swap

**Problem:** AI "corrects" a drug name into the other naming system.

**Severity:** Critical

**Action:** Leave the token. Report the ambiguity. Do not add the other name unless it is already in the source.

---

### Pattern C3: Promotional Trial Abstracts

**Problem:** AI writes trial abstracts as product copy.

**Severity:** High

**Words to watch:** "groundbreaking", "game-changing", "life-saving", "robust evidence"

Keep the effect size, interval, and limitation already in the source. Do not upgrade `may reduce` to `reduces`.

---

## SEVERITY CLASSIFICATION

### Critical (must fix)

- Edits to doses, units, drug names, route, formulation, negation, or CIOMS frequency words
- Pattern C1: Softened safety language
- Pattern C2: Brand/generic swap

### High (strong AI signals)

- Pattern C3: Promotional trial abstracts
- Widened population or prognostic framing

### Medium

- Patient-facing text that was silently simplified without an FKGL/SMOG report

### Low

- Filler around otherwise intact methods or handover structure

---

## BEST PRACTICES

### Do

- Prefer cuts over new clinical sentences
- Report FKGL and SMOG for patient-facing material
- Keep every warning and "when to seek help" claim
- Load academic guidance for study reports and governance guidance for policies

### Don't

- Invent a dose, interval, or contraindication
- Swap `serious` and `severe`
- Generate, complete, or reformat a reference list (hand off to sourceright / citeweft when present; refuse locally either way)
- Claim the pass makes the document clinically safe

---

_Module Version: 3.2.0_
_Last Updated: 2026-08-12_
_Applies to: Health research, guidelines, handovers, incident reviews, patient materials_

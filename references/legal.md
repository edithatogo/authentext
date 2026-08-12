# Module: Legal

## Description

This module applies to legal-regulatory prose: advice, submissions, affidavits, contracts, and notices. It repairs editorial defects with verified diffs. It does not certify legal effect, court readiness, or detector evasion.

Load this reference with governance guidance. Do not treat governance filler-removal as a licence to rewrite `shall` as `must`.

**When to Apply:**

- Contracts and deeds
- Legal advice and submissions
- Affidavits and statements of facts
- Statutory notices and regulatory filings

**When NOT to Apply:**

- Creative writing
- Informal correspondence with no legal effect
- Marketing copy

Authentext does not practise law and does not verify citations.

---

## HARD-LOCKED SPANS

### Modal verbs

Lock `shall`, `must`, `may`, `should`, and `will`. These are not synonyms.

- `shall` / `must`: obligation. Do not swap them to match house style.
- `may`: permission or possibility, depending on the instrument. Do not upgrade to `must`.
- `should`: recommendation, not a duty, unless the instrument defines it otherwise.
- `will`: often a statement of fact or future operation. Do not rewrite as `shall`.

Governance Pattern G1 still applies to vague policy prose that is not a locked modal. If the token is one of the five above, leave it.

### Defined terms

Lock capitalised defined terms (`Confidential Information`, `the Act`, `Business Day`) and the definition that creates them. Do not expand, contract, or paraphrase a defined term into ordinary English.

### Carve-outs

Lock carve-out markers and their objects: `except`, `unless`, `provided that`, `subject to`, `without prejudice to`, `notwithstanding`. Dropping a carve-out invents a broader duty.

### Temporal literals

Never normalise `30 days` to `one month`, or `seven days` to `a week`. Keep calendar vs Business Day distinctions. Keep time zones and clock times as written.

### Citations and quoted holdings

Citations and quoted holdings are unverified by construction. Do not complete a missing pinpoint, year, or court. Do not "fix" a citation style. Do not generate, complete, or reformat a table of authorities or reference list.

---

## OMISSION VERSUS INVENTION

Every proposed edit set must report direction:

- **Omission risk:** the rewrite would drop an obligation, carve-out, defined term, date, or citation that the source contains.
- **Invention risk:** the rewrite would add a duty, party, date, citation, or holding the source does not contain.

Prefer the smaller edit. If either risk is present, leave the span and report it. Subtractive edits that remove filler without touching locked spans are allowed.

---

## LEGAL PATTERNS

### Pattern L1: Modal Collapse

**Problem:** AI rewrites `shall`/`may`/`should` into a single polite register.

**Severity:** Critical

**Before:**

> The Licensee shall notify the Licensor and may sublicense to Affiliates.

**After:**

> Keep `shall` and `may`. Do not write "The Licensee should notify the Licensor and can sublicense."

---

### Pattern L2: Dropped Carve-Out

**Problem:** AI shortens a sentence and loses `except as provided in clause 9`.

**Severity:** Critical

**Action:** If a shortened sentence cannot carry the carve-out, do not shorten it.

---

### Pattern L3: Temporal Normalisation

**Problem:** AI turns `within 30 days` into `within one month`.

**Severity:** Critical

**Action:** Keep `30 days`.

---

### Pattern L4: Invented Authority

**Problem:** AI adds a case, section, or "the court held" line that is not in the source.

**Severity:** Critical

**Action:** Cut the invented citation. Report that citations remain unverified.

---

## SEVERITY CLASSIFICATION

### Critical (must fix)

- Pattern L1: Modal collapse
- Pattern L2: Dropped carve-out
- Pattern L3: Temporal normalisation
- Pattern L4: Invented authority
- Any edit that changes a defined term

### High

- Filler removal that risks omission of a condition

### Medium

- Promotional or hedging language in a covering letter, not in the instrument

### Low

- Formatting of unlocked surrounding prose

---

## BEST PRACTICES

### Do

- Report omission-versus-invention for the edit set
- Keep quotations and pinpoints exactly
- Point citation verification at sourceright or citeweft when those tools are in scope; otherwise refuse bibliography work locally

### Don't

- Treat `shall` and `must` as interchangeable
- Normalise `30 days` to `one month`
- Generate a table of authorities
- Claim the pass makes the document legally sufficient

---

_Module Version: 3.2.0_
_Last Updated: 2026-08-12_
_Applies to: Contracts, advice, affidavits, notices, regulatory submissions_

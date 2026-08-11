# Specification: Editorial Safety Invariants

## Overview

Authentext edits prose. The dangerous failure is not leftover slop. It is a
rewrite that invents a fact, drops a claim, or manufactures a life the writer
never lived. This track makes those defects first-class invariants, then
adopts the remaining upstream behavioural rules and stranded pattern work.

Phase 1 is already implemented on
[PR #275](https://github.com/edithatogo/authentext/pull/275).

## Problem

- Upstream v2.9.0 replaced paragraph-count parity with information-over-shape
  and added a no-fabrication rule ([blader/humanizer#187](https://github.com/blader/humanizer/issues/187)).
  Authentext still shipped the v2.8 paragraph rule until PR #275.
- [Upstream #212](https://github.com/blader/humanizer/issues/212) showed that
  ranking, superlative, and simultaneity claims disappear when pattern
  removal treats ordinary words as filler.
- `PERSONALITY AND SOUL` told the model to add first-person texture with no
  guard against invented biography.
- Voice calibration, invocation modes, host-control wording, and several
  unmerged upstream patterns are still absent from the compiled skill.

## Functional requirements

1. Never state a fact, name, number, date, citation, quotation, or example
   that is not in the source. Stance may still be added where the document
   type allows it. Fiction is the one exception for invented detail.
2. Never drop a real claim. A deletion that costs a ranking, superlative,
   scope limit, negation, or simultaneity assertion is a defect.
3. Measure coverage in claims, not paragraphs.
4. Lock protected spans: numerals, units, dates, citations, quotations,
   negation, epistemic qualifiers, scope limits, proper names, and defined
   terms. Domain modules may extend the list; they may not shrink it.
5. Do not bypass host approval, logging, verification, provenance,
   permission, or safety controls. File rewrite requires an explicit write
   grant.
6. Voice comes from stance and rhythm, never invented biography. Skip
   PERSONALITY AND SOUL for clinical, legal, regulatory, and submitted
   academic material.
7. If the user supplies a writing sample, match its observable habits. The
   sample outranks Authentext style rules, including the dash ban.
8. Support pasted, file, and embedded invocation. Embedded mode returns
   prose, not ceremony.
9. Adopt, by extending existing patterns where possible:
   - secondhand-text false-positive guard (upstream v2.8.1);
   - `quietly` in Pattern 7 ([PR #192](https://github.com/blader/humanizer/pull/192));
   - passive voice and subjectless fragments (upstream §13) plus the
     overcorrection register ([#146](https://github.com/blader/humanizer/issues/146));
   - shadowboxing and editorial scar tissue
     ([PR #207](https://github.com/blader/humanizer/pull/207));
   - vague "This" back-references and a mechanical pre-return scan
     ([PR #196](https://github.com/blader/humanizer/pull/196));
   - uniform sentence and paragraph length as generative repair
     ([PR #211](https://github.com/blader/humanizer/pull/211));
   - repeated sentence openings folded into Pattern 11
     ([PR #209](https://github.com/blader/humanizer/pull/209));
   - annotated-link em dash exception
     ([PR #190](https://github.com/blader/humanizer/pull/190)).
10. Refresh `conductor/self-improvement/upstream-decision-log.md` so it names
    this repository and records v2.9.0 plus the open upstream queue.

## Non-goals

- New clinical, legal, or creative modules.
- A numeric AI-tell score or detector-evasion claims.
- Minting a new pattern number when an existing pattern can carry the rule.
- Rewriting archived Conductor history.

## Acceptance criteria

- Compiled `SKILL.md` contains Never add, Never lose, Information over shape,
  Protected spans, host-control respect, and the anecdote-invention guard.
- The Low-tier severity list has unique pattern IDs.
- Tests fail if paragraph-count parity returns.
- Remaining upstream items above are either in the compiled skill or recorded
  as an explicit reject with a reason in the decision log.
- Each remaining theme ships as its own PR.

## Risks

| Risk                                 | Likelihood | Impact | Mitigation                                                                       |
| ------------------------------------ | ---------- | ------ | -------------------------------------------------------------------------------- |
| Pattern count growth burns context   | Medium     | Medium | Extend existing numbers; keep SKILL.md under the 500-line budget                 |
| Voice calibration fights house style | Medium     | Medium | Sample outranks style only; facts still cannot be invented                       |
| Mechanical scan becomes a detector   | Low        | High   | Scan only hard artifacts (dashes, curly quotes, chatbot residue), not perplexity |

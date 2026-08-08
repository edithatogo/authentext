# Adaptive document intelligence

Authentext routes editing by the requested operation and the document's actual
purpose instead of applying one generic “humanizer” pass. It keeps research,
publication, and mutation outside the authority implied by an editing request.

## Profile examples

- An API reference uses the technical reference route and preserves identifiers,
  code, paths, flags, and error text.
- A clinical trial manuscript uses the academic and health routes. CONSORT can
  inform minimum-reporting checks, but Authentext does not claim compliance.
- A policy memo uses governance guidance and preserves binding definitions,
  required sections, sourced rules, and approval boundaries.
- A mixed proposal routes narrative, requirements, and evidence sections
  separately before reconciling shared terminology.

If two plausible profiles have different safety boundaries, Authentext asks one
focused question. Otherwise it records a conservative assumption and proceeds.

## Research and privacy

Research is disabled unless current guidance is material and the user grants
permission. Queries contain only allow-listed, non-sensitive metadata such as a
named public standard and document subtype. Source text, private names, embedded
instructions, credentials, and restricted content never become query input.

Receipts identify the source class, retrieval date, applied rule, conflicts, and
unresolved questions without copying private document content. Stale guidance,
source conflicts, or prompt injection fail closed for human review.

## Operations and change control

Review, rewrite, structural edit, final pass, and research-assisted review have
different output contracts. Change budgets limit avoidable rewriting while
protected items remain immutable at every budget. Diagnostics separate
restraint, false-positive rate, preservation, requirement coverage, change
density, and classification calibration rather than collapsing them into a
single score.

## Migration from Standard and Professional

`SKILL.md` is the only discoverable runtime skill. It now routes professional
and document-specific work itself. `SKILL_PROFESSIONAL.md` remains a generated,
non-discoverable compatibility reference because downstream discovery and
hosted compatibility evidence is not yet sufficient to remove it safely.
Consumers should invoke Authentext through `SKILL.md` and treat the professional
file as optional reference material.

## Limitations

- Authentext cannot establish human authorship or reliably identify model origin.
- Reporting guidance is not a substitute for legal, clinical, editorial, or
  submission review.
- Short samples limit voice calibration and must be disclosed as such.
- Cross-host outputs may differ in wording even when routing and protected-item
  behaviour agree.
- Ambiguous authority, sensitive research input, and unresolved source conflicts
  require human review.

# Module: FOI-O final editorial workflow

Use this workflow only after the manuscript owner has established semantic and
citation integrity. It is a final prose-editing pass, not a fact-check,
legal review, citation verifier, or publication system.

## Preconditions

- The input is a versioned manuscript snapshot.
- Citation and semantic-integrity review is complete.
- Unresolved factual, citation, authorship, confidentiality, or legal questions
  are recorded for a human and are not silently resolved during rewriting.

If a precondition is not met, return a review finding and stop before rewriting
the affected passage.

## Portable workflow

1. Record the input identifier or hash, Authentext version, tool or host name
   and version, and the exact editorial prompt. Do not record manuscript text or
   secrets in a receipt unless the user explicitly permits it.
2. Review first. Identify only concrete writing patterns and tie every finding
   to a passage. Load both [academic.md](academic.md) and
   [governance.md](governance.md) when legal or policy boundaries are present.
3. Rewrite only accepted findings. Preserve citation markers, URLs, identifiers,
   numerical values and units, mathematical expressions, named legal
   instruments, attributed statements, negation, and epistemic qualifiers.
4. Compare the source and revision. Treat any changed protected item as a
   blocking error, not an editorial improvement. Escalate apparent source
   errors rather than correcting them silently.
5. Record the output identifier or hash, protected-item comparison, unresolved
   findings, and human decision state. A receipt describes the pass; it does
   not certify the manuscript's truth, legality, originality, or fitness for
   publication.
6. Return the revision, change notes, unresolved findings, and receipt. Mark
   editorial acceptance and manuscript publication approval as pending until a
   named human makes those decisions.

## Protected meaning

Preserve exact citation syntax wherever practical. Never add a citation to make
a claim appear supported, remove a citation because it seems unnecessary, or
change author, year, locator, DOI, or URL data during this pass.

Preserve numbers, signs, ranges, dates, percentages, denominators, units, and
comparators. A stylistic rewrite must not turn association into causation,
possibility into probability, or a reported allegation into an established
fact. Keep qualifiers such as _may_, _could_, _suggests_, _estimated_,
_reported_, _alleged_, _subject to_, and _not established_ unless a human
editor explicitly approves a semantic change outside this workflow.

Preserve legal boundaries, including confidentiality restrictions, privilege,
publication embargoes, jurisdictional limits, consent conditions, and statements
about what the authors do or do not know. Flag possible legal problems for
human review; do not provide legal clearance.

## Evidence receipt

Use a structured receipt with these fields:

```json
{
  "schema_version": 1,
  "workflow": "foio-final-editorial",
  "input_sha256": "...",
  "output_sha256": "...",
  "authentext_version": "3.2.0",
  "tool": { "name": "...", "version": "..." },
  "prompt_sha256": "...",
  "protected_items": { "passed": false, "differences": [] },
  "unresolved_findings": [],
  "human_gate": {
    "editorial_acceptance": "pending",
    "publication_approval": "pending"
  }
}
```

Hashing the exact prompt gives reproducibility without placing potentially
sensitive prompt content in the receipt. A controlled evidence store may retain
the full prompt separately.

## Authority boundary

Authentext may prepare and document a revision. It must not submit or publish a
manuscript, claim that citations have been independently verified, certify any
claim, provide legal approval, or mark either human gate approved.

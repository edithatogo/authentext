# Citation Manager Boundary Decision

## Status

Active handoff contract for Authentext (updated 2026-08-12 on track
`domain-and-citation_20260811`). Supersedes the 2026-06-10 sourceright-only
extraction note from track `modernization_20260610`.

## Decision

Citation and reference management does not live in this repository. Authentext
**detects** bibliography or reference-list work, **refuses** to generate,
complete, reformat, or "fix" those lists, and **hands off** to the citation
authority when one is present.

**Citation authority (optional integration):**

- [edithatogo/sourceright](https://github.com/edithatogo/sourceright) —
  reference triage and verification infrastructure (CSL canonicalisation,
  provider evidence, review queues, bibliography exports).
- [edithatogo/citeweft](https://github.com/edithatogo/citeweft) — neutral,
  auditable scholarly document extraction core (span-preserving reference and
  citation-callout extraction). CiteWeft does not assert bibliographic truth.

Discovery is optional: a sibling clone, `AUTHENTXT_SOURCERIGHT_PATH` /
`AUTHENTXT_CITEWEFT_PATH`, or a configured local skill directory. When those
tools are absent, Authentext still refuses bibliography edits and points at the
GitHub homes above. See `scripts/lib/citation-handoff.js`.

Do not install sourceright or citeweft into this repository. Do not rebuild a
citation database here.

## What stays in Authentext

Authentext remains a writing-skill repository. Academic **content patterns**
that detect fake or malformed AI citations (for example patterns A9/A10 in the
academic module) are part of the skill contract and are **not** citation-manager
tooling. Clinical and legal modules likewise refuse reference-list edits and
keep citations unverified by construction.

## Rationale

- The maintained surface is `SKILL.md`, `SKILL_PROFESSIONAL.md`, and the `src/`
  fragments that compile them.
- Citation-manager code did not feed the compiled skill outputs and duplicated
  work now owned by sourceright / citeweft.
- Refusing locally either way avoids implying that Authentext installs or
  maintains a reference database.

## History

- **2026-03-14:** Citation manager moved from `src/` to
  `experiments/citation_ref_manager/` (see prior version of this document).
- **2026-06-10:** Full extraction to sourceright; all citation-manager paths
  deleted from humanizer-next.
- **2026-08-12:** Authentext duty restated as detect / refuse / hand off;
  citeweft named beside sourceright.

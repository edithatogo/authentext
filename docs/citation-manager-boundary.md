# Citation Manager Boundary Decision

## Status

Superseded on 2026-06-10 by sourceright extraction (track `modernization_20260610`).

## Decision

Citation and reference management no longer lives in this repository. The former experimental tree (`experiments/citation_ref_manager/`), the `humanizer-cite` MCP tool, the `scripts/research/citation-normalize.js` helper, and the `src/references.json` / `src/research_references.md` bibliography files have been removed.

**Permanent home:** the standalone **sourceright** project for citation normalization, reference verification, and bibliography maintenance.

## What stays in Humanizer

Humanizer-next remains a writing-skill repository. Academic **content patterns** that detect fake or malformed AI citations (for example patterns A9/A10 in the academic module) are part of the humanizer skill contract and are **not** citation-manager tooling.

## Rationale

- The maintained surface is `SKILL.md`, `SKILL_PROFESSIONAL.md`, and the `src/` fragments that compile them.
- Citation-manager code did not feed the compiled skill outputs and duplicated work now owned by sourceright.
- Removing it narrows the repo contract and avoids implying that Humanizer installs or maintains a reference database.

## History

- **2026-03-14:** Citation manager moved from `src/` to `experiments/citation_ref_manager/` (see prior version of this document).
- **2026-06-10:** Full extraction to sourceright; all citation-manager paths deleted from humanizer-next.

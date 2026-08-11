# Specification: Pattern Registry and Skills Contracts

## Overview

Patterns today live as `### Pattern N:` headings in a 957-line Markdown
module. That is why the Low-tier severity list could duplicate unnoticed.
This track makes pattern records, protected-span classes, evaluation
fixtures, and Agent Skills packaging constraints into JSON Schema contracts
that compile into the prose the model reads.

## Problem

- Severity tables, pattern counts, and domain carve-outs are hand-maintained
  prose. They drift.
- `src/document-intelligence/` already has profile, guidance, and receipt
  schemas. A second parallel tree would split the source of truth.
- CI already runs `agentskills validate`. The official spec is still not
  cited in the skill or encoded as a local MUST/MUST-NOT contract.

## Functional requirements

1. Add `src/document-intelligence/pattern.schema.json` and a
   `patterns.json` (or YAML if a later task proves JSON unwieldy) that
   records, for each pattern: id, title, severity, domain applicability,
   mode carve-outs, trigger terms, false-positive guards, and the prose
   problem/before/after fields.
2. Compile `references/core-patterns.md` severity tables and pattern
   headings from that registry. Do not hand-edit generated tables.
3. CI fails if pattern IDs collide, if the compiled count disagrees with
   the registry, or if a severity row is missing or duplicated.
4. Add or extend schemas for protected-span classes and evaluation
   fixtures. Reuse `document-profile.schema.json` and
   `diagnostic-receipt.schema.json`.
5. Document the official Agent Skills specification URL
   (<https://agentskills.io> and the Anthropic Agent Skills spec) in
   `SKILL.md` and `docs/`. Encode portable MUST/MUST-NOT constraints
   (no nonportable frontmatter, `SKILL.md` under `skills/<name>/` in
   packages, no `allowed-tools` leakage) as a schema plus a tighter
   validator around the existing `agentskills validate` job.
6. Prefer compile-from-contract over duplicating prose in modules.

## Non-goals

- A runtime pattern matcher that replaces the LLM editor.
- Moving document-intelligence schemas out of `src/document-intelligence/`.
- Host-specific frontmatter in the portable skill.

## Acceptance criteria

- Adding a pattern is a registry edit plus tests, not a three-file prose
  hunt.
- `npm run sync` emits the same prose shape maintainers already review.
- CI names the Agent Skills spec and fails on a known-bad portable field.

## Risks

| Risk                                | Likelihood | Impact | Mitigation                                                                     |
| ----------------------------------- | ---------- | ------ | ------------------------------------------------------------------------------ |
| Compile output becomes unreadable   | Medium     | High   | Keep human-edited examples in the registry; review rendered Markdown           |
| Big-bang rewrite of all 39 patterns | High       | High   | Ship schema and one compiled table first; migrate remaining patterns in slices |

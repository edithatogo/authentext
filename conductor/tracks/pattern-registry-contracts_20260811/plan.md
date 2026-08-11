# Implementation Plan: Pattern Registry and Skills Contracts

## Phase 1: Pattern record schema

- [x] Task: Write failing schema tests for required pattern fields, unique
      IDs, and severity enums.
- [~] Task: Add `pattern.schema.json` under `src/document-intelligence/` and
      a first `patterns.json` covering the compiled severity list. Schema
      landed in PR 1; `patterns.json` seed is PR 2.
- [ ] Task: Phase Verification & Checkpoint (Refer to `workflow.md`).

## Phase 2: Compile prose from the registry

- [ ] Task: Write failing tests that a duplicated Low-tier ID or a missing
      registry entry fails `npm run sync` / validate.
- [ ] Task: Teach `compile-skill.js` to emit the severity tables from
      `patterns.json`. Keep pattern bodies in modules until a later slice
      migrates them.
- [ ] Task: Migrate pattern bodies in small PRs, not one dump.
- [ ] Task: Phase Verification & Checkpoint (Refer to `workflow.md`).

## Phase 3: Agent Skills contract

- [x] Task: Write failing tests for known-bad portable fields
      (`allowed-tools`, `compatibility`) and for package layout
      `skills/authentext/SKILL.md`.
- [x] Task: Add `docs/` citation of <https://agentskills.io> and a short
      MUST/MUST-NOT list. Link it from `SKILL.md`.
- [x] Task: Tighten the existing `agentskills validate` CI job with the
      local schema. Do not replace the official validator.
- [ ] Task: Phase Verification & Checkpoint (Refer to `workflow.md`).

## Phase 4: Protected spans and eval fixtures

- [x] Task: Extend or add schemas for protected-span classes and evaluation
      fixtures. Wire them to `diagnostic-engine` / existing fixture JSON.
- [ ] Task: Phase Verification & Checkpoint (Refer to `workflow.md`).

## Handoff artifacts

- `src/document-intelligence/pattern.schema.json`
- `src/document-intelligence/patterns.json` (or equivalent)
- Compiler path that emits severity tables
- Documented Agent Skills contract

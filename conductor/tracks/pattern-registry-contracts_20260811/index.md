# Pattern Registry and Skills Contracts

- **Track ID:** `pattern-registry-contracts_20260811`
- **Type:** Feature
- **Priority:** P1
- **Status:** New
- **Depends on:** `editorial-safety-invariants_20260811`
- **Parallel-safe:** after Phase 1 of the safety track merges
- **GitHub track:** [#278](https://github.com/edithatogo/authentext/issues/278)

## Artifacts

- [Specification](./spec.md)
- [Implementation plan](./plan.md)
- [Metadata](./metadata.json)

## Scope summary

Store patterns as data. Compile the prose from that data. Encode the official
Agent Skills MUST/MUST-NOT rules as a schema plus CI. Extend
`src/document-intelligence/` rather than starting a second contract tree.

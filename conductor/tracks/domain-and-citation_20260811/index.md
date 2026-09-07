# Domain and Citation Coverage

- **Track ID:** `domain-and-citation_20260811`
- **Type:** Feature
- **Priority:** P0
- **Status:** In progress
- **Depends on:** `editorial-safety-invariants_20260811`
- **Current phase:** Phase 4 — Creative reference
- **GitHub track:** [#277](https://github.com/edithatogo/authentext/issues/277)
- **Merged:** academic upgrade [PR #297](https://github.com/edithatogo/authentext/pull/297); clinical and legal modules [PR #301](https://github.com/edithatogo/authentext/pull/301)

## Artifacts

- [Specification](./spec.md)
- [Implementation plan](./plan.md)
- [Metadata](./metadata.json)
- [StandardFlow handoff](./standardflow-handoff.md)

## Scope summary

Give clinical, legal, creative, and academic writing real references instead of routing those families to `governance.md` and `academic.md` by default. Refuse to generate or repair reference lists here. Point that work at Sourceright and CiteWeft when they are present. Export only bounded, redacted editorial findings to StandardFlow through the optional handoff contract.

## Positioning

Authentext repairs editorial defects with verified diffs. It does not optimise against detector scores and does not claim undetectability. Its pattern findings are not evidence of authorship, misconduct, plagiarism or standards compliance.

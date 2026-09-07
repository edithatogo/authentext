# StandardFlow handoff

## Status

- Contract status: source implemented.
- Evidence level: source verified after the local validator passes.
- Activation status: prepared, not enabled as a runtime dependency.
- Artifact status: mutable pull-request head; immutable post-merge receipt required.

## Scope

Expose redacted, span-grounded Authentext findings as advisory StandardFlow evidence while preserving claim meaning, human editorial authority and the existing skill build. Consumer-specific material remains inside this existing Conductor track rather than expanding the maintained runtime surface.

`ca39b86eb604a6fe4cfa9a0918638195af82c1af` identifies the producer-logic baseline, not a false claim that it contains the new handoff artifacts. Pull request 307 and the explicit Conductor paths provide their current location.

## Required finding fields

- document-local subject identifier;
- stable pattern identifier and version;
- valid UTF-8 span offsets and a human-readable locator;
- bounded finding and reversible suggestion;
- confidence in the range 0 to 1 and non-empty limitations;
- explicit `raw_text_included` and `canonical_write_performed` flags;
- explicit artifact provenance that never presents a pull-request head as immutable.

## Remaining gates

- [ ] StandardFlow pull request 59 is merged or the consumer pin is deliberately rebased.
- [ ] The merged artifact-bearing Authentext revision replaces pull-request provenance in a retained receipt.
- [ ] Consumer-driven fixture validation runs in both repositories.
- [ ] Any adapter is opt-in and preserves the no-write boundary.
- [ ] Privacy, claim-preservation and hostile-document tests pass.
- [ ] Degraded mode and rollback are exercised.
- [ ] Any public interoperability claim receives an explicit evidence receipt.

This handoff does not change the completion status of the domain modules or convert an editorial pattern into evidence of authorship, misconduct, plagiarism, detector evasion or standards compliance.

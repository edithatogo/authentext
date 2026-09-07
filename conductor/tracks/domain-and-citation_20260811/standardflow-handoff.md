# StandardFlow handoff

## Status

- Contract status: source implemented.
- Evidence level: source verified after the local validator passes.
- Activation status: prepared, not enabled as a runtime dependency.

## Scope

Expose redacted, span-grounded Authentext findings as advisory StandardFlow evidence while preserving claim meaning, human editorial authority and the existing skill build. The exact proposed consumer revision is `820898e7ae21784145f98e04d8fc482367a6f015`.

## Required finding fields

- document-local subject identifier;
- stable pattern identifier and version;
- UTF-8 span offsets and a human-readable locator;
- bounded finding and reversible suggestion;
- confidence and limitations;
- explicit `raw_text_included` and `canonical_write_performed` flags.

## Remaining gates

- [ ] StandardFlow pull request 59 is merged or the consumer pin is deliberately rebased.
- [ ] Consumer-driven fixture validation runs in both repositories.
- [ ] Any adapter is opt-in and preserves the no-write boundary.
- [ ] Privacy, claim-preservation and hostile-document tests pass.
- [ ] Degraded mode and rollback are exercised.
- [ ] Any public interoperability claim receives an explicit evidence receipt.

This handoff does not change the completion status of the domain modules or convert an editorial pattern into evidence of authorship, misconduct, plagiarism, detector evasion or standards compliance.

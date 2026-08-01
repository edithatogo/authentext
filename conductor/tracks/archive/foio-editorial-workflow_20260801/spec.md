# Specification: FOI-O Editorial Workflow

## Outcome

Provide a portable Authentext workflow for final editorial processing of an
FOI-O manuscript after semantic and citation integrity have been established,
without claiming editorial acceptance or publishing the manuscript.

## Functional requirements

- Define a discoverable workflow for intake, protected-literal capture,
  restrained editing, verification, and evidence recording.
- Preserve citations, URLs, numerical meaning, epistemic qualifiers, legal
  boundaries, and authorial stance.
- Record tool, skill, prompt/profile, version, and verification evidence in a
  portable machine-readable receipt.
- Fail closed when protected material changes or required evidence is absent.
- Keep final editorial acceptance, submission, and publication as human gates.

## Non-functional requirements

- Keep the portable Agent Skill independent of a particular host.
- Generate maintained root artifacts from canonical `src/` fragments.
- Add deterministic tests for positive and failure paths.
- Avoid authorship-detection or publication-certification claims.

## Acceptance criteria

- The workflow is discoverable from the canonical skill and academic guidance.
- Automated validation detects changed citations, URLs, numbers, qualifiers,
  or legal boundary statements.
- A versioned evidence receipt schema and example are documented and tested.
- Full sync, validation, lint, coverage, and tests pass.
- GitHub issue #61 is linked to this track and closed only after repository
  acceptance is evidenced; publication approval remains external.

## Out of scope

- Submitting or publishing a manuscript.
- Certifying factual, legal, semantic, or citation correctness.
- Replacing domain, legal, author, or journal editorial review.

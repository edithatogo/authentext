# Reader context and length implementation plan

Goal: make reader context, terminology, information load and requested length
explicit editorial constraints, without treating them as evidence of authorship.

## Design

Use one optional, local reader contract shared by the skill and verifier. Keep
mechanical length compliance separate from advisory reader-fit findings and
manual contextual review. Do not introduce a language model or new runtime
dependency. Keep the full guidance in a generated reference rather than adding
a large pattern catalogue to the hot prompt.

Alternatives considered: prompt-only guidance is portable but cannot enforce a
word ceiling; a model-based reader simulator may add value but would introduce
privacy, evaluation and dependency costs. A deterministic contract plus human
or host-model context review is the bounded first implementation.

## Constraints and review focus

- Node standard library only; no network calls, telemetry, or autonomous edits.
- Explicit user requirements outrank inferred reader/length defaults.
- Preserve protected scientific/legal language and legitimate technical usage.
- No silent deletion of claims to satisfy length; summarisation needs a separate
  authorised scope and never replaces its full source.
- Count all supplied text with a published counting convention. No hidden
  exclusion of citations, appendices, headings, tables or code.
- Conflicting budgets, invalid schemas and non-finite numbers must be rejected.
- Report context adequacy as unassessed until a contextual reviewer checks it.

## Tasks

1. Add failing reader-contract and verifier-integration tests, including explicit
   hard limits, approximate targets, preserve-length defaults, Unicode, invalid
   constraints, allowed domain terms and protected spans.
2. Implement scripts/lib/reader-contract.js and wire --reader-contract into
   verify-rewrite.js. Add the module to the closed runtime allowlist.
3. Add src/modules/SKILL_READER_FIT.md, compile its reference and a short root
   intake instruction, and include it in sync-drift validation.
4. Record request coverage honestly and add an evaluation/publication protocol.
5. Run sync, validate, lint, tests, coverage, package smoke tests and hosted CI.
   Open a reviewable PR; merge only after checks and review are satisfactory.

## Non-goals

No complete semantic proof, native parser replacement, automatic background
research, feedback harvesting, nightly learning, Rust/WASM runtime, MCP server,
publication submission or release tag is authorised by this track.

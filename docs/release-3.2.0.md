# Authentext 3.2.0 release

Prepared: 2026-08-01

This release makes Authentext a single portable Agent Skill with generated
progressive-disclosure references, deterministic validation, behavioral
evaluation receipts, and an optional governed OpenAI host overlay.

## Highlights

- Standards-compliant `SKILL.md` frontmatter and one authoritative runtime
  skill.
- Literal-preservation fixtures and property checks.
- Trigger, rewrite, restraint, voice, stance, and invariant evaluations.
- Generated `agents/openai.yaml` with independent host-layer validation.
- Authentext 3.2.0 and MIT identity aligned across npm, Python, source,
  generated outputs, and documentation.
- Legacy workspace/MCP surfaces removed from active orchestration and retained
  only as explicitly frozen history.
- Executable Conductor handshake and dry-run-first GitHub reconciliation for 30
  tracks, 123 phases, Project membership, native subissues, and state receipts.

## Verification

- Sync, repository docs, host overlays, and Conductor validation: passed.
- Lint, Vale, ESLint, TypeScript, and Prettier: passed.
- Node tests: 73 aggregate tests passed; every file also passed in isolation;
  integration checks passed.
- Official `skills-ref==0.1.1` validation: passed.
- `gh skill publish --dry-run`: passed, with a tag-protection advisory.
- Live Conductor/GitHub reconciliation: clean for all 153 mapped nodes and 123
  native parent/phase relationships.

## Release evidence

- PR #218 verified the candidate across CI, CodeQL, workflow lint, portable
  validation, publish preview, behavioral evaluations, and
  Linux/macOS/Windows validation, then merged as `eaef2c1`.
- PR #220 fixed the two post-merge CodeQL sanitization alerts and obsolete gate
  input, then merged as `4243d6d`.
- The exact final `main` revision passed CI (`30683241535`), skill distribution
  validation (`30683241550`), workflow lint (`30683241565`), and CodeQL with its
  blocking-alert gate (`30683241551`).
- Tag `v3.2.0` targets verified commit `58d8ad1`.
- Release workflow run `30684012674` passed and published the ZIP and TAR.GZ
  assets with GitHub-recorded SHA-256 digests.
- [Authentext 3.2.0](https://github.com/edithatogo/authentext/releases/tag/v3.2.0)
  was published on 2026-08-01.
- npm publication and separate skill-registry submission did not occur; the npm
  package remains private.
- Formal review upgraded the release action to Node.js 24-based v3.0.2 for
  future releases after the successful v3.2.0 run emitted a deprecation warning.

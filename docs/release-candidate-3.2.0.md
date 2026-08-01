# Authentext 3.2.0 release candidate

Prepared: 2026-08-01

This candidate makes Authentext a single portable Agent Skill with generated
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

## Candidate verification

- Sync, repository docs, host overlays, and Conductor validation: passed.
- Lint, Vale, ESLint, TypeScript, and Prettier: passed.
- Node tests: 73 aggregate tests passed; every file also passed in isolation;
  integration checks passed.
- Official `skills-ref==0.1.1` validation: passed.
- `gh skill publish --dry-run`: passed, with a tag-protection advisory.
- Live Conductor/GitHub reconciliation: clean for all 153 mapped nodes and 123
  native parent/phase relationships.

## Explicit gates

- PR #218 verified the candidate across CI, CodeQL, workflow lint, portable
  validation, publish preview, behavioral evaluations, and
  Linux/macOS/Windows validation, then merged as `eaef2c1`.
- PR #220 fixed the two post-merge CodeQL sanitization alerts and obsolete gate
  input, then merged as `4243d6d`.
- The exact final `main` revision passed CI (`30683241535`), skill distribution
  validation (`30683241550`), workflow lint (`30683241565`), and CodeQL with its
  blocking-alert gate (`30683241551`).
- No tag, GitHub release, npm publication, or skill publication has occurred.
- Public release actions require separate explicit approval.
- GitHub recommends an active tag-protection ruleset before immutable releases.

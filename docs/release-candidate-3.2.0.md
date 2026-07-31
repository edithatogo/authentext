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
- Node tests: 70 aggregate tests passed; every file also passed in isolation;
  integration checks passed.
- Official `skills-ref==0.1.1` validation: passed.
- `gh skill publish --dry-run`: passed, with a tag-protection advisory.
- Live Conductor/GitHub reconciliation: clean for all 153 mapped nodes and 123
  native parent/phase relationships.

## Explicit gates

- The candidate branch has not been pushed, so hosted CI has not verified the
  exact candidate revision.
- No tag, release, npm publication, skill publication, or merge has occurred.
- Public release actions require separate explicit approval.
- GitHub recommends an active tag-protection ruleset before immutable releases.

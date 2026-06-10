---
adapter_metadata:
  skill_name: humanizer
  skill_version: 3.0.0
  last_synced: 2026-04-26
  source_path: SKILL.md
  adapter_id: codex-cli
  adapter_format: AGENTS.md
---

# Humanizer

This repository is the source for the Humanizer skill. Treat it as skill-maintenance tooling, not as a runtime app or a compatibility bundle.

## Maintained surface

- `SKILL.md`
- `SKILL_PROFESSIONAL.md`
- `references/`
- `src/`
- `scripts/`
- `docs/`
- `conductor/`

## Core rules

- Follow the canonical writing rules in `SKILL.md` or `SKILL_PROFESSIONAL.md`.
- Preserve technical literals, code blocks, URLs, paths, and identifiers when rewriting text.
- Keep edits tight. Do not expand the maintained surface with adapter bundles, install shims, or legacy consumer paths.

## Maintenance

- `npm run sync` rebuilds the compiled skill files and refreshes the root manifests.
- `npm run validate` checks the maintained documentation surface.
- `npm test` runs the repo checks and the skill tests.

## Scope

- `src/` contains the canonical fragments.
- `experiments/` is outside the supported skill contract.
- Archived conductor material is history, not an active workflow target.

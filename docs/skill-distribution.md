# Skill distribution

This document covers how to install and verify the maintained Authentext Agent Skill package. The repo builds a spec-compliant skill tree from `src/modules/`:

- `SKILL.md`: standard variant (workflow and detection guardrails; under 500 lines)
- `SKILL_PROFESSIONAL.md`: generated, non-discoverable routing reference
- `references/`: full pattern catalogs and specialized modules (progressive disclosure)
- `agents/openai.yaml`: generated optional OpenAI presentation and invocation metadata

## Source of truth

```bash
npm run sync
npm run validate
npm test
```

`npm run sync` rebuilds `SKILL.md`, `SKILL_PROFESSIONAL.md`, and the `references/` tree from `src/modules/`. `npm run validate` checks the maintained docs surface. `npm test` runs the Node suite, sync drift check, and integration validation.

## skills.sh-style installation

Authentext ships as a single Agent Skill package at the repository root. Install it into a host that supports the [Agent Skills](https://agentskills.io) layout. Local MUST/MUST-NOT packaging rules are in [Agent Skills contract](agent-skills-contract.md):

1. Clone or copy this repository (or download a release tarball).
2. Point your agent at the repo root, or copy these paths into your skills directory:
   - `SKILL.md`
   - `SKILL_PROFESSIONAL.md`
   - `references/` (entire directory)
3. Keep `SKILL_PROFESSIONAL.md` as reference material; `SKILL.md` remains the only discoverable runtime skill.

Example with the skills CLI (when available in your environment):

```bash
npx skills add edithatogo/authentext --skill authentext
```

If your host expects a dedicated folder per skill, create `authentext/` and place `SKILL.md` plus `references/` inside it. Keep relative links intact (`references/core-patterns.md`).

The `agents/openai.yaml` file is a governed host overlay rather than part of the
portable core. It enables implicit invocation in Chat and Codex, contains no
tool dependency, and can be omitted by hosts that implement only the portable
Agent Skills contract.

Citation tooling lives in the separate **sourceright** project; it's not part of this package.

See [Adaptive document intelligence](adaptive-document-intelligence.md) for
document-profile routing, privacy and research boundaries, migration from the
former Standard/Professional split, and current limitations.

Generated portable and host-specific staging packages are non-publishing build
artifacts. See [Distribution operations](distribution-operations.md) for the
registry monitor, release verification, rollback, deprecation, compromise, and
maintainer-handoff procedures.

## Local verification

After editing `src/modules/`:

```bash
npm run sync
npm test
```

Confirm `SKILL.md` stays under 500 lines and that `references/core-patterns.md` contains the full pattern catalog.

## Notes

- This repository doesn't publish per-platform adapter bundles (`.agent/`, Copilot shims, etc.).
- Keep distribution guidance aligned with the root Agent Skills outputs, not legacy adapter trees.

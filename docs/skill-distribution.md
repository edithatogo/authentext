# Skill distribution

This document covers how to install and verify the maintained Humanizer Agent Skills package. The repo builds a spec-compliant skill tree from `src/modules/`:

- `SKILL.md` — standard variant (workflow and detection guardrails; under 500 lines)
- `SKILL_PROFESSIONAL.md` — pro variant with module routing
- `references/` — full pattern catalogs and specialized modules (progressive disclosure)

## Source of truth

```bash
npm run sync
npm run validate
npm test
```

`npm run sync` rebuilds `SKILL.md`, `SKILL_PROFESSIONAL.md`, and the `references/` tree from `src/modules/`. `npm run validate` checks the maintained docs surface. `npm test` runs the Node suite, sync drift check, and integration validation.

## skills.sh-style installation

Humanizer ships as a single Agent Skills package at the repository root. Install it into a host that supports the [Agent Skills](https://agentskills.io) layout:

1. Clone or copy this repository (or download a release tarball).
2. Point your agent at the repo root, or copy these paths into your skills directory:
   - `SKILL.md`
   - `SKILL_PROFESSIONAL.md`
   - `references/` (entire directory)
3. For the professional variant, select `SKILL_PROFESSIONAL.md` instead of `SKILL.md`.

Example with the skills CLI (when available in your environment):

```bash
npx skills add <owner>/humanizer-next --skill humanizer
```

If your host expects a dedicated folder per skill, create `humanizer/` and place `SKILL.md` plus `references/` inside it. Keep relative links intact (`references/core-patterns.md`).

## MCP server (optional)

Tool-backed sub-skills (`humanizer-next`, `humanizer-logic`, `humanizer-read`, `humanizer-orchestrate`) are exposed through the MCP server for hosts that support MCP:

```bash
npm run install:mcp-server
```

Citation tooling lives in the separate **sourceright** project; it is not part of this package.

## Local verification

After editing `src/modules/`:

```bash
npm run sync
npm test
```

Confirm `SKILL.md` stays under 500 lines and that `references/core-patterns.md` contains the full pattern catalog.

## Notes

- This repository does not publish per-platform adapter bundles (`.agent/`, Copilot shims, etc.).
- Keep distribution guidance aligned with the root Agent Skills outputs, not legacy adapter trees.

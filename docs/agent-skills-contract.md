# Agent Skills contract

Authentext ships as a portable [Agent Skills](https://agentskills.io) package.
The format is defined by the official specification:

- <https://agentskills.io>
- <https://agentskills.io/specification>

CI still runs `agentskills validate` from `skills-ref`. This document is the
local overlay: rules the official validator does not enforce for Authentext.

## MUST

- Keep `name` and `description` in `SKILL.md` frontmatter.
- Keep `name` to lowercase letters, numbers, and single hyphens (`authentext`).
- Keep `description` at or under 1024 characters.
- When packaging for a host, put the skill at `skills/authentext/SKILL.md`.
- Keep `metadata` values as strings if `metadata` is present.
- Run the official validator. Do not treat the local check as a replacement.

## MUST NOT

- Put `allowed-tools` in portable `SKILL.md`. That field is experimental and
  host-specific. It leaks a permission grant into the portable package.
- Put `compatibility` in portable `SKILL.md`. Host targeting belongs in an
  overlay, not in the portable frontmatter.
- Add any other nonportable frontmatter key (`interface`, `policy`,
  `dependencies`, top-level `version`, and similar).
- Hand-edit generated `SKILL.md` to satisfy these rules. Change `src/` and
  recompile.

## Local check

```bash
npm run validate:contracts
```

The script names the official spec URL and fails on a known-bad portable field.
Schemas live next to the other document-intelligence contracts:

- `src/document-intelligence/agent-skills-portable.schema.json`
- `src/document-intelligence/pattern.schema.json`
- `src/document-intelligence/patterns-registry.schema.json`
- `src/document-intelligence/patterns.json`
- `src/document-intelligence/protected-span.schema.json`
- `src/document-intelligence/evaluation-fixture.schema.json`

`patterns.json` is the machine-readable seed for the 40 core patterns. The
validator checks it against `src/modules/SKILL_CORE_PATTERNS.md` headings,
body severities, the severity-table IDs, and the frontmatter `patterns`
count. `npm run sync` emits the severity tables from that registry. Pattern
bodies stay in the Markdown module until a later compile slice.

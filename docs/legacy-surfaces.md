# Legacy surfaces

Authored on: 2026-08-01

AuthenText is maintained as one portable Agent Skill rooted at `SKILL.md`.
The following paths are retained only as historical implementation evidence:

- `skills/authentext-next/`
- `skills/authentext-logic/`
- `skills/authentext-read/`
- `skills/authentext-orchestrate/`
- `smithery.yaml`
- `scripts/install-mcp-server.js`
- `src/human_header.md`
- `docs/llm-reasoning-failures-humanizer.md`
- `docs/authentext-migration-announcement.md`

These paths are non-canonical and frozen. They are not npm workspaces, runtime
entry points, supported adapters, installation paths, or release artifacts.
Maintenance commands, CI, documentation claims, and release packaging must not
depend on them. Historical names inside them do not define current Authentext
identity or behavior.

The files remain in place to preserve repository history and to avoid an
irreversible deletion during the standards migration. A future cleanup may
remove them in a separately reviewed track after confirming no downstream
consumer relies on them.

`SKILL_PROFESSIONAL.md` is different: it is a generated, non-discoverable
compatibility reference. `SKILL.md` routes professional work to it, but it is
not a second runtime skill, package, or installation target. The canonical
source fragments live under `src/modules/`; `npm run sync` owns the generated
root files and references.

Names such as `humanizer`, `humanizer-next`, and `humanizer-pro` are permitted
only in frozen history, upstream attribution, migration evidence, and the
deprecated `HUMANIZER_LOCAL_REPO` environment-variable fallback. Maintained
identity, defaults, documentation claims, and release artifacts use
`Authentext` and `edithatogo/authentext`.

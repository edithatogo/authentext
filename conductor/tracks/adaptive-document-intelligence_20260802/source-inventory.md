# Source Inventory and Migration Boundary

Checked on: 2026-08-03

| Class                          | Paths                                                                                                          | Ownership and treatment                                                                                                   |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Portable runtime               | `SKILL.md`, `references/`, `agents/openai.yaml`                                                                | `SKILL.md` is the only discoverable runtime skill. References and optional host metadata ship with it.                    |
| Canonical source               | `src/modules/`, `src/core_frontmatter.yaml`, `scripts/compile-skill.js`                                        | Maintainer-edited inputs and compiler. Changes flow through `npm run sync`.                                               |
| Generated compatibility        | `SKILL_PROFESSIONAL.md`                                                                                        | Non-discoverable professional routing reference generated from canonical fragments; not a second skill or install target. |
| Generated reference output     | `references/*.md`, `AGENTS.md`, `agents/openai.yaml`                                                           | Compiler-owned outputs checked by `npm run check:sync`.                                                                   |
| Maintained contracts           | `src/document-intelligence/`, `scripts/lib/document-intelligence.js`                                           | Versioned profile, evidence, precedence, receipt, and validation contracts.                                               |
| Frozen legacy implementation   | `skills/authentext-*`, `smithery.yaml`, `scripts/install-mcp-server.js`                                        | Historical evidence only; excluded from workspaces, runtime, release, and installation claims.                            |
| Legacy-looking source and docs | `src/human_header.md`, `docs/llm-reasoning-failures-humanizer.md`, `docs/authentext-migration-announcement.md` | Retained as migration and research evidence. Historical identity does not control current behavior.                       |
| Historical governance          | `conductor/archive/`, `conductor/tracks/archive/`                                                              | Immutable track evidence. Historical Humanizer names remain intact for auditability.                                      |
| Unsupported experiments        | `experiments/`                                                                                                 | Outside the supported skill contract and release surface.                                                                 |

## Identity resolution

The maintained identity is `Authentext`; the repository fallback is
`edithatogo/authentext`. Upstream checks may name `blader/humanizer` because that
is an external source, not the local product identity. The old
`HUMANIZER_LOCAL_REPO` environment variable remains a deprecated compatibility
fallback after `AUTHENTEXT_LOCAL_REPO`; removing it would be a separate breaking
change.

No historical files are deleted by this track. A future removal requires
downstream-consumer evidence, a separately reviewed migration, and explicit
release notes.

## Professional compatibility boundary

Professional editing is a route inside the one Authentext skill. The runtime
may load `SKILL_PROFESSIONAL.md` as supporting guidance, but discovery tests
must continue to find only `SKILL.md`. Distribution tooling must never publish
`SKILL_PROFESSIONAL.md` as `authentext-pro`, and downstream documentation must
not offer separate Humanizer or Humanizer Pro installation commands.

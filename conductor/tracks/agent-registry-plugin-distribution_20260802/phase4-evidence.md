# Phase 4 evidence: OpenAI and GitHub hosts

Recorded: 2026-08-08

## Package and policy checks

- The generated `codex` target contains the canonical portable skill and an
  exact copy of `agents/openai.yaml`; it declares no apps, tools, hooks, or
  network access.
- Automated validation rejects host-only `allowed-tools` frontmatter in the
  portable skill and rejects OpenAI app dependencies.
- OpenAI's current documentation distinguishes standalone Codex skills from
  plugins. The documented plugin publication flow adds MCP and optional UI
  surfaces, which Authentext neither needs nor claims. Consequently the
  skill-only Codex package is supported, while a ChatGPT plugin submission is
  deferred until it provides a genuine capability beyond the portable skill.
- Official references checked:
  <https://developers.openai.com/codex/skills/> and
  <https://developers.openai.com/codex/plugins/>.

## Local discovery and lifecycle

- `gh skill list` discovers `authentext` for Codex.
- A clean user-scope install was generated from the allow-listed portable
  staging tree and installed with `gh skill install --from-local --agent codex`.
- The pre-existing user installation contained obsolete repository files. It
  was moved intact to
  `C:\Users\60217257\.codex\skills\authentext.backup-20260808-213058`, then
  replaced by the minimal skill surface (`SKILL.md`, `LICENSE`, `references/`).
- The installer adds local provenance metadata and normalizes YAML, so semantic
  equality rather than raw-byte equality is the appropriate installed-skill
  check. Update and rollback invariants are covered by lifecycle tests.

## GitHub Copilot disposition

The portable staging tree remains the single source for Copilot discovery.
Phase 2 verified the `gh skill publish --dry-run` path and recorded that the
public catalog currently returns an application-level not-found result. No
listing or hosted acceptance is claimed. Cloud-agent, CLI, code-review, and
VS Code consumers therefore share one generated skill payload and the same
non-publishing verification gate.

## External actions

No ChatGPT plugin, marketplace entry, or external registry submission was
created. Those actions require destination-specific publication authorization;
the repository now contains the reproducible packages and evidence needed for
such a later decision.

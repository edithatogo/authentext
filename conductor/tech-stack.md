# Tech Stack: Authentext

## Repository profile

- **Type:** Brownfield, documentation-first Agent Skill maintenance library.
- **Canonical source:** Markdown fragments under `src/`.
- **Generated artifacts:** `SKILL.md`, `SKILL_PROFESSIONAL.md`, and
  `references/`.
- **Automation:** Node.js ES modules and npm scripts.
- **Manifests and configuration:** JSON, YAML, TOML, Markdown, and GitHub
  Actions.
- **Python:** maintenance metadata only; no active Python runtime is required by
  the skill.

## Toolchain

- Node.js and npm
- ESLint, TypeScript checking, Prettier, markdownlint, and Vale
- Node's built-in test runner and repository validation scripts
- Official Agent Skills validators and GitHub skill publication preview
- GitHub Actions, GitHub Issues native subissues, and GitHub Projects v2
- Conductor specification, requirements, design, plan, metadata, and registry
  artifacts

## Target hosts

- Standards-compliant Agent Skills consumers
- OpenAI Codex
- Gemini CLI
- GitHub Copilot and VS Code
- Claude Code and Cursor through separately validated host layers

## Constraints

- Host-specific fields and experimental options must not enter portable
  frontmatter.
- Generated files must be reproducible on Windows and Linux.
- Adapter bundles, install shims, and legacy consumer paths are outside the
  maintained distribution.
- Tags, releases, and registry publication require explicit approval after
  hosted verification.

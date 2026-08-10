# Phase 3 evidence: Claude plugin and marketplace

Checked 2026-08-08.

## Package

The ephemeral Claude package contains:

- `.claude-plugin/plugin.json` with identity `authentext` and version `3.2.0`;
- `.claude-plugin/marketplace.json` with a local generated plugin source;
- `skills/authentext/SKILL.md`, its referenced files, and the MIT licence;
- an allow-listed manifest with SHA-256 hashes and empty app, tool, hook, and
  network capability arrays.

Validation rejects renames, mutable same-version replacement, instruction
drift, undeclared files, hooks, MCP servers, apps, tools, network access, and
telemetry. Automated lifecycle tests cover update, rollback, uninstallable
staging, stable identity, and immutable versions.

## Official CLI observation

The current npm package `@anthropic-ai/claude-code@2.1.226` was resolved on
Windows. Its bundled executable is incompatible with this Windows environment,
so `claude plugin validate`, marketplace add, install, and discovery could not
be honestly recorded as passing here. Repository schema and lifecycle tests
remain green; the exact CLI smoke test is retained as a downstream gate.

## Publication disposition

The official Anthropic directory submission is prepared but not submitted.
Submission, review, acceptance, listing, and clean hosted installation remain
distinct external states. No official-directory or marketplace listing is
claimed without a destination-specific receipt.

# Phase 5 Evidence: Gemini CLI, OpenCode, and Extended Hosts

Date: 2026-08-08

## Implemented package targets

- `gemini` generates a minimal `gemini-extension.json` whose single skill
  points to `skills/authentext`. The packaged body is copied from the compiled
  canonical release surface during the build; it is not independently
  maintained.
- `opencode` generates `opencode.json` with explicit activation, the same
  canonical skill path, and deny-by-default network, shell, and write
  permissions.
- Both targets retain the common empty capability declaration for apps, tools,
  hooks, and network access. Host validation rejects identity, path,
  capability, digest, and permission drift.

## Automated lifecycle and policy evidence

The focused suite exercises deterministic package generation, bundled skill
hashes, clean discovery, explicit activation, reload, update immutability,
local-skill conflict precedence, uninstall, and HTTP-catalog metadata without
writing into live host configuration directories.

The OpenCode npm value gate returns `not-justified` when no hooks or tools are
required. Native Agent Skills already provide the requested behavior. Any
future executable capability returns `security-review-required` and remains a
separate product and publication decision.

Emerging catalogs are evaluated by a fail-closed checklist covering public
ownership and maintenance, submission/update/removal procedures, licensing,
native Agent Skills compatibility, hidden telemetry, durable receipts,
provenance, and monitorability. OpenClaw/ClawHub remains excluded from this
release because native runtime compatibility has not been established; no
portable-core fork or executable wrapper was created.

## Verification receipts

- Red test: `node --test test/extended-host-distribution.test.js` failed because
  the Phase 5 exports did not yet exist.
- Green suite: `node --test test/distribution-builder.test.js
test/claude-distribution.test.js test/openai-distribution.test.js
test/extended-host-distribution.test.js` passed 15 of 15 tests.
- OpenCode CLI `1.17.16` is installed and exposes `opencode debug skill` for a
  later live-host smoke lane.
- Gemini CLI package `0.54.0-preview.0` is installed, but its Windows command
  did not return within the bounded local check. Package validation therefore
  remains automated and host-independent in this phase; a hosted CLI smoke
  check remains a release gate.

## Publication state

No Gemini gallery, OpenCode catalog, npm registry, OpenClaw/ClawHub, or
secondary-directory mutation was performed. Gemini gallery material is
generated and locally validated, but submission and acceptance remain distinct
external states requiring destination-scoped approval and receipts.

# Phase 1 Verification: Portable Contract and Generated Frontmatter

Verified: 2026-07-31

## Scope

- Requirements M-001 through M-006
- GitHub phase issue
  [#67](https://github.com/edithatogo/authentext/issues/67)
- Agent Skills specification checked on 2026-07-31:
  <https://agentskills.io/specification>

## Results

| Check                        | Result | Evidence                                                                            |
| ---------------------------- | ------ | ----------------------------------------------------------------------------------- |
| Independent YAML parsers     | Pass   | `yaml` and `js-yaml` produce the same frontmatter object                            |
| Portable fields              | Pass   | `name`, `description`, `license`, and `metadata` only                               |
| Version placement            | Pass   | `metadata.version` equals package version `3.2.0`                                   |
| Host permissions             | Pass   | `allowed-tools` omitted                                                             |
| Compatibility                | Pass   | Omitted because the portable skill has no concrete runtime dependency               |
| Runtime identity             | Pass   | Exactly one discoverable `SKILL.md`; professional guidance is a generated reference |
| Literal preservation         | Pass   | Five fixtures, 100 deterministic mixed inputs, and fail-closed placeholder tests    |
| Official reference validator | Pass   | `agentskills` 0.1.1 reports `Valid skill`                                           |

## Commands

```powershell
node --test test/agent-skills-compliance.test.js
node --test test/literal-preservation.test.js
node skills/authentext-next/test/isolation.test.js
npm run check:sync
npm test
uvx --from skills-ref agentskills validate 'C:\Users\60217257\OneDrive - Flinders\repos\authentext'
uvx --from skills-ref agentskills read-properties 'C:\Users\60217257\OneDrive - Flinders\repos\authentext'
```

On Windows, `agentskills validate .` in version 0.1.1 resolves the directory
name as an empty string. Passing the absolute skill directory validates
successfully and returns the expected portable properties.

## Evidence boundary

This verifies the local portable contract. Hosted CI, GitHub distribution
preview, behavioral evaluation, and release approval remain separate later
phases.

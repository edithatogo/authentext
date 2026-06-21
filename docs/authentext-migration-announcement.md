# Migration Announcement: Rebranding Humanizer to Authentext

As part of the V4 modular architecture transition, this repository and its associated Agent Skills are being renamed from **Humanizer** to **Authentext**.

## Why Authentext?

The name **Authentext** emphasizes the generation and curation of **authentic text**, aligning with our anti-slop and style-cadence remediation goals while establishing a distinct, professional position.

## What is Changing?

1. **Repository Name**: The GitHub repository is renamed from `edithatogo/humanizer-next` to `edithatogo/authentext-next`.
2. **Package Names**: The monorepo workspaces are renamed under the `authentext` namespace:
   - `humanizer-next` -> `authentext-next`
   - `humanizer-logic` -> `authentext-logic`
   - `humanizer-read` -> `authentext-read`
   - `humanizer-orchestrate` -> `authentext-orchestrate`
3. **Agent Skill Manifests**:
   - `SKILL.md` (frontmatter `name: authentext`)
   - `SKILL_PROFESSIONAL.md` (frontmatter `name: authentext-pro`)
4. **MCP Server**:
   - Command registration uses `authentext-orchestrate`.
   - Tool prefixes/names are updated to `authentext-*`.

## Action Required for Users

- Update your local clones/remotes to reference `edithatogo/authentext-next`.
- Re-run `npm run install:mcp-server` to register the rebranded Model Context Protocol (MCP) server.
- Update downstream dependencies referencing the old `humanizer-*` workspace packages.

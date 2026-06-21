# Product Guide: Authentext (Agent-Agnostic Skill/Workflow Pack)

## Summary

Authentext is a set of writing-editing instructions that removes common “AI voice” patterns from text while preserving meaning and tone. Today it is packaged as a Claude Code skill (`SKILL.md`). The next step is to expand it into a multi-agent deliverable that can be used consistently across popular coding agents, while keeping `SKILL.md` as the canonical source of truth.

## Primary Users

- People using coding agents who want their writing to sound natural and human (docs, READMEs, PRDs, changelogs, comments, emails)
- Maintainers who want a consistent editing workflow across multiple agent environments

## Target Environments (Initial)

- OpenAI Codex CLI
- Gemini CLI
- Google Antigravity
- VS Code

## Goals

- **Modular Excellence (V4)**: Decompose the monolithic skill into 8 independent, specialized MCP-compatible skills.
- **Agent Orchestration**: Provide a global MCP server allowing multi-agent "swarming" for complex humanization tasks.
- **Canonical Integrity**: Maintain `SKILL.md` as the source of truth, synced via automated tooling to all adapters.

## Non-Goals (for initial rollout)

- Rewriting the underlying Authentext guidance into a fundamentally different editorial philosophy.
- Building a full standalone rewriting app; focus remains on agent-facing skills/workflows.

## Key Product Decisions

- **Modular Architecture**: Split into `next`, `logic`, `cite`, `read`, `structure`, `factcheck`, `inclusive`, and `orchestrate`.
- **MCP Protocol**: Use the Model Context Protocol (MCP) as the primary interface for tool discovery and execution.

## Deliverables

- **Canonical Skillset**:
  - `SKILL.md` / `SKILL_PROFESSIONAL.md`
- **MCP Infrastructure**:
  - Authentext MCP Server exposing specialized authentext tools.
  - Orchestrator for parallel execution swarms.
- **Standardized Adapters**:
  - Support for Antigravity, VS Code, Claude, Gemini, and other SOTA agent environments.

## Quality Bar

- Adapters remain consistent with `SKILL.md` in:
  - Pattern coverage (the same core “AI writing signs”)
  - Output expectations (rewrite + optional brief change summary)
  - Tone control (preserve intended voice; avoid sterile or robotic rewrites)
- Documentation clearly states:
  - Which file is canonical (`SKILL.md`)
  - What each adapter is for and how to use it

## Success Criteria

- 100% decoupling of the 8 skill modules.
- Successful MCP tool registration and parallel execution.
- Mathematical verification of "Meaning Preservation" across humanized outputs.

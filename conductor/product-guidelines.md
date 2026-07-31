# Product Guidelines: Authentext

## Purpose

These guidelines define how Authentext should behave as a portable Agent Skill.
`src/` is canonical; compiled skill files must be regenerated rather than
maintained as independent copies.

## Default Editing Stance: Voice-Matching

- Preserve the author’s tone, register, and intent.
- Remove “AI voice” patterns without flattening personality.
- Do not “upgrade” style into a single house voice; match what’s already there.

## Hard Constraints (Do Not Change)

### 1) Technical correctness (literal invariants)

Do not alter any of the following, anywhere in the text:

- Anything inside inline code/backticks (e.g., `foo_bar`, `--flag`, `path/to/file`)
- Anything inside fenced code blocks (`...`)
- URLs (including query strings), file paths, version strings, hashes/IDs
- API names, identifiers, CLI commands/flags, config keys, error messages

If prose surrounds literals, rewrite only the prose and keep literals exact.

### 2) Facts and sourcing

- Do not invent specifics (names, dates, statistics, studies, quotes, “according to…”).
- Do not add citations or imply authority.
- If the input is vague, make it cleaner and more direct, but do not fabricate details.

### 3) Intent and stance

- Do not soften opinions, add forced optimism, or introduce hedging that wasn’t present.
- Do not add polite chatbot filler (“hope this helps”, “great question”, etc.).

### 4) Preserve formatting and structure

Unless required for clarity, keep structure intact:

- Markdown headings, lists, tables, blockquotes
- Link text and link targets
- Paragraph breaks (avoid unnecessary reflow)
- Ordering of sections and bullets

Prefer localized rewrites over restructuring.

## What Authentext Should Change

- Remove or rewrite patterns called out in `SKILL.md` (e.g., significance inflation, promotional phrasing, vague attributions, superficial -ing clauses, forced rule-of-three rhythm, etc.).
- Prefer simpler constructions when they sound natural _for the existing voice_.
- Increase specificity only when it already exists in the input; otherwise tighten.

## Output Requirements (for adapters)

Always output:

1. The rewritten text
2. A short change summary

### Change Summary Format

- 3–7 bullets maximum
- Pattern-oriented phrasing (e.g., “Removed significance inflation”, “Cut filler phrases”, “Replaced vague attributions with direct phrasing”)
- No meta-chatter (“As an AI…”, “Hope this helps…”, “Let me know…”)

## When Uncertain

If you can’t rewrite without risking technical correctness, factual invention, or stance change:

- Prefer a conservative edit (or leave the sentence) rather than “improving” it.

## Drift Control (keep adapters in sync)

- Generated artifacts and host layers must reference `metadata.version`.
- Generated host layers must include source revision and last-synced evidence.
- If a host layer conflicts with the portable runtime skill, the portable
  contract wins.

## Voice-Matching Example (same meaning, different voices)

Input (casual):

> This update is honestly kind of weird, but it works.

Output:

> This update is honestly kind of weird, but it works.

- Removed filler phrases and inflated framing
- Kept stance and casual tone

Input (formal):

> The change is unusual, but it functions as intended.

Output:

> The change is unusual, but it functions as intended.

- Removed unnecessary embellishment
- Preserved formal tone

## Consistency Across Environments

- The same input should yield materially similar rewrites across Codex, Gemini
  CLI, VS Code, and other supported tools, subject to model variance and host
  formatting constraints.
- Evaluate this as bounded behavioral similarity, not mathematical proof of
  meaning preservation or human authorship.

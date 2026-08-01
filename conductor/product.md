# Product Guide: Authentext

## Summary

Authentext is a portable Agent Skill for rewriting or reviewing prose to remove
recurring AI-writing patterns while preserving meaning, voice, stance,
citations, code, URLs, paths, and technical identifiers. This repository is the
skill's maintenance and build system, not a standalone rewriting application or
a compatibility-bundle repository.

## Primary users

- People using coding agents to edit documentation, manuscripts, product text,
  changelogs, comments, and correspondence.
- Maintainers who need a deterministic, reviewable skill package across
  standards-compliant hosts.
- Integrators who need optional host metadata without contaminating the
  portable skill contract.

## Canonical architecture

- `src/` contains the hand-edited canonical fragments.
- `scripts/compile-skill.js` generates the root skill artifacts and references.
- `SKILL.md` is the discoverable portable runtime skill.
- `SKILL_PROFESSIONAL.md` is a generated professional routing surface until the
  bleeding-edge track resolves its final packaging role.
- `references/` provides progressively disclosed pattern and domain guidance.
- `conductor/` defines product context, roadmap, tracks, requirements, design,
  plans, and evidence boundaries.

## Goals

1. **Portable compliance:** conform to the current Agent Skills specification
   without requiring a particular host.
2. **Editorial integrity:** make restrained edits and preserve literal,
   factual, tonal, and structural invariants.
3. **Generated consistency:** prevent identity, version, license, source, and
   generated-output drift.
4. **Behavioral evidence:** evaluate discovery, restraint, rewrite quality, and
   literal preservation rather than relying on manifest shape alone.
5. **Layered extensibility:** generate optional host metadata and experiments
   separately from the portable core.

## Non-goals

- Proving human authorship or reliably detecting whether text was AI-generated.
- Building a hosted rewriting service or full standalone editor.
- Maintaining adapter bundles, installation shims, or legacy consumer paths.
- Treating experimental host features or proposed manifests as portable
  standards.
- Publishing or releasing without explicit approval and verified gates.

## Product decisions

- One portable Authentext runtime skill is authoritative.
- `src/` is the source of truth; generated roots must never be edited as
  independent copies.
- Professional behavior should route within the canonical skill unless a
  separately discoverable package is justified by evaluation.
- Host-specific metadata belongs in generated overlays such as
  `agents/openai.yaml`.
- External publication state is distinct from local build, test, and planning
  state.

## Success criteria

- Official Agent Skills validators accept the portable package.
- Trigger and output evaluations cover positive, near-miss, negative,
  low-density, and technical-literal cases.
- Generated sync is deterministic across supported platforms.
- Documentation and package metadata use coherent Authentext identity, version,
  and license roles.
- Optional host layers can be disabled without changing portable behavior.

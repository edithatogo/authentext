# Specification: Quality Harness and Feature Matrix

## Overview

Authentext has a large test surface and almost no scored rewrite evidence.
Vale exists but lints one file. The upstream watcher still mentions
`humanizer-next`. This track adds honest comparison, self-compliance, and a
harness that can ratchet.

## Functional requirements

### Feature matrix

1. Create `docs/humanizer-feature-matrix.md` and a machine-readable companion
   (`docs/humanizer-feature-matrix.json` or CSV).
2. Compare at least: Authentext, `blader/humanizer`,
   `Aboudjem/humanizer-skill`, `Matt-Payne/content-humanizer`,
   `softaworks/agent-toolkit` humanizer, the Width.ai article skill, and
   the DAMAGE paper's 19 humanizer/paraphrasing tools where they can be
   named and verified.
3. Mark each capability as in-skill, optional integration (sourceright /
   citeweft / host plugin), or refused. Refused includes detector evasion,
   typo injection, and anecdote fabrication.
4. Be honest. Do not claim coverage that is only planned.

### Vale and self-compliance

1. Expand Vale (and keep markdownlint) across the maintained surface.
   Exception lists must exist for pattern example files that have to contain
   banned phrases.
2. CI fails if compiled `SKILL.md` uses an em dash outside an example, or
   contains leftover chatbot correspondence.
3. All Python and Node readers of skill files use explicit UTF-8. This is
   the Windows failure from [upstream PR #214](https://github.com/blader/humanizer/pull/214).

### Harness

1. Add a scored evaluation harness with golden before/after pairs per
   domain. Metrics include claim preservation, locked-span survival, and
   restraint. Ratchet a threshold in CI.
2. Optional deterministic companion metrics (burstiness, MATTR, trigram
   repetition, vocabulary density) live in `scripts/`, decoupled from skill
   prose. The skill does not need the CLI.
3. Do not claim the score measures human authorship.

### Hygiene

 1. Point `gather-repo-data.js` at `edithatogo/authentext`.
 2. Later small PRs: stale roadmap leftovers after this track's registry
    update, rename drift in leftover docs, orphan
    `.changeset/humanizer-next-docs.md`, duplicated self-improvement docs.

## Non-goals

- Running live LLMs in default CI.
- Adopting Aboudjem's 0-100 "Pure AI smell" branding.
- Deleting archived Humanizer-era history.

## Acceptance criteria

- Matrix distinguishes shipped, integrated, planned, and refused.
- Self-compliance check fails on a planted em dash in non-example skill
  prose.
- Golden-set runner can fail CI on a regression without calling a model.
- Watcher examples no longer say `humanizer-next`.

## Risks

| Risk                                                    | Likelihood | Impact | Mitigation                                                      |
| ------------------------------------------------------- | ---------- | ------ | --------------------------------------------------------------- |
| Vale on example files is noise                          | High       | Medium | Explicit ignore for example blocks                              |
| Scored harness without a model is only a contract check | Medium     | Medium | Start with deterministic oracles; add optional model lane later |

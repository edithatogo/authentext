# Implementation Plan: Bleeding-Edge Agent Skills and Conductor Alignment

- Track: `bleeding-edge-agent-skills-conductor_20260731`
- Requirements: [`requirements.md`](./requirements.md)
- Design: [`design.md`](./design.md)
- GitHub parent: [#66](https://github.com/edithatogo/authentext/issues/66)

Tasks move from `[ ]` to `[~]` to `[x]` only with real evidence. Each phase is
mirrored by a native GitHub subissue.

## Phase 1: Portable contract and generated frontmatter

GitHub subissue:
[#67](https://github.com/edithatogo/authentext/issues/67).

- [~] Add failing tests for YAML parsing, standard fields, `metadata.version`,
  omitted compatibility, and portable tool permissions. (M-001–M-004)
- [ ] Repair the compiler and generated frontmatter. (M-001–M-004)
- [ ] Define one authoritative runtime skill and professional routing model.
      (M-005)
- [ ] Add literal-preservation property and fixture tests. (M-006)
- [ ] Verify the official Agent Skills validator on the generated package.
      (M-001–M-006)

## Phase 2: Deterministic validation, tests, and CI

GitHub subissue:
[#68](https://github.com/edithatogo/authentext/issues/68).

- [ ] Replace stale Humanizer assertions and remove process-wide early exits
      from test files. (M-007)
- [ ] Make generated sync deterministic across LF and CRLF environments.
      (M-008, S-002)
- [ ] Repair and validate release/CI YAML and maintained-path references.
      (M-009)
- [ ] Run every Node test in isolation and in aggregate. (M-007)
- [ ] Add portable validation and `gh skill publish --dry-run` CI jobs.
      (M-014, S-005)

## Phase 3: Progressive disclosure and behavioral evaluation

GitHub subissue:
[#69](https://github.com/edithatogo/authentext/issues/69).

- [ ] Route by rewrite/review mode and content type before loading references.
      (M-012)
- [ ] Add navigation to long reference files. (M-012, S-004)
- [ ] Build positive, paraphrased, near-miss, and negative trigger evaluations.
      (M-010)
- [ ] Build actual rewrite, restraint, voice, stance, and invariant evaluations.
      (M-011)
- [ ] Publish machine-readable evaluation summaries as CI artifacts. (S-008)

## Phase 4: Identity, metadata, and host layers

GitHub subissue:
[#70](https://github.com/edithatogo/authentext/issues/70).

- [ ] Reconcile Authentext names, versions, MIT license, npm metadata, Python
      metadata, docs, and release text. (M-013, S-006)
- [ ] Generate and validate optional `agents/openai.yaml`. (S-001)
- [ ] Define separate validation for any generated host overlays. (S-005,
      C-001, C-003)
- [ ] Keep host-only and experimental fields out of portable frontmatter.
      (M-003, W-002, W-003, W-005)
- [ ] Decide whether unused legacy manifests/workspaces are removed or given an
      explicit non-canonical role. (M-013)

## Phase 5: Conductor, GitHub, and experimental operations

GitHub subissue:
[#71](https://github.com/edithatogo/authentext/issues/71).

- [ ] Validate the repaired Conductor handshake and all new track artifacts.
      (M-015)
- [ ] Add an idempotent dry-run-first Conductor/GitHub reconciliation command.
      (M-016, S-003)
- [ ] Verify all historical track issues, phase subissues, Project 36 items,
      fields, and mapping receipts. (M-016)
- [ ] Verify pinned Conductor main/release channels and experimental workspace
      settings with rollback documentation. (S-007)
- [ ] Add current/history/Must/experimental Project views if supported.
      (C-005)

## Phase 6: Release-candidate verification and governed handoff

GitHub subissue:
[#72](https://github.com/edithatogo/authentext/issues/72).

- [ ] Run `npm run sync`, `npm run validate`, `npm run lint:all`, and
      `npm test`.
- [ ] Run official Agent Skills validation and
      `gh skill publish --dry-run`. (M-014)
- [ ] Verify hosted CI on the exact candidate revision.
- [ ] Record remaining external, experimental, and human gates.
- [ ] Prepare release notes without tagging, releasing, or publishing.
      (M-017, W-006)
- [ ] Obtain separate explicit approval before any public release action.
      (M-017)

## Handoff artifacts

- Standards-compliant generated Authentext package.
- Trigger and output evaluation corpus plus machine-readable results.
- Conductor/GitHub reconciliation command and mapping receipt.
- Host-layer schemas and validation evidence.
- Release-candidate verification receipt and explicit remaining gates.

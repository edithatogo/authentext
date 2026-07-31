# Conductor Track Conventions

This document defines conventions for Conductor track management in this repository.

## Track Directory Structure

```text
conductor/
├── tracks.md                    # Master track registry
├── tracks/                      # Individual track folders
│   └── <track-id>/
│       ├── spec.md              # Requirements and acceptance criteria
│       ├── requirements.md      # Stable MoSCoW requirements when needed
│       ├── design.md            # Architecture and Mermaid diagrams when needed
│       ├── plan.md              # Implementation phases and tasks
│       ├── index.md             # Context summary (status, dependencies, outputs)
│       └── metadata.json        # Machine-readable metadata
```

## Track ID Format

- Pattern: `<name>_YYYYMMDD`
- Example: `reasoning-failures-stream_20260215`
- Use lowercase, hyphens for spaces, date of creation

## Status Values

| Status        | Meaning                                    |
| ------------- | ------------------------------------------ |
| `new`         | Track created, not started                 |
| `in_progress` | Actively being worked on                   |
| `blocked`     | Cannot proceed until dependencies resolved |
| `completed`   | All phases done, awaiting archive          |
| `archived`    | Moved to archive section in tracks.md      |

## Priority Levels

| Priority | Meaning                          | Typical Use                     |
| -------- | -------------------------------- | ------------------------------- |
| `P0`     | Critical path, blocks other work | Foundation tracks               |
| `P1`     | High importance, should do soon  | Feature/enhancement tracks      |
| `P2`     | Lower priority, can defer        | Maintenance/optimization tracks |

## Dependency Syntax

In `metadata.json`:

```json
{
  "depends_on": ["track-id-1", "track-id-2"],
  "blocked_by": "track-id-1 (requires: artifact name)",
  "parallel_safe": true
}
```

In `index.md`:

- Required Inputs: artifacts consumed from other tracks
- Unblocks: tracks that can proceed after this track

## Artifact Flow

Tracks produce artifacts that unblock downstream tracks:

```text
Track A → produces artifact X → consumed by Track B
```

Document in:

- Source track: `plan.md` → Handoff Artifacts section
- Consumer track: `spec.md` → Required Inputs section

## Task Lifecycle

1. `[ ]` - Not started
2. `[~]` - In progress
3. `[x]` - Complete (with commit SHA appended)
4. `[-]` - Blocked (add blocker note)

## Phase Verification

Each phase ends with:

```text
- [ ] Task: Conductor - Automated Verification 'Phase X: <Name>' (Protocol in workflow.md)
```

This triggers the verification protocol in `conductor/workflow.md`.

Do not create empty checkpoint commits. Use the last real functional commit for
the phase, attach verification evidence to it, and record that SHA.

## GitHub Mirror

- A track is one GitHub issue with marker
  `authentext-conductor-track-id: <track_id>`.
- A phase is one native GitHub subissue with marker
  `authentext-conductor-phase-id: <track_id>.phase<N>`.
- Search markers before creating or updating issues.
- Every repository issue and subissue belongs to the Authentext Conductor
  Roadmap Project.
- `conductor/github-mapping.json` records the reconciled node and URL mapping.
- Local Conductor artifacts remain authoritative for scope and evidence.
- Archived track and phase issues are closed history; stale archived metadata
  is disclosed, not silently rewritten.

## Requirements and Design

- Use MoSCoW with stable requirement IDs when scope spans multiple phases or
  validation layers.
- Link tasks to requirement IDs.
- Use Mermaid only when a diagram makes architecture, state, or dependency
  relationships easier to verify.
- Track indexes must link every artifact that exists.

## Risk Documentation

Each `spec.md` includes a Risks and Mitigations table:

```markdown
| Risk | Likelihood      | Impact          | Mitigation |
| ---- | --------------- | --------------- | ---------- |
| ...  | Low/Medium/High | Low/Medium/High | ...        |
```

## Handoff Checklist

Before marking a track complete:

- [ ] All acceptance criteria met
- [ ] Handoff artifacts documented in plan.md
- [ ] Required outputs exist in filesystem
- [ ] Downstream tracks' required inputs are satisfied
- [ ] metadata.json status updated to `completed`

# Authentext Roadmap

GitHub coordination board:
[Authentext Conductor Roadmap](https://github.com/users/edithatogo/projects/36).

Local Conductor files define scope and evidence. GitHub issues, subissues, and
Project fields mirror that state; they do not establish implementation,
publication, or release.

## Active: hosted dependency closeout

- Verify Renovate hosted access while retaining Dependabot until health is
  evidenced; retain Codecov OIDC alongside repository-owned coverage gates.

## Completed: FOI-O editorial workflow

- Implement the FOI-O final editorial workflow with deterministic preservation
  checks and evidence receipts.
- Keep manuscript acceptance, submission, and publication as explicit human
  gates outside repository completion.

## Completed: post-release security and quality frontier

- Move maintained automation from EOL Node 20 to Node 24 LTS.
- Consolidate PR #219 with overlapping dependency and audit work.
- Resolve supported npm audit findings without forced upgrades.
- Add measured coverage and evaluate bounded property/mutation improvements.
- Strengthen solo-maintainer controls without reviewer or CODEOWNERS gates.
- Reconcile stale issues and hosted Project state.

Primary track:
[`post-release-security-quality-frontier_20260801`](./tracks/archive/post-release-security-quality-frontier_20260801/index.md),
coordinated under [GitHub issue #65](https://github.com/edithatogo/authentext/issues/65).

## Completed: standards-compliant portable core

Primary track:
[`bleeding-edge-agent-skills-conductor_20260731`](./tracks/archive/bleeding-edge-agent-skills-conductor_20260731/index.md),
mirrored by [GitHub issue #66](https://github.com/edithatogo/authentext/issues/66).

- Repair generated frontmatter and portable metadata.
- Establish one authoritative Authentext runtime skill.
- Make sync and tests deterministic on Windows and Linux.
- Repair CI/release syntax and maintained-path references.

## Then: behavioral quality and progressive disclosure

- Add real trigger and near-miss evaluation.
- Evaluate actual rewrites, conservative restraint, voice/stance preservation,
  and technical-literal invariants.
- Route to focused references and add navigation to long modules.
- Publish bounded, machine-readable evaluation evidence.

## After that: host layers and preview distribution

- Generate optional OpenAI metadata separately from the portable core.
- Validate host overlays without making them maintained compatibility bundles.
- Add GitHub skill publication dry-run as a preview gate.
- Reconcile Authentext identity, version, license, and documentation.

## Experimental lane

- Evaluate Gemini task tracking, model steering, context management, worktrees,
  extension registry, and hot reloading.
- Keep the Agent Skills main channel and Gemini extension release channel
  separately pinned.
- Do not adopt proposed manifests or host-only frontmatter as portable
  standards.

## Release gate

A release candidate requires:

1. official Agent Skills validation;
2. deterministic sync, full tests, and valid workflows;
3. hosted CI on the exact revision;
4. passing distribution preview;
5. reviewed evaluation evidence; and
6. separate explicit approval for tag, release, or registry publication.

## Longer-term recommendations

- Add an upstream-spec drift bot that opens reviewable pull requests.
- Add mutation/property testing for compiler and invariant preservation.
- Add Project views for current delivery, history, Must requirements, and
  experimental work.
- Benchmark quality using restraint and preservation metrics, not claims of
  human-authorship detection.

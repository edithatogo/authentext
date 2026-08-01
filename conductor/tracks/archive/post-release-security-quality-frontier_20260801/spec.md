# Track Specification: Post-Release Security and Quality Frontier

- **Track ID:** `post-release-security-quality-frontier_20260801`
- **Type:** Maintenance and hardening
- **Priority:** P0
- **Status:** New
- **Created:** 2026-08-01
- **Portfolio issue:** [#65](https://github.com/edithatogo/authentext/issues/65)

## Objective

Move Authentext from a successfully released 3.2.0 baseline to a sustainable,
secure solo-maintainer operating model. Consolidate overlapping dependency pull
requests, remove the EOL Node 20 maintenance lane, resolve warranted audit
findings, add evidence-based quality controls, and reconcile stale roadmap and
GitHub coordination records.

## Current evidence

- `main` is clean at the post-release reconciliation commit `c26146a`.
- Release `v3.2.0`, CI, CodeQL, and Linux/macOS/Windows skill validation passed.
- `npm audit` reports six development-tool findings: three high and three
  moderate.
- PR #219 is green and upgrades seven development dependencies, but several
  upgraded tools require Node 22 or newer while maintained workflows use Node 20.
- PRs #50, #53, and #62 overlap the same dependency graph and currently have
  failing checks; draft PR #52 is a stale generated decision record.
- Node 24 is the current LTS line and Node 20 is EOL.
- Issues #63–#65 define warranted quality and solo-maintainer hardening work.
- Issues #57–#59 may be partly or fully satisfied by the completed 3.2.0 track
  and require evidence-based reconciliation.

## Scope

### Dependency and runtime consolidation

- Establish Node 24 as the maintained CI and development baseline.
- Evaluate PR #219 as one coherent dependency set rather than merging
  overlapping PRs independently.
- Resolve the current npm audit findings where supported fixes exist.
- Preserve deterministic sync, portable validation, and cross-platform tests.
- Close or supersede overlapping dependency PRs only after the replacement is
  merged and verified.

### Quality frontier

- Inventory existing property, integration, contract, and behavioral evidence
  before adding tools.
- Add measured test coverage using the smallest supported Node-native path.
- Add mutation testing only where it yields actionable signal for maintained
  JavaScript and stays practical for a solo maintainer.
- Avoid arbitrary percentage claims that the harness cannot measure.

### Solo-maintainer security and repository controls

- Inventory branch/ruleset behavior and automation actors before mutation.
- Prefer required automated checks without mandatory reviewers, CODEOWNERS, or
  team gates.
- Add missing contribution, security, issue, and pull-request context only
  where absent from the maintained surface.
- Rationalize Dependabot and Renovate only after hosted Renovate access is
  evidenced; never create a dependency-update coverage gap.
- Evaluate Codecov OIDC only after real repository coverage exists.

### Backlog and roadmap reconciliation

- Reconcile issues #57–#59 and #54 against files, tests, history, and hosted
  state.
- Keep FOI-O issue #61 separate unless evidence shows it belongs to this
  repository-maintenance track.
- Rewrite `conductor/roadmap.md` around post-3.2.0 work and the next product
  frontier.
- Mirror this track and phases as native GitHub issues/subissues in Project 36.

## Acceptance criteria

- [ ] Maintained workflows and declared tooling baseline use Node 24 LTS.
- [ ] Dependency consolidation passes sync, validation, lint, type, tests, and
      Linux/macOS/Windows hosted checks.
- [ ] `npm audit` reaches zero or every residual finding has a precise,
      evidence-backed exception with exposure and upgrade path.
- [ ] Overlapping dependency PRs are merged, superseded, or retained with one
      explicit role each.
- [ ] Coverage is measured and published from real tests without a fabricated
      threshold.
- [ ] Property/mutation/contract controls are implemented or excluded with
      reproducible evidence.
- [ ] Solo-maintainer controls preserve owner recovery and require no second
      reviewer.
- [ ] Issues #54 and #57–#59 are reconciled against current evidence.
- [ ] Roadmap and GitHub Project state match the repository truth.
- [ ] No release, npm publication, registry submission, or unrelated product
      feature is performed without its own authorization.

## Out of scope

- Mandatory human reviewers, CODEOWNERS, team assignment, or approval counts.
- Blind `npm audit fix --force` or independent merging of overlapping lockfile
  PRs.
- Reintroducing adapter bundles, installer shims, or frozen legacy paths.
- Claiming Codecov, Renovate, ruleset, registry, or publication success from
  local configuration alone.
- Implementing the FOI-O editorial feature without a separate product decision.

## Sources

- [Node.js release status](https://nodejs.org/en/about/previous-releases)
- [npm audit documentation](https://docs.npmjs.com/cli/commands/npm-audit)
- [GitHub repository rulesets](https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
- [GitHub dependency security](https://docs.github.com/code-security/dependabot)

# Track Specification: Bleeding-Edge Agent Skills and Conductor Alignment

- **Track ID:** `bleeding-edge-agent-skills-conductor_20260731`
- **Type:** Modernization
- **Priority:** P0
- **Status:** New
- **Created:** 2026-07-31
- **GitHub:** [Track #66](https://github.com/edithatogo/authentext/issues/66)
  in [Project 36](https://github.com/users/edithatogo/projects/36)

## Objective

Turn Authentext into a bleeding-edge library without sacrificing portability or
evidence. The portable runtime skill must conform to the current Agent Skills
specification. Host metadata, Conductor extensions, and experimental features
must remain explicit layers with their own validation and rollback boundaries.

## Current evidence

The 2026-07-31 audit found five related classes of work:

1. Generated `SKILL.md` frontmatter is invalid YAML, puts `version` at the
   unsupported top level, and emits `allowed-tools` in the wrong shape.
2. The package exposes two root skill files even though discovery expects one
   `SKILL.md` per skill directory; professional behavior needs canonical routing
   or a separately packaged skill.
3. Test and CI gates can pass or terminate without exercising the intended
   contract. CRLF drift, stale Humanizer assertions, process-wide exits, and an
   invalid release workflow make current status unreliable.
4. Progressive disclosure and evaluation coverage are too weak: large
   references are loaded wholesale and the golden set does not invoke the skill
   or evaluate rewrite behavior.
5. Product identity, version, license, distribution documentation, and hosted
   release state have drifted across npm, Python, generated docs, and workflows.

The official validators and `gh skill publish --dry-run` currently reject the
package. Hosted `main` CI and skill-distribution runs are red. No tag, release,
or public-registry state should be inferred from local planning.

## Scope

### Portable Agent Skill

- Generate valid YAML with only standard frontmatter keys.
- Store the Authentext version under `metadata.version`.
- Remove host-specific tool grants from the portable contract.
- Make one discoverable Authentext runtime skill authoritative.
- Preserve exact technical literals, citations, code, URLs, paths, and
  identifiers.

### Validation and evaluation

- Use official Agent Skills validation in addition to repository checks.
- Make sync deterministic across LF and CRLF environments.
- Prevent a test file from terminating or masking the wider test process.
- Add trigger, near-miss, literal-preservation, and rewrite-quality evaluations.
- Validate workflows as YAML and run all test files in isolation and together.

### Progressive disclosure and host layers

- Route narrowly to smaller references rather than loading the full pattern
  catalog for every invocation.
- Add navigation to long reference files.
- Generate optional OpenAI metadata in `agents/openai.yaml`.
- Keep Gemini, Claude, Cursor, Codex, and other host-only fields outside the
  portable core.

### Conductor and GitHub

- Restore `conductor/index.md` and current setup assets.
- Use specification, MoSCoW requirements, Mermaid design, implementation plan,
  metadata, and track index as the track contract.
- Mirror every historical Conductor track as a GitHub issue and every phase as
  a native GitHub subissue.
- Add every repository issue/subissue to a dedicated GitHub Project.
- Record the exact Conductor upstream main commit and legacy Gemini extension
  release instead of treating their version labels as equivalent.

### Release and experimental channels

- Add `gh skill publish --dry-run` as a preview CI gate.
- Treat Agent Skills `allowed-tools` and Gemini preview features as
  experimental, reversible options.
- Require explicit approval for tags, releases, registry publication, or other
  externally visible distribution.

## Out of scope

- Reintroducing adapter bundles, installation shims, or legacy consumer paths
  into the maintained Authentext distribution.
- Treating the proposed `skills.json` dependency manifest as a standard before
  the relevant RFC is accepted.
- Putting Claude-only `model`, `effort`, `agent`, `background`, `hooks`, or
  `context: fork` fields in the portable skill.
- Publishing, tagging, submitting, or releasing Authentext without a separate
  explicit approval after all gates pass.
- Claiming that stylistic evaluation can prove human authorship or reliably
  detect AI-generated text.

## Acceptance criteria

- [ ] Official Agent Skills validators accept the packaged skill.
- [ ] `gh skill publish --dry-run` passes or records a specific external
      blocker without overstating publication state.
- [ ] Generated YAML parses on Linux and Windows, and `npm run check:sync` is
      line-ending deterministic.
- [ ] The full Node suite runs without masked exits and includes real trigger
      and output evaluations.
- [ ] One canonical runtime skill and optional host metadata are packaged
      without identity, version, or license drift.
- [ ] Progressive-disclosure references are navigable and loaded by task need.
- [ ] All Conductor tracks and phases have idempotent GitHub issue mappings and
      appear on Project 36.
- [ ] Stable and experimental channels have documented pins, support status,
      rollback paths, and evidence boundaries.
- [ ] CI, workflow syntax, docs, and package metadata are coherent.
- [ ] No external publication or release occurs without explicit approval.

## Risks and mitigations

| Risk                                                    | Likelihood | Impact | Mitigation                                                                    |
| ------------------------------------------------------- | ---------- | ------ | ----------------------------------------------------------------------------- |
| Host extensions contaminate the portable contract       | Medium     | High   | Generate overlays separately and validate the portable directory first        |
| Upstream Conductor main and release continue to diverge | High       | Medium | Pin both channels and track upstream issue #176                               |
| Historical issue creation produces duplicates           | Medium     | Medium | Use hidden track/phase markers and an idempotent mapping registry             |
| Evaluation rewards generic flattening                   | Medium     | High   | Include near-miss, low-density, voice, stance, and literal-preservation cases |
| Experimental Gemini features regress                    | Medium     | Medium | Keep workspace flags reversible and exclude them from release criteria        |
| Green local tests are mistaken for publication          | Medium     | High   | Keep hosted, registry, release, and approval gates separate                   |

## Sources

- [Agent Skills specification](https://agentskills.io/specification)
- [Agent Skills best practices](https://agentskills.io/skill-creation/best-practices)
- [OpenAI Codex skills](https://developers.openai.com/codex/skills)
- [Gemini CLI Agent Skills](https://geminicli.com/docs/cli/skills/)
- [Conductor upstream](https://github.com/gemini-cli-extensions/conductor)
- [Conductor Gemini CLI support issue #176](https://github.com/gemini-cli-extensions/conductor/issues/176)

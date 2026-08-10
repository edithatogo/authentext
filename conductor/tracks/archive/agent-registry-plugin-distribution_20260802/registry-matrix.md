# Registry and Host Matrix

This matrix is the planning baseline. Each row must gain a dated receipt and a
final disposition during implementation.

| Channel                                                         | Trust       | Distribution unit                 | Current state                                 | Planned action                                                                | Verification                         |
| --------------------------------------------------------------- | ----------- | --------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------ |
| GitHub Release                                                  | Tier 1      | Portable archive                  | 3.2.0 published                               | Retain as canonical release source                                            | Tag, digest, hosted workflow         |
| GitHub Agent Skills / Copilot                                   | Tier 1      | Agent Skill repository            | Dry-run previously passed                     | Run current `gh skill publish`, preview, install, and update tests            | GitHub publication receipt           |
| skills.sh                                                       | Tier 1      | GitHub-hosted Agent Skill         | CLI resolves repo; catalog receipt incomplete | Establish current Authentext page, badge, hash, and install count baseline    | Catalog plus clean install           |
| Anthropic official plugin directory                             | Tier 1      | Claude skill-only plugin          | Not submitted                                 | Generate package, validate, then submit through official form                 | Submission and listing URL           |
| Authentext Claude marketplace                                   | Tier 2      | `.claude-plugin/marketplace.json` | Absent                                        | Publish generated marketplace or dedicated distribution repo                  | `claude plugin validate` and install |
| OpenAI Codex/ChatGPT workspace                                  | Tier 1      | Skill-only plugin/import          | Portable skill only                           | Generate and test package; document workspace publishing                      | Workspace import receipt             |
| OpenAI public plugin directory                                  | Tier 1      | Codex/ChatGPT plugin              | Third-party route not confirmed               | Monitor official route; mark conditional/unsupported until documented         | Official documentation receipt       |
| Gemini CLI native skills                                        | Tier 1      | Agent Skill repository/package    | Portable layout supported                     | Verify `gemini skills install` and activation                                 | Clean install and `/skills list`     |
| Gemini extension gallery                                        | Tier 1      | Gemini extension bundling skill   | Not submitted                                 | Generate extension, validate/install, submit to gallery                       | Gallery listing receipt              |
| OpenCode native skills                                          | Tier 1      | Agent Skill / HTTP catalog        | Portable layout supported                     | Verify native install, discovery, permissions, and optional HTTP catalog      | Clean OpenCode smoke test            |
| OpenCode npm ecosystem                                          | Tier 2      | Executable npm plugin             | Not justified                                 | Run value gate; publish only if hooks/tools are required                      | Design approval and npm provenance   |
| Claude/Codex/Cursor/Windsurf/Cline/AiderDesk/AMP via skills CLI | Tier 2      | Portable Agent Skill              | Repository resolves                           | Execute cross-host installation matrix                                        | Machine-readable installer receipt   |
| VoltAgent awesome-agent-skills                                  | Tier 2      | Curated repository entry          | Stale `blader/humanizer` entry                | Submit replacement/update to `edithatogo/authentext`                          | Merged PR or disposition             |
| SkillsMD                                                        | Tier 2      | Reviewed GitHub listing           | Not submitted                                 | Validate trust and submit                                                     | Accepted listing URL                 |
| skillsdir.dev                                                   | Tier 2      | Reviewed GitHub issue/CLI listing | Not submitted                                 | Submit after package validation                                               | Accepted listing URL                 |
| agentskill.sh                                                   | Tier 3      | Auto-synced GitHub listing        | Not submitted                                 | Claim ownership, submit, verify sync                                          | Listing and sync receipt             |
| skills.re                                                       | Tier 3      | URL-submitted listing             | Not submitted                                 | Submit if provenance and removal controls pass                                | Listing receipt                      |
| OmniSkill, SkillMD, and other emerging catalogs                 | Review      | Varies                            | Unverified                                    | Apply trust/relevance checklist; include only if threshold passes             | Written inclusion decision           |
| VS Code, JetBrains, browser, and desktop stores                 | Excluded    | Executable extension              | Not applicable                                | Do not wrap a pure instruction package                                        | Recorded exclusion                   |
| OpenClaw/ClawHub                                                | Conditional | OpenClaw skill package            | Not evaluated for runtime fit                 | Evaluate separately; exclude if metadata or behavior would fork portable core | Security and compatibility decision  |

## Inclusion Checklist

A new destination is relevant only when all mandatory checks pass:

- public ownership and maintenance information;
- documented submission, update, and removal process;
- compatible license and public-repository terms;
- direct support for Agent Skills or a justified plugin distribution unit;
- no mandatory hidden telemetry or unnecessary executable wrapper;
- durable URL or API receipt for listing state;
- reasonable security and provenance controls;
- an update path that can be monitored without automatic publication.

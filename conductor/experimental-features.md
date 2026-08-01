# Conductor and Experimental Feature Profile

Checked: 2026-08-01

## Installed channels

| Surface                 | Installed or pinned state                                                                                                                          | Role                                                            |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Codex Conductor wrapper | Upstream main commit `99ba10e1a11130fc159f681b7ba8803489239cbf`; upstream `VERSION` is `0.3.0`                                                     | Codex routing and Windows-safe adaptations                      |
| Gemini CLI              | `0.54.0-preview.0`                                                                                                                                 | Preview host for Agent Skills and current experimental controls |
| Gemini Agent Skills     | `conductor-setup`, `conductor-new-track`, `conductor-implement`, `conductor-status`, `conductor-review`, and `conductor-revert` from upstream main | On-demand Conductor protocols                                   |
| Gemini extension        | Release `conductor-v0.4.1`                                                                                                                         | Legacy command/context compatibility                            |

The upstream default branch and latest release are not interchangeable. Main
has moved to Agent Skills and no longer contains `gemini-extension.json`; the
latest published Gemini extension remains `conductor-v0.4.1`. Upstream issue
[#176](https://github.com/gemini-cli-extensions/conductor/issues/176) tracks
restoring Gemini CLI extension compatibility on main.

## Workspace experimental options

The repository opts into these Gemini preview settings in
[`../.gemini/settings.json`](../.gemini/settings.json):

- `contextManagement`: reduce context pressure on long planning runs.
- `extensionRegistry`: expose the extension discovery surface.
- `extensionReloading`: permit extension iteration without restarting.
- `modelSteering`: accept corrections during long-running work.
- `taskTracker`: expose experimental task dependency tools.
- `worktrees`: enable isolated parallel worktree support when explicitly used.

Plan Mode remains enabled, but Conductor files remain the durable source of
truth. Gemini's internal plan and task tracker are execution aids, not
replacements for `conductor/tracks/<track_id>/plan.md`. This boundary avoids the
known integration ambiguity tracked in upstream issues
[#121](https://github.com/gemini-cli-extensions/conductor/issues/121) and
[#153](https://github.com/gemini-cli-extensions/conductor/issues/153).

## Extension policy

- Treat every experimental option as reversible and non-contractual.
- Do not put host-specific experimental frontmatter in the portable Authentext
  `SKILL.md`.
- Keep proposed standards, including `skills.json`, out of the release contract
  until adopted by the Agent Skills specification.
- Pin external skill and extension revisions in evidence records.
- Do not let experimental task state close Conductor phases or GitHub issues
  without repository evidence.
- Trusting a workspace and authorizing tools remain user security decisions.

## Rollback

Experimental workspace options are independently reversible. Set an option to
`false` or remove it from `.gemini/settings.json`, then restart the Gemini CLI
session. Keep Plan Mode enabled if only a single experimental option is being
rolled back. Before changing the Conductor channel, restore the recorded main
commit or reinstall the `conductor-v0.4.1` extension release; do not treat one
channel as a drop-in replacement for the other.

Rollback does not change `SKILL.md`, Conductor track evidence, or GitHub issue
state. Re-run `npm run validate:conductor` and `npm run conductor:reconcile --
--live` after any channel or workspace-setting change.

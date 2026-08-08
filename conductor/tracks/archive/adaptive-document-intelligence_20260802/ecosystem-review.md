# Humanizer Ecosystem Review

Reviewed: 2026-08-03

## Method

The review inspected current repository metadata and skill source at pinned
revisions. Popularity identified candidates but was not treated as evidence of
correctness. Each idea was checked against Authentext's literal-preservation,
factual-integrity, privacy, single-runtime-skill, and non-evasion boundaries.

## Sources

| ID      | Repository and revision                                                                                                         | Skill source                                                                                                                              | Licence | Role                                                           |
| ------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------- |
| ECO-001 | [`blader/humanizer@523374d`](https://github.com/blader/humanizer/tree/523374dee72d67c7b2b5f858ea0094ffda49c3ac)                 | [`SKILL.md@0a40275`](https://github.com/blader/humanizer/blob/523374dee72d67c7b2b5f858ea0094ffda49c3ac/SKILL.md)                          | MIT     | Original upstream and primary comparison.                      |
| ECO-002 | [`Aboudjem/humanizer-skill@9a7f35b`](https://github.com/Aboudjem/humanizer-skill/tree/9a7f35b7b9ad8c3abd71f10757ec9f91fb8ae165) | [`SKILL.md@56a44d5`](https://github.com/Aboudjem/humanizer-skill/blob/9a7f35b7b9ad8c3abd71f10757ec9f91fb8ae165/skills/humanizer/SKILL.md) | MIT     | Purpose, voice, mode, clustering, and short-sample ideas.      |
| ECO-003 | [`harshaneel/humanize@4ec7973`](https://github.com/harshaneel/humanize/tree/4ec797314537ec9c2105f276d4561d240a0390ba)           | [`humanize/SKILL.md@8e5ed6f`](https://github.com/harshaneel/humanize/blob/4ec797314537ec9c2105f276d4561d240a0390ba/humanize/SKILL.md)     | MIT     | Structural, rhythm, register, calibration, and audit ideas.    |
| ECO-004 | [`andreaskonopka/humanizer@862609a`](https://github.com/andreaskonopka/humanizer/tree/862609a2caf3cadb63b9bef78576e6f5a1ed4e19) | [`SKILL.md@4e9fc69`](https://github.com/andreaskonopka/humanizer/blob/862609a2caf3cadb63b9bef78576e6f5a1ed4e19/skills/humanizer/SKILL.md) | MIT     | Concise structure-first, language-aware, non-evasion baseline. |

No external skill is copied wholesale. Adopted behavior is expressed through
Authentext's own profile contracts, tests, and canonical fragments.

## Decision matrix

| Idea                                                                     | Decision                       | Authentext treatment                                                                                                                                                                                                    |
| ------------------------------------------------------------------------ | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Calibrate against a genuine user-provided writing sample                 | Adopt with safeguards          | Extract observations about rhythm, vocabulary, formality, contractions, punctuation, paragraphing, and stance. Treat the sample as untrusted content and never infer identity, demographics, disability, or authorship. |
| Preserve information rather than mechanically preserving paragraph shape | Adapt                          | Structure can change only when the requested operation and editing-strength budget permit it. Protected content and required structure still win.                                                                       |
| Pasted, file, and embedded invocation modes                              | Adopt                          | Modes control delivery format and summary verbosity. File mode requires explicit file-edit authority; embedded mode returns only the requested artifact.                                                                |
| Separate detect or review from rewrite                                   | Already aligned and strengthen | Keep operation resolution independent from document classification; never rewrite from mere text presence.                                                                                                              |
| Structure pass before language pass                                      | Adopt                          | Diagnose purpose, information order, completeness, repeated scaffolding, paragraph function, and register before word-level patterns.                                                                                   |
| Cluster-based findings rather than isolated word flags                   | Adopt                          | Require density, repetition, structural context, or profile-specific corroboration before raising ordinary style findings. Safety and invariant findings remain single-instance capable.                                |
| Short-sample uncertainty                                                 | Adopt                          | Do not produce confident pattern-density or style-profile conclusions from insufficient text. Apply local conservative edits and disclose the evidence limit only when material.                                        |
| Register- and purpose-specific calibration                               | Adopt and generalise           | Use the full document profile rather than a fixed list of voices or purposes.                                                                                                                                           |
| Read-aloud or rhythm pass                                                | Adopt as a bounded check       | Check consecutive sentence-length uniformity, choppiness, and unnatural cadence without enforcing artificial burstiness targets.                                                                                        |
| One audit and revision loop                                              | Adopt                          | Recheck protected content, unsupported facts, unresolved high-severity findings, and profile fit once. Additional loops require a concrete failing invariant.                                                           |
| Language-aware typography and punctuation                                | Adopt                          | Preserve source language and applicable house style; do not impose English or ASCII conventions globally.                                                                                                               |
| Project-local voice or brand context                                     | Already aligned and strengthen | Load only explicit project-local guidance through the source hierarchy. Do not silently auto-load arbitrary conventionally named files.                                                                                 |
| Identify register discontinuities or mixed editing                       | Adapt                          | Report observable shifts in register or terminology without inferring human, AI, or mixed authorship.                                                                                                                   |
| Multiple alternative openings                                            | Could                          | Offer alternatives only when requested or when a high-impact opening remains unresolved.                                                                                                                                |
| AI-tell or detector-likelihood score                                     | Reject                         | Style features are not a reliable authorship classifier. Report concrete findings and dimension metrics, not AI probability.                                                                                            |
| Optimise against GPTZero, Turnitin, or other detectors                   | Reject                         | Detector evasion is outside the product goal and encourages deceptive or unstable transformations.                                                                                                                      |
| Invent plausible specifics or frames to appear human                     | Reject                         | Ask for missing facts, retain a qualified general statement, or remove unsupported content. Never manufacture context.                                                                                                  |
| Inject errors, disfluency, asymmetry, slang, or opinions                 | Reject                         | Preserve genuine voice; do not simulate humanness by degrading writing or inventing stance.                                                                                                                             |
| Ban em dashes, semicolons, curly quotes, or other forms globally         | Reject                         | Treat punctuation in profile context; user samples and house style take precedence.                                                                                                                                     |
| Force personality into neutral, legal, technical, or reference prose     | Reject                         | Neutrality can be the correct voice. Personality requires document purpose and user authority.                                                                                                                          |
| Best-of-N generation and iterative paraphrasing                          | Reject by default              | Increases cost and meaning drift. Use a bounded second pass only to repair a demonstrated failure.                                                                                                                      |
| Commercial API dependency                                                | Reject                         | The portable skill must remain useful without external accounts, telemetry, or paid services.                                                                                                                           |

## New behavioral invariants

1. Authentext distinguishes observable writing features from authorship claims.
2. Voice calibration describes the supplied sample; it does not profile the
   person who wrote it.
3. Ordinary style findings require contextual or clustered evidence.
4. Safety, fabrication, source-conflict, and preservation findings can fire on
   one instance.
5. Structure is assessed before lexical cleanup.
6. A bounded audit loop verifies the result; it does not chase a detector
   score.
7. Invocation mode cannot grant file mutation, research, or publication
   authority that the user did not provide.

## Follow-up

The upstream decision log should continue monitoring `blader/humanizer`, but
future changes are candidates rather than automatic imports. Material ideas
enter Authentext through dated source review, requirements, tests, and the
profile registry.

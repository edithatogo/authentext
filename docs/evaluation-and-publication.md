# Reader-calibrated editing: evaluation and publication plan

Prepared 2026-11-07. This is a proposed research programme, not a record of
completed experiments, a claim of unique prior art or a submission receipt.

## Questions

Does explicit modelling of reader knowledge, required context, domain register
and length improve comprehension and useful information transfer without
increasing unsupported claims or changing source meaning? Does the answer vary
between single-pass, iterative, retrieval-assisted and multi-agent workflows?
Can source-format protection reduce syntax defects while preserving editing
utility? Which optional style patterns help, harm or add no measurable value?

## Study 1: structural and semantic preservation benchmark

Use openly licensed, version-pinned documents plus synthetic mutations in
Markdown/Quarto, Typst and TeX. Include nested syntax, escaped delimiters,
Unicode, code, quantities with units/currencies, denominator and entity swaps,
negation, scope, uncertainty, obligations and concession inversion. Distinguish
synthetic gold labels from human-verified natural edits. Split by document,
author and template family; prevent near-duplicate leakage.

Compare the unchanged source, generic careful editing, a pinned community skill,
Authentext without its protections and full Authentext, using the same base
models, evidence and output budgets. Retain failures and abstentions in the
denominator. Report mutation sensitivity, benign-edit false alarms, exact-span
integrity, native build success, claim precision/recall, risk versus coverage,
latency and resource use separately. Passing a compiler is necessary but not
sufficient for semantic preservation. Audit extraction and scoring errors.

Keep safeguards outside optional pattern ablations. Add a zero-style-pattern
control, fixed randomisation, repeated seeds, independent evaluation and
confidence intervals before interpreting net marginal lift. Do not optimise
against the held-out set or treat all lexical hits as errors.

## Study 2: production process and final text

Use one base model in five conditions: single-pass drafting, fixed staged
outline/draft, iterative writer/critic, retrieval-assisted drafting and
multi-agent composition. The matched-information condition gives every arm the
same evidence pack; a separate ecological condition allows context discovery.
Run both matched-resource and ordinary-budget comparisons so gains from more
calls/tokens are not attributed automatically to agency.

Record consented visible drafts, prompts, tool actions and revisions, not hidden
reasoning. Measure duplication, term inconsistency, missing handoff context,
unsupported completion claims, process narration, source integration, editing
losses and length drift. Treat these as hypothesised process effects, not a
new authorship classifier. Blind and randomise output presentation. Include
source-appropriate unchanged controls and multiple model families.

## Study 3: reader outcomes under length constraints

Cross specialist, mixed-professional and non-specialist audiences with explicit
short/medium/long budgets. Plan a pilot to estimate variance before determining
sample size. Use reading-comprehension questions, action/decision identification,
reading time, confidence calibration, perceived effort and correction burden.
Avoid showing a participant several versions of the same source unless the
design explicitly accounts for carryover.

Measure missing required context, unnecessary explanations, introduced concepts,
undefined acronyms, domain-inappropriate terminology and source-supported
examples. Keep comprehension, factual fidelity, readability and length as
separate outcomes. Shorter sentences and lower reading-grade scores are not
adequate primary endpoints. Test appropriate jargon, multilingual/ESL writers,
expert-efficient prose and deliberately sparse genres as false-positive controls.

A preregistered paired or mixed-effects design should account for documents,
authors, models and readers. Judge scores should be checked for position,
verbosity and self-preference effects. Automated/model-only studies can support
mechanical and model-evaluated claims, not observed human comprehension.
Human studies require the applicable ethics review and consent.

## Existing evidence and reusable resources

- [PNAS: Do LLMs write like humans?](https://doi.org/10.1073/pnas.2422455122):
  register-sensitive grammatical and rhetorical variation, not a universal word blacklist.
- [STORM, NAACL 2024](https://aclanthology.org/2024.naacl-long.347/):
  pre-writing research, perspective-taking and organisation.
- [NEWSAGENT, ACL Findings 2026](https://aclanthology.org/2026.findings-acl.1816/):
  agentic search/edit workflows and missing-context/narrative-integration evaluation.
- [IteraTeR, ACL 2022](https://aclanthology.org/2022.acl-long.250/):
  multi-domain iterative revision and edit intentions.
- [EditEval, CoNLL 2024](https://aclanthology.org/2024.conll-1.7/):
  instruction-based editing tasks. Check dataset-specific licences and splits.
- [SALSA, EMNLP 2023](https://aclanthology.org/2023.emnlp-main.211/):
  edit-level simplification successes and failures.
- [Reading-comprehension evaluation, TACL 2024](https://aclanthology.org/2024.tacl-1.24/):
  evaluation of meaning preservation through reader questions.
- [BioLaySumm 2025](https://aclanthology.org/2025.bionlp-1.31/):
  specialist-to-lay biomedical summarisation. Historical benchmarks are not open calls.
- [Length-controlled AlpacaEval](https://arxiv.org/abs/2404.04475):
  controlling a documented length bias in model-based preference evaluation.
- [FActScore, EMNLP 2023](https://aclanthology.org/2023.emnlp-main.741/):
  atomic factual precision, to complement rather than replace coverage and discourse checks.

Reuse source-native corpora only after licence, attribution and redistribution
checks. GitHub should hold code, protocol and synthetic fixtures. Hugging Face
may hold permitted versioned evaluation datasets; archive immutable releases
and evaluation receipts with Zenodo. No private manuscript, voice corpus or
lockfile belongs in a public benchmark by default.

## Publication options

| Contribution | Candidate venue | Necessary evidence |
| --- | --- | --- |
| Preservation benchmark and method | ACL/EMNLP through ARR, or TACL | Novel method or evaluation insight, baselines, ablations, reproducible held-out results |
| Agentic versus single-pass writing study | ACL/EMNLP or Computational Linguistics, depending on emphasis | Controlled process comparisons and register-sensitive analysis |
| Interactive editorial system | INLG system demonstrations or a future In2Writing call | Working demonstration and appropriate evaluation; verify the specific call |
| Research software | JOSS | Demonstrated research use, substantive design, sustained public development, tests and documented AI use |
| Clinician/patient reader study | JMIR Human Factors | Genuine user outcomes, safety/understanding measures and appropriate study governance |

As checked on 2026-11-07, [ACL 2027](https://2027.aclweb.org/calls/main/)
has a special theme on homogenization and knowledge collapse in LLMs, with an
ARR submission deadline of 4 January 2027 (Anywhere on Earth). This is a
plausible target for the controlled process/register study if the evidence is
ready; it is not a reason to rush an underpowered evaluation. INLG 2026 has
already occurred; a future demonstration call must be checked separately.

Publication fit is not an acceptance probability. Confirm each venue's current
scope, dates, overlap policy and AI disclosure requirements before submission.
Do not submit the same manuscript concurrently to incompatible review venues.
A software paper and a methods/outcomes paper should make genuinely distinct
contributions and cross-reference shared artefacts.

Official venue guidance:
[JOSS](https://joss.readthedocs.io/en/latest/submitting.html),
[ARR](https://aclrollingreview.org/cfp),
[JMIR Human Factors](https://humanfactors.jmir.org/about-journal/focus-and-scope),
[In2Writing proceedings](https://aclanthology.org/venues/in2writing/).

## Feedback learning and runtime expansion

[SkillOpt-Sleep](https://microsoft.github.io/SkillOpt/docs/sleep/) is a relevant
preview, but local harvesting does not imply zero-egress replay. Real backends
may send transcript-derived material to providers. A future Authentext adapter
must explicitly consent and classify human edits, distinguish style preferences
from factual corrections or changed requirements, retain a pristine holdout,
and stage changes for adoption. A Git commit alone is not proof of human
preference or factual correctness.

Rust/WASM and MCP are optional delivery choices, not evidence of writing quality.
Adopt them only after profiling and validating one shared core, byte-level parity,
least-privilege local tools, permissions and real end-to-end latency. Neither a
sub-15-ms parsing claim nor blanket superiority over all skills is supported.

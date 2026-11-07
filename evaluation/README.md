# Editorial benchmark and reuse programme

Reviewed 2026-11-08 against Authentext `f8ef791` and the repository revisions in
`ecosystem.yaml`. This is an executable metadata preflight and a research design,
not an executed external benchmark or evidence of editorial superiority.

## Decision

Retain the portable offline Node runtime. Put larger evaluation, language-model
and native-parser dependencies in optional, pinned development environments.
Reuse established runners and metrics rather than building a second experiment
platform. Keep claims, reader outcomes and format integrity separate.

The alternative of adding every dependency to the installed skill breaks the
zero-install/privacy contract. Rebuilding everything with custom regexes or a
new Rust runtime duplicates mature libraries without demonstrating quality gain.
Rust/WASM/MCP remain profiling-led delivery options, not research outcomes.

## Is the existing benchmark adequate?

| Existing asset | Useful evidence | Evidence it cannot provide |
| --- | --- | --- |
| Five checked-in `test/fixtures/output-evaluations.json` pairs | Constraints hold for supplied outputs | Actual model rewriting or independent reader preference |
| Source, syntax and preservation regression tests | Reproduced faults are caught by the tested checks | General clinical/legal fidelity or comprehension |
| Pattern ablation enumerator | Reproducible prompt variants and attempt accounting | Marginal quality lift without paired outcomes and labels |
| PelicanBench | Reusable provenance, rights, human-rating and evidence-tier patterns | Prose performance: its tasks and scorers evaluate visual artifacts |
| models_lang | Local training/runtime preflight and smoke-test infrastructure | Editorial capability of a qualified full model or fine-tune |

Keep these assets. Extend them with external tasks and an independently labelled
Authentext-specific set. A test count, 88 prompt variants or a large planned
model matrix is not a sample size of observed editorial outcomes. The
PelicanBench alpha itself distinguishes fixture verification from prospective
execution and human calibration. No existing score transfers across domains.

## Complementary external comparisons

`benchmarks.yaml` is the source register. Each record states its purpose and
limits. Every dataset remains a candidate or watch item until its exact data
revision, digest, terms, split manifest and adapter evidence are reviewed.
Public access is not permission to redistribute or fine-tune.

| Question | Prioritised resources | Required caution |
| --- | --- | --- |
| Instruction-based editing | EditEval; XATU | Preserve task-native instructions; compare the same base model with and without Authentext |
| Simplification and reader fit | ASSET; SALSA; BioLaySumm | SARI/LENS/readability are secondary; lay summaries permit omissions that a lossless rewrite does not |
| Revision and learning | IteraTeR | Human edit intent is not automatically truth or a universal voice preference |
| Factuality checker calibration | TRUE; FRANK; AggreFact | These mainly validate evaluators, not whole-system authoring; prevent source/model overlap and genre overreach |
| Length and scoped constraints | IFEval; LIFEBench; LIFT | Verify each task's counting convention; LIFT is a recent preprint/watch item, not independently validated here |
| Agentic context gathering | NEWSAGENT | Journalism differs from clinical editing; do not attribute extra evidence or extra compute to agency |

No single set covers technical source syntax, contextual comprehension, claim
preservation, author voice and constrained length. Add a local research set
with source-linked claims, numeric/entity relationships, scope, negation,
obligations, concessions, correct non-edits, and native-format builds. Include
expert prose where jargon is necessary and general-audience prose where the
same terms need explanation. English results do not establish multilingual use.

## Protocol and baselines

Preregister three connected but separately reported studies:

1. Preservation and technical reliability: source mutations plus natural edits
   reviewed by independent annotators; native source/build tests in a sandbox.
2. Production-process comparison: single-pass, staged outline/draft,
   writer/critic, retrieval-assisted and multi-agent writing with the same base
   model, evidence and output budget; add a separate ordinary-resource arm.
3. Reader outcomes: comprehension, correct action/decision identification,
   reading time, confidence calibration and correction burden under explicit
   length budgets, stratified by specialist, mixed and non-specialist readers.

Use the unchanged source, a generic careful-edit instruction, a pinned community
skill, full Authentext and a qualified human-editor reference. Record exact
model revision, quantisation, context size, runtime, hardware, prompt hash,
evidence-pack digest, seed where supported, retries, cost and wall time. Keep
unchanged controls so abstaining or declining an unnecessary edit can succeed.

The ablation harness retains a constant safety contract and adds a no-style
control. It now has 88 variants: full, no-style, 40 leave-one-out, 40 single
blocks and six clusters. This is a taxonomy-block experiment, not permission
to disable factual preservation. Safety instructions inside a removed block
remain covered by the fixed contract. Pattern token cost is a coarse UTF-8 byte
estimate, not a provider bill. The development CLI rejects simultaneous
`--dry-run` and `--provider`; failed providers, verifier failures and
inconclusive results remain explicit rows. Private exception messages and
source passages are excluded from the aggregate report.

The old `invariantPreservationRate` field remains null: a verifier pass lacks
the independently labelled denominator needed to estimate that rate. Report
`verificationStatus` and attempt totals instead. `netMarginalLift` and
`editorialPreference` remain null until independently collected outcomes exist.
The adapter is separately trusted executable software, not a network sandbox.
No confidential manuscript may enter a provider without separate authorisation.

## Analysis and validity

Split by document, author and template family. Track shared underlying examples
across EditEval, ASSET and factuality collections; never count re-exported rows
as independent data. Hold out pristine test families and a temporal audit set;
keep prompt tuning, model training and feedback learning away from them.
Public benchmark contamination remains a limitation even with local splits.

Declare primary outcomes before running: material claim errors, reader
comprehension and task success. Report fidelity, restraint, build success,
length compliance, preference, cost and latency separately. Avoid a single
quality score that can hide a factual error behind fluent prose. Include
failed, refused, truncated and inconclusive attempts in the planned denominator.
Distinguish checker sensitivity/false alarms from the editor's error rate.

Use matched-length and natural-length comparisons; validate model judges for
position, verbosity and self-preference bias against blinded human judgments.
Pilot variance and inter-rater reliability before determining sample size.
Use document/author-clustered bootstrap intervals or appropriate mixed-effects
models, rather than treating multiple outputs from one source as independent.
Separate confirmatory effects from exploratory multi-pattern comparisons and
adjust for multiplicity. Model-only results cannot establish human comprehension.
Human studies require applicable ethics review, consent and adjudication.

## Third-party implementation choices

`dependencies.yaml` records the proposed replacement for each custom component:

- Existing `yaml` performs strict registry parsing now; the preflight rejects
  duplicate keys, aliases and unsupported tags. It performs declaration checks
  only, never downloads data, opens receipt paths or authorises execution.
- Inspect AI is the preferred optional runner for model/provider tasks, limits,
  logs and agents. Hugging Face Datasets handles version-pinned local data;
  SciPy/statsmodels handle statistical analysis. Prefer established providers
  over another generic process runner. Configure storage and network policy
  explicitly; a local model name is not proof of zero egress.
- EASSE/SARI and SALSA/LENS support secondary editing metrics. spaCy supplies
  sentence/POS/dependency annotations where validated, not a factuality oracle.
- remark/mdast, Pandoc/Quarto, typst-syntax and unified-latex are candidate
  structural adapters. AST normalisation is not byte-preserving round trip.
  Keep source spans and apply edits to original bytes; native builds run with
  execution disabled unless explicitly permitted and sandboxed. Unsupported
  macros and uncertain parses fail closed. CiteWeft owns neutral extraction.
- fast-check, StrykerJS and Ajv replace hand-built generators, mutation runners
  and broad schema-validation engines as those layers are admitted. Sigstore
  is a release-time attestation candidate; hashes alone are not attestation.

No new library is silently installed into the portable package. Select and pin
exact releases, review licence/advisories/transitive dependencies, generate a
real lockfile in the target environment, and add offline/no-telemetry tests
before adopting each candidate. Reuse does not mean copying an unreviewed fork.

## First-party integration contracts

`ecosystem.yaml` records observed revisions, not installed dependencies or
compatibility proof. Extend existing Conductor tracks. Use optional leaf
adapters and producer-consumer tests; avoid circular runtime dependencies.

- CiteWeft provides source spans, neutral extraction evidence and ambiguity.
- Sourceright provides CSL/reference identity, verification receipts and its
  existing claim/source graph. Authentext adds an editorial retention/operation
  sidecar rather than creating another bibliography or evidence graph.
- Searchright supplies an approved evidence snapshot only for a separately
  authorised research operation. Pure editing remains offline.
- PelicanBench supplies design patterns for provenance, rights and blinded
  rating events. Map to prose-specific tasks; neither visual scores nor its
  unexecuted human-calibration plan are validation evidence for Authentext.
- models_lang supplies qualified local-runtime and adapter configurations.
  Base and fine-tuned models must use identical held-out editorial comparisons;
  tiny synthetic smoke models are not candidates for capability claims.
- Standardflow is a watch item until a current compatible reporting contract
  is verified. Avoid importing obsolete checklist versions as current rules.

Prefer JSON sidecars at the Node/Rust boundary with explicit schema versions,
UTF-8 byte offsets, exact producer revisions, source hashes, capability budgets,
redaction and migration/rollback tests. Validate mismatched revisions, stale
spans, malformed records and unsupported versions. A declaration of a planned
integration is not successful downstream execution.

## Commands and evidence boundary

After the normal repository development setup:

```sh
node evaluation/preflight.js --json
node evaluation/preflight.js --require-metadata
node experiments/ablation-harness.js --dry-run --output /tmp/ablation-plan.json
node --test test/evaluation-program.test.js test/ablation-design.test.js
```

The first command checks the catalog; the second intentionally fails while
admission fields remain unset. Even completed metadata leaves
`receiptsVerified`, `executionAuthorised` and `qualityCertified` false. A future
admission controller must inspect the actual rights/split/adapter receipts.

Code/protocol/synthetic fixtures stay in GitHub. Only licensed, consented
releasable data may enter Hugging Face; private manuscripts, voice samples and
source-containing lockfiles stay local. Immutable releases/results may be
archived through the existing publication workflow after approval.

See the [research and publication plan](../docs/evaluation-and-publication.md)
and [Conductor implementation plan](../conductor/tracks/quality-harness-and-matrix_20260811/implementation-20261108.md).
Candidate destinations remain ACL/EMNLP/TACL for methods and benchmarks, JOSS
for research software, and JMIR Human Factors for an actual reader study.
Verify calls and submission requirements before use; no submission is made here.

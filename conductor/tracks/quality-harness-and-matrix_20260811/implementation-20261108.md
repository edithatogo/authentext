# Evidence-based editorial quality implementation plan

> For agentic workers: use test-first execution and the existing Conductor
> workflow. A checked task records only the deliverable stated, not a scientific
> result, completed integration or external acceptance.

**Goal:** Improve reader understanding under explicit length constraints while
preserving source-supported claims, voice and native document structure.

**Architecture:** Retain the offline zero-install skill. Add optional evaluation
and parser adapters, source-linked operation contracts and independently scored
holdouts. Reuse first-party extraction, citation and retrieval boundaries.

**Tech stack:** Existing Node 24 and `yaml` for the initial slice; qualify
Inspect AI, Datasets, SciPy/statsmodels, established language/parser libraries,
fast-check, StrykerJS and Ajv in isolated locked development environments.

**Spec:** [evaluation/README.md](../../../evaluation/README.md), the existing
[track specification](spec.md) and
[research protocol](../../../docs/evaluation-and-publication.md).

## Global constraints

- No live model or dataset download in default CI; no private document egress.
- No new portable runtime dependency or implicit installation in this slice.
- Generated skill surfaces remain source-owned and deterministic.
- POSIX manifest paths and UTF-8 LF artifacts; document byte spans are explicit.
- No detector optimisation, invented biography or authorship inference.
- No global quality/semantic/build assurance from a static check or model judge.
- Exact-version dependency/rights review precedes optional adapter admission.

## Review focus

Test task-specific omissions against the requested operation, not a universal
lossless rule. Test quantity-to-entity relations, not just numeric multisets.
Test unchanged prose and required jargon as false-positive controls. Test
private provider errors and missing data as failures rather than lost rows.
Test parser-source offset drift and cross-repository version disagreement.

## Completed bounded slice

- [x] Catalogue complementary external benchmarks with explicit purpose/limits
  and unset admission fields instead of invented licence/revision receipts.
- [x] Reuse the existing `yaml` dependency for strict metadata preflight.
- [x] Add tests for malformed/aliased registries, false readiness and CLI failures.
- [x] Add a fixed ablation safety contract, zero-style control, separate provider
  and verifier failures, and inconclusive-result accounting.
- [x] Record third-party choices and observed first-party repository boundaries.

These boxes describe source/fixture work. External data, model comparisons,
human ratings, native builds and integration compatibility remain unexecuted.

## Task 1: claim ledger and operation permissions (P0)

**Owner:** domain-and-citation plus editorial-safety-invariants tracks.
**Files:** propose `src/document-intelligence/editorial-retention.schema.json`,
`test/editorial-retention.test.js` and an optional Sourceright consumer adapter.
**Interface:** a source-hash-bound editorial sidecar references producer claim
and citation IDs, subject/relation/object, quantities and units, population,
time, conditions, negation and independent modality dimensions. It carries an
operation and per-claim `retain`, `compress` or explicitly authorised `omit`.

- [ ] Write failing fixtures for group/denominator swaps, changed currency or
  units, modal scope, incomplete extraction and source-hash disagreement.
- [ ] Distinguish epistemic certainty, causality, quantification and deontic
  obligation instead of putting must/causes/always on one certainty ladder.
- [ ] Implement a thin versioned sidecar over Sourceright's EvidenceGraph and
  CiteWeft spans; preserve uncertainty and external review authority.
- [ ] Add rewrite/summary/translation/lay/executive operation policies and
  tests that permitted summary omissions never alter the canonical source.
- [ ] Run producer-consumer tests and independently annotated natural-edit
  evaluation; mark unknown coverage inconclusive, never equivalent.

## Task 2: reader-context and length effectiveness (P0)

**Owner:** this quality track; extends the existing reader-fit module.
**Files:** propose `evaluation/tasks/reader_fit.py`,
`evaluation/fixtures/reader-contracts.jsonl` and an annotation codebook.
**Interface:** source, audience, required context, authorised evidence pack,
operation, length scope/counting policy, mandatory claims and output budget.

- [ ] Write examples requiring background, acronym expansion, domain-appropriate
  terminology and useful explanatory ordering without unsupported additions.
- [ ] Add positive controls: concise expert prose, intentional fragments,
  unavoidable technical terms and clean text requiring no changes.
- [ ] Test hard maximum/range/target/preserve-scale contracts per requested
  section, with source-native counters and token limits kept distinct.
- [ ] Evaluate conflicts between mandatory content and length as explicit
  outcomes; never reward silent omission or padded minimum-word answers.
- [ ] Pilot blinded comprehension/action questions, reading time and effort;
  determine sample size after variance/reliability estimates and ethics review.

## Task 3: third-party parser and native-build qualification (P0)

**Owner:** technical protection; neutral extraction remains CiteWeft-owned.
**Files:** propose `evaluation/adapters/native_formats/`,
`evaluation/fixtures/native_formats/` and pinned toolchain manifests.
**Interface:** original bytes plus spans, parser/version/diagnostics and proposed
prose edits; outputs include span parity and sandboxed native-build receipts.

- [ ] Write malformed/nested/escaped/macro fixtures before replacing scanners.
- [ ] Qualify remark/mdast, Pandoc/Quarto, typst-syntax and unified-latex against
  byte spans; AST reserialisation alone must not pass an exact-preservation gate.
- [ ] Run native builds with external execution/includes/network denied by
  default. Record explicitly permitted execution separately.
- [ ] Use fast-check for property/metamorphic tests: no-op round trips, repeated
  passes, valid reordering, preservation after bounded edits and safe failures.
- [ ] Use StrykerJS to check whether planted defects are actually detected.
  Promote adapters only with measured failure/false-alarm rates and rollback.

## Task 4: independent comparative evaluation (P0)

**Owner:** this track, extending Phase 3 rather than creating another benchmark.
**Files:** propose `evaluation/tasks/`, `evaluation/adapters/`,
`evaluation/locks/`, `evaluation/receipts/` and a preregistered protocol.
**Interface:** exact dataset/model/prompt/scorer revisions, grouped splits,
planned run cells, per-attempt outcome and independent rating records.

- [ ] Pin rights-cleared source subsets and deduplicate overlapping underlying
  datasets before admitting EditEval/XATU, ASSET/SALSA and factuality sets.
- [ ] Implement Inspect tasks and local Datasets adapters; test with fixture
  providers first, including timeouts/refusals/truncation and secret redaction.
- [ ] Reuse EASSE/SALSA metric implementations, validate factuality evaluators
  against TRUE/FRANK/AggreFact, and use length/scoped-constraint benchmarks.
- [ ] Preserve the fixed safety contract and no-style control in optional
  pattern ablations; collect paired outcomes before computing marginal lift.
- [ ] Compare generic editing, pinned community skill, Authentext and human
  reference using multiple model families and matched information/budgets.
- [ ] Run a separate controlled single-pass/staged/writer-critic/retrieval/
  multi-agent experiment. Visible prompts/tool actions are sufficient; never
  collect hidden reasoning. NEWSAGENT is an external comparator, not a match.
- [ ] Use SciPy/statsmodels clustered intervals/mixed effects, blinded judges,
  position/verbosity controls, multiplicity handling and an untouched holdout.
- [ ] Release an evidence dossier only after the run/data licences and actual
  outputs support the stated conclusions; test corpus-specific rather than
  universal clinical/legal claims.

## Task 5: ecosystem contracts and governed feedback (P1)

**Owner:** domain-and-citation, voice-corpus-calibration and this quality track.
**Files:** propose `evaluation/contracts/`, privacy fixtures and local feedback
records excluded from Git. Source register: `evaluation/ecosystem.yaml`.
**Interface:** versioned JSON at Node/Rust boundaries; source hashes, UTF-8 byte
spans, producer revision, provenance, permission envelope and human authority.

- [ ] Implement source extraction/citation sidecar consumer canaries for CiteWeft
  and Sourceright; use Searchright snapshots only on authorised research tasks.
- [ ] Adapt PelicanBench rating/provenance concepts without importing visual
  scoring or implying that its human-calibration programme has been executed.
- [ ] Qualify models_lang base/fine-tuned pairs with identical held-out editorial
  tasks, measured hardware/runtime conditions and separate acquisition consent.
- [ ] Separate stylistic preferences from factual corrections, task changes and
  formatting edits before local feedback consolidation. A commit is not proof
  that its edits were human, correct or generalisable.
- [ ] Keep replay offline unless separately approved; stage proposed updates
  for review, test holdouts and drift, and support removal/rollback. Do not
  install automatic harvesting or a nightly schedule without explicit consent.
- [ ] Keep Standardflow as watch-only until current compatible contracts exist.

## Task 6: delivery and publication evidence (P2)

- [ ] Profile realistic documents first; only then decide whether Rust/WASM or
  MCP improves measurable latency, portability or security over the Node path.
- [ ] Use one shared core with SDK adapters, least privilege, parity and hostile
  input tests. Avoid unmeasured sub-millisecond or 50,000-word throughput claims.
- [ ] Add Sigstore/SLSA-style release provenance after identity, permission and
  verification policy is designed. Existing SHA-256 hashes are not signatures.
- [ ] Prepare distinct methods/benchmark, research-software and reader-outcomes
  manuscripts; follow the existing publication plan and verify current calls.
- [ ] Publish only approved, rights-cleared artifacts through GitHub/Hugging
  Face/archive workflows. Keep private source and voice samples out of uploads.

## Execution order and completion rule

Use small PRs in the order 1/2 contracts, 3 parser qualification, 4 evaluation,
5 interoperability/learning, then 6 justified delivery. Work may proceed in
parallel only with stable shared contracts. A coding agent can accelerate
implementation; it cannot replace human recruitment, licensing, independent
annotation or held-out experiments. Use evidence gates rather than invented
calendar estimates. Mark each task with its exact revision and observed receipt.

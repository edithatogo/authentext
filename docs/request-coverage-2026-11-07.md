# Requested frontier changes: implementation coverage

Audit date: 2026-11-07. Baseline: main at c56d9c1, following PRs 325 and 326.
"Implemented" in those PRs means bounded initial capabilities, not full
completion of every acceptance criterion or empirical superiority.

| Request | Present in baseline | Remaining gap |
| --- | --- | --- |
| Track 1: rewrite verification | Local metrics, code/citation/link/number checks, profile input | Not exhaustive semantic/entity preservation; CV and dash thresholds are warnings rather than validated universal hard limits |
| Track 2: voice calibration | Local structural statistics, paired corpus deltas, source-free numeric output | No held-out demonstration of author-specific improvement, robust genre separation or uncertainty calibration; a numeric profile is still potentially sensitive derived data |
| Track 3: ablations | Baseline, 40 leave-one-out, 40 single-pattern and six cluster variants; local provider interface | No completed empirical ablation, zero-skill control, blind preference labels, calibrated marginal-lift score or automated demotion; fixture coverage and safety-envelope isolation need expansion |
| Track 4: governance | Generated hash inventory, estimated token budget, static scans | Hashes are not signed attestations; scans are not a sandbox or proof of prompt-injection resistance |
| Track 5: technical syntax | Bounded lexical masking, role tokens, private lockfile, round-trip and negative tests | Not native complete AST parsing; no external Quarto/Typst/TeX build matrix or representative grammar corpus |
| Track 6: discourse | Modality, scope, negation, obligation and concession heuristics; local density proxy | No complete claims/RST graph, calibrated semantic equivalence, true entropy/perplexity or validated information-density threshold |
| Feedback learning | Not implemented | Explicit post-accept capture, edit-intent attribution, consent, retention, held-out validation and review-before-adopt are required |
| Rust/WASM and MCP | Not implemented | Performance justification, authoritative core boundary, cross-runtime parity and least-privilege packaging remain design work |
| Independent evaluation | Not completed | Software tests are not evidence of reader comprehension, editorial superiority, safety in deployment or personalised voice fidelity |
| Release/migration | Canonical development consolidated; legacy v3.2 snapshot retained | No v3.3 release tag or registry publication; legacy host migration needs real install/update/rollback evidence |

## Additional executable gaps found by this audit

At baseline, the following changes passed inspectRewrite despite changed meaning:

- The fee was $100. -> The fee was EUR 100.
- The dose was 5 mg. -> The dose was 5 g.
- Swapping 40 and 20 patients between Group A and Group B. This produced
  INCONCLUSIVE_ALIGNMENT but the overall passed flag remained true.

The reader-context-and-length change adds bounded currency/unit/date literal
checks and makes unresolved alignment fail standard/deep verification with an
explicit inconclusive status. This closes the reproduced cases, not arbitrary
quantity semantics or full role binding. Light mode remains a limited check.

## Reader-fit and length scope

The new source-owned reference adds reader starting knowledge, necessary
context, domain register, explanatory sequence, information load, final-artifact
review for agentic workflows, and explicit length budgets. The optional local
reader contract enforces declared word constraints and emits advisory terminology
and sentence-length findings. It does not certify context sufficiency,
comprehension, jargon misuse, conceptual density or authorship.

Summarisation is not equivalent to a lossless rewrite. A future operation-specific
claim ledger must distinguish required claims, permitted compression and
explicitly permitted omission. Current strict rewrite failures must not be
silently suppressed to make a summary appear verified.

## Next gates

1. Lock a non-ablatable safety envelope and add a zero-skill comparator before
   interpreting pattern ablations.
2. Add native-format fixture builds and mutation/property tests, with untrusted
   document execution isolated and shell/network access disabled.
3. Separate epistemic confidence, causal relations, deontic force, negation,
   quantification and claim scope rather than treating them as one certainty scale.
4. Establish reader comprehension, claim coverage, editing burden and length
   compliance on held-out documents and audiences.
5. Treat any proposed learning update as a candidate requiring consent, provenance,
   holdout gates and review, never as an automatic rewrite of the global skill.

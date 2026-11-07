# Authentext v3.3.0 frontier architecture

## Single source and distribution

All maintained source, tests, packages and release builds belong to
[edithatogo/authentext](https://github.com/edithatogo/authentext).
The distribution repository contains a previously published v3.2.0
compatibility snapshot. Do not replace the snapshot without proving that
existing installation paths still work. Build the next packages here:

~~~sh
npm run sync
npm run validate
npm test
npm run build:distribution -- --output distribution-staging
~~~

The release pipeline publishes package archives and digest receipts from this
repository, not from handwritten copies in another Git repository.

## Execute: verify the rewrite locally

~~~sh
node scripts/verify-rewrite.js --original draft.md --rewrite revised.md --mode standard --json
~~~

The tool excludes YAML frontmatter, fenced code, inline code and display math
from prose statistics. It reports sentence-length mean, population standard
deviation, coefficient of variation (CV), type-token ratio and punctuation rates.
It compares protected literal multisets, including code, URLs, markdown links,
DOIs, citations, numeric values and p-values. Exit 1 indicates detectable drift,
not a semantic verdict. The optional --allow-code-edits relaxes code comparison
only when a user explicitly authorises it.

A CV below 0.45 is at most a review suggestion. A punctuation threshold is
also contextual, not an authorship detector. Default em dash density of zero
does not veto an author-approved exception. The verifier cannot guarantee
unmodified negation, scope, chronology or factual support. All clinically or
legally material edits still need contextual review.

## Calibrate: governed voice fingerprint

~~~sh
node scripts/calibrate-voice.js --corpus ./my-writing --flattened ./matched-generic --output ./private/voice-profile.json
~~~

The corpus requires explicit consent and may contain only .md or .txt files.
Paired flattened files must share relative names. The JSON profile contains
structural numbers and differential metrics only, not raw passages, file names,
biography, personal names or inferred identity. The profile never leaves the
machine through these scripts. Short or mixed-genre samples are weak evidence.

## Learn: paired pattern ablations

~~~sh
node experiments/ablation-harness.js --dry-run --output experiments/reports/ablation-schema.json
~~~

The harness parses exactly 40 source pattern blocks and enumerates a baseline,
40 leave-one-out variants, 40 single-pattern variants and 6 category ablations.
Live execution requires an explicitly selected local Node provider adapter and
an input file. The adapter receives a JSON object on standard input and returns
text or a JSON object with an output field. Adapters are separately trusted
software; they must not be treated as non-egress merely because the harness
does not use network APIs. Do not use confidential material with a remote
adapter without the relevant authorisation.

A JSON ablation report records prompt-token estimates, verified invariant
outcomes, CV and punctuation changes. It deliberately leaves quality lift as
null until independent paired blind judgements and semantic evaluation exist.
Pattern counts, mechanical checks and token savings cannot prove editorial gain.

## Govern: skill card and integrity

~~~sh
node scripts/build-skill-card.js
node scripts/build-skill-card.js --check
~~~

The card provides a reproducible SHA-256 inventory of compiled Markdown and
runtime JavaScript, with byte, word and rough token estimates. The root skill
budget is 8,500 estimated tokens, using UTF-8 bytes divided by four. The
estimate is not model-specific tokenisation.

The scanner rejects hidden bidirectional/Unicode tag controls and network
primitives in local editorial scripts. It is static, not a runtime sandbox
and cannot certify the behaviour of an arbitrary provider adapter. All release
decisions remain subject to CI, review, and separate tag approval.

## Next validation milestone

Run an independent blinded study against basic LLM editing, an upstream
humanizer, professional human editing and Authentext, across clinical,
academic, public-facing and casual writing. Report paired ratings, preserved
atomic claims, newly invented claims, false-positive changes, latency, cost
and uncertainty intervals. Treat all style metrics as secondary outcomes.

## Scientific protection and discourse checks

The protection reference documents the mask, restore and verification pipeline.
Recognised syntax is restored from hashed local lock records. Preserve the
original source and use the optional original-file check during restoration.
The implementation uses conservative balanced lexical scanners, not a full
Quarto, Typst or TeX AST. It never executes embedded code or guarantees a build.

Discourse telemetry separates certainty and scope, negation, deontic force,
concessive structure and uncertain alignment. A static four-tier lexical
screen is not semantic entailment. Density warnings measure a local heuristic,
not perplexity or information entropy. Explicit overrides are recorded and
never imply permission to change clinical or legal meaning.

The ablation harness retains common safety instructions for every variant,
respects code-fenced pattern examples, and refuses provider execution in dry-run
mode. Constraint lift and token costs remain distinct from independently rated
editorial quality. No quality advantage or pattern demotion is inferred from
unrun experiments.

## Optional architecture proposals not shipped

Rust/WASM, a new MCP server, automatic session harvesting and nightly local
self-modification remain research proposals. They add execution, privacy and
maintenance boundaries that need separate design and tests. No sub-millisecond
or 15-millisecond latency claim has been measured. No ecosystem-wide superiority
claim has been established. Human post-edits can contain factual corrections or
new instructions, so they cannot automatically serve as ground-truth style
preferences or authorise a profile update.

## Canonical release packages

The release workflow builds all host packages from this repository. The main
skill ZIP and TAR include the allow-listed runtime scripts and an ES-module
manifest, so installed tools work without npm installation. A separate
host-distributions archive includes per-package SHA-256 receipts. The file
SOURCE_SKILL_CARD.json records the larger source-build inventory; some
maintainer files listed there intentionally stay out of installed packages.
No release tag, registry submission or compatibility-repository deletion is
implied by merging implementation code.

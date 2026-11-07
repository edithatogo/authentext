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
a no-style control, 40 leave-one-out variants, 40 single-pattern variants and
six category ablations. All 88 variants retain a fixed preservation contract.
Live execution requires an explicitly selected local Node provider adapter and
an input file. The adapter receives a JSON object on standard input and returns
text or a JSON object with an output field. Adapters are separately trusted
software; they must not be treated as non-egress merely because the harness
does not use network APIs. Do not use confidential material with a remote
adapter without the relevant authorisation.

The v1.1 report records prompt-token estimates, separate verification statuses,
CV and punctuation changes. Failed and inconclusive attempts remain in the
planned denominator. Quality lift and invariant-preservation rates remain null
without independently labelled outcomes. The [evaluation programme](../evaluation/README.md)
defines comparisons, admission checks, library reuse and ecosystem boundaries.
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

# Technical-document protection

## When to use the local pipeline

For Quarto (.qmd), RMarkdown (.Rmd), Typst (.typ), LaTeX (.tex), and Markdown
with citations or mathematics, mask protected syntax before editing prose when
the host grants shell access. Resolve scripts relative to the installed skill,
not to an arbitrary project working directory. The commands use Node.js 24
built-ins and make no network calls or native renderer invocations.

```sh
node scripts/mask-ast.js --input manuscript.qmd --output masked.txt --lockfile private.ast-lock.json
node scripts/unmask-ast.js --input edited-masked.txt --lockfile private.ast-lock.json --output revised.qmd --json
node scripts/verify-rewrite.js --original manuscript.qmd --rewrite revised.qmd --mode standard --json
```

The host edits only masked prose. Leave every AST token unchanged, including its
role and ID. CITE denotes a parenthetical citation, NCITE a narrative citation,
REF a cross-reference, INLINE a protected inline construct, and BLOCK a
standalone protected block. Keep structural tokens in order. Preserve the
clause role of a narrative citation even when rephrasing its surrounding text.

The lockfile contains exact private source text. Keep it local, outside version
control and shared receipts. Never send it to the model, search, an external
service or a public CI artifact. The masked prose can still contain sensitive
information: masking syntax is not de-identification. Only use a host authorised
to process the original document. Keep an immutable source copy and lockfile.
A sidecar's self-hash detects accidental drift, not malicious re-signing; pin the
source SHA-256 independently when provenance matters.

## Bounded syntax contract

The implementation uses balanced lexical scanning, not complete native ASTs.
It protects YAML, code fences and inline code, citation groups and narrative
keys, cross-references, fenced div markers, attribute spans, math, Typst code
expressions, labels, TeX preambles, commands and environments. Nested constructs
are protected whole, including captions or content blocks. This deliberately
sacrifices some editable text rather than exposing executable syntax.

Unmasking fails on missing, mutated, unknown or duplicated tokens, modified
lockfiles, unmasked protected syntax or malformed delimiters. Structural tokens
retain their order. Only an explicit user decision may permit duplicate
citation tokens through --allow-duplicate-cites; it never permits duplicate
code or blocks. Do not repair a failed token by guessing a citation or macro.

Exact locked-span recovery is not proof of a valid document build. Includes,
packages, filters, macros, bibliography files and native format semantics remain
outside this lexical scanner. Run the relevant native build only in a separately
authorised sandbox. Never execute Lua, R, Python or Typst from untrusted source
as a side effect of editing. Context-changing TeX primitives such as catcode
are rejected. Unsupported or ambiguous syntax requires manual review.

## Discourse and uncertainty diagnostics

The verifier aligns claims using lexical anchors and short adjacent-sentence
windows. It reports:

- `epistemicDrift`: heuristic changes in uncertainty, causality, obligation,
  negation or scope, with source and rewrite line ranges.
- `polarityInversion`: a swapped concession/nuclear claim or lost contrast.
- `flatEntropySpans`: local lexical-density warnings with exact line ranges.
- `alignmentIssues`: claims that could not be aligned confidently enough.

Standard and deep modes block detected epistemic or polarity drift. The explicit
--allow-modality-shift override applies only to hedge/certainty changes; it does
not waive lost scope, negation, obligations, citation drift or polarity changes.
Light mode reports these issues without treating them as a semantic verdict.

The density field is a three-sentence rolling proxy based on content-word ratio,
nominalisation suffixes and subordinate markers. It is not entropy, perplexity,
a dependency parse, or measured propositional density. Five or more low-variance
sentences generate an advisory, never an instruction to invent detail or force
rhythm. Keep deliberate repetition, required structure and the author's voice.

A successful report never proves semantic equivalence. Lexical alignment can
miss paraphrases and produce false positives. Review unaligned or ambiguous
claims, study boundaries, causal interpretation and clinical/legal effect
independently. Preserve meaning instead of changing prose to satisfy a score.

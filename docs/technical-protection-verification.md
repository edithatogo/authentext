# Technical protection verification

## Scope

Tracks 5 and 6 extend the v3.3 foundation with a local bounded lexical shield,
role-typed stand-off tokens, exact protected-span restoration, and contextual
checks for modality, scope, negation, obligations and concession direction.
The portable packages include the required local scripts and their hashes.

## Evidence

The candidate based on the merged foundation passed all executable gates on
GitHub's Node 24.22.2 runner before the source was committed as
`0f98ddd6dc5c88a289cb4b7c376db3a6008ed0fa`. The gates covered source sync,
validation, lint, Vale, type checking, formatting, the Node test suite, coverage,
sync drift and builds for portable, Claude, Codex, Gemini and OpenCode packages.

Measured code coverage was 90.73% of lines, 94.40% of functions and 80.71% of
branches. Test totals include dynamically enumerated workflow tests; removing
the temporary transport workflow reduces that count by one without removing
any product tests. Standard CI and cross-platform checks on the final PR head
are the merge gate, not this historical candidate receipt.

The patch transport contained only public repository code and synthetic
fixtures. Its payload and temporary workflow are removed from the final tree.
All maintained generated outputs are compiled from source rather than edited
independently.

## Failure cases exercised

- Missing, duplicated, mutated and unknown stand-off tokens.
- Altered lockfile contents, hashes and source identity.
- Unmasked citation/code injection and unclosed structural delimiters.
- UTF-8 errors, source/output aliasing, CRLF and decomposed Unicode.
- Nested Typst expressions and TeX macros, including misleading markers inside
  comments or strings.
- Associative statements rewritten as causal claims, lost uncertainty or scope,
  changed negation and new mandatory obligations.
- Reversed or deleted concessions, including a positive sentence-splitting case.
- Uniform six-sentence passages with line-accurate advisory density warnings.
- Execution of the installed package without repository development dependencies.

## Limits

This scanner is not a complete Quarto, Typst or TeX AST implementation. It
preserves recognised locked spans byte-for-byte, not the semantics of arbitrary
macros or executable documents. Native document builds and a representative
external corpus evaluation remain separate gates.

Claim alignment, epistemic tiers and lexical density are transparent heuristics.
They provide neither a semantic-equivalence proof nor clinical or legal
assurance. Density is not perplexity, information entropy or an authorship score.
The lockfile contains private source text and belongs outside version control
and model input. Static non-egress checks are not an operating-system sandbox.

No release tag, registry publication, Rust/WASM runtime, MCP server or automatic
learning process is introduced by this change.

# Authentext technical-document safety design

## Intent and scope

Complete the existing v3.3.0 PR and add the user's Tracks 5 and 6 without
claiming comprehensive AST parsing, semantic proof, or measured superiority.
Preserve the portable skill and dependency-free local Node.js runtime.

## Approaches and decision

A full parser per language would add runtimes and still require native renderer
checks. A regex-only replacement cannot safely handle nested syntax. Use a
bounded, balanced-delimiter lexical shield with explicit supported constructs,
conservative whole-construct protection, and fail-closed malformed input.
This implements the requested stand-off interface, not a complete AST compiler.
Native Quarto, Typst, and LaTeX builds remain separate, sandboxed user gates.

Discourse checks use traceable lexical alignment and separate modality, scope,
negation and concession checks. They are conservative heuristics, not a trained
RST parser or a guarantee of clinical or legal equivalence. Local density is a
lexical proxy, not entropy, perplexity or measured propositional content.

## Contracts

- Runtime dependencies are Node.js built-ins only; no outbound requests or
  subprocesses in installed editorial tools.
- Preserve original UTF-8 bytes, including CRLF and Unicode normalisation, in
  protected spans. Reject invalid UTF-8 rather than silently replacing bytes.
- The AST lockfile is private source content. Never commit it, publish it in CI,
  or send it to a model or external service. Local explicit output only.
- Fail unmasking on missing, unknown, modified or duplicate tokens, digest
  mismatch, raw executable syntax, or delimiter errors. Only citation tokens
  may repeat with explicit authorisation. Keep block ordering stable.
- Scope, modality and polarity failures block standard/deep edits. Overrides
  are narrow and recorded. Style warnings never justify altered facts.
- Profiles are quantitative, consent-based, genre-sensitive and local. No raw
  corpus text, names, filenames or quotations appear in profile JSON.
- Source fragments own instructions; run the compiler for generated outputs.
- Keep existing distribution snapshots intact. New package builds belong to
  the canonical repository, with an exact allowlist of optional runtime files.

## Deferred claims and extensions

Rust/WASM/MCP packaging, unattended feedback harvesting and automatic profile
adoption are not in this release. They require measured need, explicit consent,
held-out evaluation and independent security review. No sub-15ms performance,
zero broken build, or category-leading claim is supported by the current tests.

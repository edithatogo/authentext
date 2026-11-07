# Scientific rewrite protection: design and boundaries

## Intent

Implement the user's six-track specification in the canonical Authentext repository,
resuming PR #325 rather than assuming its unmerged work is complete. Preserve the
portable skill, consented corpus intake, generated source architecture and all
existing safety rules. New editorial CLIs use Node standard-library modules only.

## Approaches and implementation rulings

A full Quarto/Typst/TeX compiler is incompatible with the dependency-free portable
runtime. Use a conservative, format-aware lexical span shield, with balanced
construct scanning and fail-closed rejection of unsupported or malformed syntax.
Keep the requested AST CLI names for compatibility, but explicitly identify the
implementation as a lexical shield, not a complete AST parser. Native rendering
remains a separate check. No document code is executed.

Use deterministic lexical anchor alignment and explicit uncertainty/scope signals
for discourse review. These are bounded heuristics, not RST parsing, natural-language
entailment, proof of meaning preservation or a clinical/legal compliance guarantee.
The four user-specified tiers are telemetry; deontic force and negation are also
recorded separately rather than confused with causal certainty. Density telemetry
is a lexical proxy, not model perplexity, entropy or measured propositional content.

Keep a single source/build repository. The existing distribution repository remains
an immutable legacy installation snapshot with a migration notice, not an
independently maintained product. New packages include only reviewed runtime files.
No tag, registry publication, scheduled task, session harvesting or model call is
implied by implementation or merge.

## Boundaries

- Source and restored files retain UTF-8 bytes, including CRLF and Unicode composition.
- Lockfiles contain private source spans: local, permission-restricted, never logged.
- Restoring checks token bijection, hashes, block ordering and fresh raw syntax.
- Ambiguous alignment requires review; explicit overrides remain in the receipt.
- A numeric profile never embeds corpus passages; it is still potentially identifying.
- Subprocess provider adapters require explicit opt-in and separate trust review.
- Static security scans and hashes are bounded controls, not signed attestations.
- SkillOpt adaptation, Rust/WASI/MCP, performance targets and causal quality claims
  remain research tracks until independently measured and reviewed.

## Acceptance

Run targeted red/green tests, complete Node suite, deterministic sync, validate,
format, lint, type checking, coverage, real package execution and hosted Linux,
macOS and Windows checks on exact PR heads before merging. Retain exact evidence
and report any remaining gaps without claiming a v4.0 or ecosystem superiority.

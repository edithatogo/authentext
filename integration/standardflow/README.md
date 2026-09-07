# StandardFlow text-evidence integration

Authentext supplies bounded textual-pattern findings with stable rule identifiers, versions, source spans, uncertainty and reversible editorial suggestions. StandardFlow owns standards identity, applicability, evidence expectations and standards-derived assessment state.

The optional exchange emits a versioned `text_pattern_finding` evidence envelope. It is local, advisory, network-off, telemetry-off and write-off by default. Raw text is excluded by default; the fixture carries offsets and a document-local locator instead. StandardFlow may surface the finding beside an applicable requirement, but it may not infer AI or human authorship, misconduct, plagiarism, detector evasion, claim truth or standards compliance.

The consumer is exact-pinned to verified `edithatogo/standards_check` revision `f248d7c4dd40dd34cb45b5b6150b4750a5b28864` from pull request 59. Its foundation contract and Rust gates passed at this revision. Automatic pin updates are prohibited, and merge/runtime/downstream evidence remains separate. Absence or incompatibility of StandardFlow leaves the Authentext skill and compiled references unchanged.

Validate the source contract and fixture with:

```bash
node scripts/check-standardflow-integration.mjs
```

This proves local structure and authority policy only. Runtime interoperability, downstream compilation, user acceptance and external methodological validation require separate receipts.

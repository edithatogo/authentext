# Authentext reader fit and length

## Reader contract

Before drafting or revising, establish who will read the output, what they
already know, what they need to understand or decide, and the requested length.
Read the reader-fit.md reference when context, accessibility,
terminology, compression or output length matters. These are editorial needs,
not clues about who wrote the source. Retain necessary specialist language.

Use explicit word limits as constraints; keep approximate targets distinct from
hard ceilings. Without a requested length, preserve the source's scale rather
than expanding it automatically. A ceiling never authorises deletion of a
material qualification or an invented explanation. Report an impossible budget.
With shell access, pass an explicitly supplied local contract to
`verify-rewrite.js --reader-contract <contract.json>`; its reader-fit findings
remain advisory except for configured hard length constraints.

## Detailed workflow

### 1. Establish the reader's starting point

Identify the audience, genre, purpose, stakes, assumed prior knowledge and
whether this output must stand alone. A clinician, hospital board member,
patient, software engineer and journal reviewer need different explanations.
An educated reader is not necessarily a specialist in this subject.

Identify context the reader needs before the main claim: what is being discussed,
why it matters here, relevant actors and dates, the requested decision, defined
terms, and the relationship to earlier material. Reorder already supplied
explanations so concepts precede their use. Resolve vague references such as
"this approach" or "the framework" when the source identifies the referent.

Missing context is a gap to report, not a licence to invent facts. Use supplied
material first. External research remains off without authorisation. Definitions
and background additions need source support just like other new claims. Keep
missing facts explicitly unresolved when they cannot be established.

### 2. Match terminology to the domain

Distinguish necessary technical vocabulary, conventional professional language,
undefined acronyms and unnecessary jargon. Define essential unfamiliar terms on
first use. Preserve defined legal terms, clinical distinctions, code identifiers,
names, quotations and source-supported qualifiers. Avoid substituting a familiar
but inaccurate word for a precise term.

Review computing metaphors transferred into unrelated prose: pipeline, stack,
payload, artifact, orchestration, deployment, ingestion, observability and
telemetry. These words are not banned. A software pipeline is legitimate; a
hospital briefing may be clearer with "referral process" where that is the
actual meaning. Statistical, engineering and clinical meanings take precedence
over a general word list. Use an explicit domain glossary or allowedTerms list
for legitimate usage and review ambiguous cases rather than replacing them.

### 3. Reduce reader effort, not substantive content

Assess missing explanatory steps, introduced concepts, clause nesting,
nominalisations, lists of compressed claims, acronym load and abrupt changes
of level. Several short technical sentences can be harder to understand than
one well-explained paragraph. A long document can still be locally over-dense.

Use a clear sequence: establish the point, explain unfamiliar concepts, provide
necessary support, then state the implication. Split overloaded sentences,
restore omitted logical connections and place technical detail in a labelled
second layer only when the requested format permits it. Add an example only
when it is already supported or explicitly authorised as illustrative.

Sentence length, lexical-density proxies, readability formulae and flatEntropySpans
are review prompts, not comprehension measurements. Do not add filler, random
cadence, artificial hesitation or a fabricated anecdote to improve a score.
Preserve efficient technical prose when it suits the reader's task.

### 4. Respect the length contract

Resolve whether the request means a maximum, an approximate target, a range,
source-length preservation, or no constraint. Identify the counting scope:
whole response, body, abstract, selected section or each requested version.
Resolve whether headings, tables, references, captions, quotations and code count.
Do not silently exclude inconvenient material from a limit.

Plan a word allocation before writing. Reserve space for essential context,
the conclusion or decision, important limitations and any required action.
During revision, remove repeated points, unnecessary process narration and
unsupported promotional wording before compressing genuine information.

Never meet a limit by silently deleting claims, uncertainty, harms or conditions.
If complete preservation cannot fit, flag the conflict and offer the smallest
explicit scope reduction or a separate summary plus an intact full version.
Only produce both versions when authorised; a second version is not a way to
evade a total-response limit. Do not pad a clear answer to reach a soft target.

Summarisation and adaptation require explicit operation-specific permissions.
A summary can omit secondary detail only within its authorised scope, with a
record of significant omissions. It must not replace the canonical source.
The current strict rewrite verifier can flag authorised summary omissions;
record that limitation rather than falsely reporting a full-preservation pass.

### 5. Handle agentic writing explicitly

Record productionMode only from declared workflow metadata. Do not infer
whether text is human, generated or agentic from vocabulary or punctuation.
Agentic workflows still use generative models; the difference is the sequence
of planning, retrieval, editing, tool use and handoffs, not a separate species
of language model.

For a final reader-facing artifact, check for missing handoff context, repeated
introductions, conflicting terminology, tool-log narration, unexplained file or
track names, checklist residue, and claims that something was tested or completed
without a matching receipt. Evaluate the standalone final text, not only each
agent's section. Keep coordination language where it genuinely belongs in a
handoff, audit record or technical manual.

Preserve necessary provenance and AI-use disclosures. Do not conceal model use,
strip warnings that matter, or use hidden reasoning as research data. Assess
consented visible draft/version/tool traces separately from the published text.

### 6. Validate and stop

Check format and protected spans, evidence and claim strength, reader context,
terminology, information load and length separately. A mechanical pass does not
certify reader comprehension or factual completeness. Retain one bounded
revision audit and disclose unresolved conflicts rather than repeatedly
rewriting a satisfactory passage.

## Local contract interface

The optional reader contract has schemaVersion "1.0.0". Recognised fields are
audience (unspecified, general, mixed, specialist), domain, productionMode
(unknown, human, single-pass, iterative, retrieval-assisted, multi-agent),
allowedTerms, contextNeeds and length. Unknown fields are errors.

```json
{
  "schemaVersion": "1.0.0",
  "audience": "mixed",
  "domain": "governance",
  "productionMode": "multi-agent",
  "allowedTerms": ["downstream"],
  "contextNeeds": ["Identify the decision and explain the service context"],
  "length": { "mode": "maximum", "maxWords": 500 }
}
```

Length modes are preserve (optional toleranceFraction, default 0.1), maximum
(maxWords), range (minWords and maxWords), target (targetWords and optional
toleranceWords, default 10%), and unconstrained. severity can be error or warning.
Explicit maximum/range/target bounds default to error; implicit preservation is
advisory. Hard limits apply even in light verification mode.

The counter uses whitespace-separated units containing a Unicode letter or
digit, across all supplied text. Hyphenated words and contractions are one unit;
punctuation-only units are excluded. This is neither a model-token count nor a
promise to match Word, LaTeX or a journal portal. Select the intended section
explicitly and reconcile with the destination's native count when required.

readerFit reports length measurements, review findings, declared productionMode,
manualChecks and contextAssessment. Context remains manual-review-required and
qualityCertified remains false. Neither findings nor receipts include source
passages or the text of contextNeeds. IT vocabulary and long-sentence warnings
are contextual suggestions, not automatic rewrites or authorship scores.

## Interpreting verification status

verificationStatus distinguishes checks-passed, blocked and inconclusive.
Unresolved claim alignment blocks standard/deep verification but is not itself
proof that meaning changed. Review the unmatched claims rather than forcing an
edit to satisfy lexical overlap. Currency, recognised measurement units and
common date forms are protected as bounded literals; exhaustive quantity
semantics and role binding are not established by these checks.

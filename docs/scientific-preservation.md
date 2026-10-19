# Scientific prose preservation

Pattern 13 and the mechanical scan are contextual editorial checks. Severity
labels express editorial priority, not confidence about authorship. No pattern
or cluster establishes whether AI was used. Protected technical spans and
scientific uncertainty take precedence over optional style edits.

`createFoioEditorialReceipt` compares ordered, exact matches of bounded protected
patterns before and after an edit. It now detects common numeric citation ranges,
confidence-interval ranges, numeric and named-month date ranges, signed values,
selected chemical locants and stereochemical names, and explicit epistemic
qualifiers. It records hashes and counts rather than source excerpts.

Run the behavioral regression cases with:

```sh
node --test test/scientific-preservation.test.js test/foio-editorial.test.js
```

Each scientific fixture has a surrounding-prose edit that should preserve the
protected items, and a planted mutation that should fail. These exercise the
receipt implementation rather than only searching guidance text. Static skill
contract tests separately check generated guidance and pattern concordance.

This receipt is not an editor, exhaustive chemical parser, citation validator,
or semantic equivalence judge. Identical input/output tests establish only
no-edit preservation. Reordered items can trigger review, and unrecognised
qualifiers or technical forms can escape the patterns. Manuscript review still
requires human or independent contextual checks, including negation, scope,
source support, and publication disclosures. No result authorises publication.

# Module: Academic

## Navigation

- [Description](#description)
- [PUBLISHER DISCLOSURE](#publisher-disclosure)
- [INTERFACE ARTEFACTS](#interface-artefacts)
- [TORTURED PHRASES](#tortured-phrases)
- [ACADEMIC VOICE](#academic-voice)
- [ACADEMIC PATTERNS](#academic-patterns)
- [CITATION AND REFERENCING](#citation-and-referencing)
- [SEVERITY CLASSIFICATION](#severity-classification)
- [ACADEMIC WRITING BEST PRACTICES](#academic-writing-best-practices)

## Description

This module applies to academic writing: research papers, essays, dissertations, grant proposals, and formal research prose. It repairs editorial defects with verified diffs. It does not optimise against detector scores and does not claim to make text undetectable.

Prefer subtractive and reordering edits over generative ones. Do not invent a citation, statistic, finding, or source.

**When to Apply:**

- Research papers
- Academic essays
- Dissertations and theses
- Grant proposals
- Literature reviews
- Conference submissions

**When NOT to Apply:**

- Creative writing (load the creative reference when that module is present)
- Technical documentation
- Business communications

---

## PUBLISHER DISCLOSURE

Policies differ by venue. Check the named journal or publisher before treating an Authentext pass as undeclared copy-editing. This table was checked on 2026-08-12. Research remains permissioned; do not refresh the table from the web unless the user has granted research permission.

| Venue           | Disclose                                                                                          | Do not treat as automatic exemption                                                                                                   | Where authors usually declare                                                                                                           |
| --------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Elsevier        | AI use that makes substantive changes to sentence structure or organization of a part of the text | Basic grammar, spelling, and punctuation checks                                                                                       | Separate declaration before the references                                                                                              |
| Springer Nature | Generative editorial work and autonomous content creation                                         | AI-assisted copy editing of human-generated text for readability, style, grammar, spelling, punctuation, tone, wording, or formatting | Methods, Acknowledgements, Introduction, or Preface when declaration is required                                                        |
| Wiley           | AI used to substantially edit, develop, or translate any part of a manuscript                     | AI tools used solely for spelling, grammar, and general editing                                                                       | Acknowledgements for drafting or editing; Methods for study design, analysis, or figures; also at submission                            |
| ICMJE           | Any AI-assisted technology used to produce the submitted work                                     | None stated as a copy-editing exemption                                                                                               | Cover letter and the submitted work: writing assistance in Acknowledgements; data collection, analysis, or figure generation in Methods |

**Elsevier warning:** If an edit rewrites sentence structure or reorganizes a passage, report that the change crosses Elsevier's disclosure line even when Springer Nature would treat the same pass as undeclared copy-editing. Do not silently assume the venue is Springer Nature.

Authentext does not file the declaration, invent the tool-use statement, or certify compliance.

---

## INTERFACE ARTEFACTS

Treat leftover chatbot interface language as a **hard error**. Remove it. Do not soften it into scholarly hedging.

Hard-error strings and close relatives:

- `regenerate response`
- `as an AI language model`
- `as of my last knowledge update`
- `I hope this helps`
- `let me know if you'd like me to expand`

These are Critical. A manuscript that still contains them is not ready for review or rewrite of surrounding prose until they are gone.

---

## TORTURED PHRASES

Tortured phrases are synonym-substituted technical terms that no specialist would write. They are an integrity signal, not a style preference.

**Document threshold:** report the document when **5 or more** distinct tortured phrases appear, matching the Problematic Paper Screener listing rule. Flag each instance even below the threshold. Do not "fix" a phrase by guessing a prettier synonym. If the intended term is already named in the source, restore that term. If it is not, report the span and leave it.

Seed lexicon (documented examples; not exhaustive):

| Tortured form                  | Ordinary term                |
| ------------------------------ | ---------------------------- |
| vegetative electron microscop* | scanning electron microscopy |
| bosom peril                    | breast cancer                |
| kidney disappointment          | kidney failure               |
| fake neural organizations      | artificial neural networks   |
| lactose bigotry                | lactose intolerance          |

`vegetative electron microscop*` matches `vegetative electron microscopy` and `vegetative electron microscope`.

---

## ACADEMIC VOICE

**Scholarly precision matters.** Keep legitimate academic hedging ("may suggest", "appears to indicate"). Remove AI filler ("it is worth noting that", "it is important to emphasize").

---

## ACADEMIC PATTERNS

### Pattern A1: Vague Literature Citations

**Problem:** AI attributes claims to vague authorities without specific citations.

**Severity:** High

**Words to watch:**

- "Studies have shown"
- "Research indicates"
- "Experts agree"
- "It has been demonstrated"

**Action:** Do not invent a paper, year, or DOI to replace the vague attribution. Keep the claim only if the source already supports it. Otherwise cut the claim or report that the citation is missing.

**Before:**

> Studies have shown that climate change significantly impacts biodiversity. Research indicates that immediate action is necessary.

**After:**

> The manuscript claims climate change affects biodiversity and that action is necessary, but it names no study. Do not invent Smith et al. (2023) or any other source. Ask the author for the citation or cut the claim.

---

### Pattern A2: Formulaic Literature Review Sections

**Problem:** AI generates rigid, template-like literature review paragraphs.

**Severity:** Medium

**Before:**

> **Previous Research:** Previous research has explored this topic extensively. **Current Gap:** However, current research has limitations. **Our Contribution:** Our study addresses these gaps.

**After:**

> Prior work is cited in the manuscript's existing reference markers. Those studies were limited to laboratory conditions. The present field study addresses that limitation.

Do not invent "Smith, 2022" or "Jones, 2023" to fill a template.

---

### Pattern A3: Over-Hedging

**Problem:** AI over-qualifies statements beyond legitimate academic caution.

**Severity:** Low

**Before:**

> It could potentially be suggested that the results may possibly indicate a trend that might warrant further investigation.

**After:**

> The results suggest a trend warranting further investigation.

---

### Pattern A4: Generic Conclusions

**Problem:** AI ends papers with vague statements about "future research" and "broader implications."

**Severity:** Medium

**Before:**

> In conclusion, this study has provided valuable insights. Future research should explore these findings further. The implications are significant for the field.

**After:**

> This study demonstrates X under conditions Y. Future work should test whether X holds in real-world settings. The methodology may apply to similar problems in Z domain.

Replace X, Y, and Z only with claims already in the source.

---

### Pattern A5: Promotional Abstract Language

**Problem:** AI uses marketing language in abstracts instead of clear findings.

**Severity:** Medium

**Words to watch:**

- "groundbreaking", "novel", "innovative"
- "comprehensive", "extensive", "thorough"
- "significant contributions", "valuable insights"

**Before:**

> This groundbreaking study provides comprehensive insights into the novel methodology, making significant contributions to the field.

**After:**

> We present the method and the accuracy figures already reported in the manuscript. Do not invent a 95% accuracy claim or a 12% improvement.

---

### Pattern A6: Filler in Methodology

**Problem:** AI adds unnecessary words to methodology descriptions.

**Severity:** Low

**Before:**

> In order to achieve the goal of analyzing the data, we employed the use of statistical methods.

**After:**

> We analyzed the data using ANOVA.

Keep "ANOVA" only if the source already names it.

---

### Pattern A7: Artificial Signposting

**Problem:** AI uses excessive structural markers in academic writing.

**Severity:** Low

**Words to watch:**

- "Firstly", "Secondly", "Thirdly"
- "In the first section", "In the second section"
- "This paper is organized as follows"

**Before:**

> Firstly, we review the literature. Secondly, we describe our methodology. Thirdly, we present results.

**After:**

> We review the literature (Section 2), describe our methodology (Section 3), and present results (Section 4).

---

### Pattern A8: Vague Quantitative Claims

**Problem:** AI makes imprecise quantitative statements.

**Severity:** Medium

**Before:**

> A significant number of participants showed improvement.

**After:**

> Report the count, denominator, and test statistic already in the source. Do not invent "73 of 100" or a p-value.

---

## CITATION AND REFERENCING

Reference lists are **out of scope**. Do not generate, complete, reformat, or "fix" a bibliography. Do not invent missing references, DOIs, PMIDs, page ranges, or author lists. Leave the reference list untouched and report the gap. Hand bibliography work to sourceright / citeweft when present (sibling clone, AUTHENTXT_SOURCERIGHT_PATH / AUTHENTXT_CITEWEFT_PATH, or configured skill); when absent, refuse locally and point to https://github.com/edithatogo/sourceright and https://github.com/edithatogo/citeweft.

In-text citation tokens that already exist in the source are protected spans. You may flag a vague attribution (Pattern A1) or a padded span (Pattern A10). You may not rewrite the reference list to match.

### Pattern A9: Fake or Inaccurate Citations

**Problem:** AI generates plausible-looking but fake or inaccurate citations.

**Severity:** Critical

**Action:** Do not invent a replacement citation. Do not complete or reformat the reference list. Report the suspect token and stop.

**Before:**

> (Smith et al., 2023) found significant effects.

**After:**

> Keep `(Smith et al., 2023)` as written. Report it as unverified. Do not add a DOI, expand the author list, or rewrite the bibliography entry.

---

### Pattern A10: Citation Padding

**Problem:** AI adds unnecessary citations to appear authoritative.

**Severity:** Low

**Before:**

> Climate change is a serious problem [1-15].

**After:**

> Keep the claim the manuscript already makes. Drop the padded `[1-15]` span only when those markers are not tied to specific sentences in the source. Do not replace them with a new invented citation.

---

## SEVERITY CLASSIFICATION

### Critical (must fix)

- Interface artefacts (`regenerate response`, `as an AI language model`, `as of my last knowledge update`, close relatives)
- Pattern A9: Fake or inaccurate citations
- Tortured-phrase documents at the Problematic Paper Screener threshold of 5 or more

### High (strong AI signals)

- Pattern A1: Vague literature citations
- Elsevier-crossing sentence-structure or organization edits on an Elsevier manuscript (disclosure warning)

### Medium (moderate AI signals)

- Pattern A2: Formulaic literature review sections
- Pattern A4: Generic conclusions
- Pattern A5: Promotional abstract language
- Pattern A8: Vague quantitative claims
- Individual tortured phrases below the document threshold

### Low (weak AI signals)

- Pattern A3: Over-hedging
- Pattern A6: Filler in methodology
- Pattern A7: Artificial signposting
- Pattern A10: Citation padding

---

## ACADEMIC WRITING BEST PRACTICES

### Do

- Prefer cuts and reordering over new sentences
- Keep existing citations, qualifiers, numbers, and limitations
- Flag vague attributions without inventing a source
- Warn when an edit would require Elsevier disclosure
- Report tortured phrases; restore a term only when the source already uses it
- Follow the named journal's disclosure location when the author asks for a declaration draft they will own

### Don't

- Optimise wording against a detector score
- Generate, complete, or reformat a reference list
- Invent Smith et al., a DOI, a p-value, or a sample size
- Leave interface artefacts in submitted prose
- Treat Springer Nature copy-editing exemption as universal
- Use vague citations ("studies have shown") as a rewrite target that you then "solve" with a fake paper
- Add promotional language ("groundbreaking", "novel")

---

_Module Version: 3.2.0_
_Last Updated: 2026-08-12_
_Applies to: Research papers, essays, dissertations, grant proposals, literature reviews_

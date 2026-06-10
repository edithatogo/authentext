# Module: Academic

## Description

This module applies to academic writing: research papers, essays, dissertations, grant proposals, and formal research prose. It maintains scholarly rigor while removing AI voice patterns.

**When to Apply:**

- Research papers
- Academic essays
- Dissertations and theses
- Grant proposals
- Literature reviews
- Conference submissions

**When NOT to Apply:**

- Creative writing
- Technical documentation
- Business communications

---

## ACADEMIC VOICE

**Scholarly precision matters.** Academic writing has specific conventions: hedging where appropriate, acknowledging limitations, citing sources properly. The goal is to remove AI patterns while preserving legitimate academic style.

**Rule:** Keep legitimate academic hedging ("may suggest", "appears to indicate"). Remove AI filler ("it is worth noting that", "it is important to emphasize").

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

**Before:**

> Studies have shown that climate change significantly impacts biodiversity. Research indicates that immediate action is necessary.

**After:**

> Smith et al. (2023) found that climate change reduced local biodiversity by 40% over two decades. Immediate conservation measures are recommended (Jones, 2024).

---

### Pattern A2: Formulaic Literature Review Sections

**Problem:** AI generates rigid, template-like literature review paragraphs.

**Severity:** Medium

**Before:**

> **Previous Research:** Previous research has explored this topic extensively. **Current Gap:** However, current research has limitations. **Our Contribution:** Our study addresses these gaps.

**After:**

> Prior work established the foundation for this study (Smith, 2022; Jones, 2023). However, these studies were limited to laboratory conditions. Our field study addresses this limitation.

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

> We present a method achieving 95% accuracy on dataset X, improving on prior work by 12%.

---

### Pattern A6: Filler in Methodology

**Problem:** AI adds unnecessary words to methodology descriptions.

**Severity:** Low

**Before:**

> In order to achieve the goal of analyzing the data, we employed the use of statistical methods.

**After:**

> We analyzed the data using ANOVA.

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

> 73 of 100 participants (73%) showed improvement (p < 0.01).

---

## CITATION AND REFERENCING

### Pattern A9: Fake or Inaccurate Citations

**Problem:** AI generates plausible-looking but fake or inaccurate citations.

**Severity:** Critical

**Action:** Verify every citation against real databases (Google Scholar, DOI, PubMed).

**Before:**

> (Smith et al., 2023) found significant effects.

**After:**

> [Verify: Does Smith et al. 2023 actually exist? Check DOI.]

---

### Pattern A10: Citation Padding

**Problem:** AI adds unnecessary citations to appear authoritative.

**Severity:** Low

**Before:**

> Climate change is a serious problem [1-15].

**After:**

> Global average temperature has increased 1.1°C since 1880 (NASA, 2023).

---

## SEVERITY CLASSIFICATION

### Critical (must fix)

- Pattern A9: Fake or inaccurate citations

### High (strong AI signals)

- Pattern A1: Vague literature citations

### Medium (moderate AI signals)

- Pattern A2: Formulaic literature review sections
- Pattern A4: Generic conclusions
- Pattern A5: Promotional abstract language
- Pattern A8: Vague quantitative claims

### Low (weak AI signals)

- Pattern A3: Over-hedging
- Pattern A6: Filler in methodology
- Pattern A7: Artificial signposting
- Pattern A10: Citation padding

---

## ACADEMIC WRITING BEST PRACTICES

### Do

- Cite specific sources with verifiable references
- Use appropriate hedging for claims
- Report exact statistics and p-values
- Acknowledge limitations clearly
- Use field-standard terminology
- Follow journal/conference style guides

### Don't

- Use vague citations ("studies have shown")
- Add promotional language ("groundbreaking", "novel")
- Over-hedge beyond legitimate academic caution
- Pad citations unnecessarily
- Use marketing language in abstracts

---

_Module Version: 3.0.0_
_Last Updated: 2026-03-03_
_Applies to: Research papers, essays, dissertations, grant proposals, literature reviews_

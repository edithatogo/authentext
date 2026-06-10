# Module: Governance

## Description

This module applies to governance writing: policies, risk assessments, compliance documentation, legal writing, and regulatory submissions. It maintains precision and formality while removing AI voice patterns.

**When to Apply:**

- Company policies
- Risk assessments
- Compliance documentation
- Legal contracts
- Regulatory submissions
- Board reports

**When NOT to Apply:**

- Creative writing
- Marketing materials
- Informal communications

---

## GOVERNANCE VOICE

**Precision and clarity are critical.** Governance documents have legal and regulatory implications. Remove AI patterns while preserving necessary formality and precision.

**Rule:** Keep required legal/formal language. Remove AI filler, vague attributions, and promotional phrasing.

---

## GOVERNANCE PATTERNS

### Pattern G1: Vague Policy Language

**Problem:** AI uses imprecise language in policies where specificity is required.

**Severity:** High

**Before:**

> Employees should generally endeavor to maintain appropriate security practices where feasible.

**After:**

> Employees must enable two-factor authentication on all company accounts.

---

### Pattern G2: Hedged Risk Statements

**Problem:** AI over-hedges risk statements, weakening accountability.

**Severity:** High

**Before:**

> There may potentially be some risk that data could possibly be compromised in certain circumstances.

**After:**

> Risk: Unencrypted data in transit may be intercepted. Likelihood: Medium. Impact: High.

---

### Pattern G3: Promotional Compliance Language

**Problem:** AI uses marketing language in compliance documents.

**Severity:** Medium

**Words to watch:**

- "commitment to excellence", "dedication to"
- "best-in-class", "industry-leading"
- "unwavering commitment", "paramount importance"

**Before:**

> Our unwavering commitment to data protection demonstrates our dedication to best-in-class security practices.

**After:**

> We comply with GDPR Article 32 (security of processing) through encryption, access controls, and regular audits.

---

### Pattern G4: Vague Attributions in Policy

**Problem:** AI attributes requirements to vague authorities.

**Severity:** High

**Words to watch:**

- "Industry standards require"
- "Regulations state"
- "Experts recommend"

**Before:**

> Industry standards require regular security assessments.

**After:**

> SOC 2 Type II requires annual security assessments (AICPA, 2023).

---

### Pattern G5: Formulaic "Future Outlook" Sections

**Problem:** AI adds generic forward-looking statements to governance docs.

**Severity:** Low

**Before:**

> Looking ahead, we remain committed to continuous improvement. The future looks bright as we enhance our governance framework.

**After:**

> Next review date: 2027-03-03. Responsible: Chief Compliance Officer.

---

### Pattern G6: Over-Structured Risk Matrices

**Problem:** AI uses rigid formatting for risk descriptions that humans would write narratively.

**Severity:** Low

**Before:**

> **Risk Category:** Cybersecurity
> **Likelihood:** High
> **Impact:** Critical
> **Mitigation:** Implement controls

**After:**

> Cybersecurity risk is high with critical potential impact. Mitigation: implement access controls, encryption, and monitoring.

---

### Pattern G7: Filler in Legal Writing

**Problem:** AI adds unnecessary words to legal/policy text.

**Severity:** Medium

**Before:**

> In the event that an employee fails to comply with the provisions set forth herein, disciplinary action may be taken.

**After:**

> Employees who violate this policy face disciplinary action, up to and including termination.

---

### Pattern G8: Generic Positive Conclusions

**Problem:** AI ends governance docs with vague upbeat statements.

**Severity:** Low

**Before:**

> We are confident that these measures will ensure a bright and secure future for our organization.

**After:**

> This policy takes effect 2026-04-01. Questions: [compliance@company.com](mailto:compliance@company.com)

---

## COMPLIANCE AND REGULATORY

### Pattern G9: Vague Regulatory References

**Problem:** AI references regulations without specific sections or requirements.

**Severity:** High

**Before:**

> We comply with all applicable data protection regulations.

**After:**

> We comply with:
>
> - GDPR (EU) 2016/679: Articles 5, 6, 32
> - CCPA (California): Section 1798.100
> - HIPAA (US): 45 CFR Part 160

---

### Pattern G10: Missing Accountability

**Problem:** AI policies lack clear ownership and enforcement.

**Severity:** Medium

**Before:**

> This policy should be followed by all employees.

**After:**

> **Owner:** Chief Compliance Officer
> **Applies to:** All employees, contractors, vendors
> **Enforcement:** HR and Legal
> **Violations:** Report to [compliance@company.com](mailto:compliance@company.com)

---

## SEVERITY CLASSIFICATION

### Critical (must fix)

- None for governance module (precision varies by context)

### High (strong AI signals)

- Pattern G1: Vague policy language
- Pattern G2: Hedged risk statements
- Pattern G4: Vague attributions in policy
- Pattern G9: Vague regulatory references

### Medium (moderate AI signals)

- Pattern G3: Promotional compliance language
- Pattern G7: Filler in legal writing
- Pattern G10: Missing accountability

### Low (weak AI signals)

- Pattern G5: Formulaic "Future Outlook" sections
- Pattern G6: Over-structured risk matrices
- Pattern G8: Generic positive conclusions

---

## GOVERNANCE WRITING BEST PRACTICES

### Do

- Use precise, unambiguous language
- Cite specific regulations and sections
- Define clear ownership and accountability
- Include enforcement mechanisms
- Use consistent terminology
- Set specific review dates

### Don't

- Use vague language ("should", "may", "where feasible")
- Add promotional phrasing
- Hedge risk statements unnecessarily
- Reference vague authorities
- End with generic positive conclusions

---

_Module Version: 3.0.0_
_Last Updated: 2026-03-03_
_Applies to: Policies, risk assessments, compliance docs, legal writing, regulatory submissions_

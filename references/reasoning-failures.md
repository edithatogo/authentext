# Humanizer Reasoning Module: LLM Reasoning Failures

This module identifies and addresses reasoning failures in Large Language Model (LLM) outputs that manifest as detectable patterns in the generated text.

## Description

## Reasoning Failure Categories

### Pattern R1: Depth-Dependent Reasoning Failures

- **Problem:** Accuracy decreases as reasoning chain lengthens
- **Severity:** Medium
- **Action:** Simplify complex explanations, remove tangential content, ensure focus

### Pattern R2: Context-Switching Failures

- **Problem:** Difficulty maintaining coherence across different knowledge domains
- **Severity:** High
- **Action:** Smooth transitions between topics, maintain consistent register and tone

### Pattern R3: Temporal Reasoning Limitations

- **Problem:** Errors in temporal sequence or causal reasoning tasks
- **Severity:** Medium
- **Action:** Clarify chronological order, strengthen causal connections

### Pattern R4: Abstraction-Level Mismatches

- **Problem:** Difficulty maintaining appropriate level of abstraction
- **Severity:** Medium
- **Action:** Bridge abstraction gaps with clear connections

### 5. Logical Fallacy Susceptibility

- **Sign:** Systematic reasoning errors that contradict formal logic
- **Action:** Identify and correct logical inconsistencies

### 6. Quantitative Reasoning Deficits

- **Sign:** Errors in numerical computation or quantitative understanding
- **Action:** Flag questionable numerical claims for review

### 7. Self-Consistency Failures

- **Sign:** Internal contradictions within a single output
- **Action:** Identify and resolve internal contradictions

### 8. Verification and Checking Deficiencies

- **Sign:** Lack of internal verification mechanisms
- **Action:** Add appropriate qualifiers, acknowledge uncertainties

## APPLICATION RULES

### When to Apply

- When text quality critically depends on logical consistency
- When dealing with technical, academic, or factual content
- When surface-level fixes are insufficient for naturalness

### When Not to Apply

- For general casual writing where logical depth isn't critical
- When computational efficiency is paramount
- When the text is already logically sound

## INTEGRATION WITH OTHER MODULES

- Core Humanizer addresses surface-level writing quality issues
- Reasoning module addresses deeper logical consistency issues
- Both modules can operate independently or in combination
- Reasoning module defers to Core for surface-level fixes

## QUALITY STANDARDS

All reasoning diagnostics must meet these standards:

- Corrections must be logically sound
- Claims must be verifiable or appropriately qualified
- Changes must improve accuracy and consistency
- Evidence for diagnoses must be documented

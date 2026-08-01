# Authentext Professional Routing Reference

This generated reference is not a separately discoverable Agent Skill.
The authoritative runtime entry point is [SKILL.md](SKILL.md), which owns
activation and routing. Use this file as supplementary professional-editing
guidance when the main skill selects a technical, academic, governance, or
client-facing route.

## Professional editing profile

Use this variant for technical, policy, academic, and client-facing prose. Keep the text precise, restrained, and readable.

## Reference modules

- [Core patterns](references/core-patterns.md) — always apply
- [Technical module](references/technical.md) — code and technical docs
- [Academic module](references/academic.md) — papers and formal research
- [Governance module](references/governance.md) — policy and compliance
- [Reasoning module](references/reasoning-failures.md) — reasoning failures and contradictions

## ROUTING LOGIC

1. Analyze input context:
   * Code or technical docs -> Core + Technical
   * Papers, essays, or formal research -> Core + Academic
   * Policy, risk, or compliance writing -> Core + Governance
   * Reasoning failures or self-contradictions -> Core + Reasoning
   * Otherwise -> Core only

2. Open the linked reference files for the selected modules and apply their patterns.

## Professional Tone

* Prefer direct, precise phrasing.
* Keep technical terms when they are accurate.
* Avoid decorative language, stock transitions, and inflated claims.
* Preserve the intended register of the source text instead of smoothing everything into the same tone.

## Your Task

When given text to humanize:

1. **Identify AI patterns** - Scan the reference modules for the patterns that apply
2. **Rewrite problematic sections** - Replace AI-isms with natural alternatives
3. **Preserve meaning** - Keep the core message intact
4. **Maintain voice** - Match the intended tone (formal, casual, technical, etc.)
5. **Refine voice** - Keep the result clear, specific, and professional

---

## CLARITY AND TONE

Removing AI patterns is necessary but not sufficient. What remains needs to actually read well.

The goal isn't to flatten everything into a generic professional register. Keep the text readable, specific, and appropriately formal for the context. A technical spec should sound different from a report or memo, but each should still sound like it was written by someone who knows what they are talking about.

### Signs the writing is still flat

* Every sentence lands the same way—same length, same structure, same rhythm
* Nothing is concrete; everything is "significant" or "notable" without saying why
* No perspective, just information arranged in order
* Reads like it could be about anything, with no sign the writer knows the subject

### What to aim for

Vary sentence rhythm with short and long lines. Use specific details instead of vague assertions. Keep the point of view clear. Read it aloud if the prose feels too polished or too flat.

---

**Clarity over filler.** Use simple active verbs (`is`, `has`, `shows`) instead of filler phrases (`stands as a testament to`).

### Technical Nuance

**Expertise isn't slop.** In professional contexts, "crucial" or "pivotal" are sometimes the exact right words for a technical requirement. The Pro variant targets lazy patterns, not technical precision. If a word is required for accuracy, keep it. If it's there to add fake gravitas, cut it.

---

## Severity and detection guardrails

For severity tiers and false-positive guidance, read [Core patterns](references/core-patterns.md) (sections **SEVERITY CLASSIFICATION** and **DETECTION GUIDANCE**).

Available reference files: core-patterns.md, technical.md, academic.md, governance.md, reasoning-failures.md.

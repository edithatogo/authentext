---
name: authentext
version: 3.2.0
description: Remove signs of AI-generated writing from text. Use when editing or reviewing text to make it sound more natural and human-written. Based on Wikipedia's "Signs of AI writing" guide. Detects and fixes inflated symbolism, promotional language, superficial -ing analyses, vague attributions, em dash overuse, rule of three, AI vocabulary, negative parallelisms, reasoning failures, and LLM artifacts. Includes severity classification, technical literal preservation, and density-aware detection guidance.
license: MIT
compatibility: Requires an agent host that supports the Agent Skills format and Read, Write, Edit, Grep, and Glob tools (Claude Code, Cursor, Codex CLI, Gemini CLI, GitHub Copilot, and compatible hosts).
allowed-tools:

* Read
* Write
* Edit
* Grep
* Glob
* AskUserQuestion

---

# Authentext: Remove AI Writing Patterns

## Description

Always-applied patterns for general writing. These patterns identify and remove signs of AI-generated text to make writing sound more natural and human.

Based on Wikipedia's "Signs of AI writing" page, maintained by WikiProject AI Cleanup.

## Your Task

When given text to humanize:

1. **Identify AI patterns** - Scan for the patterns listed below
2. **Rewrite, don't delete** - Replace AI-isms with natural alternatives and cover everything the original covers. If the original has five paragraphs, the rewrite has five paragraphs. (Content-preservation guarantee from upstream v2.8.)
3. **Preserve meaning** - Keep the core message intact
4. **Maintain voice** - Match the intended tone (formal, casual, technical, etc.)
5. **Add soul** - Don't just remove bad patterns; inject actual personality when appropriate (see PERSONALITY AND SOUL)

---

## PERSONALITY AND SOUL

Avoiding AI patterns is only half the job. Sterile, voiceless writing is just as obvious as slop. Good writing has a human behind it.

### Signs of soulless writing (even if technically "clean")

- Every sentence is the same length and structure
- No opinions, just neutral reporting
- No acknowledgment of uncertainty or mixed feelings
- No first-person perspective when appropriate
- No humor, no edge, no personality
- Reads like a Wikipedia article or press release

### How to add voice

Have opinions and react to facts. Vary sentence rhythm with short and long lines. Acknowledge complexity, use "I" when it fits, allow tangents, and be specific about feelings.

### Before (clean but soulless)

> The experiment produced interesting results. The agents generated 3 million lines of code. Some developers were impressed while others were skeptical. The implications remain unclear.

### After (has a pulse)

> I genuinely don't know how to feel about this one. 3 million lines of code, generated while the humans presumably slept. Half the dev community is losing their minds, half are explaining why it doesn't count. The truth is probably somewhere boring in the middle - but I keep thinking about those agents working through the night.

---

## Reference material

Read these files for the full pattern catalog, examples, and remediation guidance:

- [Core patterns (39 patterns, before/after examples)](references/core-patterns.md)
- [Reasoning failures and self-contradictions](references/reasoning-failures.md)

Apply every pattern in the reference files when humanizing text. This root skill keeps workflow, severity tiers, and detection guardrails; the references hold the exhaustive pattern definitions.

## SEVERITY CLASSIFICATION

### Critical (immediate AI detection)

- Pattern 19: Collaborative communication artifacts
- Pattern 20: Knowledge-cutoff disclaimers
- Pattern 21: Sycophantic tone
- Pattern 25: AI signatures in code
- Pattern 27: Technical literal preservation (must preserve)

### High (strong AI signals)

- Pattern 1: Undue emphasis on significance
- Pattern 3: Superficial -ing analyses
- Pattern 4: Promotional language
- Pattern 31: Extended thinking tags

### Medium (moderate AI signals)

- Pattern 2: Undue emphasis on notability
- Pattern 5: Vague attributions
- Pattern 6: Formulaic "Challenges" sections
- Pattern 7: Overused AI vocabulary
- Pattern 8: Copula avoidance
- Pattern 11: Elegant variation
- Pattern 32: JSON mode artifacts
- Pattern 33: Tool use documentation

### Low (weak AI signals)

- Pattern 9: Negative parallelisms
- Pattern 10: Rule of three overuse
- Pattern 12: False ranges
- Pattern 13: Em dash overuse
- Pattern 14: Overuse of boldface
- Pattern 15: Inline-header lists
- Pattern 16: Title case in headings
- Pattern 17: Emojis
- Pattern 18: Quotation mark issues
- Pattern 22: Filler phrases
- Pattern 23: Excessive hedging
- Pattern 24: Generic positive conclusions
- Pattern 26: Over-structuring
- Pattern 28: Persuasive tropes
- Pattern 29: Signposting
- Pattern 30: Fragmented headers
- Pattern 34: Over-polished conclusions
- Pattern 35: Manufactured punchlines and staccato drama (Upstream #31)
- Pattern 36: Aphorism formulas (Upstream #32)
- Pattern 37: Conversational rhetorical openers (Upstream #33)
- Pattern 38: Diff-anchored writing (upstream refinement)
- Pattern 39: Hyphenated word pair overuse (narrowed, upstream)
- Pattern 14: Overuse of boldface
- Pattern 15: Inline-header lists
- Pattern 16: Title case in headings
- Pattern 17: Emojis
- Pattern 18: Quotation mark issues
- Pattern 22: Filler phrases
- Pattern 23: Excessive hedging
- Pattern 24: Generic positive conclusions
- Pattern 26: Over-structuring
- Pattern 28: Persuasive tropes
- Pattern 29: Signposting
- Pattern 30: Fragmented headers

## DETECTION GUIDANCE

### What NOT to flag (false positives)

A clean human writer can hit several of the patterns above without any AI involvement. Before rewriting, sanity-check that you are not gutting legitimate prose. The following are _not_ reliable indicators on their own:

- **Perfect grammar and consistent style.** Many writers are professionals or have been edited. Polish does not equal AI.
- **Mixed casual and formal registers.** This often signals a person in a technical field, a young writer, or someone with neurodivergent prose habits — not a chatbot.
- **"Bland" or "robotic" prose.** AI prose has _specific_ tells. Generic dryness without those tells is just dry writing.
- **Formal or academic vocabulary.** AI overuses _specific_ fancy words (see Pattern 7), not all fancy words. Don't flatten "ostensibly" or "constituent" just because they sound brainy.
- **Letter-style opening or closing on a comment.** Salutations and sign-offs predate ChatGPT by centuries.
- **Common transition words in isolation.** _Additionally_, _moreover_, _consequently_ are AI-coded only when piled up. One _however_ is not a tell.
- **Curly quotes alone.** macOS, Word, Google Docs, and most CMSes auto-curl by default. Curly quotes only count when stacked with other tells.
- **Em dashes alone.** Many editors and journalists use them often. Em dashes are evidence only when paired with formulaic sales-y rhythm.
- **One short emphatic sentence.** Humans use clipped sentences to land a point. Flag staccato drama only when several short fragments appear in a row and inflate the tone.
- **"Honestly" or "look" mid-sentence.** These are ordinary in casual writing. The tell is the standalone theatrical opener, not the word itself.
- **Unsourced claims.** Most of the web is unsourced. Lack of citations doesn't prove anything.
- **Correct, complex formatting.** Visual editors and templates produce clean output without any AI.

When in doubt, look for **clusters** of tells, not isolated ones. A single em dash means nothing; em dashes plus rule-of-three plus _vibrant tapestry_ plus a "Conclusion" section is a confession.

### Signs of human writing (preserve these)

When you see these, lean toward leaving the prose alone — they are evidence of a real person writing, and over-editing will destroy what makes the piece sound human:

- **Specific, unusual, hard-to-fabricate detail.** A real address. A weird quote. The phrase "the lawyer who used to work upstairs from my dentist." LLMs round off specifics; humans hoard them.
- **Mixed feelings and unresolved tension.** "I think this is mostly good, but it bothers me, and I can't fully explain why." LLMs default to clean takes.
- **Dated, era-bound references.** Slang, memes, or in-jokes that map to a specific year and subculture. Models lag by a year or more.
- **First-person editorial choices the writer can defend.** If the writer can explain _why_ they made a particular cut or used a particular word, that's a strong human signal.
- **Variety in sentence length.** Real writing alternates short and long. AI writing tends toward an even, mid-length cadence.
- **Genuine asides, parentheticals, or self-corrections.** "(I keep wanting to say 'almost' here, but it really was certain.)" Models rarely interrupt themselves like this.
- **Edits made before November 30, 2022.** ChatGPT's public launch. Anything older than that is, with very rare exceptions, not AI-written.

---

**Note:** Detectors (including this skill) are fallible. Humans write with some of these tells too, especially in professional or edited contexts. Use clusters and the human-signal list above; do not over-correct text that is already human.

### Density-aware application (upstream #93)

When the input is low-density (roughly 0–2 obvious Tier-1 tells per 100 words), treat it as human-first writing. Apply only the strongest, least-ambiguous rules; leave voice, fragments, first-person texture, and ordinary human roughness alone.

This is the most common way "humanizer made my writing worse" on journals, meeting notes, and personal drafts. Measure before you rewrite. High-density AI-first text can tolerate full passes; low-density text should see a very light touch.

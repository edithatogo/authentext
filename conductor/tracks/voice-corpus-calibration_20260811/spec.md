# Specification: Voice and Corpus Calibration

## Overview

Voice calibration already exists as a seven-line pasted-sample idea and as
`calibrateVoiceSample()` in `scripts/lib/document-intake-policy.js`. This
track lets the user point at a corpus instead of pasting two paragraphs, and
keeps that path inside the existing governed intake rules.

## Problem

- A pasted sample is enough for casual use and too small for a writer with
  a body of work.
- Fetching published papers or reading a local drafts folder can leak
  private text into search or invent a biography from inferred life events.
- Style matching and claim grounding are different jobs. Mixing them is how
  humanizers start fabricating.

## Functional requirements

1. Accept an explicit pointer: local file, local folder, DOI, URL, ORCID, or
   institutional-repo identifier. Do not scrape a mailbox or disk without
   that pointer and consent.
2. Optional email or other plugins are sources only when the host has
   granted the plugin and the user has named it. Default is off.
3. Research remains metadata-only. Private document text never becomes a
   search query. Published-work fetches use the identifier, not the current
   manuscript.
4. Build a voice profile from observable features only: sentence length,
   vocabulary, openings, punctuation, paragraphing, stance. Do not infer
   identity, demographics, disability, or authorship.
5. A user sample outranks Authentext style rules, including the dash ban.
   It does not outrank never-add, never-lose, or protected spans.
6. Facts found in the corpus may be cited back to the user as "you have
   written this before." They may not be inserted into the current document
   unless the user asks and the current source already supports the claim.
7. If the corpus is too small or unreadable, say so. Do not invent a voice.

## Non-goals

- Training or fine-tuning a model on the corpus.
- A stored cloud profile service.
- Reading the user's entire disk or inbox to "find their voice."

## Acceptance criteria

- Intake tests cover local path, DOI/URL/ORCID, missing consent, and
  insufficient sample.
- Skill prose states sample-outranks-style and corpus-does-not-license-
  fabrication.
- No test or script uploads fixture prose to a search API.

## Risks

| Risk                               | Likelihood | Impact | Mitigation                                                      |
| ---------------------------------- | ---------- | ------ | --------------------------------------------------------------- |
| Plugin sources over-collect        | Medium     | High   | Named source, explicit grant, default off                       |
| Corpus facts leak into the rewrite | High       | High   | Separate voice features from claim memory; never-add still wins |

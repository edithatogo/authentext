# Local-model comparisons for Authentext  -  8 November 2026

**Status: evaluation plan only.** This is a consumer-specific extension of the existing reader-context/length and quality harness work; not a new rewrite engine. Model discovery and cross-platform results remain owned by [models_lang](https://github.com/edithatogo/models_lang).

## Evaluate before integrating

1. Compare the current deterministic/skill-only rewrite and verification path with small local models (LFM3-1.7B, Qwen3.5-4B), medium reasoning models and optionally specialist adapters. Use a frozen corpus of rights-cleared academic, medical, medicolegal, policy, narrative and ordinary communications; hold out authors/documents.
2. Assign task-level outputs: mechanical pattern detection, reader-context fitness, overtechnical IT wording, missing context, semantic preservation, numerical/currency/units preservation, attribution, unsupported additions, register, sentence cadence and **length adherence** (absolute/relative length and user-requested compression).
3. Track generative prose versus agent-generated prose separately, including tool-chain templating effects; report readable error taxonomies, not an unvalidated 'AI detection' probability.
4. Prefer source-preserving deterministic checks before a model call; never invent missing domain context. Perform source-span and contradiction checks after any rewrite. Measure latency, cost, and platform-specific availability; local-only inputs never silently hit a cloud provider.
5. Score blind human reader adequacy and meaning retention; record changes that make technically correct source text less accurate or shift clinical/legal meaning. Fine-tune only if demonstrated gains outweigh prompt/verification alternatives on held-out samples.

## Deliverables and acceptance

Small bounded additions to the existing ablation/quality harness, model-independent result JSON with exact HF revision and device/runtime details compatible with `models_lang`, an ablation report including negative results, and cross-links from Conductor. Do not claim that a rewrite is human-authored, or that a low detector score demonstrates quality.

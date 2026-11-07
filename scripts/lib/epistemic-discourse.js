import { extractProtectedSpans } from './ast-shield.js';

// These are review heuristics, not POS tagging, RST parsing, entailment or entropy.
const STOP = new Set(
  'a an the and or but so yet if then than that this these those of to in on at by with for from as is are was were be been being have has had do does did it its they their them we our you your i my me he she his her which who whom what when where how while although despite whereas notwithstanding however into over under only not no may might could can must shall should will would always never'.split(
    ' '
  )
);
const SIGNALS = new Set(
  'plausible hypothesized hypothesised suggests suggest preliminary consistent exploratory associated correlated conditional holding constant tends indicates indicated estimated demonstrates demonstrated shows show establishes confirms supports causes caused cause leads proves guarantees requires reduced'.split(
    ' '
  )
);
const TIERS = [
  /\b(?:may(?!\s+\d)|might|could|plausible|hypothesi[sz]ed|suggests?|preliminary|consistent with|exploratory)\b/giu,
  /\b(?:associated with|correlated with|conditional on|holding\s+[^,.!?]+\s+constant|tends to|indicates?|estimated|in this cohort)\b/giu,
  /\b(?:demonstrates?|shows?|establishes?|confirms?|supports?)\b/giu,
  /\b(?:causes?|leads? to|proves?|guarantees?|must|shall|requires?|always|never)\b/giu,
];
const SCOPES = [
  /\bin\s+(?:this|the|our)\s+(?:cohort|sample|population|study|analysis|setting)\b/giu,
  /\b(?:conditional on|under)\s+[^,.!?;]+/giu,
  /\b(?:among|within)\s+[^,.!?;]+/giu,
  /\b(?:if|unless|provided that)\s+[^,.!?;]+/giu,
  /\b(?:confidence|credible) intervals?\b|\bCI\b/gu,
];
const mean = (values) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0);
const deviation = (values) => Math.sqrt(mean(values.map((n) => (n - mean(values)) ** 2)));
const tokens = (text) =>
  text.toLowerCase().match(/\[\[ast_[a-z]+_\d+\]\]|[\p{L}\p{N}]+(?:['-][\p{L}\p{N}]+)*/gu) || [];
const stem = (word) =>
  word.length > 5 ? word.replace(/(?:ing|ed|s)$/u, '') : word.replace(/s$/u, '');
const anchors = (text) =>
  new Set(
    tokens(text)
      .filter((word) => !STOP.has(word) && !SIGNALS.has(word))
      .map(stem)
  );
const clean = (text) => text.toLowerCase().replace(/\s+/gu, ' ').trim();

function overlap(a, b) {
  if (!a.size || !b.size) return 0;
  const shared = [...a].filter((word) => b.has(word)).length;
  if (shared < Math.min(2, a.size, b.size)) return 0;
  return shared / Math.min(a.size, b.size);
}

/** Return stable spans into the supplied text, with one-based line numbers. */
export function sentenceSpans(text) {
  const results = [];
  let start = 0;
  const add = (end) => {
    let first = start,
      last = end;
    while (first < last && /\s/u.test(text[first])) first++;
    while (last > first && /\s/u.test(text[last - 1])) last--;
    if (first < last)
      results.push({
        start: first,
        end: last,
        text: text.slice(first, last),
        startLine: text.slice(0, first).split('\n').length,
        endLine: text.slice(0, last).split('\n').length,
      });
    start = end;
  };
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '\n' && /^\r?\n[ \t\r]*\n/u.test(text.slice(i))) {
      add(i);
      start = i + 1;
      continue;
    }
    if (!/[.!?]/u.test(text[i])) continue;
    if (text[i] === '.' && /\d/u.test(text[i - 1] || '') && /\d/u.test(text[i + 1] || '')) continue;
    const before = text.slice(Math.max(start, i - 12), i + 1);
    if (
      text[i] === '.' &&
      /\b(?:Dr|Mr|Ms|Mrs|Prof|Fig|Figs|Eq|Sec|vs|al|e\.g|i\.e)\.$/iu.test(before)
    )
      continue;
    let end = i + 1;
    while (end < text.length && /["'”’)]/u.test(text[end])) end++;
    if (end < text.length && !/\s/u.test(text[end])) continue;
    add(end);
    i = end - 1;
  }
  add(text.length);
  return results;
}

function proseView(source, format) {
  const spans = extractProtectedSpans(source, format);
  let cursor = 0;
  const parts = [];
  for (const span of spans) {
    parts.push(
      source.slice(cursor, span.start),
      source.slice(span.start, span.end).replace(/[^\r\n]/gu, ' ')
    );
    cursor = span.end;
  }
  parts.push(source.slice(cursor));
  return parts.join('');
}

export function classifyClaim(text) {
  const matches = TIERS.map((regex) => [...text.matchAll(regex)].map((m) => m[0]));
  // A hedge scopes a causal verb: "may cause" is not unconditional causation.
  const tier = matches.findIndex((list) => list.length) + 1;
  const negation = [
    ...text
      .replace(/\bnot only\b/giu, '')
      .matchAll(/\b(?:not|no|neither|without|cannot|can't|doesn't|didn't|isn't|wasn't|never)\b/giu),
  ].length;
  const deontic = [...text.matchAll(/\b(?:must|shall|should|required|requires?)\b/giu)]
    .map((m) => m[0].toLowerCase())
    .sort();
  const scopes = SCOPES.flatMap((regex) => [...text.matchAll(regex)].map((m) => clean(m[0])));
  return {
    tier,
    negation,
    deontic,
    scopes,
    guarded: tier > 0 || negation > 0 || scopes.length > 0,
  };
}

function bestMatch(claim, candidates) {
  const ranked = candidates
    .map((candidate, index) => ({ index, score: overlap(claim.anchors, candidate.anchors) }))
    .sort((a, b) => b.score - a.score);
  if (!ranked.length || ranked[0].score < 0.5) return null;
  // An exact phrase match breaks lexical ties without pretending to infer meaning.
  if (ranked[1] && ranked[0].score - ranked[1].score < 0.05) {
    const exact = ranked.filter(
      (entry) => clean(candidates[entry.index].text) === clean(claim.text)
    );
    if (exact.length === 1) return exact[0];
    return { ...ranked[0], ambiguous: true };
  }
  return ranked[0];
}

function concession(text) {
  const prefix =
    /^(?:although|though|while|despite|whereas|notwithstanding)\s+([^,;]+)[,;]\s*(.+)$/iu.exec(
      text.trim()
    );
  if (prefix) return { subordinate: anchors(prefix[1]), nucleus: anchors(prefix[2]) };
  const suffix = /^(.+?)[,;]?\s+(?:although|though)\s+(.+)$/iu.exec(text.trim());
  if (suffix) return { subordinate: anchors(suffix[2]), nucleus: anchors(suffix[1]) };
  const however = /^(.+?)[,;.]\s*(?:however|nevertheless|nonetheless|yet)\s*,?\s*(.+)$/iu.exec(
    text.trim()
  );
  if (however) return { subordinate: anchors(however[1]), nucleus: anchors(however[2]) };
  return null;
}

function densityWarnings(sentences, source) {
  const densities = sentences.map((sentence) => {
    const words = tokens(sentence.text);
    if (!words.length) return 0;
    const content = words.filter((word) => !STOP.has(word)).length / words.length;
    const nominal =
      words.filter((word) => /(?:tion|ment|ance|ence|ity|sis)$/u.test(word)).length / words.length;
    const clauses =
      words.filter((word) =>
        ['although', 'because', 'while', 'whereas', 'which', 'that', 'if', 'unless'].includes(word)
      ).length / words.length;
    return 0.7 * content + 0.2 * nominal + 0.1 * clauses;
  });
  const rolling = densities.map((_, i) => (i >= 2 ? mean(densities.slice(i - 2, i + 1)) : null));
  const warnings = [];
  let run = null;
  for (let i = 4; i < sentences.length; i++) {
    const subset = sentences.slice(i - 4, i + 1);
    const crossesParagraph = /\n[ \t\r]*\n/u.test(source.slice(subset[0].start, subset[4].end));
    const flat =
      !crossesParagraph &&
      subset.every((s) => tokens(s.text).length >= 4) &&
      deviation(rolling.slice(i - 2, i + 1)) < 0.04;
    if (flat) {
      if (run && run.lastSentence === i - 1) {
        run.endLine = sentences[i].endLine;
        run.lastSentence = i;
        run.sentenceCount++;
      } else {
        run = {
          startLine: subset[0].startLine,
          endLine: subset[4].endLine,
          sentenceCount: 5,
          lastSentence: i,
          rollingDensitySd: deviation(rolling.slice(i - 2, i + 1)),
          severity: 'advisory',
        };
        warnings.push(run);
      }
    } else run = null;
  }
  return warnings.map(({ lastSentence: _lastSentence, ...entry }) => entry);
}

/** Conservative anchor alignment with inspectable limitations and no source excerpts. */
export function analyzeDiscourse(original, rewrite, { format = 'md' } = {}) {
  const report = {
    epistemicDrift: [],
    polarityInversion: [],
    alignmentUncertain: [],
    flatEntropySpans: [],
    densityMethod: 'lexical-density-proxy',
    semanticEquivalenceProven: false,
  };
  let beforeView, afterView;
  try {
    beforeView = proseView(original, format);
    afterView = proseView(rewrite, format);
  } catch {
    report.alignmentUncertain.push({
      reason: 'unsupported-or-malformed-syntax',
      requiresReview: true,
    });
    return report;
  }
  const before = sentenceSpans(beforeView).map((s) => ({
    ...s,
    anchors: anchors(s.text),
    modality: classifyClaim(s.text),
  }));
  const after = sentenceSpans(afterView).map((s) => ({
    ...s,
    anchors: anchors(s.text),
    modality: classifyClaim(s.text),
  }));
  report.flatEntropySpans = densityWarnings(after, afterView);
  if (original === rewrite) return report;
  const pairs = new Map();
  const addPair = (oldIndex, newIndex, score) =>
    pairs.set(`${oldIndex}:${newIndex}`, { oldIndex, newIndex, score });
  for (let j = 0; j < after.length; j++) {
    const match = bestMatch(after[j], before);
    if (match && !match.ambiguous) addPair(match.index, j, match.score);
  }
  for (let i = 0; i < before.length; i++) {
    const match = bestMatch(before[i], after);
    if (match && !match.ambiguous) addPair(i, match.index, match.score);
    else if (
      before[i].modality.guarded &&
      ![...pairs.values()].some((pair) => pair.oldIndex === i)
    ) {
      report.alignmentUncertain.push({
        originalLine: before[i].startLine,
        reason: match ? 'ambiguous-claim-alignment' : 'unmatched-guarded-claim',
        requiresReview: true,
      });
    }
  }
  for (const { oldIndex, newIndex, score } of pairs.values()) {
    const old = before[oldIndex],
      fresh = after[newIndex];
    const a = old.modality,
      b = fresh.modality;
    const reasons = [];
    if (a.tier > 0 && ((b.tier === 0 && a.tier <= 2) || b.tier > a.tier))
      reasons.push('certainty-increased');
    if (a.negation !== b.negation) reasons.push('negation-changed');
    if (a.deontic.join('|') !== b.deontic.join('|')) reasons.push('deontic-force-changed');
    if (a.scopes.some((scope) => !clean(fresh.text).includes(scope))) reasons.push('scope-removed');
    if (reasons.length)
      report.epistemicDrift.push({
        originalLine: old.startLine,
        rewriteLine: fresh.startLine,
        fromTier: a.tier,
        toTier: b.tier || null,
        anchorOverlap: score,
        reasons,
      });
    const x = concession(old.text),
      y = concession(fresh.text);
    if (x) {
      if (!y && score >= 0.7)
        report.polarityInversion.push({
          originalLine: old.startLine,
          rewriteLine: fresh.startLine,
          reason: 'contrast-marker-removed',
          requiresReview: true,
        });
      else if (
        y &&
        overlap(x.subordinate, y.nucleus) >= 0.7 &&
        overlap(x.nucleus, y.subordinate) >= 0.7 &&
        overlap(x.subordinate, y.subordinate) < 0.5
      ) {
        report.polarityInversion.push({
          originalLine: old.startLine,
          rewriteLine: fresh.startLine,
          reason: 'concession-and-nucleus-swapped',
          requiresReview: true,
        });
      }
    }
  }
  return report;
}

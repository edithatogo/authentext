import { extractProtectedSpans } from './ast-shield.js';

// All scores below are auditable lexical proxies. No POS tagger, entailment
// model, dependency parser, RST parser or authorship detector is used.
const FUNCTION_WORDS = new Set(
  'a an the and or but if then than that this these those to of for in on at by with from into as is are was were be been being it its they them their we our you your he she his her not no nor do does did have has had can will would should may might could must shall also only very more most less much some any all each every while although despite however whereas under among during after before over about through such which who whom whose when where how what there here'.split(
    ' '
  )
);
const MARKER_WORDS = new Set(
  'associated association correlated correlation conditional indicates indicated estimated suggests suggested suggest shows showed show demonstrates demonstrated establishes established confirms confirmed supports supported causes caused cause leads lead proves proved proven guarantees guaranteed plausible preliminary exploratory cohort sample study population analysis outcome exposure patient patients total intervention'
    .split(' ')
    .filter(
      (w) => !['outcome', 'exposure', 'patient', 'patients', 'total', 'intervention'].includes(w)
    )
);
const TENTATIVE =
  /\b(?:may|might|could|plausible|hypothesi[sz]ed|suggest(?:s|ed)?|preliminary|consistent with|exploratory|possibly|perhaps)\b/giu;
const ASSOCIATIVE =
  /\b(?:associated with|correlated with|conditional on|holding\b[^.;]*\bconstant|tends? to|indicat(?:e|es|ed)|estimated|in this cohort)\b/giu;
const EMPIRICAL =
  /\b(?:demonstrat(?:e|es|ed)|show(?:s|ed)?|establish(?:es|ed)?|confirm(?:s|ed)?|support(?:s|ed)?)\b/giu;
const CAUSAL =
  /\b(?:caus(?:e|es|ed)|leads? to|prov(?:e|es|ed|en)|guarantee(?:s|d)?|always|never)\b/giu;
const OBLIGATION = /\b(?:must|shall|requires?)\b/giu;
const NEGATION =
  /\b(?:not(?!\s+only\b)|never|no\s+(?:evidence|association|benefit)|cannot|can't|doesn't|didn't|isn't|wasn't)\b/giu;
const tokens = (s) => [...s.matchAll(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu)].map((m) => m[0]);
const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const sd = (a) => Math.sqrt(mean(a.map((n) => (n - mean(a)) ** 2)));
const stem = (word) => word.toLowerCase().replace(/(?:ing|ed|s)$/u, '');

function projectProse(source, format) {
  const spans = extractProtectedSpans(source, format);
  let out = '',
    previous = 0;
  for (const span of spans) {
    out +=
      source.slice(previous, span.start) +
      source.slice(span.start, span.end).replace(/[^\r\n]/gu, ' ');
    previous = span.end;
  }
  return out + source.slice(previous);
}
export function sentencesWithLines(source, format = 'md') {
  const text = projectProse(source, format);
  const lineOffsets = [0];
  for (let i = 0; i < text.length; i++) if (text[i] === '\n') lineOffsets.push(i + 1);
  const lineAt = (n) => {
    let lo = 0,
      hi = lineOffsets.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (lineOffsets[mid] <= n) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  };
  let start = 0,
    paragraph = 0;
  const result = [];
  const add = (end) => {
    const raw = text.slice(start, end),
      prefix = raw.search(/\S/u);
    if (prefix >= 0) {
      const value = raw.trim();
      result.push({
        text: value,
        startLine: lineAt(start + prefix),
        endLine: lineAt(start + prefix + value.length - 1),
        paragraph,
      });
    }
    start = end;
  };
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '\n' && /^\s*\n/u.test(text.slice(i + 1))) {
      add(i);
      paragraph++;
      start = i + 1;
      continue;
    }
    if (!/[.!?]/u.test(text[i])) continue;
    if (text[i] === '.' && /\d/u.test(text[i - 1] ?? '') && /\d/u.test(text[i + 1] ?? '')) continue;
    const preceding = /([A-Za-z.]+)$/u.exec(text.slice(start, i))?.[1]?.toLowerCase();
    if (
      text[i] === '.' &&
      (['dr', 'mr', 'mrs', 'ms', 'prof', 'fig', 'eq', 'sec', 'al', 'vs', 'e.g', 'i.e'].includes(
        preceding
      ) ||
        /^[a-z]$/u.test(preceding ?? ''))
    )
      continue;
    let end = i + 1;
    while (/["'\u2019\u201d)\]]/u.test(text[end] ?? '')) end++;
    if (end === text.length || /\s/u.test(text[end])) {
      add(end);
      i = end - 1;
    }
  }
  add(text.length);
  return result;
}
function anchors(text) {
  const set = new Set();
  for (const word of tokens(text)) {
    if (/^[A-Z]$/u.test(word) && word !== 'I') {
      set.add('variable:' + word);
      continue;
    }
    const lower = word.toLowerCase();
    if (!FUNCTION_WORDS.has(lower) && !MARKER_WORDS.has(lower) && lower.length > 1)
      set.add(stem(lower));
  }
  for (const match of text.matchAll(/\[\[AST_[A-Z]+_\d+\]\]/gu)) set.add(match[0]);
  return set;
}
const overlap = (a, b) => [...a].filter((x) => b.has(x)).length;
const recall = (a, b) => (a.size ? overlap(a, b) / a.size : 0);
function windows(sentences) {
  const output = [];
  for (let i = 0; i < sentences.length; i++) {
    for (let size = 1; size <= 3 && i + size <= sentences.length; size++) {
      const group = sentences.slice(i, i + size);
      if (group.some((s) => s.paragraph !== group[0].paragraph)) break;
      const text = group.map((s) => s.text).join(' ');
      output.push({
        text,
        anchors: anchors(text),
        indices: group.map((_, j) => i + j),
        startLine: group[0].startLine,
        endLine: group.at(-1).endLine,
      });
    }
  }
  return output;
}
function align(source, candidates, used) {
  const available = candidates.filter((candidate) => candidate.indices.every((i) => !used.has(i)));
  // Exact occurrences outrank lexical ties; never compare an unchanged claim
  // against an earlier claim that happens to use the same content words.
  const exact = available.find((candidate) => candidate.text === source.text);
  if (exact) return { ...exact, score: 1, recall: 1 };
  const a = anchors(source.text);
  if (a.size < 2) return null;
  const ranked = available
    .map((candidate) => ({
      ...candidate,
      score:
        (2 * overlap(a, candidate.anchors)) / Math.max(1, a.size + candidate.anchors.size) -
        0.04 * (candidate.indices.length - 1),
      recall: recall(a, candidate.anchors),
    }))
    .sort((x, y) => y.score - x.score || x.indices[0] - y.indices[0]);
  if (!ranked[0] || ranked[0].score < 0.4 || ranked[0].recall < 0.5) return null;
  if (
    ranked[1] &&
    Math.abs(ranked[0].score - ranked[1].score) < 1e-9 &&
    ranked[0].text !== ranked[1].text
  )
    return null;
  return ranked[0];
}
function positiveMarkers(text, pattern) {
  return [...text.matchAll(pattern)]
    .filter((m) => {
      const before = text.slice(Math.max(0, m.index - 60), m.index);
      return !/\b(?:not|never|no evidence(?: that)?|cannot|can't|doesn't|didn't)(?:\s+\w+){0,2}\s*$/iu.test(
        before
      );
    })
    .map((m) => m[0].toLowerCase());
}
function scopeMarkers(text) {
  const rules = [
    [
      'sample',
      /\b(?:in|among|within)\s+(?:this|the|our)\s+(?:cohort|sample|study|population|analysis)\b/giu,
    ],
    [
      'population',
      /\b(?:in|among|for)\s+(?:adults|children|infants|adolescents|participants|patients)(?:\s+with\s+[^,;.]+)?/giu,
    ],
    [
      'condition',
      /\b(?:conditional on|assuming|provided that|under (?:these|the|specific|certain) assumptions|only (?:in|for|among))\b[^,;.]*/giu,
    ],
    ['conditional-clause', /\bif\s+[^,;.]+/giu],
    ['confidence-interval', /\b(?:\d+(?:\.\d+)?%\s+)?(?:confidence interval|CI)\b[^;.]*?/giu],
  ];
  return rules.flatMap(([kind, pattern]) =>
    [...text.matchAll(pattern)].map((m) => ({
      kind,
      text: m[0].toLowerCase(),
      anchors: anchors(m[0]),
    }))
  );
}
function profile(text) {
  const tentative = positiveMarkers(text, TENTATIVE);
  const associative = positiveMarkers(text, ASSOCIATIVE);
  const empirical = positiveMarkers(text, EMPIRICAL);
  const causal = positiveMarkers(text, CAUSAL);
  const obligations = positiveMarkers(text, OBLIGATION);
  const tier = tentative.length
    ? 1
    : associative.length
      ? 2
      : causal.length || obligations.length
        ? 4
        : empirical.length
          ? 3
          : null;
  return {
    tentative,
    associative,
    empirical,
    causal,
    obligations,
    tier,
    negation: [...text.matchAll(NEGATION)].length > 0,
    scopes: scopeMarkers(text),
  };
}
function concession(text) {
  let m = /^(?:although|though|while|despite|whereas|notwithstanding)\s+(.+?),\s*(.+)$/iu.exec(
    text
  );
  if (m) return { subordinate: anchors(m[1]), nucleus: anchors(m[2]) };
  m = /^(.+?)[;,.]\s*(?:however|nevertheless|nonetheless|but|yet)\s*,?\s*(.+)$/iu.exec(text);
  if (m) return { subordinate: anchors(m[1]), nucleus: anchors(m[2]) };
  m = /^(.+?),\s*(?:although|though|despite|notwithstanding)\s+(.+)$/iu.exec(text);
  return m ? { subordinate: anchors(m[2]), nucleus: anchors(m[1]) } : null;
}
function density(sentence) {
  const w = tokens(sentence.text).map((s) => s.toLowerCase());
  const total = Math.max(1, w.length);
  const contentWordRatio =
    w.filter((s) => !FUNCTION_WORDS.has(s) && /\p{L}/u.test(s)).length / total;
  const nominalizationDensity =
    w.filter((s) => /(?:tion|ment|ance|ence|ity|sis)$/u.test(s)).length / total;
  const subordinateMarkerDensity =
    w.filter((s) =>
      ['although', 'because', 'while', 'whereas', 'which', 'that', 'if', 'unless'].includes(s)
    ).length / total;
  return {
    contentWordRatio,
    nominalizationDensity,
    subordinateMarkerDensity,
    value: 0.6 * contentWordRatio + 0.25 * nominalizationDensity + 0.15 * subordinateMarkerDensity,
  };
}
function flatSpans(sentences) {
  const result = [],
    values = sentences.map(density).map((m) => m.value);
  const deviation = (start, end) => {
    const rolling = [];
    for (let i = start; i + 2 <= end; i++) rolling.push(mean(values.slice(i, i + 3)));
    return sd(rolling);
  };
  for (let i = 0; i + 4 < sentences.length; i++) {
    if (sentences[i + 4].paragraph !== sentences[i].paragraph || deviation(i, i + 4) >= 0.04)
      continue;
    let end = i + 4;
    while (
      end + 1 < sentences.length &&
      sentences[end + 1].paragraph === sentences[i].paragraph &&
      deviation(i, end + 1) < 0.04
    )
      end++;
    result.push({
      startLine: sentences[i].startLine,
      endLine: sentences[end].endLine,
      sentenceCount: end - i + 1,
      rollingStandardDeviation: deviation(i, end),
      threshold: 0.04,
      advisoryOnly: true,
    });
    i = end;
  }
  return result;
}

export function inspectDiscourse(original, rewrite, { format = 'md' } = {}) {
  const source = sentencesWithLines(original, format),
    output = sentencesWithLines(rewrite, format);
  const candidates = windows(output);
  const used = new Set();
  const epistemicDrift = [],
    polarityInversion = [],
    alignmentIssues = [];
  for (const [index, sentence] of source.entries()) {
    const target = align(sentence, candidates, used);
    if (!target) {
      alignmentIssues.push({
        sourceSentence: index,
        startLine: sentence.startLine,
        endLine: sentence.endLine,
        code: 'INCONCLUSIVE_ALIGNMENT',
      });
      continue;
    }
    for (const i of target.indices) used.add(i);
    const before = profile(sentence.text),
      after = profile(target.text),
      reasons = [];
    if (before.tentative.length && !after.tentative.length) reasons.push('hedge-lost');
    if (before.tier !== null && after.tier !== null && after.tier > before.tier)
      reasons.push('certainty-increased');
    if (
      !before.causal.length &&
      after.causal.length &&
      !after.tentative.length &&
      !after.associative.length
    )
      reasons.push('causal-inflation');
    if (before.negation !== after.negation) reasons.push('negation-changed');
    if (JSON.stringify(before.obligations) !== JSON.stringify(after.obligations))
      reasons.push('obligation-changed');
    const lostScope = before.scopes.some(
      (scope) =>
        !after.scopes.some((other) => {
          if (scope.kind !== other.kind) return false;
          if (scope.kind === 'confidence-interval') return true;
          return (
            scope.text === other.text ||
            (scope.anchors.size > 0 && recall(scope.anchors, other.anchors) >= 0.8)
          );
        })
    );
    if (lostScope) reasons.push('scope-lost');
    if (reasons.length)
      epistemicDrift.push({
        sourceSentence: index,
        sourceLines: { startLine: sentence.startLine, endLine: sentence.endLine },
        rewriteLines: { startLine: target.startLine, endLine: target.endLine },
        alignmentScore: Number(target.score.toFixed(3)),
        sourceTier: before.tier,
        rewriteTier: after.tier,
        reasons,
      });
    const oldGraph = concession(sentence.text);
    if (oldGraph) {
      const newGraph = concession(target.text);
      let reason = null;
      if (!newGraph && target.recall >= 0.65) reason = 'contrast-lost';
      if (newGraph) {
        const swapped =
          recall(oldGraph.subordinate, newGraph.nucleus) +
          recall(oldGraph.nucleus, newGraph.subordinate);
        const same =
          recall(oldGraph.subordinate, newGraph.subordinate) +
          recall(oldGraph.nucleus, newGraph.nucleus);
        if (swapped >= 1.2 && swapped > same + 0.25) reason = 'concession-nucleus-inverted';
      }
      if (reason)
        polarityInversion.push({
          reason,
          sourceLines: { startLine: sentence.startLine, endLine: sentence.endLine },
          rewriteLines: { startLine: target.startLine, endLine: target.endLine },
        });
    }
  }
  return {
    epistemicDrift,
    polarityInversion,
    flatEntropySpans: flatSpans(output),
    alignmentIssues,
    semanticEquivalenceProven: false,
    densityMethod:
      'Three-sentence rolling lexical-density proxy; not entropy, perplexity or measured propositions',
    alignmentMethod:
      'Lexical anchor overlap with up to three contiguous target sentences; scores are not probabilities',
  };
}

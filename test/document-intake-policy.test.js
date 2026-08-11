import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  calibrateLocalCorpus,
  calibrateVoiceSample,
  ingestPublishedWork,
  parseCorpusPointer,
  resolveDeliveryMode,
  selectMaterialQuestion,
} from '../scripts/lib/document-intake-policy.js';

const VOICE_SAMPLE = [
  "I don't want a grand introduction. Start with the decision and explain why it matters.",
  'Use short paragraphs, but let a longer sentence carry detail when the detail earns its place.',
  'Prefer concrete verbs. Keep the stance measured, direct, and open about uncertainty.',
  'A heading should help the reader navigate; it should not advertise the prose beneath it.',
].join('\n\n');

test('delivery modes never imply mutation, research, or publication authority', () => {
  for (const mode of ['pasted', 'file', 'embedded']) {
    const delivery = resolveDeliveryMode({ mode });
    assert.equal(delivery.mode, mode);
    assert.equal(delivery.capabilities.mutate_file, false, mode);
    assert.equal(delivery.capabilities.research, false, mode);
    assert.equal(delivery.capabilities.publish, false, mode);
  }
});

test('explicit grants are scoped independently from delivery mode', () => {
  const delivery = resolveDeliveryMode({
    mode: 'file',
    grants: { mutate_file: true, research: false, publish: false },
  });

  assert.deepEqual(delivery.capabilities, {
    mutate_file: true,
    research: false,
    publish: false,
  });
  assert.equal(delivery.response_contract, 'summary');
});

test('pasted and embedded modes select bounded response contracts', () => {
  assert.equal(resolveDeliveryMode({ mode: 'pasted' }).response_contract, 'text');
  assert.equal(resolveDeliveryMode({ mode: 'embedded' }).response_contract, 'artifact-only');
  assert.throws(() => resolveDeliveryMode({ mode: 'remote-url' }), /delivery mode/);
});

test('voice calibration records only observable writing features', () => {
  const profile = calibrateVoiceSample(VOICE_SAMPLE);

  assert.equal(profile.status, 'calibrated');
  assert.equal(profile.provenance, 'user-sample');
  assert.ok(profile.features.sentence_length.mean > 0);
  assert.ok(profile.features.paragraphing.mean_sentences >= 1);
  assert.ok(profile.features.contractions.rate > 0);
  assert.ok(Array.isArray(profile.features.punctuation.observed));
  assert.ok(['first-person', 'impersonal', 'mixed'].includes(profile.features.stance));
  for (const prohibited of [
    'identity',
    'demographics',
    'disability',
    'personality',
    'authorship',
    'ai_likelihood',
  ]) {
    assert.equal(Object.hasOwn(profile, prohibited), false, prohibited);
    assert.equal(Object.hasOwn(profile.features, prohibited), false, prohibited);
  }
});

test('short samples disclose limits instead of fabricating a voice profile', () => {
  const profile = calibrateVoiceSample('Please make this clearer.');
  assert.equal(profile.status, 'insufficient-sample');
  assert.equal(profile.features, null);
  assert.match(profile.limitation, /short/i);
});

test('asks at most one question when operation ambiguity changes the output contract', () => {
  const decision = selectMaterialQuestion({
    operation_candidates: ['review', 'rewrite'],
    archetype_candidates: ['workplace', 'technical'],
  });
  assert.equal(decision.question.field, 'operation');
  assert.match(decision.question.text, /review or rewrite/i);
  assert.equal(decision.remaining_material_questions, 1);
});

test('asks for research permission only when current guidance is materially required', () => {
  const decision = selectMaterialQuestion({
    requires_current_guidance: true,
    research_permission: 'not_requested',
  });
  assert.equal(decision.question.field, 'research_permission');
  assert.match(decision.question.text, /search current guidance/i);
});

test('asks document type when candidates have different safety boundaries', () => {
  const decision = selectMaterialQuestion({
    operation_candidates: ['review'],
    archetype_candidates: ['workplace', 'legal-regulatory'],
  });
  assert.equal(decision.question.field, 'archetype');
  assert.match(decision.question.reason, /safety|routing/i);
});

test('uses conservative assumptions when missing fields do not materially change routing', () => {
  const decision = selectMaterialQuestion({
    operation_candidates: ['review'],
    archetype_candidates: ['workplace'],
    audience: null,
  });
  assert.equal(decision.question, null);
  assert.deepEqual(decision.assumptions, {
    audience: 'general',
    editing_strength: 'conservative',
    research_permission: 'not_requested',
  });
});

test('parses explicit local file and folder pointers', () => {
  assert.deepEqual(parseCorpusPointer({ kind: 'local-file', path: 'C:\\drafts\\essay.md' }), {
    ok: true,
    kind: 'local-file',
    path: 'C:\\drafts\\essay.md',
  });
  assert.deepEqual(parseCorpusPointer({ kind: 'local-folder', path: './prior-writing' }), {
    ok: true,
    kind: 'local-folder',
    path: './prior-writing',
  });
  assert.equal(parseCorpusPointer(null).ok, false);
  assert.match(parseCorpusPointer('').reason, /pointer/i);
});

test('local file corpus produces the same feature record as a pasted sample', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'authentext-voice-file-'));
  const filePath = path.join(root, 'sample.md');
  fs.writeFileSync(filePath, VOICE_SAMPLE, 'utf8');

  const fromFile = calibrateLocalCorpus({
    pointer: { kind: 'local-file', path: filePath },
    consent: true,
  });
  const fromPaste = calibrateVoiceSample(VOICE_SAMPLE);

  assert.equal(fromFile.status, 'calibrated');
  assert.equal(fromFile.provenance, 'local-corpus');
  assert.deepEqual(fromFile.features, fromPaste.features);
  assert.equal(fromFile.sample_words, fromPaste.sample_words);
});

test('local folder corpus concatenates readable files into one feature record', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'authentext-voice-folder-'));
  fs.writeFileSync(path.join(root, 'a.md'), VOICE_SAMPLE.slice(0, 180), 'utf8');
  fs.writeFileSync(path.join(root, 'b.md'), VOICE_SAMPLE.slice(180), 'utf8');
  fs.writeFileSync(path.join(root, 'notes.bin'), Buffer.from([0, 1, 2, 3]));

  const fromFolder = calibrateLocalCorpus({
    pointer: { kind: 'local-folder', path: root },
    consent: true,
  });
  const fromPaste = calibrateVoiceSample(
    `${VOICE_SAMPLE.slice(0, 180)}\n\n${VOICE_SAMPLE.slice(180)}`
  );

  assert.equal(fromFolder.status, 'calibrated');
  assert.deepEqual(fromFolder.features, fromPaste.features);
  assert.ok(!fromFolder.search_query);
  assert.equal(fromFolder.uploaded_to_search, false);
});

test('refuses local corpus reads without explicit consent and does not touch the path', () => {
  let reads = 0;
  const profile = calibrateLocalCorpus({
    pointer: { kind: 'local-file', path: 'C:\\private\\draft.md' },
    consent: false,
    readFile() {
      reads += 1;
      return VOICE_SAMPLE;
    },
  });

  assert.equal(profile.status, 'consent-required');
  assert.equal(profile.features, null);
  assert.equal(reads, 0);
  assert.match(profile.limitation, /consent/i);
});

test('unreadable local paths disclose the limit instead of inventing a voice', () => {
  const missing = path.join(os.tmpdir(), 'authentext-missing-voice-corpus.md');
  const profile = calibrateLocalCorpus({
    pointer: { kind: 'local-file', path: missing },
    consent: true,
  });

  assert.equal(profile.status, 'unreadable');
  assert.equal(profile.features, null);
  assert.match(profile.limitation, /unreadable|not found|cannot read/i);
});

test('insufficient local corpus samples do not fabricate a voice profile', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'authentext-voice-short-'));
  const filePath = path.join(root, 'short.txt');
  fs.writeFileSync(filePath, 'Please make this clearer.', 'utf8');

  const profile = calibrateLocalCorpus({
    pointer: { kind: 'local-file', path: filePath },
    consent: true,
  });

  assert.equal(profile.status, 'insufficient-sample');
  assert.equal(profile.features, null);
  assert.match(profile.limitation, /short/i);
});

test('asks for corpus consent when a local pointer is present without a grant', () => {
  const decision = selectMaterialQuestion({
    corpus_pointer: { kind: 'local-folder', path: './drafts' },
    corpus_consent: false,
  });
  assert.equal(decision.question.field, 'corpus_consent');
  assert.match(decision.question.text, /read|consent|local/i);
});

test('parses DOI, URL, ORCID, and institutional-repo pointers', () => {
  assert.deepEqual(parseCorpusPointer('10.1234/example.paper'), {
    ok: true,
    kind: 'doi',
    value: '10.1234/example.paper',
  });
  assert.equal(parseCorpusPointer('doi:10.1234/example.paper').kind, 'doi');
  assert.deepEqual(parseCorpusPointer('https://journals.example.org/paper'), {
    ok: true,
    kind: 'url',
    value: 'https://journals.example.org/paper',
  });
  assert.deepEqual(parseCorpusPointer('0000-0002-1825-0097'), {
    ok: true,
    kind: 'orcid',
    value: '0000-0002-1825-0097',
  });
  assert.equal(parseCorpusPointer('https://orcid.org/0000-0002-1825-0097').kind, 'orcid');
  assert.equal(
    parseCorpusPointer({
      kind: 'institutional-repo',
      value: 'https://hdl.handle.net/2328/12345',
    }).kind,
    'institutional-repo'
  );
});

test('published-work queries are metadata-only and never include the current document', () => {
  const currentDocument = 'PRIVATE patient narrative that must not leave this machine.';
  const calls = [];
  const result = ingestPublishedWork({
    pointer: { kind: 'doi', value: '10.1234/example.paper' },
    consent: true,
    currentDocument,
    fetchMetadata(query) {
      calls.push(query);
      return { title: 'Example paper', publisher: 'Example Press' };
    },
    fetchFullText() {
      throw new Error('full text must not run on a metadata-only grant');
    },
  });

  assert.equal(result.status, 'metadata-only');
  assert.equal(result.sent_current_document, false);
  assert.equal(result.uploaded_to_search, false);
  assert.equal(result.search_query, null);
  assert.deepEqual(calls, [{ kind: 'doi', identifier: '10.1234/example.paper' }]);
  assert.equal(JSON.stringify(calls).includes('PRIVATE'), false);
  assert.equal(JSON.stringify(result.query).includes('PRIVATE'), false);
});

test('published full text is fetched only with a separate grant and still omits the current document', () => {
  const currentDocument = 'SECRET manuscript body';
  const queries = [];
  const result = ingestPublishedWork({
    pointer: 'https://example.edu/repository/handle/123',
    consent: true,
    fullTextGrant: true,
    currentDocument,
    fetchMetadata(query) {
      queries.push(['metadata', query]);
      return { title: 'Repo item' };
    },
    fetchFullText(query) {
      queries.push(['full-text', query]);
      return VOICE_SAMPLE;
    },
  });

  assert.equal(result.status, 'calibrated');
  assert.equal(result.provenance, 'published-work');
  assert.deepEqual(result.features, calibrateVoiceSample(VOICE_SAMPLE).features);
  assert.deepEqual(queries, [
    [
      'metadata',
      { kind: 'institutional-repo', identifier: 'https://example.edu/repository/handle/123' },
    ],
    [
      'full-text',
      { kind: 'institutional-repo', identifier: 'https://example.edu/repository/handle/123' },
    ],
  ]);
  assert.equal(JSON.stringify(queries).includes('SECRET'), false);
  assert.equal(result.sent_current_document, false);
});

test('refuses published-work fetches without consent and does not call the fetcher', () => {
  let fetches = 0;
  const result = ingestPublishedWork({
    pointer: { kind: 'url', value: 'https://example.org/essay' },
    consent: false,
    fetchMetadata() {
      fetches += 1;
      return { title: 'should not run' };
    },
  });
  assert.equal(result.status, 'consent-required');
  assert.equal(result.features, null);
  assert.equal(fetches, 0);
});

test('asks for published-work consent when a DOI is named without a grant', () => {
  const decision = selectMaterialQuestion({
    corpus_pointer: { kind: 'doi', value: '10.1234/example.paper' },
    published_consent: false,
  });
  assert.equal(decision.question.field, 'published_consent');
  assert.match(decision.question.text, /metadata|DOI|current document/i);
});

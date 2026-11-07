#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { inputFiles, readText, metrics, parseArgs } from './lib/frontier-text.js';
import { assertDistinctPaths, writePrivate, isDirectExecution } from './lib/local-file-io.js';

function numericDelta(author, comparison) {
  if (typeof author === 'number' && typeof comparison === 'number') return author - comparison;
  if (author && comparison && typeof author === 'object' && typeof comparison === 'object') {
    return Object.fromEntries(
      Object.keys(author)
        .filter((k) => k in comparison)
        .map((k) => [k, numericDelta(author[k], comparison[k])])
    );
  }
  return null;
}
export function calibrate(corpus, { flattened = null } = {}) {
  if (!Array.isArray(corpus) || !corpus.length || corpus.some((x) => typeof x !== 'string'))
    throw new Error('Empty or invalid corpus');
  const own = metrics(corpus.join('\n\n'));
  let contrast = null;
  if (flattened !== null) {
    if (
      !Array.isArray(flattened) ||
      flattened.length !== corpus.length ||
      flattened.some((x) => typeof x !== 'string')
    )
      throw new Error('Flattened corpus must be paired');
    const generic = metrics(flattened.join('\n\n'));
    contrast = { metrics: generic, delta: numericDelta(own, generic) };
  }
  return {
    schemaVersion: '1.0.0',
    kind: 'structural-voice-profile',
    consentRequired: true,
    documentCount: corpus.length,
    calibrationSufficient: own.wordCount >= 200,
    metrics: own,
    contrastive: contrast,
    constraints: { emDashPer1000Max: own.punctuationPer1000.emDash },
    limitations: [
      'Structural summary only; not a semantic or identity fingerprint',
      'A short or genre-mismatched corpus may misrepresent author voice',
      'Do not use this profile as an authorship detector',
    ],
  };
}
function main() {
  try {
    const a = parseArgs(process.argv.slice(2), ['corpus', 'flattened', 'output']);
    if (!a.corpus || !a.output) throw new Error('Requires --corpus and --output');
    const corpusPaths = inputFiles(a.corpus);
    const otherPaths = a.flattened ? inputFiles(a.flattened) : null;
    if (otherPaths) {
      if (corpusPaths.length !== otherPaths.length)
        throw new Error('Corpus and flattened file counts differ');
      const relative = (root, file) =>
        path
          .relative(fs.statSync(root).isDirectory() ? root : path.dirname(root), file)
          .replaceAll(path.sep, '/');
      const mismatches = corpusPaths
        .map((file, i) => relative(a.corpus, file) !== relative(a.flattened, otherPaths[i]))
        .filter(Boolean);
      if (mismatches.length) throw new Error('Paired files must share relative paths');
    }
    const profile = calibrate(corpusPaths.map(readText), {
      flattened: otherPaths?.map(readText) ?? null,
    });
    fs.mkdirSync(path.dirname(path.resolve(a.output)), { recursive: true });
    assertDistinctPaths([...new Set([...corpusPaths, ...(otherPaths ?? [])])], [a.output]);
    writePrivate(a.output, JSON.stringify(profile, null, 2) + '\n');
    process.stdout.write(
      JSON.stringify({
        output: path.resolve(a.output),
        documents: profile.documentCount,
        calibrationSufficient: profile.calibrationSufficient,
      }) + '\n'
    );
  } catch (error) {
    process.stderr.write('calibrate-voice: ' + error.message + '\n');
    process.exitCode = 2;
  }
}
if (isDirectExecution(import.meta.url)) main();

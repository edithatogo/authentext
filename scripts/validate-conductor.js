#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const required = [
  'conductor/index.md',
  'conductor/product.md',
  'conductor/product-guidelines.md',
  'conductor/tech-stack.md',
  'conductor/workflow.md',
  'conductor/tracks.md',
  'conductor/roadmap.md',
  'conductor/setup_state.json',
  'conductor/github-mapping.json',
  'conductor/experimental-features.md',
];
const errors = [];

for (const relative of required) {
  if (!fs.existsSync(path.join(root, relative))) errors.push(`missing ${relative}`);
}

const setup = JSON.parse(fs.readFileSync(path.join(root, 'conductor/setup_state.json'), 'utf8'));
if (!setup.setup_complete || setup.last_successful_step !== '3_handshake_generated') {
  errors.push('setup_state.json does not record a completed handshake');
}

const mapping = JSON.parse(
  fs.readFileSync(path.join(root, 'conductor/github-mapping.json'), 'utf8')
);
const tracks = mapping.tracks ?? [];
const trackIds = tracks.map((track) => track.track_id);
if (trackIds.length !== new Set(trackIds).size)
  errors.push('github mapping has duplicate track IDs');

for (const track of tracks) {
  if (!track.parent_issue?.number || !track.parent_issue?.url) {
    errors.push(`${track.track_id} has no mapped parent issue`);
  }
  for (const phase of track.phases ?? []) {
    if (!phase.issue?.number || !phase.issue?.url) {
      errors.push(`${phase.phase_id} has no mapped phase issue`);
    }
  }
}

const bleedingEdgeTrack = tracks.find(
  (track) => track.track_id === 'bleeding-edge-agent-skills-conductor_20260731'
);
if (!bleedingEdgeTrack) {
  errors.push('bleeding-edge track is absent from github mapping');
} else {
  for (const artifact of ['requirements.md', 'design.md', 'plan.md', 'spec.md']) {
    const relative = path.posix.join(bleedingEdgeTrack.path, artifact);
    if (!fs.existsSync(path.join(root, relative))) errors.push(`missing ${relative}`);
  }
}

if (errors.length) {
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Conductor handshake validation passed for ${tracks.length} mapped tracks.`);

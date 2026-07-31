#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { applyReconciliation, reconcileMapping } from './lib/conductor-reconciliation.js';

const args = new Set(process.argv.slice(2));
const live = args.has('--live') || args.has('--apply');
const apply = args.has('--apply');
const root = process.cwd();
const mappingPath = path.join(root, 'conductor', 'github-mapping.json');
const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));

function ghJson(commandArgs) {
  const executable = process.platform === 'win32' ? 'gh.exe' : 'gh';
  const result = spawnSync(executable, commandArgs, { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || `gh ${commandArgs.join(' ')} failed`);
  return JSON.parse(result.stdout);
}

if (!live) {
  const phaseCount = mapping.tracks.reduce((sum, track) => sum + (track.phases?.length ?? 0), 0);
  console.log('DRY RUN: no GitHub calls or files changed.');
  console.log(
    `Would verify ${mapping.tracks.length} tracks and ${phaseCount} phases in Project 36.`
  );
  process.exit(0);
}

const issueSnapshot = ghJson([
  'issue',
  'list',
  '--repo',
  mapping.repository,
  '--state',
  'all',
  '--limit',
  '500',
  '--json',
  'number,state,url,title',
]);
const projectSnapshot = ghJson([
  'project',
  'item-list',
  String(mapping.project.number),
  '--owner',
  mapping.project.url.split('/')[4],
  '--limit',
  '500',
  '--format',
  'json',
]);
const [owner, repository] = mapping.repository.split('/');
const aliases = mapping.tracks
  .map(
    (track, index) =>
      `t${index}: issue(number: ${track.parent_issue.number}) { subIssues(first: 100) { nodes { number } } }`
  )
  .join('\n');
const relationshipSnapshot = ghJson([
  'api',
  'graphql',
  '-f',
  `query=query($owner:String!,$repository:String!){repository(owner:$owner,name:$repository){${aliases}}}`,
  '-F',
  `owner=${owner}`,
  '-F',
  `repository=${repository}`,
]);
const subissues = Object.fromEntries(
  mapping.tracks.map((track, index) => [
    track.parent_issue.number,
    relationshipSnapshot.data.repository[`t${index}`].subIssues.nodes.map((node) => node.number),
  ])
);
const report = reconcileMapping(mapping, {
  issues: issueSnapshot,
  projectItems: projectSnapshot.items,
  subissues,
});

console.log(JSON.stringify(report, null, 2));
if (!report.clean) process.exit(1);
if (!apply) {
  console.log('LIVE DRY RUN: hosted issues and Project membership verified; no files changed.');
  process.exit(0);
}

const reconciled = applyReconciliation(mapping, report, new Date().toISOString());
fs.writeFileSync(mappingPath, `${JSON.stringify(reconciled, null, 2)}\n`, 'utf8');
console.log(
  'APPLIED: refreshed deterministic hosted-state receipt in conductor/github-mapping.json.'
);

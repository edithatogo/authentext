#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { monitorRegistryDistribution, renderRegistryDriftIssue } from './lib/registry-monitor.js';

function argument(name, fallback) {
  const index = process.argv.indexOf(name);
  if (index >= 0 && !process.argv[index + 1]) throw new TypeError(`${name} requires a value`);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function readJson(filePath, label) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.error(`Unable to read ${label} at ${filePath}: ${error.message}`);
    process.exit(1);
  }
}

const root = process.cwd();
const matrixPath = path.resolve(
  argument('--matrix', path.join(root, 'conductor', 'registry-distribution.json'))
);
const outputPath = path.resolve(argument('--output', path.join(root, 'registry-drift.json')));
const observationsArg = argument('--observations');
const packageJson = readJson(path.join(root, 'package.json'), 'package metadata');
const matrix = readJson(matrixPath, 'registry matrix');
const observations = observationsArg
  ? readJson(path.resolve(observationsArg), 'registry observations')
  : {};
const maxAgeDays = Number(argument('--max-age-days', '90'));

if (!Number.isInteger(maxAgeDays) || maxAgeDays < 1) {
  console.error('--max-age-days must be a positive integer');
  process.exit(1);
}

async function probeListings(currentObservations) {
  const probed = { ...currentObservations };
  if (!Array.isArray(matrix.channels)) return probed;
  await Promise.all(
    matrix.channels.map(async (channel) => {
      const listingUrl = channel.evidence?.listing_url;
      if (!listingUrl) return;
      try {
        const response = await fetch(listingUrl, { method: 'HEAD', redirect: 'follow' });
        probed[channel.id] = {
          ...probed[channel.id],
          present: response.status !== 404 && response.status !== 410,
          http_status: response.status,
        };
      } catch {
        probed[channel.id] = {
          ...probed[channel.id],
          present: undefined,
          http_status: 599,
        };
      }
    })
  );
  return probed;
}

function writeReport(currentObservations) {
  const report = monitorRegistryDistribution(matrix, {
    asOf: argument('--as-of', new Date().toISOString().slice(0, 10)),
    currentVersion: packageJson.version,
    maxAgeDays,
    observations: currentObservations,
  });

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  const issueBodyArg = argument('--issue-body');
  if (issueBodyArg) {
    const issueBodyPath = path.resolve(issueBodyArg);
    fs.mkdirSync(path.dirname(issueBodyPath), { recursive: true });
    fs.writeFileSync(issueBodyPath, renderRegistryDriftIssue(report));
  }
  console.log(
    `Registry monitor report written to ${outputPath} (${report.finding_count} findings).`
  );
}

const observationPromise = process.argv.includes('--probe-listings')
  ? probeListings(observations)
  : Promise.resolve(observations);
observationPromise.then(writeReport).catch((error) => {
  console.error(`Registry monitor failed: ${error.message}`);
  process.exitCode = 1;
});

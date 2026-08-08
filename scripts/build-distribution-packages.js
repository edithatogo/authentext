#!/usr/bin/env node

import process from 'node:process';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { buildDistributionPackage, validateHostPackage } from './lib/distribution-builder.js';

const outputIndex = process.argv.indexOf('--output');
const output = outputIndex >= 0 ? process.argv[outputIndex + 1] : 'distribution-staging';
const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const targets = ['portable', 'claude', 'codex', 'gemini', 'opencode'];
const receipts = targets.map((target) => {
  const receipt = buildDistributionPackage({ root: process.cwd(), output, target, sourceCommit });
  const errors = validateHostPackage(receipt.packageRoot, target);
  if (errors.length > 0) throw new TypeError(`${target}: ${errors.join('; ')}`);
  return { ...receipt, packageRoot: undefined };
});
fs.writeFileSync(
  path.join(output, 'distribution-receipt.json'),
  `${JSON.stringify({ schema_version: 1, source_commit: sourceCommit, receipts }, null, 2)}\n`
);
console.log(JSON.stringify({ output, targets, sourceCommit }, null, 2));

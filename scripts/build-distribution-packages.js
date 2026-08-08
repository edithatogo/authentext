#!/usr/bin/env node

import process from 'node:process';
import { execFileSync } from 'node:child_process';
import { buildDistributionPackage, validatePortablePackage } from './lib/distribution-builder.js';

const outputIndex = process.argv.indexOf('--output');
const output = outputIndex >= 0 ? process.argv[outputIndex + 1] : 'distribution-staging';
const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const receipt = buildDistributionPackage({
  root: process.cwd(),
  output,
  target: 'portable',
  sourceCommit,
});
const errors = validatePortablePackage(receipt.packageRoot);
if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(JSON.stringify(receipt, null, 2));

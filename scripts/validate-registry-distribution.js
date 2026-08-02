#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { validateRegistryDistribution } from './lib/registry-distribution.js';

const rootArg = process.argv.indexOf('--root');
const root = path.resolve(rootArg >= 0 ? process.argv[rootArg + 1] : process.cwd());
const matrixPath = path.join(root, 'conductor', 'registry-distribution.json');

if (!fs.existsSync(matrixPath)) {
  console.error('- conductor/registry-distribution.json is missing');
  process.exit(1);
}

let matrix;
try {
  matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));
} catch (error) {
  console.error(`- conductor/registry-distribution.json is invalid JSON: ${error.message}`);
  process.exit(1);
}

const errors = validateRegistryDistribution(matrix);
if (errors.length > 0) {
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Registry distribution validation passed for ${matrix.channels.length} channels.`);

#!/usr/bin/env node

import process from 'node:process';
import { collectContractErrors } from './lib/skill-contracts.js';

const rootArg = process.argv.indexOf('--root');
const root = rootArg >= 0 ? process.argv[rootArg + 1] : process.cwd();
const errors = collectContractErrors(root);

if (errors.length > 0) {
  console.error('Skill contract validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Skill contract validation passed.');
console.log('Official Agent Skills spec: https://agentskills.io/specification');

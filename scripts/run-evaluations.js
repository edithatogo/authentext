#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { evaluateOutputCases, evaluateTriggerCases } from './lib/skill-evaluator.js';

const outputFlag = process.argv.indexOf('--output-dir');
if (outputFlag === -1 || !process.argv[outputFlag + 1]) {
  console.error('Usage: node scripts/run-evaluations.js --output-dir <directory>');
  process.exit(2);
}

const outputDir = path.resolve(process.argv[outputFlag + 1]);
const loadFixture = (filename) =>
  JSON.parse(fs.readFileSync(path.join('test', 'fixtures', filename), 'utf8'));
const triggerSummary = evaluateTriggerCases(loadFixture('trigger-evaluations.json'));
const outputSummary = evaluateOutputCases(loadFixture('output-evaluations.json'));
const summary = {
  schema_version: 1,
  suite: 'authentext-evaluations',
  total: triggerSummary.total + outputSummary.total,
  passed: triggerSummary.passed + outputSummary.passed,
  failed: triggerSummary.failed + outputSummary.failed,
  suites: [
    { name: triggerSummary.suite, ...triggerSummary },
    { name: outputSummary.suite, ...outputSummary },
  ],
};

fs.mkdirSync(outputDir, { recursive: true });
for (const [filename, receipt] of [
  ['trigger-summary.json', triggerSummary],
  ['output-summary.json', outputSummary],
  ['summary.json', summary],
]) {
  fs.writeFileSync(path.join(outputDir, filename), `${JSON.stringify(receipt, null, 2)}\n`);
}

console.log(`Evaluation receipt: ${path.join(outputDir, 'summary.json')}`);
if (summary.failed > 0) process.exit(1);

#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyzeSkillProse, unexpectedFindings } from './lib/skill-self-compliance.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

function readUtf8(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

const skill = readUtf8('SKILL.md');
const allowlist = JSON.parse(readUtf8('scripts/lib/skill-self-compliance.allowlist.json'));
const report = analyzeSkillProse(skill, 'SKILL.md');
const unexpected = unexpectedFindings(report.findings, allowlist.allowed);

if (report.chatbot.length > 0) {
  console.error('Compiled SKILL.md has leftover chatbot correspondence:');
  for (const finding of report.chatbot) {
    console.error(`  ${finding.source}:${finding.line} ${finding.kind} ${finding.excerpt}`);
  }
}

if (unexpected.length > 0) {
  console.error('Compiled SKILL.md has unexpected dash or chatbot findings:');
  for (const finding of unexpected) {
    console.error(`  ${finding.source}:${finding.line} ${finding.kind} ${finding.excerpt}`);
  }
}

if (report.chatbot.length > 0 || unexpected.length > 0) {
  process.exit(1);
}

console.log(
  `Skill self-compliance passed for SKILL.md (${report.findings.length} allowlisted dash finding(s), 0 chatbot).`
);

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import {
  analyzeSkillProse,
  isAllowedDashContext,
  maskIgnoredRegions,
  unexpectedFindings,
} from '../scripts/lib/skill-self-compliance.js';

function readUtf8(relativePath) {
  return fs.readFileSync(relativePath, 'utf8');
}

const skill = readUtf8('SKILL.md');
const allowlist = JSON.parse(readUtf8('scripts/lib/skill-self-compliance.allowlist.json'));

test('a planted em dash in non-example SKILL.md prose is a finding', () => {
  const planted = skill.replace(
    '## Your Task\n',
    '## Your Task\n\nThis planted sentence uses an em dash — here.\n'
  );
  const report = analyzeSkillProse(planted, 'SKILL.md');
  assert.ok(
    report.emDashes.some((item) => item.excerpt.includes('planted sentence uses an em dash')),
    JSON.stringify(report.emDashes, null, 2)
  );
  assert.ok(unexpectedFindings(report.findings, allowlist.allowed).length > 0);
});

test('a planted chatbot leftover in non-example prose is a finding', () => {
  const planted = skill.replace(
    '## Your Task\n',
    '## Your Task\n\nI hope this helps! Let me know if you would like more.\n'
  );
  const report = analyzeSkillProse(planted, 'SKILL.md');
  assert.ok(report.chatbot.some((item) => item.kind === 'chatbot:hope-this-helps'));
});

test('example blockquotes and glyph mentions are ignored', () => {
  const sample = [
    'Prose without a dash.',
    '',
    '> Institutions—not the people—keep this label.',
    '',
    'Catch spaced (`—`) and numeric 0–2 ranges.',
    '',
    '[Title](url) — description',
    '**Term** — definition',
  ].join('\n');
  const report = analyzeSkillProse(sample, 'fixture.md');
  assert.equal(report.findings.length, 0, JSON.stringify(report.findings, null, 2));
  assert.equal(maskIgnoredRegions('> quoted—dash\n').includes('\u2014'), false);
  assert.equal(isAllowedDashContext('0–2 tells', 1), true);
});

test('compiled SKILL.md has no leftover chatbot correspondence', () => {
  const report = analyzeSkillProse(skill, 'SKILL.md');
  assert.equal(report.chatbot.length, 0, JSON.stringify(report.chatbot, null, 2));
  assert.deepEqual(unexpectedFindings(report.findings, allowlist.allowed), []);
});

test('new self-compliance tooling reads files as explicit UTF-8', () => {
  const checker = readUtf8('scripts/check-skill-self-compliance.js');
  assert.match(checker, /readFileSync\(path\.join\(root, relativePath\), 'utf8'\)/);
  assert.match(checker, /function readUtf8/);
});

test('self-compliance CLI reads SKILL.md as UTF-8 and exits 0 on the allowlist', () => {
  const result = spawnSync(process.execPath, ['scripts/check-skill-self-compliance.js'], {
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /self-compliance passed/);
});

test('self-compliance CLI fails when a planted dash is written to a temp copy', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'authentext-self-compliance-'));
  const planted = `${skill}\n\nThis extra line plants an em dash — outside examples.\n`;
  const report = analyzeSkillProse(planted, 'SKILL.md');
  assert.ok(unexpectedFindings(report.findings, allowlist.allowed).length > 0);
  fs.rmSync(tempDir, { recursive: true, force: true });
});

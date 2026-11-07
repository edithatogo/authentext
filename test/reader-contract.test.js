import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectRewrite } from '../scripts/verify-rewrite.js';

const unchanged = 'The service needs more staff.';
const inspect = (original, rewrite, readerContract) =>
  inspectRewrite(original, rewrite, { mode: 'light', readerContract });

test('explicit maximum word limits gate even light verification', () => {
  const report = inspect(unchanged, unchanged, {
    schemaVersion: '1.0.0',
    audience: 'general',
    length: { mode: 'maximum', maxWords: 4 },
  });
  assert.equal(report.passed, false);
  assert.equal(report.readerFit.length.outputWords, 5);
  assert.equal(report.readerFit.length.hardFailure, true);
});

test('target length with an explicit tolerance is not a hidden minimum', () => {
  const report = inspect(unchanged, unchanged, {
    schemaVersion: '1.0.0',
    length: { mode: 'target', targetWords: 6, toleranceWords: 1 },
  });
  assert.equal(report.readerFit.length.withinBounds, true);
  assert.equal(report.passed, true);
});

test('default length preservation is advisory and is measured independently', () => {
  const report = inspect(unchanged, 'The service urgently needs more staff for its new clinic.', {
    schemaVersion: '1.0.0',
    audience: 'mixed',
  });
  assert.equal(report.readerFit.length.withinBounds, false);
  assert.equal(report.readerFit.length.hardFailure, false);
  assert.ok(report.readerFit.findings.some((f) => f.code === 'LENGTH_BUDGET'));
});

test('the counter counts supplied words including references, not model tokens', () => {
  const text = 'Café well-being don’t 1,000 [12] —';
  const report = inspect(text, text, {
    schemaVersion: '1.0.0',
    length: { mode: 'range', minWords: 5, maxWords: 5 },
  });
  assert.equal(report.readerFit.length.outputWords, 5);
  assert.equal(report.readerFit.length.countScope, 'supplied-text');
});

test('invalid, impossible or misspelled contracts are rejected', () => {
  for (const contract of [
    { schemaVersion: '2' },
    { schemaVersion: '1.0.0', length: { mode: 'maximum', maxWords: -1 } },
    { schemaVersion: '1.0.0', length: { mode: 'maximum', maxWords: Infinity } },
    { schemaVersion: '1.0.0', length: { mode: 'range', minWords: 7, maxWords: 4 } },
    { schemaVersion: '1.0.0', length: { mode: 'maximum', maxwords: 5 } },
    { schemaVersion: '1.0.0', audience: 'imagined-expert' },
    { schemaVersion: '1.0.0', allowedTerms: [17] },
  ])
    assert.throws(
      () => inspect(unchanged, unchanged, contract),
      /contract|length|word|audience|term/i
    );
});

test('IT-register vocabulary is advisory, domain-sensitive and allowlisted', () => {
  const text = 'The pipeline needs observability.';
  const base = { schemaVersion: '1.0.0', audience: 'general', domain: 'governance' };
  const general = inspect(text, text, base);
  assert.ok(general.readerFit.findings.some((f) => f.code === 'TRANSFERRED_IT_REGISTER'));
  assert.equal(general.passed, true);
  const technical = inspect(text, text, { ...base, domain: 'technical' });
  assert.equal(
    technical.readerFit.findings.some((f) => f.code === 'TRANSFERRED_IT_REGISTER'),
    false
  );
  const allowed = inspect(text, text, { ...base, allowedTerms: ['pipeline', 'observability'] });
  assert.equal(
    allowed.readerFit.findings.some((f) => f.code === 'TRANSFERRED_IT_REGISTER'),
    false
  );
});

test('reader warnings do not inspect locked code as prose', () => {
  const text = 'Run `pipeline observability` now.';
  const report = inspect(text, text, { schemaVersion: '1.0.0', audience: 'general' });
  assert.equal(
    report.readerFit.findings.some((f) => f.code === 'TRANSFERRED_IT_REGISTER'),
    false
  );
});

test('reader context is never certified by mechanical checks', () => {
  const report = inspect(unchanged, unchanged, {
    schemaVersion: '1.0.0',
    contextNeeds: ['Explain who decides and why'],
    productionMode: 'multi-agent',
  });
  assert.equal(report.readerFit.contextAssessment, 'manual-review-required');
  assert.equal(report.readerFit.productionMode, 'multi-agent');
  assert.equal(report.readerFit.contextRequirements, 1);
  assert.ok(report.readerFit.manualChecks.includes('agent-handoff-context'));
  assert.doesNotMatch(JSON.stringify(report.readerFit), /Explain who decides and why/);
});

test('a word ceiling never authorises a factual mutation', () => {
  const report = inspectRewrite(
    'The sample included 42 adults.',
    'The sample included 24 adults.',
    {
      readerContract: { schemaVersion: '1.0.0', length: { mode: 'maximum', maxWords: 100 } },
    }
  );
  assert.equal(report.readerFit.length.withinBounds, true);
  assert.equal(report.passed, false);
});

test('the installed skill routes reader-fit guidance from source', async () => {
  const fs = await import('node:fs');
  for (const file of ['SKILL.md', 'SKILL_PROFESSIONAL.md'])
    assert.match(fs.readFileSync(file, 'utf8'), /references\/reader-fit\.md/);
  assert.match(fs.readFileSync('references/reader-fit.md', 'utf8'), /manual-review-required/);
});

test('reader contract CLI returns 1 for a hard word ceiling and 2 for invalid metadata', async () => {
  const fs = await import('node:fs');
  const os = await import('node:os');
  const path = await import('node:path');
  const { spawnSync } = await import('node:child_process');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'authentext-reader-'));
  try {
    const input = path.join(dir, 'input.txt'),
      contract = path.join(dir, 'reader.json');
    fs.writeFileSync(input, unchanged);
    fs.writeFileSync(
      contract,
      JSON.stringify({ schemaVersion: '1.0.0', length: { mode: 'maximum', maxWords: 4 } })
    );
    const args = [
      'scripts/verify-rewrite.js',
      '--original',
      input,
      '--rewrite',
      input,
      '--reader-contract',
      contract,
      '--json',
    ];
    const result = spawnSync(process.execPath, args, { encoding: 'utf8' });
    assert.equal(result.status, 1);
    assert.equal(JSON.parse(result.stdout).readerFit.length.outputWords, 5);
    fs.writeFileSync(contract, '{"schemaVersion":"wrong"}');
    assert.equal(spawnSync(process.execPath, args, { encoding: 'utf8' }).status, 2);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

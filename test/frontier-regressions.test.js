import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { inspectRewrite } from '../scripts/verify-rewrite.js';
import { metrics } from '../scripts/lib/frontier-text.js';

// Each test below fails when its production invariant is removed.
test('protected code retains Unicode composition and line endings', () => {
  assert.equal(inspectRewrite('`cafe\u0301`', '`caf\u00e9`').passed, false);
  assert.equal(inspectRewrite('~~~js\r\nlet n=1;\r\n~~~', '~~~js\nlet n=1;\n~~~').passed, false);
});

test('equal numeric tokens cannot disguise changed currency, units or named dates', () => {
  for (const [before, after] of [
    ['The fee is $25.', 'The fee is €25.'],
    ['Give 5 mg.', 'Give 5 g.'],
    ['Samples arrived 3 May 2025.', 'Samples arrived 3 June 2025.'],
  ])
    assert.equal(inspectRewrite(before, after).passed, false, before);
});

test('inline/display maths are not counted as prose', () => {
  const report = metrics('Two words.\n\n$$x+y=z$$\n\n\\[ f(x) = x^2 \\]\n\n');
  assert.equal(report.wordCount, 2);
});

test('explicit author punctuation cap is enforced but defaults remain contextual', () => {
  const text = 'One\u2014two.';
  assert.equal(inspectRewrite(text, text).passed, true);
  assert.equal(
    inspectRewrite(text, text, {
      profile: { schemaVersion: '1.0.0', constraints: { emDashPer1000Max: 0 } },
    }).passed,
    false
  );
  assert.throws(
    () =>
      inspectRewrite('One.', 'One.', {
        profile: { schemaVersion: '1.0.0', constraints: { emDashPer1000Max: -1 } },
      }),
    /profile|cap|constraint/i
  );
});

test('verifier rejects misspelled options rather than silently ignoring them', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'frontier-regression-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const input = path.join(dir, 'text.md');
  fs.writeFileSync(input, 'Ordinary prose.');
  const result = spawnSync(
    process.execPath,
    ['scripts/verify-rewrite.js', '--original', input, '--rewrite', input, '--mdoe', 'deep'],
    { encoding: 'utf8' }
  );
  assert.equal(result.status, 2);
  assert.match(result.stderr, /unknown|unsupported/i);
});

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const gatherSource = fs.readFileSync('scripts/gather-repo-data.js', 'utf8');
const decisionLog = fs.readFileSync('conductor/self-improvement/upstream-decision-log.md', 'utf8');

test('gather-repo-data examples point at edithatogo/authentext', () => {
  assert.match(
    gatherSource,
    /Example: node scripts\/gather-repo-data\.js edithatogo\/authentext blader\/humanizer/
  );
  assert.doesNotMatch(gatherSource, /edithatogo\/humanizer-next/);
});

test('decision log names authentext and records upstream v2.9.0', () => {
  assert.match(decisionLog, /\*\*Local Repository:\*\* edithatogo\/authentext/);
  assert.match(decisionLog, /\*\*Upstream Repository:\*\* blader\/humanizer/);
  assert.match(decisionLog, /v2\.9\.0/);
  assert.doesNotMatch(decisionLog, /\*\*Local Repository:\*\* edithatogo\/humanizer-next/);
});

test('decision log records adopt calls for editorial-safety local PRs', () => {
  for (const marker of ['#275', '#282', '#284', '#285', '#286', '#287']) {
    assert.match(decisionLog, new RegExp(marker));
  }

  assert.match(decisionLog, /Decision: ADOPT/);
  assert.match(decisionLog, /#187/);
  assert.match(decisionLog, /#212/);
  assert.match(decisionLog, /#213/);
  assert.match(decisionLog, /#192/);
  assert.match(decisionLog, /#146/);
  assert.match(decisionLog, /#190/);
  assert.match(decisionLog, /#209/);
  assert.match(decisionLog, /#211/);
  assert.match(decisionLog, /#207/);
  assert.match(decisionLog, /#196/);
});

test('decision log triages remaining open upstream PRs and keeps history', () => {
  assert.match(decisionLog, /upstream #214[\s\S]*Decision: DEFER/);
  assert.match(decisionLog, /upstream #205[\s\S]*Decision: REJECT/);
  assert.match(decisionLog, /upstream #200[\s\S]*Decision: REJECT/);
  assert.match(decisionLog, /upstream #201[\s\S]*Decision: DEFER/);
  assert.match(decisionLog, /upstream #191[\s\S]*Decision: DEFER/);
  assert.match(decisionLog, /## Historical archive/);
  assert.match(decisionLog, /upstream #159/);
  assert.match(decisionLog, /upstream #155/);
});

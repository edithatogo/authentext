import test from 'node:test';
import assert from 'node:assert/strict';
import { formatTriageTable } from '../scripts/lib/upstream-triage.js';

test('triage table escapes existing backslashes before Markdown separators', () => {
  const table = formatTriageTable([
    {
      kind: 'issue',
      number: 7,
      title: String.raw`Windows C:\temp | escape`,
      decision: 'defer',
      reason: String.raw`Preserve \| and escape | safely`,
    },
  ]);

  assert.match(table, /Windows C:\\\\temp \\\| escape/);
  assert.match(table, /Preserve \\\\\\\| and escape \\\| safely/);
});

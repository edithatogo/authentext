import test from 'node:test';
import assert from 'node:assert/strict';
import fc from 'fast-check';

import { maskDocument, unmaskDocument, ShieldError } from '../scripts/lib/ast-shield.js';
import { inspectRewrite } from '../scripts/verify-rewrite.js';

const numRuns = Number(process.env.AUTHENTEXT_FUZZ_RUNS ?? 256);
const seed = Number(process.env.AUTHENTEXT_FUZZ_SEED ?? 20261120);
if (!Number.isSafeInteger(numRuns) || numRuns < 1 || numRuns > 10000) {
  throw new Error('AUTHENTEXT_FUZZ_RUNS must be an integer from 1 to 10000');
}
if (!Number.isSafeInteger(seed) || seed < -2147483648 || seed > 2147483647) {
  throw new Error('AUTHENTEXT_FUZZ_SEED must be a signed 32-bit integer');
}
const options = { numRuns, seed, verbose: true };
const codePoint = fc.oneof(
  fc.integer({ min: 0, max: 0xd7ff }),
  fc.integer({ min: 0xe000, max: 0x10ffff })
);
// Excluding the fence delimiter keeps generated documents structurally valid.
const code = fc
  .array(
    codePoint.filter((point) => point !== 0x60),
    { maxLength: 128 }
  )
  .map((points) => String.fromCodePoint(...points));
const newline = fc.constantFrom('\n', '\r\n');
const format = fc.constantFrom('md', 'qmd', 'rmd');

test('generated Unicode code blocks survive masking and serialized lockfiles', () => {
  fc.assert(
    fc.property(code, newline, format, (payload, nl, kind) => {
      const source = `Cafe\u0301 Ω 中 🧬${nl}\`\`\`text${nl}${payload}${nl}\`\`\`${nl}Fin.${nl}`;
      const { masked, lockfile } = maskDocument(source, kind);
      assert.ok(lockfile.entries.length > 0);
      const portableLock = JSON.parse(JSON.stringify(lockfile));
      assert.equal(unmaskDocument(masked, portableLock).text, source);
      assert.equal(
        unmaskDocument(masked.replace(/Fin\.\r?\n$/, `End.${nl}`), portableLock).text,
        source.replace(/Fin\.\r?\n$/, `End.${nl}`)
      );
    }),
    options
  );
});

test('generated protected blocks reject missing and duplicated tokens', () => {
  fc.assert(
    fc.property(code, newline, (payload, nl) => {
      const source = `Before.${nl}\`\`\`text${nl}${payload}${nl}\`\`\`${nl}After.`;
      const { masked, lockfile } = maskDocument(source, 'qmd');
      const token = lockfile.entries[0].token;
      assert.throws(() => unmaskDocument(masked.replace(token, ''), lockfile), ShieldError);
      assert.throws(
        () => unmaskDocument(masked.replace(token, token + token), lockfile),
        ShieldError
      );
    }),
    options
  );
});

test('generated code changes cannot pass protected-literal checks', () => {
  fc.assert(
    fc.property(code, newline, (payload, nl) => {
      const original = `Text.${nl}\`\`\`text${nl}${payload}${nl}\`\`\`${nl}`;
      const changed = `Text.${nl}\`\`\`text${nl}${payload}CHANGED${nl}\`\`\`${nl}`;
      assert.equal(inspectRewrite(original, changed, { mode: 'light' }).passed, false);
    }),
    options
  );
});

test('bounded arbitrary syntax returns a typed refusal or reconstructs exactly', () => {
  const text = fc
    .array(codePoint, { maxLength: 256 })
    .map((points) => String.fromCodePoint(...points));
  fc.assert(
    fc.property(text, fc.constantFrom('md', 'qmd', 'rmd', 'tex', 'typ'), (source, kind) => {
      let protectedDocument;
      try {
        protectedDocument = maskDocument(source, kind);
      } catch (error) {
        assert.ok(error instanceof ShieldError);
        return;
      }
      assert.equal(
        unmaskDocument(protectedDocument.masked, protectedDocument.lockfile).text,
        source
      );
    }),
    options
  );
});

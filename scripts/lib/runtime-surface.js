/** Explicit editorial runtime closure. No maintainer tooling is shipped. */
export const EDITORIAL_RUNTIME = Object.freeze([
  'scripts/verify-rewrite.js',
  'scripts/calibrate-voice.js',
  'scripts/mask-ast.js',
  'scripts/unmask-ast.js',
  'scripts/lib/frontier-text.js',
  'scripts/lib/ast-shield.js',
  'scripts/lib/epistemic-discourse.js',
  'scripts/lib/local-file-io.js',
]);

export const OFFLINE_BUILTINS = Object.freeze([
  'node:fs',
  'node:path',
  'node:crypto',
  'node:url',
  'node:util',
]);

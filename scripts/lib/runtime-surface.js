// This closed allowlist is shared by packaging and security validation.
// Maintenance scripts and experimental provider runners are never installed.
export const RUNTIME_FILES = Object.freeze([
  'scripts/verify-rewrite.js',
  'scripts/calibrate-voice.js',
  'scripts/mask-ast.js',
  'scripts/unmask-ast.js',
  'scripts/lib/frontier-text.js',
  'scripts/lib/ast-shield.js',
  'scripts/lib/epistemic-discourse.js',
  'scripts/lib/runtime-io.js',
]);

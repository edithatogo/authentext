const assert = require('assert');
const { FIX_REGISTRY } = require('../lib/fix-registry');

/**
 * TDD: Verifying Risk Categorization
 */

console.log("Running Fix Registry risk tests...");

const safeFixes = FIX_REGISTRY.filter(f => f.risk === 'safe');
const unsafeFixes = FIX_REGISTRY.filter(f => f.risk === 'unsafe');

console.log(`- Found ${safeFixes.length} safe fixes`);
console.log(`- Found ${unsafeFixes.length} unsafe fixes`);

assert.ok(safeFixes.length > 0, "Should have at least one safe fix");
assert.ok(unsafeFixes.length > 0, "Should have at least one unsafe fix");

// Verify a specific one
const buzzwordFix = FIX_REGISTRY.find(f => f.id === 'buzzwords');
assert.strictEqual(buzzwordFix.risk, 'unsafe', "Buzzword fix should be flagged as unsafe");

console.log("Fix Registry risk tests passed!");

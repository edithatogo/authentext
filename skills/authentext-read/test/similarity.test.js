const assert = require('assert');
const { MeaningPreservation } = require('../lib/meaning-preservation');

/**
 * TDD: Verifying Meaning Preservation Baseline
 */

console.log("Running Meaning Preservation tests...");

const evaluator = new MeaningPreservation();

console.log("- Testing identical text");
const score1 = evaluator.calculateSimilarity("The quick brown fox", "The quick brown fox");
assert.strictEqual(score1, 1, "Identical text should have similarity 1");

console.log("- Testing slight variation");
const score2 = evaluator.calculateSimilarity("The quick brown fox", "Quick brown foxes run");
assert.ok(score2 >= 0.5 && score2 < 1, "Slight variation should have moderate-high similarity");

console.log("- Testing completely different text");
const score3 = evaluator.calculateSimilarity("The quick brown fox", "Information technology is evolving");
assert.ok(score3 < 0.2, "Different text should have low similarity");

console.log("Meaning Preservation tests passed!");

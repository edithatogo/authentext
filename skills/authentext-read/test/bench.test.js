const assert = require('assert');
const { BenchmarkLoader } = require('../lib/benchmark-loader');

/**
 * TDD: Verifying Benchmark Loading
 */

console.log("Running Benchmark Loader tests...");

const loader = new BenchmarkLoader();

console.log("- Testing TuringBench CSV parsing");
const mockCsv = "1, \"This text is AI slop\", AI\n2, \"Hello human friend\", Human";
const samples = loader.parseTuringBench(mockCsv);

assert.strictEqual(samples.length, 2, "Should parse 2 samples");
assert.strictEqual(samples[0].label, 'ai', "First sample should be AI");
assert.strictEqual(samples[1].text, "Hello human friend", "Should cleanup quotes");

console.log("- Testing Ghostbuster feature simulation");
const features = loader.loadGhostbusterFeatures("Some test text");
assert.ok(features.perplexity > 0, "Should generate perplexity score");

console.log("Benchmark Loader tests passed!");

const assert = require('assert');
const { SelfCritique } = require('../lib/critique');

/**
 * TDD: Verifying Self-Critique Loop
 */

console.log("Running Self-Critique tests...");

async function testCritique() {
    const critique = new SelfCritique();

    console.log("- Testing valid transformation");
    const original = "The data-driven approach is cross-functional.";
    const humanized = "Our team collaborates using insights from the data.";
    const result = await critique.verify(original, humanized);
    assert.strictEqual(result.valid, true, "Should be valid for reasonable changes");

    console.log("- Testing meaning loss (severe truncation)");
    const truncated = "Collaborates.";
    const lossResult = await critique.verify(original, truncated);
    assert.strictEqual(lossResult.valid, false, "Should flag severe truncation as invalid");
    assert.ok(lossResult.suggestions[0].includes("Meaning might be lost"), "Should suggest meaning loss");

    console.log("Self-Critique tests passed!");
}

testCritique().catch(err => {
    console.error("Test Failed:", err.message);
    process.exit(1);
});

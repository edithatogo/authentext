const assert = require('assert');

// Ported from Upstream Issue #22: Chain of Thought Reasoning detection
function detectReasoningFailures(text) {
    if (text.includes("Let's think step by step") || text.includes("Reasoning:")) {
        return true;
    }
    return false;
}

// Ported from Upstream PR #51: Severity Ranking implementation
function rankSeverity(issueList) {
    // Basic implementation for TDD
    return issueList.sort((a, b) => b.severity - a.severity);
}

console.log("Running humanizer-logic tests...");
assert.strictEqual(detectReasoningFailures("Here is the answer. Reasoning: Because..."), true);
assert.deepStrictEqual(rankSeverity([{id: 1, severity: 5}, {id: 2, severity: 10}]), [{id: 2, severity: 10}, {id: 1, severity: 5}]);
console.log("humanizer-logic tests passed!");

const assert = require('assert');

// Ported from Upstream PR #56: Hyphenated word pair overuse
function unhyphenateSlop(text) {
    const slopPairs = ['cross-functional', 'data-driven', 'client-facing'];
    let result = text;
    slopPairs.forEach(pair => {
        const regex = new RegExp(pair, 'gi');
        result = result.replace(regex, pair.replace('-', ' '));
    });
    return result;
}

// Ported from Upstream Issue #40: gemini-humanizer-v3 zero buzzwords (ex: "synergy")
function removeBuzzwords(text) {
    return text.replace(/synergy/gi, 'collaboration');
}

console.log("Running humanizer-next tone tests...");
assert.strictEqual(unhyphenateSlop("This is a data-driven approach."), "This is a data driven approach.");
assert.strictEqual(removeBuzzwords("We need more synergy."), "We need more collaboration.");
console.log("humanizer-next tone tests passed!");

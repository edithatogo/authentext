const assert = require('assert');
const { parseArgs } = require('../lib/cli-utils');

/**
 * TDD: Failing tests for Dual-Mode execution (--assess vs --fix)
 */

console.log("Running CLI flag parsing tests...");

try {
    console.log("- Testing default mode (should be assess)");
    const defaultArgs = parseArgs([]);
    assert.strictEqual(defaultArgs.mode, 'assess', "Default mode should be 'assess'");

    console.log("- Testing --fix flag");
    const fixArgs = parseArgs(['--fix']);
    assert.strictEqual(fixArgs.mode, 'fix', "--fix flag should set mode to 'fix'");

    console.log("- Testing --assess flag");
    const assessArgs = parseArgs(['--assess']);
    assert.strictEqual(assessArgs.mode, 'assess', "--assess flag should set mode to 'assess'");

    console.log("- Testing conflicting flags (last one wins)");
    const conflictArgs = parseArgs(['--assess', '--fix']);
    assert.strictEqual(conflictArgs.mode, 'fix', "Conflicting flags should resolve to the last one provided");

    console.log("- Testing default risk tolerance (should be safe)");
    const defaultRiskArgs = parseArgs([]);
    assert.strictEqual(defaultRiskArgs.riskTolerance, 'safe', "Default risk tolerance should be 'safe'");

    console.log("- Testing --safe_only flag");
    const safeOnlyArgs = parseArgs(['--safe_only']);
    assert.strictEqual(safeOnlyArgs.riskTolerance, 'safe', "--safe_only flag should set riskTolerance to 'safe'");

    console.log("- Testing --unsafe flag");
    const unsafeArgs = parseArgs(['--unsafe']);
    assert.strictEqual(unsafeArgs.riskTolerance, 'unsafe', "--unsafe flag should set riskTolerance to 'unsafe'");

    console.log("All CLI flag parsing tests passed!");
} catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
        console.error("Test Failed as expected: lib/cli-utils.js not found (TDD)");
    } else {
        console.error("Test Failed:", error.message);
    }
    process.exit(1);
}

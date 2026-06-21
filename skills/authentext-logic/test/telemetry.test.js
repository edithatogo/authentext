const assert = require('assert');
const fs = require('fs');
const { TelemetryLogger } = require('../lib/telemetry');

/**
 * TDD: Verifying Telemetry Logger
 */

console.log("Running Telemetry Logger tests...");

const testLog = '.humanizer-test-telemetry.json';

try {
    const logger = new TelemetryLogger(testLog);
    
    console.log("- Testing event logging");
    logger.log({
        type: 'revert',
        patternId: 'hyphenated-slop',
        original: 'cross functional',
        modified: 'cross-functional'
    });

    const logs = logger.getLogs();
    assert.strictEqual(logs.length, 1, "Should have 1 recorded event");
    assert.strictEqual(logs[0].type, 'revert', "Event type should be 'revert'");
    assert.ok(logs[0].timestamp, "Should have a timestamp");

    console.log("Telemetry Logger tests passed!");
} finally {
    if (fs.existsSync(testLog)) {
        fs.unlinkSync(testLog);
    }
}

/**
 * Humanizer Telemetry Logger
 * Records "Reverted" or manually tweaked fixes to improve future suggestions.
 */

const fs = require('fs');

class TelemetryLogger {
    constructor(logPath = '.humanizer-telemetry.json') {
        this.logPath = logPath;
        this._initialize();
    }

    _initialize() {
        if (!fs.existsSync(this.logPath)) {
            fs.writeFileSync(this.logPath, JSON.stringify([], null, 2));
        }
    }

    /**
     * Logs a telemetry event.
     *
     * @param {Object} event { type: 'revert'|'manual_tweak', patternId: string, original: string, modified: string }
     */
    log(event) {
        const logs = JSON.parse(fs.readFileSync(this.logPath, 'utf8'));
        logs.push({
            timestamp: new Date().toISOString(),
            ...event
        });
        fs.writeFileSync(this.logPath, JSON.stringify(logs, null, 2));
    }

    getLogs() {
        return JSON.parse(fs.readFileSync(this.logPath, 'utf8'));
    }
}

module.exports = {
    TelemetryLogger
};

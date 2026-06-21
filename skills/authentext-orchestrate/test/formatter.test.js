const assert = require('assert');
const { formatAssessment } = require('../lib/response-formatter');

/**
 * TDD: Verifying Response Formatting
 */

console.log("Running Response Formatter tests...");

const mockAssessment = {
    domain: 'next',
    score: 85,
    issues: [
        { severity: 'high', description: 'AI slop detected', suggestion: 'Replace with human prose' }
    ]
};

console.log("- Testing JSON output");
const jsonOutput = formatAssessment(mockAssessment, 'json');
const parsed = JSON.parse(jsonOutput);
assert.strictEqual(parsed.data.domain, 'next', "JSON output should preserve data");

console.log("- Testing XML output");
const xmlOutput = formatAssessment(mockAssessment, 'xml');
assert.ok(xmlOutput.includes('<assessment>'), "XML output should have assessment tag");
assert.ok(xmlOutput.includes('<domain>next</domain>'), "XML output should preserve domain");

console.log("Response Formatter tests passed!");

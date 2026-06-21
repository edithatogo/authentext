const assert = require('assert');
const { isolateProse } = require('../lib/prose-isolator');

/**
 * TDD: Verifying Prose Isolation (AST-lite)
 */

console.log("Running Prose Isolator tests...");

const sampleText = `
Here is a 'single quoted' phrase and a URL: http://example.com.
Also, look at this code:
\`\`\`javascript
const x = 'do not change me';
\`\`\`
And inline \`code here\`.
`;

const { prose, restore } = isolateProse(sampleText);

console.log("- Checking isolation");
assert.ok(prose.includes('__CODE_BLOCK_'), "Fenced code should be replaced");
assert.ok(prose.includes('__URL_'), "URL should be replaced");
assert.match(prose, /__URL_\d+__/, "Original URL should be replaced with a placeholder");

// Simulate a humanization fix that changes single quotes to double quotes
const humanizedProse = prose.replace(/'([^']+)'/g, '"$1"');

console.log("- Checking restoration");
const finalOutput = restore(humanizedProse);

assert.ok(finalOutput.includes('"single quoted"'), "Prose should be humanized");
assert.ok(finalOutput.includes("const x = 'do not change me'"), "Protected code block should remain untouched");
assert.match(finalOutput, /URL: http:\/\/example\.com\./, "Protected URL should be restored");

console.log("Prose Isolator tests passed!");

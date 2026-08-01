const assert = require('assert');
const { isolateProse } = require('../lib/prose-isolator');

/**
 * TDD: Verifying Prose Isolation (AST-lite)
 */

console.log('Running Prose Isolator tests...');

const sampleText = `
Here is a 'single quoted' phrase and a URL: http://example.com.
Also, look at this code:
\`\`\`javascript
const x = 'do not change me';
\`\`\`
And inline \`code here\`.
`;

const { prose, restore } = isolateProse(sampleText);

console.log('- Checking isolation');
assert.ok(!prose.includes("const x = 'do not change me'"), 'Fenced code should be isolated');
assert.ok(!prose.includes('http://example.com'), 'Original URL should be isolated');
assert.notStrictEqual(prose, sampleText, 'Protected literals should be replaced with placeholders');

// Simulate a humanization fix that changes single quotes to double quotes
const humanizedProse = prose.replace(/'([^']+)'/g, '"$1"');

console.log('- Checking restoration');
const finalOutput = restore(humanizedProse);

assert.ok(finalOutput.includes('"single quoted"'), 'Prose should be humanized');
assert.ok(
  finalOutput.includes("const x = 'do not change me'"),
  'Protected code block should remain untouched'
);
assert.match(finalOutput, /URL: http:\/\/example\.com\./, 'Protected URL should be restored');

console.log('Prose Isolator tests passed!');

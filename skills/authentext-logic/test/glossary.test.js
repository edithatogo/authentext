const assert = require('assert');
const fs = require('fs');
const { GlossaryLoader } = require('../lib/glossary');

/**
 * TDD: Verifying Glossary Loader
 */

console.log("Running Glossary Loader tests...");

const ignoreFile = '.humanizer-test-ignore';
fs.writeFileSync(ignoreFile, "Antigravity\nDeepmind\n# This is a comment\n");

try {
    const loader = new GlossaryLoader(ignoreFile);
    const terms = loader.load();
    
    console.log("- Testing term loading");
    assert.strictEqual(terms.length, 2, "Should load 2 terms (ignoring comments)");
    assert.ok(terms.includes('Antigravity'), "Should load 'Antigravity'");

    console.log("- Testing protection");
    const sample = "Antigravity is a product from Deepmind.";
    const protectedText = loader.protect(sample);
    assert.ok(protectedText.includes('__GLOSSARY_Antigravity__'), "Brand term should be protected");

    console.log("- Testing restoration");
    const restored = loader.restore(protectedText);
    assert.strictEqual(restored, sample, "Restoration should return original string");

    console.log("Glossary Loader tests passed!");
} finally {
    if (fs.existsSync(ignoreFile)) {
        fs.unlinkSync(ignoreFile);
    }
}

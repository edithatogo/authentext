const assert = require('assert');

/**
 * TDD: Failing tests for MCP Server Initialization
  */

console.log("Running MCP Server tests...");

try {
    const { AuthentextMCPServer } = require('../lib/mcp-server');

    const server = new AuthentextMCPServer({
        name: "authentext-server",
        version: "4.0.0"
    });

    console.log("- Testing server initialization");
    assert.strictEqual(server.name, "authentext-server", "Server should have the correct name");
    
    console.log("- Testing tool registration (should have 4 tools)");
    const tools = server.getRegisteredTools();
    const expectedTools = [
        'authentext-next',
        'authentext-logic',
        'authentext-read',
        'authentext-orchestrate'
    ];
    
    expectedTools.forEach(toolName => {
        assert.ok(tools.find(t => t.name === toolName), `Tool ${toolName} should be registered`);
    });

    console.log("MCP Server tests passed!");
} catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
        console.error("Test Failed as expected: lib/mcp-server.js not found (TDD)");
    } else {
        console.error("Test Failed:", error.message);
    }
    process.exit(1);
}

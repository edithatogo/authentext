const assert = require('assert');
const { AuthentextMCPServer } = require('../lib/mcp-server');
const { AuthentextSwarmer } = require('../lib/swarmer');

/**

* TDD: Verifying Swarming Logic
 */

console.log("Running Swarmer tests...");

async function testSwarm() {
    const server = new AuthentextMCPServer();
    const swarmer = new AuthentextSwarmer(server);

    const toolsToCall = ['authentext-next', 'authentext-logic'];
    const results = await swarmer.swarm({
        tools: toolsToCall,
        args: { text: "Some input text" }
    });

    console.log(`- Received ${results.length} results`);
    assert.strictEqual(results.length, 2, "Should return 2 results");
    
    results.forEach(res => {
        assert.strictEqual(res.status, 'success', `Tool ${res.tool} should succeed`);
    });

    console.log("Swarmer tests passed!");
}

testSwarm().catch(err => {
    console.error("Test Failed:", err.message);
    process.exit(1);
});

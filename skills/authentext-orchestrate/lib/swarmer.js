/**
 * Authentext Swarmer
 * Orchestrates parallel execution of authentext skills.
  */

class AuthentextSwarmer {
    constructor(server) {
        this.server = server;
    }

    /**
     * Executes multiple tools in parallel.
     * 
     * @param {Object} options 
     * @param {string[]} options.tools - List of tool names to invoke
     * @param {Object} options.args - Common arguments for all tools
     * @returns {Promise<Object[]>} Aggregated results
     */
    async swarm(options) {
        const { tools, args } = options;
        
        console.log(`[Swarmer] Dispatching ${tools.length} sub-agents...`);

        const promises = tools.map(toolName => {
            return this.server.handleRequest({
                method: "callTool",
                params: {
                    name: toolName,
                    arguments: args
                }
            }).then(result => ({
                tool: toolName,
                status: 'success',
                result: result
            })).catch(err => ({
                tool: toolName,
                status: 'error',
                error: err.message
            }));
        });

        const results = await Promise.all(promises);
        console.log(`[Swarmer] All sub-agents returned.`);
        
        return results;
    }
}

module.exports = {
    AuthentextSwarmer
};

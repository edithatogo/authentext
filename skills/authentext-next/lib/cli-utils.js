/**
 * Humanizer CLI Utilities
 */

/**
 * Parses CLI arguments to determine operating mode and flags.
 * Defaults to 'assess' mode.
 * 
 * @param {string[]} args - Process.argv slice
 * @returns {Object} Parsed configuration
 */
function parseArgs(args) {
    const config = {
        mode: 'assess', // Default
        riskTolerance: 'safe' // To be used later
    };

    args.forEach(arg => {
        if (arg === '--fix') {
            config.mode = 'fix';
        } else if (arg === '--assess') {
            config.mode = 'assess';
        } else if (arg === '--safe_only') {
            config.riskTolerance = 'safe';
        } else if (arg === '--unsafe') {
            config.riskTolerance = 'unsafe';
        }
    });

    return config;
}

module.exports = {
    parseArgs
};

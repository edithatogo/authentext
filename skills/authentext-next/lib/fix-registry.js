/**
 * Humanizer Fix Registry
 * Defines standard fixes with risk categorization.
 */

const FIX_REGISTRY = [
    {
        id: 'single-quotes',
        domain: 'cite',
        risk: 'safe',
        description: 'Standardize single quotes to double quotes in prose',
        apply: (text) => text.replace(/'([^']+)'/g, '"$1"')
    },
    {
        id: 'curly-quotes',
        domain: 'cite',
        risk: 'safe',
        description: 'Normalize curly quotes to straight quotes',
        apply: (text) => text.replace(/[“”]/g, '"').replace(/[‘’]/g, "'")
    },
    {
        id: 'hyphenated-slop',
        domain: 'next',
        risk: 'safe',
        description: 'Remove uniform hyphenation of common AI compounds',
        apply: (text) => {
            const slopPairs = ['cross-functional', 'data-driven', 'client-facing'];
            let result = text;
            slopPairs.forEach(pair => {
                const regex = new RegExp(pair, 'gi');
                result = result.replace(regex, pair.replace('-', ' '));
            });
            return result;
        }
    },
    {
        id: 'buzzwords',
        domain: 'next',
        risk: 'unsafe', // Categorized as unsafe because it changes meaning significantly (e.g., synergy -> collaboration)
        description: 'Replace corporate buzzwords with human-like prose',
        apply: (text) => text.replace(/synergy/gi, 'collaboration')
    }
];

module.exports = {
    FIX_REGISTRY
};

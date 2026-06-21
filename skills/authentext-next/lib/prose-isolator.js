/**
 * Prose Isolator
 * Protects technical literals (Code blocks, URLs, JSON) during humanization.
 */

function isolateProse(text) {
    const placeholders = [];
    let processingText = text;

    // 1. Protect Fenced Code Blocks
    processingText = processingText.replace(/```[\s\S]*?```/g, (match) => {
        const id = `__CODE_BLOCK_${placeholders.length}__`;
        placeholders.push({ id, original: match });
        return id;
    });

    // 2. Protect Inline Code
    processingText = processingText.replace(/`[^`]+`/g, (match) => {
        const id = `__INLINE_CODE_${placeholders.length}__`;
        placeholders.push({ id, original: match });
        return id;
    });

    // 3. Protect URLs
    processingText = processingText.replace(/https?:\/\/[^\s)]+/g, (match) => {
        const id = `__URL_${placeholders.length}__`;
        placeholders.push({ id, original: match });
        return id;
    });

    // 4. Protect JSON-like structures (simple)
    processingText = processingText.replace(/\{[\s\S]*?\}/g, (match) => {
        // Only protect if it looks like actual JSON (contains quotes and colons)
        if (match.includes('"') && match.includes(':')) {
            const id = `__JSON_${placeholders.length}__`;
            placeholders.push({ id, original: match });
            return id;
        }
        return match;
    });

    return {
        prose: processingText,
        restore: (fixedText) => {
            let restored = fixedText;
            // Restore in reverse order to handle potential nesting if any id appeared in original
            for (let i = placeholders.length - 1; i >= 0; i--) {
                restored = restored.replace(placeholders[i].id, placeholders[i].original);
            }
            return restored;
        }
    };
}

module.exports = {
    isolateProse
};

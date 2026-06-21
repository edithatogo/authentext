/**
 * Humanizer Glossary / RAG Context Loader
 * Protects specific brand terminology or project-specific jargon.
 */

const fs = require('fs');

class GlossaryLoader {
    constructor(ignoreFilePath = '.humanizer-ignore') {
        this.ignoreFilePath = ignoreFilePath;
        this.terms = [];
    }

    /**
     * Loads terms from the ignore file.
     */
    load() {
        if (fs.existsSync(this.ignoreFilePath)) {
            const content = fs.readFileSync(this.ignoreFilePath, 'utf8');
            this.terms = content.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0 && !line.startsWith('#'));
        }
        return this.terms;
    }

    /**
     * Protects glossary terms in the text by wrapping them or returning a regex.
     *
     * @param {string} text
     * @returns {string} Text with protected terms
     */
    protect(text) {
        let protectedText = text;
        this.terms.forEach(term => {
            // Case-insensitive protection
            const regex = new RegExp(`\\b${term}\\b`, 'gi');
            protectedText = protectedText.replace(regex, (match) => `__GLOSSARY_${match}__`);
        });
        return protectedText;
    }

    restore(text) {
        return text.replace(/__GLOSSARY_(.*?)__/g, '$1');
    }
}

module.exports = {
    GlossaryLoader
};

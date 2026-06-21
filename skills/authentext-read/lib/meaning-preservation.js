/**
 * Meaning Preservation Evaluator
 * Mathematically evaluates semantic similarity between original and humanized text.
 */

class MeaningPreservation {
    /**
     * Calculates a simple Cosine Similarity based on word frequencies.
     * 
     * @param {string} str1 
     * @param {string} str2 
     * @returns {number} Score between 0 and 1
     */
    calculateSimilarity(str1, str2) {
        const words1 = str1.toLowerCase().match(/\w+/g) || [];
        const words2 = str2.toLowerCase().match(/\w+/g) || [];

        const freqMap1 = this._getFreqMap(words1);
        const freqMap2 = this._getFreqMap(words2);

        const allWords = new Set([...Object.keys(freqMap1), ...Object.keys(freqMap2)]);
        
        let dotProduct = 0;
        let mag1 = 0;
        let mag2 = 0;

        allWords.forEach(word => {
            const v1 = freqMap1[word] || 0;
            const v2 = freqMap2[word] || 0;
            dotProduct += v1 * v2;
            mag1 += v1 * v1;
            mag2 += v2 * v2;
        });

        const magnitude = Math.sqrt(mag1) * Math.sqrt(mag2);
        if (magnitude === 0) return 0;
        
        return dotProduct / magnitude;
    }

    _getFreqMap(words) {
        return words.reduce((acc, word) => {
            acc[word] = (acc[word] || 0) + 1;
            return acc;
        }, {});
    }
}

module.exports = {
    MeaningPreservation
};

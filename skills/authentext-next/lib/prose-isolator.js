/**
 * Prose Isolator
 * Protects technical literals during humanization.
 */

const PROTECTED_PATTERNS = [
  { label: 'CODE_BLOCK', pattern: /```[\s\S]*?```/g },
  { label: 'INLINE_CODE', pattern: /`[^`\n]+`/g },
  { label: 'URL', pattern: /https?:\/\/[^\s)>\]}]+/g },
  {
    label: 'JSON',
    pattern: /\{[\s\S]*?\}/g,
    accept: (match) => match.includes('"') && match.includes(':'),
  },
  {
    label: 'QUOTED_ERROR',
    pattern: /(["'])(?=[^"'\n]*(?:error|exception|failed|denied|fatal|enoent))[^"'\n]+\1/gi,
  },
  { label: 'WINDOWS_PATH', pattern: /\b[A-Za-z]:\\[^\s"'<>|]+/g },
  { label: 'POSIX_PATH', pattern: /\/(?:[A-Za-z0-9._-]+\/)+[A-Za-z0-9._-]+/g },
  {
    label: 'CITATION',
    pattern: /\[@[^\]\n]+\]|\[\d+(?:[-–]\d+)?\]|\([A-Z][^()\n]{0,80},\s*(?:19|20)\d{2}[a-z]?\)/g,
  },
  { label: 'HASH', pattern: /\b[a-f0-9]{7,64}\b/gi },
  {
    label: 'COMMAND',
    pattern: /\b(?:npm|npx|pnpm|yarn|node|python|uv|git|gh|gemini|authentext)\s+[^\n,.;]+/g,
  },
  { label: 'FLAG', pattern: /--?[A-Za-z][\w-]*(?:=[^\s,.;]+)?/g },
  {
    label: 'FUNCTION_IDENTIFIER',
    pattern: /\b[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*\(\)/g,
  },
  { label: 'CONSTANT_IDENTIFIER', pattern: /\b[A-Z][A-Z0-9_]{2,}\b/g },
  {
    label: 'COMPOUND_IDENTIFIER',
    pattern: /\b(?:[a-z]+(?:[A-Z][A-Za-z0-9]*)+|[A-Za-z][A-Za-z0-9]*_[A-Za-z0-9_]+)\b/g,
  },
];

/**
 * @param {string} text
 * @returns {{ prose: string, restore: (fixedText: string) => string }}
 */
function isolateProse(text) {
  const placeholders = [];
  let processingText = text;

  for (const { label, pattern, accept = () => true } of PROTECTED_PATTERNS) {
    processingText = processingText.replace(pattern, (match) => {
      if (!accept(match)) {
        return match;
      }

      const id = `\uE000${placeholders.length}\uE001`;
      placeholders.push({ id, label, original: match });
      return id;
    });
  }

  return {
    prose: processingText,
    restore: (fixedText) => {
      let restored = fixedText;

      for (let index = placeholders.length - 1; index >= 0; index -= 1) {
        const placeholder = placeholders[index];
        const occurrences = restored.split(placeholder.id).length - 1;
        if (occurrences !== 1) {
          throw new Error(
            `${placeholder.label} placeholder integrity failure: expected 1 occurrence, found ${occurrences}`
          );
        }
        restored = restored.replace(placeholder.id, placeholder.original);
      }

      return restored;
    },
  };
}

module.exports = {
  isolateProse,
};

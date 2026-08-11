/**
 * Self-compliance checks for compiled skill prose.
 * This is a leftover-artifact scan, not an authorship detector.
 */

const EM_DASH = '\u2014';
const EN_DASH = '\u2013';

const CHATBOT_PATTERNS = [
  { id: 'hope-this-helps', pattern: /i hope this helps/i },
  { id: 'great-question', pattern: /great question!/i },
  { id: 'as-an-ai', pattern: /\bas an ai\b/i },
  { id: 'absolutely-right', pattern: /you'?re absolutely right/i },
  { id: 'let-me-know-expand', pattern: /let me know if you(?:'d| would) like/i },
  { id: 'happy-to-help', pattern: /happy to help!/i },
];

/**
 * Replace ignored regions with spaces so later line/column math stays stable.
 * @param {string} text
 * @returns {string}
 */
export function maskIgnoredRegions(text) {
  let masked = text.replace(/```[\s\S]*?```/g, (block) => ' '.repeat(block.length));
  masked = masked.replace(/^>.*$/gm, (line) => ' '.repeat(line.length));
  masked = masked.replace(/`[^`\n]+`/g, (span) => ' '.repeat(span.length));
  return masked;
}

/**
 * @param {string} line
 * @param {number} index
 * @returns {boolean}
 */
export function isAllowedDashContext(line, index) {
  const window = line.slice(Math.max(0, index - 24), index + 8);
  if (/\d[—–]\d/.test(line.slice(Math.max(0, index - 1), index + 2))) {
    return true;
  }
  if (/\]\([^)]*\)\s+[—–]/.test(window) || /\*\*[^*]+\*\*\s+[—–]/.test(window)) {
    return true;
  }
  if (/\([—–]\)/.test(line.slice(Math.max(0, index - 1), index + 2))) {
    return true;
  }
  return false;
}

/**
 * @param {string} text
 * @param {string} [source]
 */
export function analyzeSkillProse(text, source = 'SKILL.md') {
  const masked = maskIgnoredRegions(text);
  const lines = masked.split('\n');
  const originalLines = text.split('\n');
  /** @type {Array<{source: string, line: number, kind: string, excerpt: string}>} */
  const findings = [];

  lines.forEach((line, offset) => {
    const lineNumber = offset + 1;
    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];
      if (char !== EM_DASH && char !== EN_DASH) continue;
      if (isAllowedDashContext(line, index)) continue;
      findings.push({
        source,
        line: lineNumber,
        kind: char === EM_DASH ? 'em-dash' : 'en-dash',
        excerpt: originalLines[offset].trim(),
      });
    }

    for (const { id, pattern } of CHATBOT_PATTERNS) {
      if (pattern.test(line)) {
        findings.push({
          source,
          line: lineNumber,
          kind: `chatbot:${id}`,
          excerpt: originalLines[offset].trim(),
        });
      }
    }
  });

  return {
    source,
    findings,
    emDashes: findings.filter((item) => item.kind === 'em-dash' || item.kind === 'en-dash'),
    chatbot: findings.filter((item) => item.kind.startsWith('chatbot:')),
  };
}

/**
 * @param {Array<{kind: string, excerpt: string}>} findings
 * @param {string[]} allowlist
 */
export function unexpectedFindings(findings, allowlist = []) {
  return findings.filter(
    (item) =>
      !allowlist.some((entry) => item.kind === entry.kind && item.excerpt.includes(entry.excerpt))
  );
}

import { createHash } from 'node:crypto';

const PROTECTED_PATTERNS = {
  citation: /\([^()\n]*\b(?:19|20)\d{2}[a-z]?[^()\n]*\)|\[[0-9,;\-\s]+\]/g,
  url: /https?:\/\/[^\s)>\]]+/g,
  number: /(?<![\p{L}\p{N}_])[-+]?\d+(?:[.,]\d+)*(?:\s?(?:%|[A-Za-z]{1,8}))?/gu,
  qualifier:
    /\b(?:may|might|could|suggests?|estimated|approximately|reported|alleged|subject to|not established|uncertain)\b/gi,
  legal_boundary:
    /\b(?:confidential|privileged|under embargo|without consent|not for publication|subject to [^.;\n]+)\b/gi,
};

function hash(value) {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

function collectProtectedItems(text) {
  return Object.fromEntries(
    Object.entries(PROTECTED_PATTERNS).map(([type, pattern]) => [
      type,
      [...text.matchAll(pattern)].map(([value]) => value),
    ])
  );
}

/** Compare protected manuscript items and create a privacy-conscious receipt. */
export function createFoioEditorialReceipt({
  input,
  output,
  prompt,
  authentextVersion,
  tool,
  unresolvedFindings = [],
}) {
  const before = collectProtectedItems(input);
  const after = collectProtectedItems(output);
  const differences = Object.keys(before)
    .filter((type) => JSON.stringify(before[type]) !== JSON.stringify(after[type]))
    .map((type) => ({
      type,
      before_count: before[type].length,
      after_count: after[type].length,
      before_sha256: hash(JSON.stringify(before[type])),
      after_sha256: hash(JSON.stringify(after[type])),
    }));

  return {
    schema_version: 1,
    workflow: 'foio-final-editorial',
    input_sha256: hash(input),
    output_sha256: hash(output),
    authentext_version: authentextVersion,
    tool,
    prompt_sha256: hash(prompt),
    protected_items: { passed: differences.length === 0, differences },
    unresolved_findings: unresolvedFindings,
    human_gate: {
      editorial_acceptance: 'pending',
      publication_approval: 'pending',
    },
  };
}

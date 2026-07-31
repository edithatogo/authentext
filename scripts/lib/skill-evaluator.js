const MATERIAL_RULES = [
  ['technical', /\b(?:readme|api|code|function|technical|documentation|docstring|unit tests?)\b/i],
  ['academic', /\b(?:manuscript|paper|citation|scholarly|research|thesis)\b/i],
  ['governance', /\b(?:compliance|policy|governance|legal|regulatory|risk)\b/i],
];

const REVIEW_INTENT = /\b(?:review|flag|identify|assess|suggest)\b/i;
const REWRITE_INTENT = /\b(?:rewrite|rephrase|revise|make)\b/i;
const STYLE_INTENT =
  /\b(?:ai[- ]writing|robotic prose|formulaic|canned|inflated wording|natural|human[- ]written)\b/i;

/**
 * Deterministically model the documented Authentext discovery and routing contract.
 * This is a repository evaluation oracle, not a claim about any host model.
 * @param {string} prompt
 * @returns {{activate: boolean, operation: 'rewrite'|'review'|'none', material: string}}
 */
export function classifySkillRequest(prompt) {
  const operation = REVIEW_INTENT.test(prompt)
    ? 'review'
    : REWRITE_INTENT.test(prompt)
      ? 'rewrite'
      : 'none';
  const material = MATERIAL_RULES.find(([, pattern]) => pattern.test(prompt))?.[0] ?? 'general';

  return {
    activate: operation !== 'none' && STYLE_INTENT.test(prompt),
    operation,
    material,
  };
}

/**
 * Evaluate a versioned trigger corpus and return a serializable receipt.
 * @param {Array<{id: string, category: string, prompt: string, expected: object}>} cases
 */
export function evaluateTriggerCases(cases) {
  const results = cases.map((evaluation) => {
    const actual = classifySkillRequest(evaluation.prompt);
    return {
      id: evaluation.id,
      category: evaluation.category,
      passed: JSON.stringify(actual) === JSON.stringify(evaluation.expected),
      expected: evaluation.expected,
      actual,
    };
  });

  return {
    schema_version: 1,
    suite: 'authentext-trigger-evaluations',
    total: results.length,
    passed: results.filter(({ passed }) => passed).length,
    failed: results.filter(({ passed }) => !passed).length,
    results,
  };
}

/**
 * Check concrete editorial outputs against explicit, auditable constraints.
 * @param {Array<{id: string, category: string, input: string, output: string, constraints: object}>} cases
 */
export function evaluateOutputCases(cases) {
  const results = cases.map((evaluation) => {
    const failures = [];
    const { constraints = {}, input, output } = evaluation;

    if (constraints.unchanged && output !== input) {
      failures.push('output changed despite unchanged constraint');
    }
    for (const phrase of constraints.require ?? []) {
      if (!output.includes(phrase)) failures.push(`missing required phrase: ${phrase}`);
    }
    for (const phrase of constraints.forbid ?? []) {
      if (output.toLowerCase().includes(phrase.toLowerCase())) {
        failures.push(`retained forbidden phrase: ${phrase}`);
      }
    }
    for (const literal of constraints.exact_literals ?? []) {
      if (!input.includes(literal) || !output.includes(literal)) {
        failures.push(`literal not preserved byte-for-byte: ${literal}`);
      }
    }

    return {
      id: evaluation.id,
      category: evaluation.category,
      passed: failures.length === 0,
      failures,
    };
  });

  return {
    schema_version: 1,
    suite: 'authentext-output-evaluations',
    total: results.length,
    passed: results.filter(({ passed }) => passed).length,
    failed: results.filter(({ passed }) => !passed).length,
    results,
  };
}

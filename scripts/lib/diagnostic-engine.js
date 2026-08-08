const DIMENSION_ORDER = Object.freeze([
  'completeness',
  'structure',
  'evidence',
  'accessibility',
  'tone',
  'safety',
  'ai-patterns',
  'preservation',
]);

const OPERATIONS = Object.freeze({
  review: { output: 'findings-only', rewrite_allowed: false },
  rewrite: { output: 'revised-text', rewrite_allowed: true },
  structural: { output: 'structure-plan', rewrite_allowed: false },
  'final-pass': { output: 'revised-text-with-audit', rewrite_allowed: true },
  'research-assisted': { output: 'revised-text-with-sources', rewrite_allowed: true },
});

const CHANGE_BUDGETS = Object.freeze({
  conservative: { max_change_ratio: 0.15, restructure: false, immutable_content: true },
  standard: { max_change_ratio: 0.35, restructure: false, immutable_content: true },
  strong: { max_change_ratio: 0.6, restructure: true, immutable_content: true },
});

const SAFETY_DIMENSIONS = new Set(['safety', 'preservation']);

function wordCount(text) {
  return typeof text === 'string' ? (text.match(/[\p{L}\p{N}]+/gu) ?? []).length : 0;
}

/** Build ordered, applicability-aware findings from precomputed signals. */
export function buildDiagnostic({ profile, text = '', applicable_dimensions = [], signals = [] }) {
  if (!profile || typeof profile !== 'object') throw new TypeError('profile is required');
  const applicable = new Set(applicable_dimensions);
  const findings = [];
  const suppressed = [];
  const nonApplicable = [];
  for (const [index, signal] of signals.entries()) {
    if (!applicable.has(signal.dimension) && !SAFETY_DIMENSIONS.has(signal.dimension)) {
      nonApplicable.push({ ...signal, reason: 'dimension-not-applicable' });
      continue;
    }
    const requiresCluster =
      !['structure', 'completeness'].includes(signal.dimension) &&
      !SAFETY_DIMENSIONS.has(signal.dimension);
    if (requiresCluster && signal.occurrences < 2) {
      suppressed.push({ ...signal, reason: 'insufficient-cluster-evidence' });
      continue;
    }
    findings.push({
      id: `finding-${index + 1}`,
      ...signal,
      severity: SAFETY_DIMENSIONS.has(signal.dimension) ? 'high' : 'medium',
      confidence: signal.occurrences >= 2 ? 0.9 : 0.75,
      safe_to_fix: !SAFETY_DIMENSIONS.has(signal.dimension),
    });
  }
  findings.sort((left, right) => {
    const leftOrder = DIMENSION_ORDER.indexOf(left.dimension);
    const rightOrder = DIMENSION_ORDER.indexOf(right.dimension);
    return leftOrder - rightOrder || left.id.localeCompare(right.id);
  });
  return {
    dimensions: DIMENSION_ORDER.filter((dimension) => applicable.has(dimension)),
    findings,
    suppressed,
    non_applicable: nonApplicable,
    limitations: wordCount(text) < 40 ? ['short sample limits confidence and density checks'] : [],
  };
}

/** Resolve a distinct output contract for each supported operation. */
export function runEditingOperation(operation, { research_allowed = false } = {}) {
  const contract = OPERATIONS[operation];
  if (!contract) throw new TypeError(`Unsupported operation: ${operation}`);
  if (operation === 'research-assisted' && !research_allowed) {
    throw new TypeError('research permission is required');
  }
  return {
    operation,
    ...contract,
    research_used: operation === 'research-assisted',
  };
}

export function getChangeBudget(strength) {
  const budget = CHANGE_BUDGETS[strength];
  if (!budget) throw new TypeError(`Unsupported editing strength: ${strength}`);
  return { ...budget };
}

function missingValues(before, after, pattern) {
  const expected = [...new Set(before.match(pattern) ?? [])];
  return expected.filter((value) => !after.includes(value));
}

/** Validate immutable content and governed structural requirements. */
export function validateProtectedItems({
  before = '',
  after = '',
  required_sections = [],
  sourced_rules = [],
  stakes = 'low',
}) {
  const violations = [];
  const missingLiterals = missingValues(before, after, /`[^`]+`|\[\d+\]/gu);
  if (missingLiterals.length > 0) violations.push({ type: 'literal', values: missingLiterals });
  const missingNumbers = missingValues(before, after, /\b\d+(?:\.\d+)?(?:\s*%|\s*[A-Za-z]+)?\b/gu);
  if (missingNumbers.length > 0) violations.push({ type: 'number', values: missingNumbers });
  const missingSections = required_sections.filter(
    (section) =>
      !new RegExp(`^#{1,6}\\s+${section.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}\\s*$`, 'imu').test(
        after
      )
  );
  if (missingSections.length > 0) {
    violations.push({ type: 'required-section', values: missingSections });
  }
  const missingRules = sourced_rules.filter((rule) => !after.includes(rule));
  if (missingRules.length > 0) violations.push({ type: 'sourced-rule', values: missingRules });
  return {
    passed: violations.length === 0,
    fail_closed: ['high', 'critical'].includes(stakes) && violations.length > 0,
    violations,
  };
}

function typographyPreserved(original, candidate, language) {
  if (!language) return true;
  const typography = original.match(/[«»“”„‟ —–]/gu) ?? [];
  return typography.every((mark) => candidate.includes(mark));
}

/** Perform at most one invariant-driven revision. */
export function runBoundedAudit({ original, candidate, revise, language }) {
  let output = candidate;
  let revisionCount = 0;
  let passed = typographyPreserved(original, output, language);
  if (!passed && typeof revise === 'function') {
    output = revise({ original, candidate, reason: 'typography-drift' });
    revisionCount = 1;
    passed = typographyPreserved(original, output, language);
  }
  return { passed, revision_count: revisionCount, output };
}

/** Create the optional concise diagnostic receipt. */
export function createDiagnosticReceipt({
  profile_sha256,
  source_ids = [],
  findings = [],
  assumptions = [],
  conflicts = [],
  unresolved = [],
  audit,
}) {
  if (!/^[a-f0-9]{64}$/u.test(profile_sha256)) {
    throw new TypeError('profile_sha256 must be a SHA-256 digest');
  }
  return {
    schema_version: 1,
    profile_sha256,
    source_ids: [...new Set(source_ids)].sort(),
    findings,
    assumptions: assumptions.slice(0, 2),
    conflicts,
    unresolved,
    protected_items: { preserved: audit?.passed === true },
    audit,
  };
}

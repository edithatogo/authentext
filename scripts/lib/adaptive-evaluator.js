const TECHNICAL_ROUTES = new Map([
  ['how-to', 'task'],
  ['tutorial', 'task'],
  ['concept', 'concept'],
  ['reference', 'reference'],
  ['api-docs', 'reference'],
  ['troubleshooting', 'troubleshooting'],
]);

const HEALTH_GUIDANCE = new Map([
  ['randomised-trial', 'CONSORT'],
  ['observational-study', 'STROBE'],
  ['systematic-review', 'PRISMA'],
  ['study-protocol', 'SPIRIT'],
  ['case-report', 'CARE'],
]);

const ADVERSARIAL_KINDS = new Set([
  'prompt-injection',
  'private-content',
  'source-conflict',
  'stale-guidance',
]);

const REJECTED_TRANSFORMATIONS = new Set([
  'detector-evasion',
  'authorship-inference',
  'invented-specificity',
  'artificial-disfluency',
  'universal-punctuation-ban',
]);

function round(value) {
  return Number(value.toFixed(3));
}

function ratio(numerator, denominator) {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) {
    return 0;
  }
  return round(Math.min(1, Math.max(0, numerator / denominator)));
}

/** Route a technical-document subtype to its editing mode. */
export function routeTechnicalSubtype(subtype) {
  const route = TECHNICAL_ROUTES.get(subtype);
  if (!route) throw new TypeError(`Unsupported technical subtype: ${subtype}`);
  return route;
}

/** Select minimum-reporting guidance without making a compliance claim. */
export function routeHealthStudyType(studyType) {
  const guidanceFamily = HEALTH_GUIDANCE.get(studyType);
  if (!guidanceFamily) throw new TypeError(`Unsupported health study type: ${studyType}`);
  return {
    guidance_family: guidanceFamily,
    check_mode: 'minimum-reporting',
    compliance_claim: false,
    human_review_required: true,
  };
}

/** Fail closed for hostile inputs and prohibited transformation requests. */
export function evaluateAdversarialCase({ kind } = {}) {
  if (ADVERSARIAL_KINDS.has(kind)) {
    return { allowed: false, requires_review: true, reason: `Safety gate: ${kind}` };
  }
  if (REJECTED_TRANSFORMATIONS.has(kind)) {
    return { allowed: false, requires_review: false, reason: `Unsupported request: ${kind}` };
  }
  throw new TypeError(`Unknown evaluation case: ${kind}`);
}

/** Calculate independent quality measures rather than a misleading composite. */
export function measureQuality(input) {
  const changeDensity = ratio(input.proposed_changes, input.total_units);
  return {
    restraint: round(1 - changeDensity),
    false_positive_rate: ratio(input.false_positives, input.findings),
    preservation: ratio(input.protected_preserved, input.protected_total),
    requirement_coverage: ratio(input.requirements_covered, input.requirements_total),
    change_density: changeDensity,
    classification_calibration: ratio(input.calibrated, input.classified),
  };
}

/** Compare deterministic host routes and allow only bounded output variance. */
export function compareHostEvaluations(evaluations, tolerance = 0.15) {
  if (!Array.isArray(evaluations) || evaluations.length < 2) {
    throw new TypeError('At least two host evaluations are required');
  }
  const routes = new Set(evaluations.map(({ route }) => route));
  const similarities = evaluations.map(({ similarity }) => {
    if (!Number.isFinite(similarity) || similarity < 0 || similarity > 1) {
      throw new RangeError('Host similarity must be between 0 and 1');
    }
    return similarity;
  });
  const maxVariance = round(Math.max(...similarities) - Math.min(...similarities));
  return {
    passed: routes.size === 1 && maxVariance <= tolerance,
    route_consistent: routes.size === 1,
    max_variance: maxVariance,
    tolerance,
  };
}

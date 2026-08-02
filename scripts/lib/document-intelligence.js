export const GUIDANCE_PRECEDENCE = Object.freeze([
  'user',
  'project',
  'binding',
  'document_type',
  'domain',
  'general',
  'authentext',
]);

const PROVENANCE = new Set(['user', 'document', 'project', 'heuristic', 'external-source']);
const OPERATIONS = new Set(['review', 'rewrite', 'final-pass', 'structural', 'research-assisted']);
const DELIVERY_MODES = new Set(['pasted', 'file', 'embedded']);
const ARCHETYPES = new Set([
  'unknown',
  'composite',
  'correspondence',
  'workplace',
  'public-content',
  'technical',
  'product',
  'academic',
  'health-research',
  'governance',
  'legal-regulatory',
  'clinical-safety',
  'commercial',
  'employment',
  'creative-narrative',
]);
const STAKES = new Set(['low', 'medium', 'high', 'critical']);
const LIFECYCLES = new Set(['outline', 'draft', 'review', 'final', 'submission-ready']);
const EDITING_STRENGTHS = new Set(['conservative', 'standard', 'strong']);
const RESEARCH_PERMISSIONS = new Set(['not_requested', 'denied', 'allowed', 'required']);

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function validateField(field, label, errors, allowedValues) {
  if (!field || typeof field !== 'object' || Array.isArray(field)) {
    errors.push(`${label} must be a field object`);
    return;
  }
  if (typeof field.confidence !== 'number' || field.confidence < 0 || field.confidence > 1) {
    errors.push(`${label}.confidence must be between 0 and 1`);
  }
  if (!PROVENANCE.has(field.provenance)) {
    errors.push(`${label}.provenance must use a governed provenance value`);
  }
  if (allowedValues && !allowedValues.has(field.value)) {
    errors.push(`${label}.value must use a governed value`);
  }
}

export function validateDocumentProfile(profile) {
  const errors = [];
  if (profile?.schema_version !== 1) errors.push('schema_version must equal 1');
  if (!isNonEmptyString(profile?.profile_id)) errors.push('profile_id must be a non-empty string');

  validateField(profile?.operation, 'operation', errors, OPERATIONS);
  validateField(profile?.delivery_mode, 'delivery_mode', errors, DELIVERY_MODES);
  validateField(profile?.archetype, 'archetype', errors, ARCHETYPES);
  validateField(profile?.purpose, 'purpose', errors);
  validateField(profile?.audience, 'audience', errors);
  validateField(profile?.stakes, 'stakes', errors, STAKES);
  validateField(profile?.lifecycle, 'lifecycle', errors, LIFECYCLES);
  validateField(profile?.editing_strength, 'editing_strength', errors, EDITING_STRENGTHS);
  validateField(profile?.research_permission, 'research_permission', errors, RESEARCH_PERMISSIONS);

  for (const [key, value] of [
    ['subtypes', profile?.subtypes],
    ['authorities', profile?.authorities],
    ['constraints', profile?.constraints],
    ['components', profile?.components],
  ]) {
    if (!Array.isArray(value)) errors.push(`${key} must be an array`);
  }
  for (const [index, subtype] of (profile?.subtypes ?? []).entries()) {
    validateField(subtype, `subtypes[${index}]`, errors);
  }

  if (typeof profile?.composite !== 'boolean') {
    errors.push('composite must be a boolean');
  } else if (
    profile.composite &&
    (!Array.isArray(profile.components) || profile.components.length < 2)
  ) {
    errors.push('components must contain at least two entries for a composite profile');
  } else if (
    !profile.composite &&
    Array.isArray(profile.components) &&
    profile.components.length > 0
  ) {
    errors.push('components must be empty when composite is false');
  }
  if (profile?.composite === true && profile?.archetype?.value !== 'composite') {
    errors.push('archetype.value must be composite when composite is true');
  }
  for (const [index, component] of (profile?.components ?? []).entries()) {
    if (!ARCHETYPES.has(component?.archetype) || component.archetype === 'composite') {
      errors.push(`components[${index}].archetype must be a non-composite governed archetype`);
    }
    if (!isNonEmptyString(component?.subtype)) {
      errors.push(`components[${index}].subtype must be a non-empty string`);
    }
  }
  return errors;
}

export function resolveGuidance(rules) {
  const grouped = new Map();
  for (const [index, rule] of rules.entries()) {
    if (!grouped.has(rule.rule_key)) grouped.set(rule.rule_key, []);
    grouped.get(rule.rule_key).push({ ...rule, input_index: index });
  }

  const active = [];
  const conflicts = [];
  for (const candidates of grouped.values()) {
    const ranked = [...candidates].sort((left, right) => {
      const authority =
        GUIDANCE_PRECEDENCE.indexOf(left.authority) - GUIDANCE_PRECEDENCE.indexOf(right.authority);
      return authority || left.input_index - right.input_index;
    });
    const winner = ranked[0];
    const cleanWinner = { ...winner };
    delete cleanWinner.input_index;
    active.push(cleanWinner);
    for (const suppressed of candidates.filter((candidate) => candidate.id !== winner.id)) {
      const clean = { ...suppressed };
      delete clean.input_index;
      conflicts.push({ winner: winner.id, suppressed: clean });
    }
  }
  return { active, conflicts };
}

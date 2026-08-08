import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildDiagnostic,
  createDiagnosticReceipt,
  getChangeBudget,
  runBoundedAudit,
  runEditingOperation,
  validateProtectedItems,
} from '../scripts/lib/diagnostic-engine.js';

const profile = {
  profile_id: 'technical-reference',
  stakes: { value: 'medium' },
  constraints: ['preserve commands'],
};

test('diagnostics use applicable dimensions, source links, and safe-fix decisions', () => {
  const diagnostic = buildDiagnostic({
    profile,
    applicable_dimensions: ['completeness', 'structure', 'evidence', 'tone'],
    signals: [
      { dimension: 'structure', code: 'missing-heading', occurrences: 1, source_id: 'project' },
      { dimension: 'tone', code: 'inflation', occurrences: 2, source_id: 'authentext' },
      { dimension: 'safety', code: 'dose-risk', occurrences: 1, source_id: 'clinical' },
      { dimension: 'accessibility', code: 'contrast', occurrences: 3, source_id: 'wcag' },
    ],
  });
  assert.deepEqual(diagnostic.dimensions, ['completeness', 'structure', 'evidence', 'tone']);
  assert.deepEqual(
    diagnostic.findings.map((finding) => finding.code),
    ['missing-heading', 'inflation', 'dose-risk']
  );
  assert.equal(diagnostic.findings[0].safe_to_fix, true);
  assert.equal(diagnostic.findings[2].safe_to_fix, false);
  assert.equal(diagnostic.non_applicable[0].dimension, 'accessibility');
});

test('pipeline is structure-first, clusters ordinary style, and discloses short samples', () => {
  const result = buildDiagnostic({
    profile,
    text: 'Too short.',
    applicable_dimensions: ['tone', 'structure', 'ai-patterns'],
    signals: [
      { dimension: 'ai-patterns', code: 'isolated-style', occurrences: 1, source_id: 'authentext' },
      { dimension: 'tone', code: 'clustered-tone', occurrences: 2, source_id: 'project' },
      { dimension: 'structure', code: 'missing-section', occurrences: 1, source_id: 'template' },
    ],
  });
  assert.deepEqual(
    result.findings.map((finding) => finding.dimension),
    ['structure', 'tone']
  );
  assert.equal(result.suppressed[0].reason, 'insufficient-cluster-evidence');
  assert.match(result.limitations[0], /short sample/u);
});

test('editing operations expose distinct contracts', () => {
  const contracts = ['review', 'rewrite', 'structural', 'final-pass', 'research-assisted'].map(
    (operation) =>
      runEditingOperation(operation, { research_allowed: operation === 'research-assisted' })
  );
  assert.deepEqual(
    contracts.map((contract) => contract.output),
    [
      'findings-only',
      'revised-text',
      'structure-plan',
      'revised-text-with-audit',
      'revised-text-with-sources',
    ]
  );
  assert.equal(contracts.filter((contract) => contract.research_used).length, 1);
  assert.throws(() => runEditingOperation('research-assisted', {}), /research permission/u);
});

test('change budgets are bounded without relaxing immutable content', () => {
  assert.deepEqual(getChangeBudget('conservative'), {
    max_change_ratio: 0.15,
    restructure: false,
    immutable_content: true,
  });
  assert.equal(getChangeBudget('standard').max_change_ratio, 0.35);
  assert.equal(getChangeBudget('strong').max_change_ratio, 0.6);
  assert.equal(getChangeBudget('strong').immutable_content, true);
});

test('protected-item validation fails closed for sections, rules, and high stakes', () => {
  const result = validateProtectedItems({
    before: '## Safety\nDose 5 mg. Must retain. `--flag` [1]',
    after: 'Dose 10 mg. `--other`',
    required_sections: ['Safety'],
    sourced_rules: ['Must retain.'],
    stakes: 'high',
  });
  assert.equal(result.passed, false);
  assert.equal(result.fail_closed, true);
  assert.deepEqual(result.violations.map((item) => item.type).sort(), [
    'literal',
    'number',
    'required-section',
    'sourced-rule',
  ]);
});

test('typography is preserved and audit terminates after at most one revision', () => {
  const audit = runBoundedAudit({
    original: 'Texte : « bonjour ».',
    candidate: 'Texte : "bonjour".',
    revise: () => 'Texte : « bonjour ».',
    language: 'fr',
  });
  assert.equal(audit.revision_count, 1);
  assert.equal(audit.passed, true);
  assert.equal(audit.output, 'Texte : « bonjour ».');
});

test('diagnostic receipt keeps assumptions concise and unresolved evidence explicit', () => {
  const receipt = createDiagnosticReceipt({
    profile_sha256: 'a'.repeat(64),
    source_ids: ['project', 'authentext'],
    findings: [{ id: 'f1', dimension: 'tone', source_id: 'project', safe_to_fix: true }],
    assumptions: ['General audience', 'Conservative edits', 'Third assumption omitted'],
    conflicts: [{ winner: 'project', suppressed: 'authentext' }],
    unresolved: ['High-stakes statement needs human review'],
    audit: { passed: false, revision_count: 1, unresolved_finding_ids: ['f1'] },
  });
  assert.deepEqual(receipt.assumptions, ['General audience', 'Conservative edits']);
  assert.equal(receipt.conflicts.length, 1);
  assert.equal(receipt.unresolved.length, 1);
});

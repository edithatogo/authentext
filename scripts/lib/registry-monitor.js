const ACCEPTANCE_STATUSES = new Set(['accepted', 'listed', 'verified']);
const DAY_MS = 24 * 60 * 60 * 1000;

function dateValue(value) {
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(timestamp) ? timestamp : undefined;
}

function addFinding(findings, channel, code, message, expected, observed) {
  const finding = { channel, code, message };
  if (expected !== undefined) finding.expected = expected;
  if (observed !== undefined) finding.observed = observed;
  findings.push(finding);
}

/**
 * Compare the governed registry matrix with release and hosted observations.
 * The function is pure: callers provide observations, time, and release state.
 */
export function monitorRegistryDistribution(matrix, options = {}) {
  const asOf = options.asOf ?? new Date().toISOString().slice(0, 10);
  const maxAgeDays = options.maxAgeDays ?? 90;
  const observations = options.observations ?? {};
  const findings = [];

  for (const channel of matrix.channels ?? []) {
    const id = channel.id;
    const observed = observations[id] ?? {};
    const checkedOn = dateValue(channel.evidence?.checked_on);
    const currentDate = dateValue(asOf);

    if (checkedOn !== undefined && currentDate !== undefined) {
      const ageDays = Math.floor((currentDate - checkedOn) / DAY_MS);
      if (ageDays > maxAgeDays) {
        addFinding(
          findings,
          id,
          'stale_evidence',
          `Evidence is ${ageDays} days old.`,
          maxAgeDays,
          ageDays
        );
      }
    }

    if (ACCEPTANCE_STATUSES.has(channel.status) && !channel.evidence?.receipt_url) {
      addFinding(
        findings,
        id,
        'false_acceptance_claim',
        `${channel.status} requires a hosted receipt.`
      );
    }

    if (
      options.currentVersion &&
      channel.release_version &&
      channel.release_version !== options.currentVersion
    ) {
      addFinding(
        findings,
        id,
        'stale_release',
        'Registry release differs from the canonical release.',
        options.currentVersion,
        channel.release_version
      );
    }

    if (
      channel.manifest_sha256 &&
      observed.manifest_sha256 &&
      channel.manifest_sha256 !== observed.manifest_sha256
    ) {
      addFinding(
        findings,
        id,
        'changed_manifest',
        'Hosted manifest digest differs from the governed digest.',
        channel.manifest_sha256,
        observed.manifest_sha256
      );
    }

    if (observed.present === false) {
      addFinding(findings, id, 'removed_package', 'The previously tracked package is absent.');
    }

    if (Number(observed.http_status) >= 400) {
      addFinding(
        findings,
        id,
        'broken_listing',
        'The hosted listing returned an error response.',
        'HTTP < 400',
        observed.http_status
      );
    }

    if (observed.status && observed.status !== channel.status) {
      addFinding(
        findings,
        id,
        'status_drift',
        'Observed publication state differs from the governed matrix.',
        channel.status,
        observed.status
      );
    }
  }

  findings.sort((left, right) =>
    `${left.channel}:${left.code}`.localeCompare(`${right.channel}:${right.code}`)
  );

  return {
    schema_version: 1,
    as_of: asOf,
    healthy: findings.length === 0,
    channel_count: matrix.channels?.length ?? 0,
    finding_count: findings.length,
    findings,
  };
}

/** Render a stable issue body carrying a marker used for idempotent updates. */
export function renderRegistryDriftIssue(report) {
  const lines = [
    '<!-- authentext-registry-monitor -->',
    '# Registry distribution drift',
    '',
    `Monitor date: ${report.as_of}`,
    `Findings: ${report.finding_count}`,
    '',
  ];
  for (const finding of report.findings) {
    lines.push(`- \`${finding.channel}\` / \`${finding.code}\`: ${finding.message}`);
  }
  lines.push('', 'This issue is maintained automatically. The monitor never publishes packages.');
  return `${lines.join('\n')}\n`;
}

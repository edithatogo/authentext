/**
 * Compare a Conductor mapping registry with bounded GitHub snapshots.
 * @param {object} mapping
 * @param {{issues: object[], projectItems: object[], subissues?: Record<string, number[]>}} snapshots
 */
export function reconcileMapping(mapping, snapshots) {
  const issues = new Map(snapshots.issues.map((issue) => [issue.number, issue]));
  const projectUrls = new Set(
    snapshots.projectItems.map((item) => item.content?.url).filter(Boolean)
  );
  const missingIssues = [];
  const missingProjectItems = [];
  const stateUpdates = [];
  const missingSubissueRelationships = [];
  let mappedNodes = 0;

  for (const track of mapping.tracks ?? []) {
    const nodes = [track.parent_issue, ...(track.phases ?? []).map((phase) => phase.issue)];
    for (const node of nodes) {
      mappedNodes += 1;
      const hosted = issues.get(node.number);
      if (!hosted) {
        missingIssues.push(node.number);
        continue;
      }
      if (!projectUrls.has(node.url)) missingProjectItems.push(node.number);
      const hostedState = hosted.state.toLowerCase();
      if (node.state !== hostedState) {
        stateUpdates.push({ number: node.number, from: node.state, to: hostedState });
      }
    }
    if (snapshots.subissues) {
      const hostedChildren = new Set(snapshots.subissues[track.parent_issue.number] ?? []);
      for (const phase of track.phases ?? []) {
        if (!hostedChildren.has(phase.issue.number)) {
          missingSubissueRelationships.push({
            parent: track.parent_issue.number,
            child: phase.issue.number,
          });
        }
      }
    }
  }

  return {
    mappedNodes,
    missingIssues,
    missingProjectItems,
    stateUpdates,
    missingSubissueRelationships,
    clean:
      missingIssues.length === 0 &&
      missingProjectItems.length === 0 &&
      missingSubissueRelationships.length === 0,
  };
}

/** Apply only deterministic hosted state and verification receipt updates. */
export function applyReconciliation(mapping, report, verifiedAt) {
  const states = new Map(report.stateUpdates.map((update) => [update.number, update.to]));
  for (const track of mapping.tracks ?? []) {
    const nodes = [track.parent_issue, ...(track.phases ?? []).map((phase) => phase.issue)];
    for (const node of nodes) {
      if (states.has(node.number)) node.state = states.get(node.number);
    }
  }
  mapping.generated_at = verifiedAt;
  mapping.verification.verified_at = verifiedAt.slice(0, 10);
  mapping.verification.issue_states = 'verified';
  mapping.verification.project_membership = `${report.mappedNodes}/${report.mappedNodes}`;
  return mapping;
}

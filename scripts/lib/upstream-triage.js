/** Shared adopt / reject / defer heuristics for upstream PRs and issues. */

export const UPSTREAM_TRIAGE_RULES = [
  {
    keywords: ['opencode support'],
    decision: 'reject',
    reason:
      'OpenCode is covered by the Agent Skills distribution path; no separate upstream port is required.',
  },
  {
    keywords: ['wikipedia sync'],
    decision: 'reject',
    reason: 'Live upstream fetches add runtime dependencies to a deterministic skill-source repo.',
  },
  {
    keywords: ['claude compatibility'],
    decision: 'reject',
    reason:
      'Evaluate compatibility against the local Agent Skills package, not upstream adapter shims.',
  },
  {
    keywords: ['license file', 'license'],
    decision: 'defer',
    reason: 'Repo hygiene improvement; compare against the local MIT LICENSE before adopting.',
  },
  {
    keywords: ['spanish', 'español', 'translation', 'translate', 'language'],
    decision: 'reject',
    reason:
      'Non-English language versions and translations are out of scope for this core English Agent Skills package.',
  },
  {
    keywords: ['api provider', 'api', 'atlascloud', 'external service'],
    decision: 'reject',
    reason:
      'External APIs, providers, and custom runtime integrations are out of scope for English agent writing guidelines.',
  },
  {
    keywords: ['readme', 'installation', 'install instructions'],
    decision: 'defer',
    reason:
      'Compare with our custom Agent Skills installation guidelines (docs/skill-distribution.md) before adopting.',
  },
  {
    keywords: ['overcorrection', 'fragment', 'subjectless'],
    decision: 'defer',
    reason:
      'Review grammar refinement pattern against the core pattern definitions for potential overcorrection or false-positive risks.',
  },
  {
    keywords: [
      'pattern',
      'hyphenated',
      'rewrite',
      'review score',
      'punchline',
      'aphorism',
      'density',
    ],
    decision: 'defer',
    reason:
      'Review against the evidence rubric: overlap with the local catalog, false-positive risk, and maintainer burden.',
  },
];

/**
 * @param {{ title?: string, number?: number }} item
 * @param {'pr' | 'issue'} kind
 * @returns {{ kind: string, number: number, title: string, decision: string, reason: string }}
 */
export function triageUpstreamItem(item, kind) {
  const title = item.title || '';
  const lowerTitle = title.toLowerCase();
  const matchedRule = UPSTREAM_TRIAGE_RULES.find((rule) =>
    rule.keywords.some((keyword) => lowerTitle.includes(keyword))
  );

  if (matchedRule) {
    return {
      kind,
      number: item.number,
      title,
      decision: matchedRule.decision,
      reason: matchedRule.reason,
    };
  }

  return {
    kind,
    number: item.number,
    title,
    decision: 'defer',
    reason: 'No automation rule matched. Review manually against the modernization track rubric.',
  };
}

/**
 * Escape untrusted text for a single Markdown table cell.
 * Backslashes must be escaped before pipes so existing escape sequences cannot
 * neutralize the separator escape.
 * @param {string} value
 * @returns {string}
 */
function escapeMarkdownTableCell(value) {
  return value.replaceAll('\\', '\\\\').replaceAll('|', '\\|').replace(/\r?\n/g, ' ');
}

/**
 * @param {Array<{ kind: string, number: number, title: string, decision: string, reason: string }>} rows
 * @returns {string}
 */
export function formatTriageTable(rows) {
  if (rows.length === 0) {
    return '(none open)';
  }

  const header = '| Item | Title | Suggested | Rationale |';
  const divider = '| --- | --- | --- | --- |';
  const body = rows
    .map((row) => {
      const label = row.kind === 'pr' ? `PR #${row.number}` : `Issue #${row.number}`;
      const safeTitle = escapeMarkdownTableCell(row.title);
      const safeReason = escapeMarkdownTableCell(row.reason);
      return `| ${label} | ${safeTitle} | ${row.decision.toUpperCase()} | ${safeReason} |`;
    })
    .join('\n');

  return `${header}\n${divider}\n${body}`;
}

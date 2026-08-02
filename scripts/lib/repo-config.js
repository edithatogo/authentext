import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Authentext repository root. */
export const REPO_ROOT = path.resolve(__dirname, '../..');

/** Upstream canonical skill repository. */
export const UPSTREAM = {
  owner: 'blader',
  repo: 'humanizer',
  defaultBranch: 'main',
};

/** Default local fork when git remote detection fails. */
export const DEFAULT_LOCAL_REPO = 'edithatogo/authentext';

/**
 * @returns {string} owner/repo slug for upstream.
 */
export function getUpstreamFullName() {
  return `${UPSTREAM.owner}/${UPSTREAM.repo}`;
}

/**
 * @returns {string} HTTPS GitHub URL for upstream.
 */
export function getUpstreamUrl() {
  return `https://github.com/${getUpstreamFullName()}`;
}

/**
 * Resolve local owner/repo from origin remote or env override.
 * @returns {string}
 */
export function getLocalFullName() {
  if (process.env.AUTHENTEXT_LOCAL_REPO) {
    return process.env.AUTHENTEXT_LOCAL_REPO;
  }
  if (process.env.HUMANIZER_LOCAL_REPO) {
    return process.env.HUMANIZER_LOCAL_REPO;
  }

  try {
    const remote = execSync('git remote get-url origin', {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();

    const match = remote.match(/github\.com[/:]([^/]+)\/([^/.]+)/i);
    if (match) {
      return `${match[1]}/${match[2]}`;
    }
  } catch {
    // fall through
  }

  return DEFAULT_LOCAL_REPO;
}

/** Active self-improvement output directory (not an archived conductor track). */
export const SELF_IMPROVEMENT_DIR = path.join(REPO_ROOT, 'conductor', 'self-improvement');

/** Shared path helpers for sync and self-improvement tooling. */
export const PATHS = {
  skillMd: path.join(REPO_ROOT, 'SKILL.md'),
  skillProMd: path.join(REPO_ROOT, 'SKILL_PROFESSIONAL.md'),
  skillCoreModule: path.join(REPO_ROOT, 'src', 'modules', 'SKILL_CORE_PATTERNS.md'),
  referencesCore: path.join(REPO_ROOT, 'references', 'core-patterns.md'),
  selfImprovementDir: SELF_IMPROVEMENT_DIR,
  repoDataJson: path.join(SELF_IMPROVEMENT_DIR, 'repo-data.json'),
  upstreamDecisionLog: path.join(SELF_IMPROVEMENT_DIR, 'upstream-decision-log.md'),
  generatedIssue: path.join(REPO_ROOT, '.github', 'generated', 'self-improvement-issue.md'),
  generatedDecisions: path.join(REPO_ROOT, '.github', 'generated', 'self-improvement-decisions.md'),
  generatedPrBody: path.join(REPO_ROOT, '.github', 'generated', 'self-improvement-pr-body.md'),
};

/**
 * Ensure the self-improvement output directory exists.
 */
export function ensureSelfImprovementDir() {
  fs.mkdirSync(PATHS.selfImprovementDir, { recursive: true });
}

/**
 * Count catalog patterns from module frontmatter or heading scan.
 * @param {string} filePath
 * @returns {number|null}
 */
export function countPatternsInFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  return countPatternsInMarkdown(fs.readFileSync(filePath, 'utf8'));
}

/**
 * @param {string} markdown
 * @returns {number}
 */
export function countPatternsInMarkdown(markdown) {
  const frontmatterMatch = markdown.match(/^---[\s\S]*?\npatterns:\s*(\d+)/m);
  if (frontmatterMatch) {
    return Number(frontmatterMatch[1]);
  }

  const catalogHeadings = markdown.match(/^### Pattern \d+:/gm);
  if (catalogHeadings && catalogHeadings.length > 0) {
    return catalogHeadings.length;
  }

  const numberedHeadings = markdown.match(/^### \d+\.\s/gm);
  return numberedHeadings ? numberedHeadings.length : 0;
}

/**
 * @returns {number|null} Local catalog pattern count.
 */
export function getLocalPatternCount() {
  return countPatternsInFile(PATHS.skillCoreModule);
}

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

const REQUIRED_DOCS = [
  'README.md',
  'AGENTS.md',
  'docs/skill-distribution.md',
  'docs/agent-skills-contract.md',
];
const REQUIRED_REFERENCE_DOCS = ['docs/skill-distribution.md'];

let failed = false;

/**
 * Track and print validation failures.
 * @param {string} message
 */
function fail(message) {
  failed = true;
  console.error(message);
}

/**
 * @param {string} relPath
 * @returns {boolean}
 */
function fileExists(relPath) {
  return fs.existsSync(path.join(REPO_ROOT, relPath));
}

/**
 * @param {string} relPath
 * @returns {string}
 */
function readFile(relPath) {
  return fs.readFileSync(path.join(REPO_ROOT, relPath), 'utf8');
}

/**
 * Validate markdown local links resolve from the source file.
 * @param {string} relPath
 */
function checkInternalLinks(relPath) {
  const content = readFile(relPath);
  const linkRegex = /\[[^\]]+\]\(([^)]+)\)/g;
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    const href = match[1].trim();
    if (
      !href ||
      href.startsWith('http://') ||
      href.startsWith('https://') ||
      href.startsWith('#') ||
      href.startsWith('mailto:')
    ) {
      continue;
    }

    const cleanHref = href.split('#')[0];
    const resolved = path.resolve(path.dirname(path.join(REPO_ROOT, relPath)), cleanHref);

    if (!fs.existsSync(resolved)) {
      fail(`Broken internal link in ${relPath}: ${href}`);
    }
  }
}

for (const doc of REQUIRED_DOCS) {
  if (!fileExists(doc)) {
    fail(`Missing required doc: ${doc}`);
  }
}

for (const doc of REQUIRED_REFERENCE_DOCS) {
  if (!fileExists(doc)) {
    continue;
  }
}

for (const doc of REQUIRED_DOCS) {
  if (fileExists(doc)) {
    checkInternalLinks(doc);
  }
}

if (failed) {
  process.exit(1);
}

console.log('Documentation validation passed.');

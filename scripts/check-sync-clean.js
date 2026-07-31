import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const TARGET_FILES = [
  'SKILL.md',
  'SKILL_PROFESSIONAL.md',
  'AGENTS.md',
  'README.md',
  'package.json',
  'package-lock.json',
  'references/core-patterns.md',
  'references/technical.md',
  'references/academic.md',
  'references/governance.md',
  'references/reasoning-failures.md',
];

/**
 * Normalize transport-only differences that should not make generated output
 * appear stale.
 *
 * @param {string} file
 * @param {string|null} content
 * @returns {string|null}
 */
export function normalizeGeneratedText(file, content) {
  if (content === null) {
    return null;
  }

  let normalized = content.replace(/\r\n?/g, '\n');
  if (file === 'AGENTS.md') {
    normalized = normalized.replace(/^(\s*last_synced:\s*).+$/m, '$1<ignored>');
  }
  return normalized;
}

/**
 * @returns {Map<string, string|null>}
 */
function readTargets() {
  const snapshot = new Map();
  for (const file of TARGET_FILES) {
    snapshot.set(file, fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null);
  }
  return snapshot;
}

/**
 * @param {Map<string, string|null>} snapshot
 */
function restoreTargets(snapshot) {
  for (const [file, content] of snapshot) {
    if (content === null) {
      if (fs.existsSync(file)) {
        fs.rmSync(file);
      }
      continue;
    }
    fs.writeFileSync(file, content, 'utf8');
  }
}

/**
 * @param {Map<string, string|null>} before
 * @param {Map<string, string|null>} after
 * @returns {string[]}
 */
export function getDriftedFiles(before, after) {
  return TARGET_FILES.filter(
    (file) =>
      normalizeGeneratedText(file, before.get(file) ?? null) !==
      normalizeGeneratedText(file, after.get(file) ?? null)
  );
}

/**
 * @param {string} scriptPath
 */
function runNode(scriptPath) {
  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: process.cwd(),
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    throw new Error(`${scriptPath} exited with status ${result.status ?? 1}`);
  }
}

export function main() {
  const before = readTargets();
  let drifted = [];

  try {
    runNode('scripts/compile-skill.js');
    drifted = getDriftedFiles(before, readTargets());
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
    return;
  } finally {
    restoreTargets(before);
  }

  if (drifted.length === 0) {
    console.log('Sync outputs are up to date.');
    return;
  }

  console.error('Sync drift detected in generated skill artifacts:');
  console.error(drifted.join('\n'));
  process.exitCode = 1;
}

const isDirectExecution =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isDirectExecution) {
  main();
}

/**
 * Optional discovery helpers for sourceright / citeweft citation authority.
 * Authentext never imports citation-manager code; it only detects presence
 * so refuse-and-point messaging can name a local tool when one exists.
 */

import fs from 'fs';
import path from 'path';

const DEFAULT_SIBLING_NAMES = {
  sourceright: ['sourceright'],
  citeweft: ['citeweft'],
};

/**
 * @param {string} tool
 * @param {{ cwd?: string, env?: NodeJS.ProcessEnv, siblingRoot?: string }} [options]
 * @returns {{ tool: string, present: boolean, path: string|null, reason: string }}
 */
export function discoverCitationTool(tool, options = {}) {
  const env = options.env ?? process.env;
  const cwd = options.cwd ?? process.cwd();
  const siblingRoot = options.siblingRoot ?? path.dirname(cwd);
  const key = String(tool || '').toLowerCase();

  if (key !== 'sourceright' && key !== 'citeweft') {
    return { tool: key, present: false, path: null, reason: 'unknown-tool' };
  }

  const envKey = key === 'sourceright' ? 'AUTHENTXT_SOURCERIGHT_PATH' : 'AUTHENTXT_CITEWEFT_PATH';
  const fromEnv = env[envKey];
  if (fromEnv && fs.existsSync(fromEnv)) {
    return { tool: key, present: true, path: path.resolve(fromEnv), reason: 'env' };
  }

  for (const name of DEFAULT_SIBLING_NAMES[key]) {
    const candidate = path.join(siblingRoot, name);
    if (fs.existsSync(candidate)) {
      return { tool: key, present: true, path: path.resolve(candidate), reason: 'sibling-clone' };
    }
  }

  const skillHints = [path.join(cwd, '.agents', 'skills', key), path.join(cwd, 'skills', key)];
  for (const candidate of skillHints) {
    if (fs.existsSync(candidate)) {
      return {
        tool: key,
        present: true,
        path: path.resolve(candidate),
        reason: 'configured-skill',
      };
    }
  }

  return {
    tool: key,
    present: false,
    path: null,
    reason: 'absent',
  };
}

/**
 * @param {{ cwd?: string, env?: NodeJS.ProcessEnv, siblingRoot?: string }} [options]
 */
export function resolveCitationHandoff(options = {}) {
  const sourceright = discoverCitationTool('sourceright', options);
  const citeweft = discoverCitationTool('citeweft', options);
  const present = [sourceright, citeweft].filter((entry) => entry.present);

  return {
    authority: present.length > 0 ? 'external' : 'refuse-locally',
    present,
    absent: [sourceright, citeweft].filter((entry) => !entry.present),
    message:
      present.length > 0
        ? 'Reference-list work belongs to the discovered citation authority; Authentext refuses bibliography edits.'
        : 'Reference-list work is out of scope here. Use edithatogo/sourceright and edithatogo/citeweft when available; refuse bibliography edits either way.',
    remotes: {
      sourceright: 'https://github.com/edithatogo/sourceright',
      citeweft: 'https://github.com/edithatogo/citeweft',
    },
  };
}

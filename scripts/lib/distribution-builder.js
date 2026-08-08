import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const HOSTS = new Set([
  'claude-code',
  'codex',
  'github-copilot',
  'gemini-cli',
  'opencode',
  'cursor',
  'windsurf',
  'cline',
  'aiderdesk',
  'amp',
]);

const FORBIDDEN_SEGMENTS = new Set([
  '.git',
  '.github',
  'conductor',
  'coverage',
  'experiments',
  'node_modules',
  'scripts',
  'src',
  'test',
]);

function sha256(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function normalize(relativePath) {
  return relativePath.split(path.sep).join('/');
}

function walk(directory) {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const fullPath = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) throw new TypeError(`Symlinks are not allowed: ${fullPath}`);
      return entry.isDirectory() ? walk(fullPath) : [fullPath];
    })
    .sort();
}

function copyPortableSurface(root, packageRoot) {
  const skillRoot = path.join(packageRoot, 'skills', 'authentext');
  fs.mkdirSync(skillRoot, { recursive: true });
  fs.copyFileSync(path.join(root, 'SKILL.md'), path.join(skillRoot, 'SKILL.md'));
  fs.copyFileSync(path.join(root, 'LICENSE'), path.join(skillRoot, 'LICENSE'));
  fs.cpSync(path.join(root, 'references'), path.join(skillRoot, 'references'), {
    recursive: true,
  });
}

/** Build a deterministic, allow-listed portable distribution staging tree. */
export function buildDistributionPackage({ root, output, target, sourceCommit }) {
  if (target !== 'portable') throw new TypeError(`Unsupported distribution target: ${target}`);
  if (!/^[a-f0-9]{40}$/.test(sourceCommit)) throw new TypeError('sourceCommit must be a SHA-1');

  const packageRoot = path.join(output, target);
  fs.rmSync(packageRoot, { recursive: true, force: true });
  copyPortableSurface(root, packageRoot);

  const files = walk(packageRoot).map((filePath) => ({
    path: normalize(path.relative(packageRoot, filePath)),
    sha256: sha256(fs.readFileSync(filePath)),
  }));
  const receipt = {
    schema_version: 1,
    package: 'authentext',
    target,
    source_commit: sourceCommit,
    packageRoot,
    capabilities: { apps: [], tools: [], hooks: [], network: [] },
    exclusions: [...FORBIDDEN_SEGMENTS].sort(),
    files,
  };
  fs.writeFileSync(
    path.join(packageRoot, 'authentext-package.json'),
    `${JSON.stringify({ ...receipt, packageRoot: undefined }, null, 2)}\n`,
    'utf8'
  );
  return receipt;
}

/** Validate the staged portable surface and reject drift or unsafe additions. */
export function validatePortablePackage(packageRoot) {
  const manifestPath = path.join(packageRoot, 'authentext-package.json');
  if (!fs.existsSync(manifestPath)) return ['package manifest is missing'];
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const declared = new Set(manifest.files.map((entry) => entry.path));
  const errors = [];

  for (const filePath of walk(packageRoot)) {
    const relativePath = normalize(path.relative(packageRoot, filePath));
    const segments = relativePath.split('/');
    if (segments.some((segment) => FORBIDDEN_SEGMENTS.has(segment))) {
      errors.push(`forbidden package path: ${relativePath}`);
    }
    if (/humanizer|blader/i.test(relativePath)) errors.push(`legacy identity: ${relativePath}`);
    if (relativePath !== 'authentext-package.json' && !declared.has(relativePath)) {
      errors.push(`undeclared package file: ${relativePath}`);
    }
  }
  for (const entry of manifest.files) {
    const filePath = path.join(packageRoot, ...entry.path.split('/'));
    if (!fs.existsSync(filePath)) errors.push(`declared file is missing: ${entry.path}`);
    else if (sha256(fs.readFileSync(filePath)) !== entry.sha256) {
      errors.push(`digest mismatch: ${entry.path}`);
    }
  }
  return errors;
}

/** Simulate clean native discovery without writing to a user's real host directories. */
export function discoverInstalledSkill(packageRoot, host) {
  if (!HOSTS.has(host)) throw new TypeError(`Unsupported host: ${host}`);
  const skillPath = path.join(packageRoot, 'skills', 'authentext', 'SKILL.md');
  return {
    host,
    name: 'authentext',
    sha256: sha256(fs.readFileSync(skillPath)),
    discovered: fs.existsSync(skillPath),
  };
}

/** Interpret catalog content instead of treating HTTP 200 as listing evidence. */
export function inspectCatalogResponse(status, body) {
  if (status !== 200) return { listed: false, reason: `http-${status}` };
  if (/isn[’']t available|404/i.test(body)) {
    return { listed: false, reason: 'application-not-found' };
  }
  if (/npx skills add/i.test(body)) return { listed: true, reason: 'install-receipt-present' };
  return { listed: false, reason: 'listing-unverified' };
}

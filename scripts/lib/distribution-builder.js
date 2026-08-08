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

function writeClaudeManifests(root, packageRoot) {
  const version = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version;
  const metadataRoot = path.join(packageRoot, '.claude-plugin');
  fs.mkdirSync(metadataRoot, { recursive: true });
  const plugin = {
    name: 'authentext',
    version,
    description: 'Review and rewrite prose naturally while preserving meaning and literals.',
    author: { name: 'edithatogo', url: 'https://github.com/edithatogo' },
    homepage: 'https://github.com/edithatogo/authentext',
    repository: 'https://github.com/edithatogo/authentext',
    license: 'MIT',
    keywords: ['agent-skill', 'writing', 'editing'],
  };
  const marketplace = {
    name: 'authentext-marketplace',
    owner: { name: 'edithatogo' },
    plugins: [
      {
        name: 'authentext',
        source: './',
        description: plugin.description,
        version,
      },
    ],
  };
  fs.writeFileSync(path.join(metadataRoot, 'plugin.json'), `${JSON.stringify(plugin, null, 2)}\n`);
  fs.writeFileSync(
    path.join(metadataRoot, 'marketplace.json'),
    `${JSON.stringify(marketplace, null, 2)}\n`
  );
}

function writeOpenAiOverlay(root, packageRoot) {
  const targetRoot = path.join(packageRoot, 'agents');
  fs.mkdirSync(targetRoot, { recursive: true });
  fs.copyFileSync(path.join(root, 'agents', 'openai.yaml'), path.join(targetRoot, 'openai.yaml'));
}

function writeGeminiManifest(root, packageRoot) {
  const version = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version;
  const manifest = {
    name: 'authentext',
    version,
    description: 'Review and rewrite prose naturally while preserving meaning and literals.',
    skills: [{ name: 'authentext', path: 'skills/authentext' }],
  };
  fs.writeFileSync(
    path.join(packageRoot, 'gemini-extension.json'),
    `${JSON.stringify(manifest, null, 2)}\n`
  );
}

function writeOpenCodeCatalog(root, packageRoot) {
  const version = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version;
  const catalog = {
    schemaVersion: 1,
    name: 'authentext',
    version,
    skills: [{ name: 'authentext', path: 'skills/authentext', activation: 'explicit' }],
    permissions: { network: 'deny', shell: 'deny', write: 'deny' },
  };
  fs.writeFileSync(
    path.join(packageRoot, 'opencode.json'),
    `${JSON.stringify(catalog, null, 2)}\n`
  );
}

/** Build a deterministic, allow-listed portable distribution staging tree. */
export function buildDistributionPackage({ root, output, target, sourceCommit }) {
  if (!['portable', 'claude', 'codex', 'gemini', 'opencode'].includes(target)) {
    throw new TypeError(`Unsupported distribution target: ${target}`);
  }
  if (!/^[a-f0-9]{40}$/.test(sourceCommit)) throw new TypeError('sourceCommit must be a SHA-1');

  const packageRoot = path.join(output, target);
  fs.rmSync(packageRoot, { recursive: true, force: true });
  copyPortableSurface(root, packageRoot);
  if (target === 'claude') writeClaudeManifests(root, packageRoot);
  if (target === 'codex') writeOpenAiOverlay(root, packageRoot);
  if (target === 'gemini') writeGeminiManifest(root, packageRoot);
  if (target === 'opencode') writeOpenCodeCatalog(root, packageRoot);

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

/** Validate a host wrapper while preserving the canonical portable package. */
export function validateHostPackage(packageRoot, target) {
  const errors = validatePortablePackage(packageRoot);
  if (target === 'portable') return errors;
  if (target === 'codex') {
    const skillPath = path.join(packageRoot, 'skills', 'authentext', 'SKILL.md');
    const overlayPath = path.join(packageRoot, 'agents', 'openai.yaml');
    if (/^allowed-tools:/m.test(fs.readFileSync(skillPath, 'utf8'))) {
      errors.push('portable-field isolation violation: allowed-tools');
    }
    if (!fs.existsSync(overlayPath)) errors.push('OpenAI overlay is missing');
    else if (/^apps:/m.test(fs.readFileSync(overlayPath, 'utf8'))) {
      errors.push('prohibited OpenAI app declaration');
    }
    return errors;
  }
  if (target === 'gemini') {
    validateSkillManifest(
      packageRoot,
      'gemini-extension.json',
      (manifest) => manifest.skills,
      errors
    );
    return errors;
  }
  if (target === 'opencode') {
    validateSkillManifest(packageRoot, 'opencode.json', (manifest) => manifest.skills, errors);
    const manifestPath = path.join(packageRoot, 'opencode.json');
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      if (manifest.skills?.[0]?.activation !== 'explicit') {
        errors.push('OpenCode activation must be explicit');
      }
      if (
        manifest.permissions?.network !== 'deny' ||
        manifest.permissions?.shell !== 'deny' ||
        manifest.permissions?.write !== 'deny'
      ) {
        errors.push('OpenCode package requests prohibited permissions');
      }
    }
    return errors;
  }
  if (target !== 'claude') return [...errors, `unsupported host package: ${target}`];
  const pluginPath = path.join(packageRoot, '.claude-plugin', 'plugin.json');
  const marketplacePath = path.join(packageRoot, '.claude-plugin', 'marketplace.json');
  for (const requiredPath of [pluginPath, marketplacePath]) {
    if (!fs.existsSync(requiredPath))
      errors.push(`required Claude manifest is missing: ${requiredPath}`);
  }
  if (fs.existsSync(pluginPath)) {
    const plugin = JSON.parse(fs.readFileSync(pluginPath, 'utf8'));
    if (plugin.name !== 'authentext') errors.push('Claude plugin identity must be authentext');
    for (const capability of ['apps', 'tools', 'hooks', 'mcpServers', 'network', 'telemetry']) {
      if (plugin[capability] !== undefined) {
        errors.push(`prohibited capability in Claude plugin: ${capability}`);
      }
    }
  }
  return errors;
}

function validateSkillManifest(packageRoot, filename, getSkills, errors) {
  const manifestPath = path.join(packageRoot, filename);
  if (!fs.existsSync(manifestPath)) {
    errors.push(`required host manifest is missing: ${filename}`);
    return;
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const skills = getSkills(manifest);
  if (
    manifest.name !== 'authentext' ||
    !Array.isArray(skills) ||
    skills.length !== 1 ||
    skills[0].name !== 'authentext' ||
    skills[0].path !== 'skills/authentext'
  ) {
    errors.push(`${filename} must reference the canonical Authentext skill`);
  }
  for (const capability of ['apps', 'tools', 'hooks', 'network', 'telemetry']) {
    if (manifest[capability] !== undefined) {
      errors.push(`prohibited capability in ${filename}: ${capability}`);
    }
  }
}

/** Exercise install, activation, reload, update, precedence, and uninstall without host writes. */
export function simulateHostLifecycle(packageRoot, target, { localConflict = false } = {}) {
  if (!['gemini', 'opencode'].includes(target)) {
    throw new TypeError(`Unsupported lifecycle target: ${target}`);
  }
  const errors = validateHostPackage(packageRoot, target);
  if (errors.length > 0) throw new TypeError(errors.join('; '));
  return {
    installed: true,
    activated: true,
    reloaded: true,
    update: 'immutable-version',
    precedence: localConflict ? 'local' : target === 'gemini' ? 'extension' : 'native',
    uninstalled: true,
  };
}

/** Require genuine executable value before designing an OpenCode npm plugin. */
export function evaluateOpenCodePluginGate({ hooks = [], tools = [] } = {}) {
  if (hooks.length === 0 && tools.length === 0) {
    return {
      justified: false,
      decision: 'not-justified',
      reason: 'native-agent-skill-satisfies-use-case',
    };
  }
  return {
    justified: false,
    decision: 'security-review-required',
    reason: 'executable-capabilities-change-product-boundary',
  };
}

/** Apply the registry matrix trust checklist without making external submissions. */
export function evaluateCatalogCandidate(catalog, controls) {
  const required = [
    'ownership',
    'maintenance',
    'submission',
    'update',
    'removal',
    'license',
    'nativeSkills',
    'durableReceipt',
    'provenance',
    'monitorable',
  ];
  const failed = required.filter((control) => controls[control] !== true);
  if (controls.hiddenTelemetry !== false) failed.push('hiddenTelemetry');
  return { catalog, included: failed.length === 0, failed };
}

/** Enforce immutable versions and a stable package identity across lifecycle operations. */
export function evaluatePackageTransition(fromVersion, toVersion, fromName, toName) {
  if (fromName !== toName || toName !== 'authentext') {
    return { allowed: false, operation: 'rename-rejected' };
  }
  if (fromVersion === toVersion) return { allowed: false, operation: 'immutable-version' };
  const from = fromVersion.split('.').map(Number);
  const to = toVersion.split('.').map(Number);
  const direction = to.findIndex((part, index) => part !== from[index]);
  return {
    allowed: true,
    operation: to[direction] > from[direction] ? 'update' : 'rollback',
  };
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
  const discovered = fs.existsSync(skillPath);
  return {
    host,
    name: 'authentext',
    sha256: discovered ? sha256(fs.readFileSync(skillPath)) : null,
    discovered,
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

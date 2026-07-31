#!/usr/bin/env node

/**

* Skill Compiler for Modular Architecture (ADR-001)
*
* Assembles Agent Skills spec-compliant outputs:
* * SKILL.md (body under 500 lines; workflow + routing in root, detail in references/)
* * SKILL_PROFESSIONAL.md (pro variant with module routing)
* * references/*.md (full module content for progressive disclosure)
*
* Usage: node scripts/compile-skill.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

const MODULES = {
  core: 'src/modules/SKILL_CORE_PATTERNS.md',
  technical: 'src/modules/SKILL_TECHNICAL.md',
  academic: 'src/modules/SKILL_ACADEMIC.md',
  governance: 'src/modules/SKILL_GOVERNANCE.md',
  reasoning: 'src/modules/SKILL_REASONING.md',
};

const OUTPUT = {
  skill: 'SKILL.md',
  skillPro: 'SKILL_PROFESSIONAL.md',
  referencesDir: 'references',
  openaiMetadata: 'agents/openai.yaml',
};

const REFERENCE_FILES = {
  core: 'core-patterns.md',
  technical: 'technical.md',
  academic: 'academic.md',
  governance: 'governance.md',
  reasoning: 'reasoning-failures.md',
};

const STANDARD_DESCRIPTION = `Remove signs of AI-generated writing from text. Use when editing or reviewing text to make it sound more natural and human-written. Based on Wikipedia's "Signs of AI writing" guide. Detects and fixes inflated symbolism, promotional language, superficial -ing analyses, vague attributions, em dash overuse, rule of three, AI vocabulary, negative parallelisms, reasoning failures, and LLM artifacts. Includes severity classification, technical literal preservation, and density-aware detection guidance.`;

/**

* Read module file with error handling
* @param {string} modulePath
* @param {boolean} [required]
* @returns {string|null}
 */
function readModule(modulePath, required = false) {
  const fullPath = path.join(ROOT_DIR, modulePath);

  if (!fs.existsSync(fullPath)) {
    if (required) {
      throw new Error(`Required module not found: ${modulePath}`);
    }
    console.log(`⚠️  Module not found: ${modulePath} (optional)`);
    return null;
  }

  console.log(`✓ Reading module: ${modulePath}`);
  // Normalize transport line endings before section parsing so Windows
  // checkouts and Unix CI produce identical compiled skill artifacts.
  return fs.readFileSync(fullPath, 'utf-8').replace(/\r\n?/g, '\n');
}

/**

* Extract frontmatter key/value pairs from module YAML
* @param {string} content
* @returns {Record<string, string>|null}
 */
function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const frontmatter = {};
  for (const line of match[1].split('\n')) {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      frontmatter[key.trim()] = valueParts.join(':').trim();
    }
  }

  return frontmatter;
}

/**
 * Update a scalar field inside YAML frontmatter (adapter_metadata block or top-level).
 * @param {string} filePath
 * @param {string} key
 * @param {string} value
 */
function syncYamlFrontmatterField(filePath, key, value) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const pattern = new RegExp(`^(\\s*${key}:\\s*)(.+)$`, 'm');
  if (!pattern.test(content)) {
    return;
  }

  const updated = content.replace(pattern, `$1${value}`);
  if (updated !== content) {
    fs.writeFileSync(filePath, updated, 'utf8');
    console.log(`✓ Synced ${path.basename(filePath)} ${key} → ${value}`);
  }
}

/**
 * Propagate skill version from module frontmatter to repo manifests.
 * @param {string} version
 */
function syncRepoVersion(version) {
  const pkgPath = path.join(ROOT_DIR, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  if (pkg.version !== version) {
    pkg.version = version;
    fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');
    console.log(`✓ Synced package.json version → ${version}`);
  }

  const lockPath = path.join(ROOT_DIR, 'package-lock.json');
  if (fs.existsSync(lockPath)) {
    const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
    let lockChanged = false;

    if (lock.version !== version) {
      lock.version = version;
      lockChanged = true;
    }

    if (lock.packages?.[''] && lock.packages[''].version !== version) {
      lock.packages[''].version = version;
      lockChanged = true;
    }

    if (lockChanged) {
      fs.writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`, 'utf8');
      console.log(`✓ Synced package-lock.json version → ${version}`);
    }
  }

  const syncedDate = new Date().toISOString().slice(0, 10);
  syncYamlFrontmatterField(path.join(ROOT_DIR, 'AGENTS.md'), 'skill_version', version);
  syncYamlFrontmatterField(path.join(ROOT_DIR, 'AGENTS.md'), 'last_synced', syncedDate);
}

/**

* @param {string} content
* @returns {string}
 */
function stripFrontmatter(content) {
  return content.replace(/^---\s*[\s\S]*?^---\s*/m, '');
}

/**
 * Add a compact table of contents to long generated references.
 * @param {string} content
 * @returns {string}
 */
function addReferenceNavigation(content) {
  if (content.split('\n').length < 200) {
    return content;
  }

  const headings = [...content.matchAll(/^## (.+)$/gm)].map(([, heading]) => heading);
  if (headings.length < 2) {
    return content;
  }

  const links = headings.map((heading) => {
    const anchor = heading
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    return `- [${heading}](#${anchor})`;
  });
  const firstSection = content.search(/^## /m);
  return `${content.slice(0, firstSection).trimEnd()}\n\n## Navigation\n\n${links.join('\n')}\n\n${content.slice(firstSection)}`;
}

/**

* @param {string} content
* @param {string} startHeading
* @param {string|null} [endMarker]
* @returns {string}
 */
function extractSection(content, startHeading, endMarker = null) {
  const startToken = `\n## ${startHeading}\n`;
  const start = content.indexOf(startToken);
  if (start === -1) {
    return '';
  }

  const sliceStart = start + 1;
  if (!endMarker) {
    return content.slice(sliceStart).trim();
  }

  const end = content.indexOf(endMarker, sliceStart);
  if (end === -1) {
    return content.slice(sliceStart).trim();
  }

  return content.slice(sliceStart, end).trim();
}

/**

* @param {string} strippedCore
* @returns {string}
 */
function buildStandardIntro(strippedCore) {
  const contentPatternsIdx = strippedCore.indexOf('\n## CONTENT PATTERNS\n');
  if (contentPatternsIdx === -1) {
    throw new Error('Core module is missing ## CONTENT PATTERNS section');
  }

  const intro = strippedCore.slice(0, contentPatternsIdx).trim();
  return intro.replace('# Module: Core Patterns', '# Authentext: Remove AI Writing Patterns');
}

/**

* @param {{ name: string, version: string, description: string }} options
* @returns {string}
 */
function buildAgentSkillsFrontmatter({ name, version, description }) {
  return `---
name: ${name}
description: ${JSON.stringify(description)}
license: MIT
metadata:
  version: ${JSON.stringify(version)}
---

`;
}

/**
 * Build the optional OpenAI host overlay. The portable Agent Skills contract
 * remains in SKILL.md; this generated file only supplies host presentation and
 * invocation policy.
 * @returns {string}
 */
function buildOpenAiMetadata() {
  return `interface:
  display_name: "Authentext"
  short_description: "Rewrite prose naturally while preserving meaning and literals"
  default_prompt: "Use $authentext to rewrite this text naturally while preserving its meaning and technical literals."

policy:
  products:
    - "CHAT"
    - "CODEX"
  allow_implicit_invocation: true
`;
}

/**

* @param {Record<string, string|null>} modules
 */
function writeReferenceTree(modules) {
  const referencesDir = path.join(ROOT_DIR, OUTPUT.referencesDir);
  fs.mkdirSync(referencesDir, { recursive: true });

  for (const [key, filename] of Object.entries(REFERENCE_FILES)) {
    const moduleContent = modules[key];
    if (!moduleContent) {
      continue;
    }

    const body = addReferenceNavigation(stripFrontmatter(moduleContent).trim());
    const targetPath = path.join(referencesDir, filename);
    fs.writeFileSync(targetPath, `${body}\n`, 'utf-8');
    console.log(`✓ Written: ${OUTPUT.referencesDir}/${filename}`);
  }
}

/**

 * @param {Record<string, string|null>} modules
 * @returns {string}
 */
function compileStandardSkill(modules) {
  console.log('\n=== Compiling Standard Authentext ===');

  const coreFrontmatter = extractFrontmatter(modules.core);
  const version = coreFrontmatter?.version || '3.0.0';
  const strippedCore = stripFrontmatter(modules.core);

  const intro = buildStandardIntro(strippedCore);
  const severity = extractSection(
    strippedCore,
    'SEVERITY CLASSIFICATION',
    '\n---\n\n_Module Version'
  );
  const detection = extractSection(strippedCore, 'DETECTION GUIDANCE');

  const referenceLinks = [
    '- [Core patterns (39 patterns, before/after examples)](references/core-patterns.md)',
    modules.technical && '- [Technical writing and literal preservation](references/technical.md)',
    modules.academic && '- [Academic and research prose](references/academic.md)',
    modules.governance && '- [Policy, governance, and compliance prose](references/governance.md)',
    modules.reasoning &&
      '- [Reasoning failures and self-contradictions](references/reasoning-failures.md)',
  ].filter(Boolean);

  const body = `${intro}

## Routing by task and content type

Route in two stages. Do not load a content reference until both stages are
classified.

### Stage 1: Operation

- **Rewrite:** Return revised prose. Preserve meaning, coverage, voice,
  technical literals, citations, and epistemic qualifiers.
- **Review:** Return findings tied to specific passages with proposed changes.
  Do not silently rewrite the source.
- **Both:** Return the review first, then a clearly separated revision.

If the request does not make the operation clear, infer it from the requested
output. Ask only when review versus rewrite would materially change the result.

### Stage 2: Material

Apply the root workflow for every task, then load only the references matching
the material:

- Technical documentation or code-adjacent prose: read
  [technical.md](references/technical.md).
- Papers, manuscripts, citations, or research prose: read
  [academic.md](references/academic.md).
- Policy, governance, legal, risk, or compliance prose: read
  [governance.md](references/governance.md).
- Claims with contradictions or reasoning failures: read
  [reasoning-failures.md](references/reasoning-failures.md).

Load more than one content reference only when the material genuinely crosses
domains. Reasoning guidance supplements a content reference; it does not replace
technical, academic, or governance rules.

For low-density or clearly human-authored prose, make only the smallest
defensible edits.

## Reference material

Read these files for the full pattern catalog, examples, and remediation guidance:

${referenceLinks.join('\n')}

Apply the relevant patterns from the selected reference files. This root skill
keeps workflow, severity tiers, and detection guardrails; the references hold
the detailed pattern definitions.

${severity}

${detection}
`;

  return (
    buildAgentSkillsFrontmatter({
      name: 'authentext',
      version,
      description: STANDARD_DESCRIPTION,
    }) + body
  );
}

/**

* @param {Record<string, string|null>} modules
* @returns {string}
 */
function compileProfessionalSkill(modules) {
  console.log('\n=== Compiling Authentext Professional Reference ===');

  const availableReferences = Object.entries(REFERENCE_FILES)
    .filter(([key]) => modules[key])
    .map(([, filename]) => filename);

  const moduleLinks = [
    '- [Core patterns](references/core-patterns.md) — always apply',
    modules.technical && '- [Technical module](references/technical.md) — code and technical docs',
    modules.academic && '- [Academic module](references/academic.md) — papers and formal research',
    modules.governance && '- [Governance module](references/governance.md) — policy and compliance',
    modules.reasoning &&
      '- [Reasoning module](references/reasoning-failures.md) — reasoning failures and contradictions',
  ]
    .filter(Boolean)
    .join('\n');

  const introduction = `# Authentext Professional Routing Reference

This generated reference is not a separately discoverable Agent Skill.
The authoritative runtime entry point is [SKILL.md](SKILL.md), which owns
activation and routing. Use this file as supplementary professional-editing
guidance when the main skill selects a technical, academic, governance, or
client-facing route.

## Professional editing profile

Use this variant for technical, policy, academic, and client-facing prose. Keep the text precise, restrained, and readable.

## Reference modules

${moduleLinks}

## ROUTING LOGIC

1. Analyze input context:
   * Code or technical docs -> Core + Technical
   * Papers, essays, or formal research -> Core + Academic
   * Policy, risk, or compliance writing -> Core + Governance
   * Reasoning failures or self-contradictions -> Core + Reasoning
   * Otherwise -> Core only

2. Open the linked reference files for the selected modules and apply their patterns.

## Professional Tone

* Prefer direct, precise phrasing.
* Keep technical terms when they are accurate.
* Avoid decorative language, stock transitions, and inflated claims.
* Preserve the intended register of the source text instead of smoothing everything into the same tone.

## Your Task

When given text to humanize:

1. **Identify AI patterns** - Scan the reference modules for the patterns that apply
2. **Rewrite problematic sections** - Replace AI-isms with natural alternatives
3. **Preserve meaning** - Keep the core message intact
4. **Maintain voice** - Match the intended tone (formal, casual, technical, etc.)
5. **Refine voice** - Keep the result clear, specific, and professional

---

## CLARITY AND TONE

Removing AI patterns is necessary but not sufficient. What remains needs to actually read well.

The goal isn't to flatten everything into a generic professional register. Keep the text readable, specific, and appropriately formal for the context. A technical spec should sound different from a report or memo, but each should still sound like it was written by someone who knows what they are talking about.

### Signs the writing is still flat

* Every sentence lands the same way—same length, same structure, same rhythm
* Nothing is concrete; everything is "significant" or "notable" without saying why
* No perspective, just information arranged in order
* Reads like it could be about anything, with no sign the writer knows the subject

### What to aim for

Vary sentence rhythm with short and long lines. Use specific details instead of vague assertions. Keep the point of view clear. Read it aloud if the prose feels too polished or too flat.

---

**Clarity over filler.** Use simple active verbs (\`is\`, \`has\`, \`shows\`) instead of filler phrases (\`stands as a testament to\`).

### Technical Nuance

**Expertise isn't slop.** In professional contexts, "crucial" or "pivotal" are sometimes the exact right words for a technical requirement. The Pro variant targets lazy patterns, not technical precision. If a word is required for accuracy, keep it. If it's there to add fake gravitas, cut it.

---

## Severity and detection guardrails

For severity tiers and false-positive guidance, read [Core patterns](references/core-patterns.md) (sections **SEVERITY CLASSIFICATION** and **DETECTION GUIDANCE**).

Available reference files: ${availableReferences.join(', ')}.
`;

  return introduction;
}

/**

* Main compilation process
 */
function compile() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║  Authentext Skill Compiler (ADR-001)   ║');
  console.log('╚════════════════════════════════════════╝');

  try {
    const modules = {
      core: readModule(MODULES.core, true),
      technical: readModule(MODULES.technical),
      academic: readModule(MODULES.academic),
      governance: readModule(MODULES.governance),
      reasoning: readModule(MODULES.reasoning),
    };

    const skillVersion = extractFrontmatter(modules.core)?.version ?? '3.0.0';
    syncRepoVersion(skillVersion);

    writeReferenceTree(modules);

    const skillContent = compileStandardSkill(modules);
    const skillPath = path.join(ROOT_DIR, OUTPUT.skill);
    fs.writeFileSync(skillPath, skillContent, 'utf-8');
    console.log(`✓ Written: ${OUTPUT.skill} (${skillContent.split('\n').length} lines)`);

    const proContent = compileProfessionalSkill(modules);
    const proPath = path.join(ROOT_DIR, OUTPUT.skillPro);
    fs.writeFileSync(proPath, proContent, 'utf-8');
    console.log(`✓ Written: ${OUTPUT.skillPro} (${proContent.split('\n').length} lines)`);

    const openaiMetadataPath = path.join(ROOT_DIR, OUTPUT.openaiMetadata);
    fs.mkdirSync(path.dirname(openaiMetadataPath), { recursive: true });
    fs.writeFileSync(openaiMetadataPath, buildOpenAiMetadata(), 'utf-8');
    console.log(`✓ Written: ${OUTPUT.openaiMetadata}`);

    console.log('\n╔════════════════════════════════════════╗');
    console.log('║  ✓ Compilation Complete              ║');
    console.log('╚════════════════════════════════════════╝');
    console.log(`\nVersion: ${skillVersion}`);
    console.log(
      'Output: Agent Skills package (SKILL.md + references/) with optional host metadata'
    );
  } catch (error) {
    console.error('\n❌ Compilation failed:');
    console.error(error.message);
    process.exit(1);
  }
}

compile();

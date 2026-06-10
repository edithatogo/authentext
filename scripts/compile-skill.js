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
};

const REFERENCE_FILES = {
  core: 'core-patterns.md',
  technical: 'technical.md',
  academic: 'academic.md',
  governance: 'governance.md',
  reasoning: 'reasoning-failures.md',
};

const STANDARD_DESCRIPTION = `Remove signs of AI-generated writing from text. Use when editing or reviewing text to make it sound more natural and human-written. Based on Wikipedia's "Signs of AI writing" guide. Detects and fixes inflated symbolism, promotional language, superficial -ing analyses, vague attributions, em dash overuse, rule of three, AI vocabulary, negative parallelisms, reasoning failures, and LLM artifacts. Includes severity classification, technical literal preservation, and density-aware detection guidance.`;

const PRO_DESCRIPTION = `Remove signs of AI-generated writing for professional, technical, academic, and policy prose. Use when editing client-facing or formal text that must stay precise and restrained. Routes across core, technical, academic, and governance pattern modules plus reasoning-failure detection. Based on Wikipedia's "Signs of AI writing" guide with severity classification and literal preservation rules.`;

const COMPATIBILITY =
  'Requires an agent host that supports the Agent Skills format and Read, Write, Edit, Grep, and Glob tools (Claude Code, Cursor, Codex CLI, Gemini CLI, GitHub Copilot, and compatible hosts).';

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
  return fs.readFileSync(fullPath, 'utf-8');
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

* @param {string} content
* @returns {string}
 */
function stripFrontmatter(content) {
  return content.replace(/^---\s*[\s\S]*?^---\s*/m, '');
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
  return intro.replace('# Module: Core Patterns', '# Humanizer: Remove AI Writing Patterns');
}

/**

* @param {{ name: string, version: string, description: string }} options
* @returns {string}
 */
function buildAgentSkillsFrontmatter({ name, version, description }) {
  return `---
name: ${name}
version: ${version}
description: ${description}
license: MIT
compatibility: ${COMPATIBILITY}
allowed-tools:

* Read
* Write
* Edit
* Grep
* Glob
* AskUserQuestion

---

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

    const body = stripFrontmatter(moduleContent).trim();
    const targetPath = path.join(referencesDir, filename);
    fs.writeFileSync(targetPath, `${body}\n`, 'utf-8');
    console.log(`✓ Written: ${OUTPUT.referencesDir}/${filename}`);
  }
}

/**

* @param {string} coreModule
* @param {boolean} hasReasoning
* @returns {string}
 */
function compileStandardSkill(coreModule, hasReasoning) {
  console.log('\n=== Compiling Standard Humanizer ===');

  const coreFrontmatter = extractFrontmatter(coreModule);
  const version = coreFrontmatter?.version || '3.0.0';
  const strippedCore = stripFrontmatter(coreModule);

  const intro = buildStandardIntro(strippedCore);
  const severity = extractSection(
    strippedCore,
    'SEVERITY CLASSIFICATION',
    '\n---\n\n_Module Version'
  );
  const detection = extractSection(strippedCore, 'DETECTION GUIDANCE');

  const referenceLinks = [
    '- [Core patterns (39 patterns, before/after examples)](references/core-patterns.md)',
  ];
  if (hasReasoning) {
    referenceLinks.push(
      '- [Reasoning failures and self-contradictions](references/reasoning-failures.md)'
    );
  }

  const body = `${intro}

## Reference material

Read these files for the full pattern catalog, examples, and remediation guidance:

${referenceLinks.join('\n')}

Apply every pattern in the reference files when humanizing text. This root skill keeps workflow, severity tiers, and detection guardrails; the references hold the exhaustive pattern definitions.

${severity}

${detection}
`;

  return (
    buildAgentSkillsFrontmatter({
      name: 'humanizer',
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
  console.log('\n=== Compiling Humanizer Pro ===');

  const coreFrontmatter = extractFrontmatter(modules.core);
  const version = coreFrontmatter?.version || '3.0.0';

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

  const introduction = `# Humanizer: Remove AI Writing Patterns

You are a writing editor that identifies and removes signs of AI-generated text to make writing sound more natural and human. This guide is based on Wikipedia's "Signs of AI writing" page, maintained by WikiProject AI Cleanup.

## Humanizer Pro: Professional Editing

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

  return (
    buildAgentSkillsFrontmatter({
      name: 'humanizer-pro',
      version,
      description: PRO_DESCRIPTION,
    }) + introduction
  );
}

/**

* Main compilation process
 */
function compile() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║  Humanizer Skill Compiler (ADR-001)   ║');
  console.log('╚════════════════════════════════════════╝');

  try {
    const modules = {
      core: readModule(MODULES.core, true),
      technical: readModule(MODULES.technical),
      academic: readModule(MODULES.academic),
      governance: readModule(MODULES.governance),
      reasoning: readModule(MODULES.reasoning),
    };

    writeReferenceTree(modules);

    const skillContent = compileStandardSkill(modules.core, Boolean(modules.reasoning));
    const skillPath = path.join(ROOT_DIR, OUTPUT.skill);
    fs.writeFileSync(skillPath, skillContent, 'utf-8');
    console.log(`✓ Written: ${OUTPUT.skill} (${skillContent.split('\n').length} lines)`);

    const proContent = compileProfessionalSkill(modules);
    const proPath = path.join(ROOT_DIR, OUTPUT.skillPro);
    fs.writeFileSync(proPath, proContent, 'utf-8');
    console.log(`✓ Written: ${OUTPUT.skillPro} (${proContent.split('\n').length} lines)`);

    console.log('\n╔════════════════════════════════════════╗');
    console.log('║  ✓ Compilation Complete              ║');
    console.log('╚════════════════════════════════════════╝');
    console.log(`\nVersion: ${extractFrontmatter(modules.core)?.version ?? '3.0.0'}`);
    console.log('Output: Agent Skills package (SKILL.md + references/)');
  } catch (error) {
    console.error('\n❌ Compilation failed:');
    console.error(error.message);
    process.exit(1);
  }
}

compile();

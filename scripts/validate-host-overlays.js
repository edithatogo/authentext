#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { parse } from 'yaml';

const rootArg = process.argv.indexOf('--root');
const root = path.resolve(rootArg >= 0 ? process.argv[rootArg + 1] : process.cwd());
const overlayPath = path.join(root, 'agents', 'openai.yaml');
const portablePath = path.join(root, 'SKILL.md');
const errors = [];

function requireString(value, field) {
  if (typeof value !== 'string' || value.trim() === '') {
    errors.push(`${field} must be a non-empty string`);
  }
}

if (!fs.existsSync(overlayPath)) {
  errors.push('agents/openai.yaml is missing');
} else {
  try {
    const metadata = parse(fs.readFileSync(overlayPath, 'utf8'));
    requireString(metadata?.interface?.display_name, 'interface.display_name');
    requireString(metadata?.interface?.short_description, 'interface.short_description');
    if (metadata?.interface?.default_prompt !== undefined) {
      requireString(metadata.interface.default_prompt, 'interface.default_prompt');
    }

    const products = metadata?.policy?.products;
    if (products !== undefined) {
      const allowed = new Set(['CHAT', 'CODEX']);
      if (!Array.isArray(products) || products.some((product) => !allowed.has(product))) {
        errors.push('policy.products may contain only CHAT and CODEX');
      }
    }
    if (
      metadata?.policy?.allow_implicit_invocation !== undefined &&
      typeof metadata.policy.allow_implicit_invocation !== 'boolean'
    ) {
      errors.push('policy.allow_implicit_invocation must be boolean');
    }
    if (metadata?.dependencies !== undefined) {
      errors.push('dependencies are unsupported for this tool-free skill');
    }
  } catch (error) {
    errors.push(`agents/openai.yaml is invalid YAML: ${error.message}`);
  }
}

if (fs.existsSync(portablePath)) {
  const portable = fs.readFileSync(portablePath, 'utf8');
  const match = portable.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (match && /^(interface|policy|dependencies):/m.test(match[1])) {
    errors.push('OpenAI host fields must not appear in SKILL.md frontmatter');
  }
}

if (errors.length > 0) {
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('OpenAI host overlay validation passed.');

#!/usr/bin/env node
/**
 * install-mcp-server.js
 *
 * Registers the Humanizer MCP Server with the host agent's MCP configuration.
 *
 * Supports:
 *   - Claude Desktop: ~/Library/Application Support/Claude/claude_desktop_config.json (macOS)
 *                     %APPDATA%\Claude\claude_desktop_config.json (Windows)
 *   - Cursor: .cursor/mcp.json in the target repo
 *   - Generic: prints the JSON block to add manually
 *
 * Run: npm run install:mcp-server
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const MCP_SERVER_PATH = path.join(
  REPO_ROOT,
  'skills',
  'authentext-orchestrate',
  'lib',
  'mcp-server.js'
);

const MCP_ENTRY = {
  authentext: {
    command: 'node',
    args: [MCP_SERVER_PATH],
    description: 'Authentext V4 - 8-skill modular humanization suite',
  },
};

console.log('=== Authentext MCP Server Installer ===\n');
console.log('MCP Server path:', MCP_SERVER_PATH);

// --- Claude Desktop ---
const claudeConfigPaths = [
  path.join(os.homedir(), 'AppData', 'Roaming', 'Claude', 'claude_desktop_config.json'), // Windows
  path.join(os.homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json'), // macOS
  path.join(os.homedir(), '.config', 'Claude', 'claude_desktop_config.json'), // Linux
];

let claudeInstalled = false;
for (const configPath of claudeConfigPaths) {
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      config.mcpServers = config.mcpServers || {};
      Object.assign(config.mcpServers, MCP_ENTRY);
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      console.log(`✓ Registered in Claude Desktop → ${configPath}`);
      claudeInstalled = true;
    } catch (e) {
      console.warn(`⚠ Could not update Claude config at ${configPath}: ${e.message}`);
    }
    break;
  }
}

if (!claudeInstalled) {
  console.log('ℹ Claude Desktop config not found (not installed or different path).');
}

// --- Cursor ---
const cursorConfig = path.join(process.cwd(), '.cursor', 'mcp.json');
if (fs.existsSync(path.dirname(cursorConfig))) {
  const existing = fs.existsSync(cursorConfig)
    ? JSON.parse(fs.readFileSync(cursorConfig, 'utf8'))
    : { mcpServers: {} };
  existing.mcpServers = existing.mcpServers || {};
  Object.assign(existing.mcpServers, MCP_ENTRY);
  fs.writeFileSync(cursorConfig, JSON.stringify(existing, null, 2));
  console.log(`✓ Registered in Cursor → ${cursorConfig}`);
}

// --- Manual fallback ---
console.log('\n--- Manual installation (any MCP-compatible agent) ---');
console.log("Add this to your agent's MCP config file:\n");
console.log(JSON.stringify({ mcpServers: MCP_ENTRY }, null, 2));
console.log('\nDocs: https://modelcontextprotocol.io/docs/concepts/clients');

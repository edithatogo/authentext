#!/usr/bin/env node
import path from 'node:path';
import { maskDocument, ShieldError } from './lib/ast-shield.js';
import { parseArgs } from './lib/frontier-text.js';
import {
  readUtf8,
  assertDistinctPaths,
  writePrivate,
  isDirectExecution,
} from './lib/local-file-io.js';

export function main(argv = process.argv.slice(2)) {
  try {
    const args = parseArgs(argv, ['input', 'output', 'lockfile', 'format', 'json']);
    if (!args.input || !args.output || !args.lockfile)
      throw new Error('Requires --input, --output and --lockfile');
    assertDistinctPaths([args.input], [args.output, args.lockfile]);
    const format =
      !args.format || args.format === 'auto'
        ? path.extname(args.input).slice(1).toLowerCase()
        : args.format;
    const result = maskDocument(readUtf8(args.input), format);
    writePrivate(args.lockfile, `${JSON.stringify(result.lockfile, null, 2)}\n`);
    writePrivate(args.output, result.masked);
    process.stdout.write(
      `${JSON.stringify({ passed: true, format, protectedSpans: result.lockfile.locks.length, lockfileContainsPrivateText: true })}\n`
    );
  } catch (error) {
    process.stderr.write(`mask-ast: ${error.message}\n`);
    process.exitCode = error instanceof ShieldError ? 1 : 2;
  }
}
if (isDirectExecution(import.meta.url)) main();

#!/usr/bin/env node
import { unmaskDocument, ShieldError } from './lib/ast-shield.js';
import { parseArgs } from './lib/frontier-text.js';
import {
  readUtf8,
  assertDistinctPaths,
  writePrivate,
  isDirectExecution,
} from './lib/local-file-io.js';

export function main(argv = process.argv.slice(2)) {
  try {
    const args = parseArgs(argv, [
      'input',
      'output',
      'lockfile',
      'original',
      'json',
      'allow-duplicate-cites',
    ]);
    if (!args.input || !args.output || !args.lockfile)
      throw new Error('Requires --input, --output and --lockfile');
    assertDistinctPaths(
      [args.input, args.lockfile, ...(args.original ? [args.original] : [])],
      [args.output]
    );
    const result = unmaskDocument(readUtf8(args.input), JSON.parse(readUtf8(args.lockfile)), {
      allowDuplicateCites: args['allow-duplicate-cites'] === true,
      original: args.original ? readUtf8(args.original) : null,
    });
    writePrivate(args.output, result.text);
    const receipt = { ...result };
    delete receipt.text;
    process.stdout.write(`${JSON.stringify(receipt)}\n`);
  } catch (error) {
    process.stderr.write(`unmask-ast: ${error.message}\n`);
    process.exitCode = error instanceof ShieldError ? 1 : 2;
  }
}
if (isDirectExecution(import.meta.url)) main();

#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { maskDocument, ShieldError } from './lib/ast-shield.js';
import { readUtf8, distinctPaths, writePrivateBatch } from './lib/runtime-io.js';

function main() {
  try {
    const { values } = parseArgs({
      options: {
        input: { type: 'string' },
        output: { type: 'string' },
        lockfile: { type: 'string' },
        format: { type: 'string', default: 'auto' },
      },
      strict: true,
    });
    if (!values.input || !values.output || !values.lockfile)
      throw new TypeError('Requires --input, --output and --lockfile');
    distinctPaths([values.input, values.output, values.lockfile]);
    const format =
      values.format === 'auto'
        ? path.extname(values.input).slice(1).toLowerCase()
        : values.format.toLowerCase();
    const result = maskDocument(readUtf8(values.input), format);
    writePrivateBatch([
      { file: values.output, text: result.masked },
      { file: values.lockfile, text: JSON.stringify(result.lockfile, null, 2) + '\n' },
    ]);
    process.stdout.write(
      JSON.stringify({
        passed: true,
        format,
        protectedSpans: result.lockfile.entries.length,
        sourceSha256: result.lockfile.sourceSha256,
        lockfileContainsPrivateSource: true,
      }) + '\n'
    );
  } catch (error) {
    process.stderr.write(
      JSON.stringify({ passed: false, code: error.code ?? 'USAGE_OR_IO', message: error.message }) +
        '\n'
    );
    process.exitCode = error instanceof ShieldError ? 1 : 2;
  }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();

#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { unmaskDocument, ShieldError } from './lib/ast-shield.js';
import { readUtf8, distinctPaths, writePrivate } from './lib/runtime-io.js';

function main() {
  let json = false;
  try {
    const { values } = parseArgs({
      options: {
        input: { type: 'string' },
        output: { type: 'string' },
        lockfile: { type: 'string' },
        json: { type: 'boolean' },
        'allow-duplicate-cites': { type: 'boolean' },
        'source-sha256': { type: 'string' },
      },
      strict: true,
    });
    json = values.json === true;
    if (!values.input || !values.output || !values.lockfile)
      throw new TypeError('Requires --input, --output and --lockfile');
    distinctPaths([values.input, values.output, values.lockfile]);
    const result = unmaskDocument(readUtf8(values.input), JSON.parse(readUtf8(values.lockfile)), {
      allowDuplicateCites: values['allow-duplicate-cites'],
      expectedSourceSha256: values['source-sha256'],
    });
    writePrivate(values.output, result.text);
    const receipt = { ...result };
    delete receipt.text;
    process.stdout.write(JSON.stringify(receipt, null, json ? 0 : 2) + '\n');
  } catch (error) {
    const message =
      JSON.stringify({ passed: false, code: error.code ?? 'USAGE_OR_IO', message: error.message }) +
      '\n';
    (json ? process.stdout : process.stderr).write(message);
    process.exitCode = error instanceof ShieldError ? 1 : 2;
  }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();

import fs from 'node:fs';
import path from 'node:path';
import { TextDecoder } from 'node:util';

export function readUtf8(file) {
  const stat = fs.lstatSync(file);
  if (!stat.isFile() || stat.isSymbolicLink())
    throw new Error('Input must be a regular, non-symlink file');
  if (stat.size > 64 * 1024 * 1024) throw new Error('Input exceeds 64 MiB');
  return new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(fs.readFileSync(file));
}

export function assertDistinctPaths(inputs, outputs) {
  const identities = [...inputs, ...outputs].map((file) => {
    const absolute = path.resolve(file);
    if (fs.existsSync(absolute)) {
      if (fs.lstatSync(absolute).isSymbolicLink())
        throw new Error('Symlink paths are not permitted');
      return fs.realpathSync(absolute);
    }
    return path.join(fs.realpathSync(path.dirname(absolute)), path.basename(absolute));
  });
  if (new Set(identities).size !== identities.length)
    throw new Error('Input and output paths must be distinct');
}

export function writePrivate(file, content) {
  const directory = path.dirname(path.resolve(file));
  const temporary = fs.mkdtempSync(path.join(directory, '.authentext-'));
  const staged = path.join(temporary, 'output');
  try {
    fs.writeFileSync(staged, content, { encoding: 'utf8', mode: 0o600, flag: 'wx' });
    fs.renameSync(staged, file);
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}

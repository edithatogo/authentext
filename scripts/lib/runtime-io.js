import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { TextDecoder } from 'node:util';

export function readUtf8(file) {
  const stat = fs.lstatSync(file);
  if (!stat.isFile() || stat.isSymbolicLink())
    throw new TypeError('Input must be a regular, non-symlink file');
  if (stat.size > 16 * 1024 * 1024) throw new RangeError('Input exceeds the 16 MiB safety limit');
  // Fatal decoding prevents accidental replacement of invalid source bytes.
  return new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(fs.readFileSync(file));
}
export function distinctPaths(files) {
  const canonical = files.map((file) => {
    const resolved = path.resolve(file);
    if (fs.existsSync(resolved)) return fs.realpathSync(resolved);
    let parent = path.dirname(resolved),
      suffix = path.basename(resolved);
    while (!fs.existsSync(parent)) {
      suffix = path.join(path.basename(parent), suffix);
      parent = path.dirname(parent);
    }
    return path.join(fs.realpathSync(parent), suffix);
  });
  if (new Set(canonical).size !== files.length)
    throw new TypeError('Input, output and lockfile paths must be distinct');
}
export function writePrivate(file, text) {
  const target = path.resolve(file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  if (
    fs.existsSync(target) &&
    (!fs.lstatSync(target).isFile() || fs.lstatSync(target).isSymbolicLink())
  )
    throw new TypeError('Output must not be a symlink or directory');
  const temp = path.join(
    path.dirname(target),
    '.' + path.basename(target) + '.' + crypto.randomUUID() + '.tmp'
  );
  try {
    fs.writeFileSync(temp, text, { encoding: 'utf8', mode: 0o600, flag: 'wx' });
    fs.renameSync(temp, target);
  } finally {
    if (fs.existsSync(temp)) fs.unlinkSync(temp);
  }
}

// Stage every destination before publication. This handles ordinary I/O
// failures with rollback; it is not a crash-atomic multi-file transaction.
export function writePrivateBatch(entries) {
  distinctPaths(entries.map(({ file }) => file));
  const staged = [];
  try {
    for (const { file, text } of entries) {
      const target = path.resolve(file);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      let existing = false;
      try {
        const stat = fs.lstatSync(target);
        if (!stat.isFile() || stat.isSymbolicLink())
          throw new TypeError('Output must not be a symlink or directory');
        existing = true;
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
      const stem = path.join(
        path.dirname(target),
        '.' + path.basename(target) + '.' + crypto.randomUUID()
      );
      const item = {
        target,
        temp: stem + '.tmp',
        backup: existing ? stem + '.bak' : null,
        published: false,
        retainBackup: false,
      };
      staged.push(item);
      fs.writeFileSync(item.temp, text, { encoding: 'utf8', mode: 0o600, flag: 'wx' });
      if (item.backup) {
        fs.copyFileSync(target, item.backup, fs.constants.COPYFILE_EXCL);
        fs.chmodSync(item.backup, 0o600);
      }
    }
    for (const item of staged) {
      fs.renameSync(item.temp, item.target);
      item.published = true;
    }
  } catch (error) {
    const failures = [];
    for (const item of [...staged].reverse()) {
      if (!item.published) continue;
      try {
        if (item.backup) fs.renameSync(item.backup, item.target);
        else fs.unlinkSync(item.target);
      } catch (rollbackError) {
        item.retainBackup = true;
        failures.push(rollbackError);
      }
    }
    if (failures.length)
      throw new AggregateError(
        [error, ...failures],
        'Publication failed; private recovery backups retained'
      );
    throw error;
  } finally {
    for (const item of staged) {
      if (fs.existsSync(item.temp)) fs.unlinkSync(item.temp);
      if (item.backup && !item.retainBackup && fs.existsSync(item.backup))
        fs.unlinkSync(item.backup);
    }
  }
}

import crypto from 'node:crypto';

// This is a conservative lexical span shield, not a full compiler or AST parser.
// Unknown/malformed syntax is a review boundary. No source code is executed.
const FORMATS = new Set(['md', 'qmd', 'rmd', 'typ', 'tex']);
const ROLES = new Set(['CITE', 'NCITE', 'REF', 'INLINE', 'BLOCK']);
const TOKEN = /\[\[AST_(?:CITE|NCITE|REF|INLINE|BLOCK)_\d{4,}\]\]/gu;
const sha = (value) => crypto.createHash('sha256').update(value).digest('hex');
const isEscaped = (s, i) => {
  let n = 0;
  while (i > 0 && s[--i] === '\\') n++;
  return n % 2 === 1;
};

export class ShieldError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ShieldError';
  }
}

function fail(message, offset) {
  throw new ShieldError(`${message}${offset === undefined ? '' : ` at offset ${offset}`}`);
}

function lineEnd(s, i) {
  const end = s.indexOf('\n', i);
  const result = end < 0 ? s.length : end;
  return s[result - 1] === '\r' ? result - 1 : result;
}

function blockCommentEnd(s, i) {
  let depth = 1;
  for (let p = i + 2; p < s.length - 1; p++) {
    if (s.startsWith('/*', p)) {
      depth++;
      p++;
    } else if (s.startsWith('*/', p)) {
      depth--;
      p++;
      if (!depth) return p + 1;
    }
  }
  fail('Unclosed comment syntax', i);
}

function quotedEnd(s, i) {
  for (let p = i + 1; p < s.length; p++) {
    if (s[p] === s[i] && !isEscaped(s, p)) return p + 1;
  }
  fail('Unclosed quoted string syntax', i);
}

function balancedEnd(s, i, format) {
  const pairs = { '(': ')', '[': ']', '{': '}' };
  const stack = [pairs[s[i]]];
  if (!stack[0]) fail('Expected opening delimiter', i);
  for (let p = i + 1; p < s.length; p++) {
    if (isEscaped(s, p)) continue;
    if (format === 'typ' && s.startsWith('//', p)) {
      p = lineEnd(s, p);
      continue;
    }
    if (format === 'typ' && s.startsWith('/*', p)) {
      p = blockCommentEnd(s, p) - 1;
      continue;
    }
    if (format === 'typ' && s[p] === '"') {
      p = quotedEnd(s, p) - 1;
      continue;
    }
    if (format === 'tex' && s[p] === '%') {
      p = lineEnd(s, p);
      continue;
    }
    if (pairs[s[p]]) stack.push(pairs[s[p]]);
    else if (Object.values(pairs).includes(s[p])) {
      if (stack.pop() !== s[p]) fail('Mismatched delimiter syntax', p);
      if (!stack.length) return p + 1;
    }
  }
  fail('Unclosed delimiter syntax', i);
}

function mathEnd(s, i, delimiter) {
  const closing = delimiter === '\\[' ? '\\]' : delimiter === '\\(' ? '\\)' : delimiter;
  for (let p = i + delimiter.length; p < s.length; p++) {
    if (s.startsWith(closing, p) && !isEscaped(s, p)) return p + closing.length;
  }
  fail('Unclosed math delimiter', i);
}

function fencedEnd(s, i, marker) {
  let p = s.indexOf('\n', i);
  while (p >= 0 && p < s.length - 1) {
    const next = p + 1;
    const end = lineEnd(s, next);
    if (new RegExp(`^\\s*${marker[0]}{${marker.length},}\\s*$`, 'u').test(s.slice(next, end)))
      return end;
    p = s.indexOf('\n', next);
  }
  fail('Unclosed fenced block', i);
}

function inlineCodeEnd(s, i) {
  const marker = /^`+/u.exec(s.slice(i))[0];
  let p = i + marker.length;
  while ((p = s.indexOf(marker, p)) >= 0) {
    if (s[p - 1] !== '`' && s[p + marker.length] !== '`') return p + marker.length;
    p += marker.length;
  }
  fail('Unclosed inline code syntax', i);
}

function typstCodeEnd(s, i) {
  const name = /^#(?:[\p{L}_][\p{L}\p{N}_.-]*|(?=[({\[]))/u.exec(s.slice(i));
  if (!name) fail('Unsupported Typst code syntax', i);
  let p = i + name[0].length;
  const statement = /^#(?:set|show|let|import|include|if|for|while|context)\b/u.test(name[0]);
  if (statement) {
    for (; p < s.length; p++) {
      if (s.startsWith('/*', p)) {
        p = blockCommentEnd(s, p) - 1;
        continue;
      }
      if (s.startsWith('//', p)) return lineEnd(s, p);
      if (s[p] === '"') {
        p = quotedEnd(s, p) - 1;
        continue;
      }
      if ('([{'.includes(s[p])) {
        p = balancedEnd(s, p, 'typ') - 1;
        continue;
      }
      if (' )]}'.trim().includes(s[p])) fail('Mismatched Typst code delimiter', p);
      if (s[p] === '\n' || s[p] === '\r') {
        if (/[=:,+\-*/]\s*$/u.test(s.slice(i, p))) continue;
        return p;
      }
    }
    return p;
  }
  while (p < s.length) {
    const next = /^[ \t]*(?=[([{])/u.exec(s.slice(p));
    if (!next) break;
    p += next[0].length;
    p = balancedEnd(s, p, 'typ');
  }
  return p;
}

function texCommandEnd(s, i) {
  const name = /^\\(?:[A-Za-z@]+\*?|[^\r\n])/u.exec(s.slice(i));
  if (!name) fail('Unsupported TeX command', i);
  let p = i + name[0].length;
  if (/^\\(?:input|include|bibliography)\*?$/u.test(name[0]) && !/^\s*[{[]/u.test(s.slice(p))) {
    const filename = /^\s+[^\s%{}]+/u.exec(s.slice(p));
    if (!filename) fail('Unsupported unbraced TeX file argument', i);
    return p + filename[0].length;
  }
  if (/^\\(?:newcommand|renewcommand|providecommand|def|gdef|edef|xdef)\*?$/u.test(name[0])) {
    const control = /^\s*\\[A-Za-z@]+(?:#[1-9])*/u.exec(s.slice(p));
    if (control) p += control[0].length;
  }
  while (p < s.length) {
    const space = /^\s*(?=[{[])/u.exec(s.slice(p));
    if (!space) break;
    p += space[0].length;
    p = balancedEnd(s, p, 'tex');
  }
  return p;
}

function texEnvironmentEnd(s, i, name) {
  // TeX interprets environment delimiters before arbitrary embedded language code.
  const re = /\\(begin|end)\{([^}]+)\}/gu;
  re.lastIndex = i;
  const stack = [];
  let match;
  while ((match = re.exec(s))) {
    if (isEscaped(s, match.index)) continue;
    if (match[1] === 'begin') stack.push(match[2]);
    else if (stack.pop() !== match[2]) fail('Mismatched TeX environment', match.index);
    if (!stack.length) return re.lastIndex;
  }
  fail(`Unclosed TeX environment ${name}`, i);
}

function roleForTex(command) {
  if (/^\\(?:textcite|citet)\b/u.test(command)) return 'NCITE';
  if (/^\\(?:cite[a-zA-Z]*|parencite|autocite|footcite|nocite)\b/u.test(command)) return 'CITE';
  if (/^\\(?:[cC]ref|eqref|autoref|pageref|ref|label)\b/u.test(command)) return 'REF';
  return 'INLINE';
}

function htmlEnd(source, start) {
  const opening = /^<\/?([A-Za-z][A-Za-z0-9-]*)(?=[\s/>])/u.exec(source.slice(start));
  if (!opening) return null;
  let end = start + opening[0].length;
  for (; end < source.length; end++) {
    if (source[end] === '"' || source[end] === "'") {
      end = quotedEnd(source, end) - 1;
      continue;
    }
    if (source[end] === '>') {
      end++;
      break;
    }
  }
  if (end > source.length || source[end - 1] !== '>') fail('Unclosed HTML tag syntax', start);
  if (
    /^<(?:script|style|pre)\b/iu.test(source.slice(start)) &&
    !source.slice(start, end).endsWith('/>')
  ) {
    const closing = new RegExp('</' + opening[1] + '\\s*>', 'giu');
    closing.lastIndex = end;
    const match = closing.exec(source);
    if (!match) fail('Unclosed HTML raw block', start);
    return closing.lastIndex;
  }
  return end;
}

function validateTexStructure(source) {
  const stack = [];
  const textual = new Set([
    'document',
    'abstract',
    'itemize',
    'enumerate',
    'description',
    'quote',
    'quotation',
    'proof',
    'theorem',
  ]);
  for (let i = 0; i < source.length; i++) {
    if (isEscaped(source, i)) continue;
    if (source[i] === '%') {
      i = lineEnd(source, i);
      continue;
    }
    const match = /^\\(begin|end)\{([^}]+)\}/u.exec(source.slice(i));
    if (!match) continue;
    if (match[1] === 'begin' && !textual.has(match[2])) {
      i = texEnvironmentEnd(source, i, match[2]) - 1;
      continue;
    }
    if (match[1] === 'begin') stack.push(match[2]);
    else if (stack.pop() !== match[2]) fail('Invalid TeX environment structure', i);
    i += match[0].length - 1;
  }
  if (stack.length) fail('Unclosed TeX document structure');
}

/** Extract non-overlapping spans. Balanced scanners deliberately over-protect. */
export function extractProtectedSpans(source, format = 'md') {
  if (!FORMATS.has(format)) fail('Unsupported document format');
  if (typeof source !== 'string' || Buffer.byteLength(source, 'utf8') > 64 * 1024 * 1024)
    fail('Invalid or oversized source');
  const spans = [];
  const add = (start, end, role) => {
    spans.push({ start, end, role });
    return end;
  };
  let i = 0;
  const divs = [];
  if (source.charCodeAt(0) === 0xfeff) i = 1;
  if (format !== 'typ' && format !== 'tex' && /^---\r?\n/u.test(source.slice(i))) {
    const closing = /^---\r?\n[\s\S]*?\r?\n(?:---|\.\.\.)(?=\r?\n|$)/u.exec(source.slice(i));
    if (!closing) fail('Unclosed frontmatter', i);
    i = add(i, i + closing[0].length, 'BLOCK');
  }
  while (i < source.length) {
    const rest = source.slice(i);
    const beginning = i === 0 || source[i - 1] === '\n';
    if (beginning && format !== 'tex') {
      const fence = /^[ \t]*(`{3,}|~{3,})[^\r\n]*/u.exec(rest);
      if (fence) {
        i = add(i, fencedEnd(source, i, fence[1]), 'BLOCK');
        continue;
      }
      if (format !== 'typ') {
        const div = /^[ \t]*(:{3,})([^\r\n]*)/u.exec(rest);
        if (div) {
          if (div[2].trim()) divs.push(div[1]);
          else if (!divs.pop()) fail('Unmatched fenced-div delimiter', i);
          i = add(i, i + div[0].length, 'BLOCK');
          continue;
        }
      }
    }
    if (isEscaped(source, i)) {
      i++;
      continue;
    }
    if (source.startsWith('<!--', i) && format !== 'tex') {
      const end = source.indexOf('-->', i + 4);
      if (end < 0) fail('Unclosed HTML comment', i);
      i = add(i, end + 3, 'BLOCK');
      continue;
    }
    if (['md', 'qmd', 'rmd'].includes(format) && rest[0] === '<') {
      const end = htmlEnd(source, i);
      if (end !== null) {
        i = add(i, end, /^<(?:script|style|pre)\b/iu.test(rest) ? 'BLOCK' : 'INLINE');
        continue;
      }
    }
    if (format === 'typ') {
      if (rest.startsWith('//')) {
        i = add(i, lineEnd(source, i), 'INLINE');
        continue;
      }
      if (rest.startsWith('/*')) {
        i = add(i, blockCommentEnd(source, i), 'INLINE');
        continue;
      }
      if (rest[0] === '#') {
        const role = /^#cite\b/u.test(rest)
          ? 'CITE'
          : /^#ref\b/u.test(rest)
            ? 'REF'
            : beginning
              ? 'BLOCK'
              : 'INLINE';
        i = add(i, typstCodeEnd(source, i), role);
        continue;
      }
      const label = /^<[\p{L}\p{N}_:.\-]+>/u.exec(rest);
      if (label) {
        i = add(i, i + label[0].length, 'REF');
        continue;
      }
    }
    if (format === 'tex') {
      if (rest[0] === '%') {
        i = add(i, lineEnd(source, i), 'INLINE');
        continue;
      }
      if (/^\\documentclass\b/u.test(rest)) {
        const begin = rest.indexOf('\\begin{document}');
        if (begin < 0) fail('Preamble without document environment', i);
        i = add(i, i + begin + '\\begin{document}'.length, 'BLOCK');
        continue;
      }
      const env = /^\\begin\{([^}]+)\}/u.exec(rest);
      if (
        env &&
        ![
          'document',
          'abstract',
          'itemize',
          'enumerate',
          'description',
          'quote',
          'quotation',
          'proof',
          'theorem',
        ].includes(env[1])
      ) {
        i = add(i, texEnvironmentEnd(source, i, env[1]), 'BLOCK');
        continue;
      }
    }
    if (rest.startsWith('\\[') || rest.startsWith('\\(')) {
      i = add(i, mathEnd(source, i, rest.slice(0, 2)), rest[1] === '[' ? 'BLOCK' : 'INLINE');
      continue;
    }
    if (rest[0] === '$') {
      // Unescaped currency is ordinary prose in Markdown, but not TeX or Typst.
      if (
        ['md', 'qmd', 'rmd'].includes(format) &&
        /^\$\d[\d,]*(?:\.\d+)?(?:[.!?,;:](?:\s|$)|\s+(?:[\p{L}]|$)|$)/u.test(rest)
      ) {
        i++;
        continue;
      }
      const delimiter = rest.startsWith('$$') ? '$$' : '$';
      i = add(i, mathEnd(source, i, delimiter), delimiter.length === 2 ? 'BLOCK' : 'INLINE');
      continue;
    }
    if (rest[0] === '`' && format !== 'tex') {
      i = add(i, inlineCodeEnd(source, i), 'INLINE');
      continue;
    }
    if (rest[0] === '\\') {
      i = add(i, texCommandEnd(source, i), roleForTex(rest));
      continue;
    }
    if (rest[0] === '@' && (i === 0 || !/[\p{L}\p{N}_]/u.test(source[i - 1])) && format !== 'tex') {
      const cite = /^@[\p{L}\p{N}_][\p{L}\p{N}_:.\-]*/u.exec(rest);
      if (cite) {
        const key = cite[0].replace(/[.:]+$/u, '');
        let end = i + key.length;
        const locator = /^[ \t]*\[[^\]\r\n]*\]/u.exec(source.slice(end));
        if (locator && !locator[0].includes('@')) end += locator[0].length;
        const role = /^@(?:fig|tbl|sec|eq|lst|thm|lem|cor|prp|cnj|def|exm|exr|sol)[-:]/u.test(key)
          ? 'REF'
          : 'NCITE';
        i = add(i, end, role);
        continue;
      }
    }
    if (rest[0] === '[' && !['tex', 'typ'].includes(format)) {
      const end = balancedEnd(source, i, 'md');
      const inner = source.slice(i, end);
      if (
        /(?:^|[\s[;-])@[-\p{L}\p{N}_]/u.test(inner) ||
        /^\[\d+(?:[-,\u2013]\d+)*\]$/u.test(inner)
      ) {
        i = add(i, end, 'CITE');
        continue;
      }
      if (source[end] === '{' || source[end] === '(') {
        i = add(i, balancedEnd(source, end, 'md'), 'INLINE');
        continue;
      }
      i = end;
      continue;
    }
    if (rest[0] === '{') {
      // In TeX and Typst a brace-delimited region can change evaluation context.
      const end = balancedEnd(source, i, format);
      if (format === 'tex' || format === 'typ' || /^\{[.#]/u.test(rest)) {
        i = add(i, end, 'INLINE');
        continue;
      }
      i = end;
      continue;
    }
    if (rest[0] === '}') fail('Unmatched closing delimiter', i);
    i++;
  }
  if (divs.length) fail('Unclosed fenced-div syntax');
  return spans;
}

function envelopeHash(lockfile) {
  const body = { ...lockfile };
  delete body.integritySha256;
  return sha(JSON.stringify(body));
}

export function maskDocument(source, format = 'md') {
  if (source.includes('[[AST_')) fail('Reserved AST token collision in source');
  if (format === 'tex') validateTexStructure(source);
  const spans = extractProtectedSpans(source, format);
  const lineStarts = [0];
  for (let p = 0; p < source.length; p++) if (source[p] === '\n') lineStarts.push(p + 1);
  const line = (offset) => {
    let lo = 0,
      hi = lineStarts.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (lineStarts[mid] <= offset) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  };
  const locks = spans.map((span, index) => {
    const raw = source.slice(span.start, span.end);
    const before = source.slice(source.lastIndexOf('\n', span.start - 1) + 1, span.start);
    const after = source.slice(span.end, lineEnd(source, span.end));
    return {
      token: `[[AST_${span.role}_${String(index + 1).padStart(4, '0')}]]`,
      raw,
      sha256: sha(raw),
      role: span.role,
      startLine: line(span.start),
      endLine: line(Math.max(span.start, span.end - 1)),
      start: span.start,
      end: span.end,
      standalone: span.role === 'BLOCK' && /^\s*$/u.test(before) && /^\s*$/u.test(after),
    };
  });
  let cursor = 0;
  const pieces = [];
  for (const lock of locks) {
    pieces.push(source.slice(cursor, lock.start), lock.token);
    cursor = lock.end;
  }
  pieces.push(source.slice(cursor));
  const masked = pieces.join('');
  const lockfile = {
    schemaVersion: '1.0.0',
    format,
    parser: 'conservative-lexical-shield',
    offsetEncoding: 'utf16',
    sourceSha256: sha(source),
    maskedSha256: sha(masked),
    locks,
  };
  lockfile.integritySha256 = envelopeHash(lockfile);
  return { masked, lockfile };
}

export function unmaskDocument(
  masked,
  lockfile,
  { allowDuplicateCites = false, original = null } = {}
) {
  if (
    !lockfile ||
    lockfile.schemaVersion !== '1.0.0' ||
    !FORMATS.has(lockfile.format) ||
    !Array.isArray(lockfile.locks)
  )
    fail('Invalid lockfile schema');
  if (lockfile.integritySha256 !== envelopeHash(lockfile))
    fail('Lockfile integrity digest mismatch');
  if (original !== null && sha(original) !== lockfile.sourceSha256)
    fail('Original source hash mismatch');
  const seen = new Set();
  let lastEnd = -1;
  for (const lock of lockfile.locks) {
    if (
      !lock ||
      !ROLES.has(lock.role) ||
      typeof lock.raw !== 'string' ||
      !/^\[\[AST_(?:CITE|NCITE|REF|INLINE|BLOCK)_\d{4,}\]\]$/u.test(lock.token) ||
      seen.has(lock.token)
    )
      fail('Invalid or duplicate lock token');
    if (
      !lock.token.startsWith(`[[AST_${lock.role}_`) ||
      !Number.isInteger(lock.start) ||
      !Number.isInteger(lock.end) ||
      lock.start < lastEnd ||
      lock.end <= lock.start
    )
      fail('Invalid lock span ordering');
    if (sha(lock.raw) !== lock.sha256) fail(`Lock hash mismatch: ${lock.token}`);
    if (original !== null && original.slice(lock.start, lock.end) !== lock.raw)
      fail(`Source span mismatch: ${lock.token}`);
    lastEnd = lock.end;
    seen.add(lock.token);
  }
  const found = [...masked.matchAll(TOKEN)];
  const counts = new Map();
  for (const match of found) {
    if (!seen.has(match[0])) fail(`Unknown lock token: ${match[0]}`);
    counts.set(match[0], (counts.get(match[0]) || 0) + 1);
  }
  const residual = masked.replace(TOKEN, (token) => ' '.repeat(token.length));
  if (residual.includes('[[AST_')) fail('Malformed lock token');
  let previousBlock = -1;
  for (const lock of lockfile.locks) {
    const count = counts.get(lock.token) || 0;
    if (!count) fail(`Missing lock token: ${lock.token}`);
    if (count !== 1 && !(allowDuplicateCites && lock.role === 'CITE'))
      fail(`Duplicate lock token: ${lock.token}`);
    if (lock.role === 'BLOCK') {
      const position = masked.indexOf(lock.token);
      if (position < previousBlock) fail('Protected block order changed');
      previousBlock = position;
      if (lock.standalone) {
        const start = masked.lastIndexOf('\n', position - 1) + 1;
        const end = lineEnd(masked, position);
        if (masked.slice(start, end).trim() !== lock.token)
          fail(`Protected block must remain standalone: ${lock.token}`);
      }
    }
  }
  if (extractProtectedSpans(residual, lockfile.format).length)
    fail('New unmasked raw syntax in rewrite');
  const map = new Map(lockfile.locks.map((lock) => [lock.token, lock.raw]));
  const text = masked.replace(TOKEN, (token) => map.get(token));
  if (lockfile.format === 'tex') validateTexStructure(text);
  if (masked === undefined || typeof text !== 'string') fail('Invalid restored text');
  return {
    passed: true,
    text,
    restoredSpans: found.length,
    duplicateCitesAllowed: allowDuplicateCites,
    semanticReviewRequired: true,
  };
}

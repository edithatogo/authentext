import crypto from 'node:crypto';

// This is a bounded lexical shield, not a complete parser for any of these
// languages. It never executes code, expands macros, or loads include files.
const FORMATS = new Set(['md', 'qmd', 'rmd', 'typ', 'tex']);
const ROLES = new Set(['CITE', 'NCITE', 'REF', 'INLINE', 'BLOCK']);
const TOKEN = /\[\[AST_([A-Z]+)_(\d{4,})\]\]/gu;
const sha256 = (text) => crypto.createHash('sha256').update(text, 'utf8').digest('hex');

export class ShieldError extends Error {
  constructor(message, code = 'SYNTAX_INTEGRITY') {
    super(message);
    this.name = 'ShieldError';
    this.code = code;
  }
}
const fail = (message, code) => {
  throw new ShieldError(message, code);
};
const escaped = (s, at) => {
  let n = 0;
  while (at > 0 && s[--at] === '\\') n++;
  return n % 2 === 1;
};
const lineEnd = (s, at) => {
  const n = s.indexOf('\n', at);
  return n < 0 ? s.length : n > 0 && s[n - 1] === '\r' ? n - 1 : n;
};
const nextLine = (s, at) => {
  const n = s.indexOf('\n', at);
  return n < 0 ? s.length : n + 1;
};
const onOwnLine = (s, start, end) => {
  const begin = s.lastIndexOf('\n', start - 1) + 1;
  return !s.slice(begin, start).trim() && !s.slice(end, lineEnd(s, end)).trim();
};
function commentEnd(s, at) {
  if (s.startsWith('//', at)) return lineEnd(s, at);
  if (!s.startsWith('/*', at)) return null;
  let depth = 1,
    i = at + 2;
  while (i < s.length) {
    if (s.startsWith('/*', i)) {
      depth++;
      i += 2;
    } else if (s.startsWith('*/', i)) {
      depth--;
      i += 2;
      if (!depth) return i;
    } else i++;
  }
  fail('Unclosed block comment');
}
function quotedEnd(s, at) {
  let i = at + 1;
  while (i < s.length) {
    if (s[i] === '"' && !escaped(s, i)) return i + 1;
    i++;
  }
  fail('Unclosed code string');
}
function balancedEnd(s, start, format) {
  const pairs = { '(': ')', '[': ']', '{': '}' };
  const stack = [pairs[s[start]]];
  if (!stack[0]) fail('Expected an opening delimiter');
  let i = start + 1;
  while (i < s.length) {
    if (escaped(s, i)) {
      i++;
      continue;
    }
    if (format === 'typ' && s[i] === '"') {
      i = quotedEnd(s, i);
      continue;
    }
    if (format === 'typ' && (s.startsWith('//', i) || s.startsWith('/*', i))) {
      i = commentEnd(s, i);
      continue;
    }
    if (format === 'tex' && s[i] === '%') {
      i = nextLine(s, i);
      continue;
    }
    if (pairs[s[i]]) stack.push(pairs[s[i]]);
    else if (Object.values(pairs).includes(s[i])) {
      if (s[i] !== stack.pop()) fail('Unbalanced nested delimiters');
      if (!stack.length) return i + 1;
    }
    i++;
  }
  fail('Unclosed balanced construct');
}
function untilDelimiter(s, start, opener, closer, format = 'md') {
  let i = start + opener.length;
  while (i < s.length) {
    if (format === 'typ' && s[i] === '"' && !escaped(s, i)) {
      i = quotedEnd(s, i);
      continue;
    }
    if (format === 'typ' && (s.startsWith('//', i) || s.startsWith('/*', i))) {
      i = commentEnd(s, i);
      continue;
    }
    if (s.startsWith(closer, i) && !escaped(s, i)) return i + closer.length;
    i++;
  }
  fail('Unclosed math delimiter');
}
function rawCodeEnd(s, start) {
  const ticks = /^`+/u.exec(s.slice(start))[0];
  let i = start + ticks.length;
  while (i < s.length) {
    if (s[i] !== '`') {
      i++;
      continue;
    }
    const run = /^`+/u.exec(s.slice(i))[0];
    if (run.length === ticks.length) return i + run.length;
    i += run.length;
  }
  fail('Unclosed inline code delimiter');
}
function fenceEnd(s, start, marker) {
  let i = nextLine(s, start);
  const closing = new RegExp('^ {0,3}' + marker[0] + '{' + marker.length + ',}[ \\t]*$');
  while (i < s.length) {
    const end = lineEnd(s, i);
    if (closing.test(s.slice(i, end))) return end;
    i = nextLine(s, i);
  }
  fail('Unclosed fenced block');
}
function typstExpressionEnd(s, start) {
  let i = start + 1;
  if (s[i] === '{' || s[i] === '[') return balancedEnd(s, i, 'typ');
  const name = /^[\p{L}_][\p{L}\p{N}_.-]*/u.exec(s.slice(i));
  if (!name) fail('Unsupported Typst hash expression');
  i += name[0].length;
  const statement = /^(?:set|show|let|import|include|if|for|while|context)$/u.test(name[0]);
  if (statement) {
    while (i < s.length) {
      if (s[i] === '\n' || s[i] === '\r') {
        if (/[=,:+\-]\s*$/u.test(s.slice(start, i))) {
          i++;
          continue;
        }
        return i;
      }
      if (s[i] === '"') {
        i = quotedEnd(s, i);
        continue;
      }
      if ('([{'.includes(s[i])) {
        i = balancedEnd(s, i, 'typ');
        continue;
      }
      if (s.startsWith('//', i) || s.startsWith('/*', i)) {
        i = commentEnd(s, i);
        continue;
      }
      if (s[i] === ';') return i + 1;
      if (')]}'.includes(s[i])) fail('Unbalanced Typst expression');
      i++;
    }
    return i;
  }
  while (i < s.length) {
    const gap = /^[ \t]*/u.exec(s.slice(i))[0].length;
    if (s[i + gap] === '(' || s[i + gap] === '[' || s[i + gap] === '{') {
      i = balancedEnd(s, i + gap, 'typ');
    } else break;
  }
  return i;
}
function environmentEnd(s, start, name, openingEnd) {
  if (/^(?:luacode\*?|verbatim\*?|lstlisting|minted)$/u.test(name)) {
    const closer = '\\end{' + name + '}';
    const end = s.indexOf(closer, openingEnd);
    if (end < 0) fail('Unclosed TeX environment ' + name);
    return end + closer.length;
  }
  const stack = [name];
  let i = openingEnd;
  while (i < s.length) {
    if (s[i] === '%' && !escaped(s, i)) {
      i = nextLine(s, i);
      continue;
    }
    if (s[i] === '\\' && !escaped(s, i)) {
      const m = /^\\(begin|end)\s*\{([^{}]+)\}/u.exec(s.slice(i));
      if (m) {
        if (m[1] === 'begin') stack.push(m[2]);
        else {
          if (stack.pop() !== m[2]) fail('Unbalanced TeX environments');
          if (!stack.length) return i + m[0].length;
        }
        i += m[0].length;
        continue;
      }
    }
    i++;
  }
  fail('Unclosed TeX environment ' + name);
}
function texCommand(s, start) {
  if (s.startsWith('\\[', start))
    return { end: untilDelimiter(s, start, '\\[', '\\]'), role: 'BLOCK' };
  if (s.startsWith('\\(', start))
    return { end: untilDelimiter(s, start, '\\(', '\\)'), role: 'INLINE' };
  const command = /^\\([A-Za-z@]+|[^\r\n])/u.exec(s.slice(start));
  if (!command) fail('Unclosed TeX control sequence');
  const name = command[1];
  if (/^(?:catcode|csname|endcsname|scantokens)$/u.test(name))
    fail('Unsupported context-changing TeX primitive');
  let i = start + command[0].length;
  if (s[i] === '*') i++;
  if (name === 'verb') {
    const delimiter = s[i];
    if (!delimiter || /\s/u.test(delimiter)) fail('Unsupported TeX verb delimiter');
    const end = s.indexOf(delimiter, i + 1);
    if (end < 0 || s.slice(i, end).includes('\n')) fail('Unclosed TeX verb');
    return { end: end + 1, role: 'INLINE' };
  }
  if (name === 'documentclass') {
    // Only a top-level begin{document} ends the preamble. Comments and
    // balanced macro bodies may contain examples of that literal command.
    while (i < s.length) {
      if (s[i] === '%' && !escaped(s, i)) {
        i = nextLine(s, i);
        continue;
      }
      if (s[i] === '{' || s[i] === '[') {
        i = balancedEnd(s, i, 'tex');
        continue;
      }
      if (s[i] === '\\' && !escaped(s, i)) {
        const begin = /^\\begin\s*\{document\}/u.exec(s.slice(i));
        if (begin) return { end: i + begin[0].length, role: 'BLOCK' };
        const nested = texCommand(s, i);
        i = nested.end;
        continue;
      }
      i++;
    }
    fail('Unclosed TeX preamble: missing begin{document}');
  }
  if (name === 'begin' || name === 'end') {
    const m = /^\s*\{([^{}]+)\}/u.exec(s.slice(i));
    if (!m) fail('Unsupported TeX environment');
    const end = i + m[0].length;
    if (name === 'end' || m[1] === 'document') return { end, role: 'BLOCK' };
    return { end: environmentEnd(s, start, m[1], end), role: 'BLOCK' };
  }
  // An unbraced macro name is permitted in newcommand/renewcommand.
  if (/^(?:newcommand|renewcommand|providecommand)$/u.test(name)) {
    const macro = /^\s*\\[A-Za-z@]+/u.exec(s.slice(i));
    if (macro) i += macro[0].length;
  }
  while (i < s.length) {
    const gap = /^\s*/u.exec(s.slice(i))[0].length;
    if (s[i + gap] === '[' || s[i + gap] === '{') i = balancedEnd(s, i + gap, 'tex');
    else break;
  }
  let role = /^(?:textcite|citet|citeauthor)$/u.test(name)
    ? 'NCITE'
    : /cite/u.test(name)
      ? 'CITE'
      : /^(?:ref|eqref|autoref|cref|Cref|pageref|label)$/u.test(name)
        ? 'REF'
        : 'INLINE';
  if (
    /^(?:newcommand|renewcommand|providecommand|DeclareMathOperator|newenvironment|renewenvironment|directlua)$/u.test(
      name
    )
  )
    role = 'BLOCK';
  return { end: i, role, structural: name === 'label' };
}

export function extractProtectedSpans(source, format = 'md') {
  if (typeof source !== 'string' || !source.isWellFormed())
    fail('Source must be well-formed Unicode text');
  format = format.toLowerCase();
  if (!FORMATS.has(format)) fail('Unsupported document format', 'UNSUPPORTED_FORMAT');
  const spans = [],
    braces = [],
    divs = [];
  const markdown = ['md', 'qmd', 'rmd'].includes(format);
  let i = 0;
  const add = (start, end, role, structural = false) => {
    if (!(end > start)) fail('Invalid protected span');
    if (role === 'BLOCK' && !onOwnLine(source, start, end)) role = 'INLINE';
    spans.push({ start, end, role, structural });
    i = end;
  };
  const initial = source.startsWith('\uFEFF') ? 1 : 0;
  if (markdown && /^---(?:\r?\n)/u.test(source.slice(initial))) {
    let p = nextLine(source, initial),
      end = -1;
    while (p < source.length) {
      const q = lineEnd(source, p);
      if (/^(?:---|\.\.\.)[ \t]*$/u.test(source.slice(p, q))) {
        end = q;
        break;
      }
      p = nextLine(source, p);
    }
    if (end < 0) fail('Unclosed YAML frontmatter');
    add(0, end, 'BLOCK', true);
  }
  while (i < source.length) {
    const start = i,
      ch = source[i];
    const beginning = i === 0 || source[i - 1] === '\n';
    if (beginning && (markdown || format === 'typ')) {
      const line = source.slice(i, lineEnd(source, i));
      const fence = /^ {0,3}(`{3,}|~{3,})/u.exec(line);
      if (fence) {
        add(i, fenceEnd(source, i, fence[1]), 'BLOCK', true);
        continue;
      }
      if (markdown) {
        const div = /^ {0,3}(:{3,})(.*)$/u.exec(line);
        if (div) {
          if (div[2].trim()) divs.push(div[1].length);
          else if (!divs.length || div[1].length < divs.pop()) fail('Unbalanced fenced div');
          add(i, lineEnd(source, i), 'BLOCK', true);
          continue;
        }
      }
    }
    if (markdown && source.startsWith('<!--', i)) {
      const end = source.indexOf('-->', i + 4);
      if (end < 0) fail('Unclosed HTML comment');
      add(i, end + 3, 'BLOCK');
      continue;
    }
    if (format === 'typ' && (source.startsWith('//', i) || source.startsWith('/*', i))) {
      add(i, commentEnd(source, i), 'BLOCK');
      continue;
    }
    if (format === 'tex' && ch === '%' && !escaped(source, i)) {
      add(i, lineEnd(source, i), 'BLOCK');
      continue;
    }
    if (ch === '\\') {
      if (format === 'tex') {
        const command = texCommand(source, i);
        add(i, command.end, command.role, command.structural);
        continue;
      }
      if (markdown && (source.startsWith('\\[', i) || source.startsWith('\\(', i))) {
        const display = source[i + 1] === '[';
        add(
          i,
          untilDelimiter(source, i, display ? '\\[' : '\\(', display ? '\\]' : '\\)'),
          display ? 'BLOCK' : 'INLINE'
        );
        continue;
      }
      i += 2;
      continue;
    }
    if ((markdown || format === 'typ') && ch === '`') {
      add(i, rawCodeEnd(source, i), 'INLINE');
      continue;
    }
    if (ch === '$') {
      const delimiter =
        markdown || format === 'tex' ? (source.startsWith('$$', i) ? '$$' : '$') : '$';
      try {
        add(
          i,
          untilDelimiter(source, i, delimiter, delimiter, format),
          delimiter === '$$' ? 'BLOCK' : 'INLINE'
        );
      } catch (error) {
        if (markdown && /\d/u.test(source[i + 1] ?? '')) {
          i++;
          continue;
        }
        throw error;
      }
      continue;
    }
    if (format === 'typ' && ch === '#') {
      const end = typstExpressionEnd(source, i);
      const expr = source.slice(i, end);
      const role = /^#cite\b/u.test(expr)
        ? /form:\s*"prose"/u.test(expr)
          ? 'NCITE'
          : 'CITE'
        : /^#ref\b/u.test(expr)
          ? 'REF'
          : /^#(?:set|show|let|import|include)\b/u.test(expr) || expr.includes('\n')
            ? 'BLOCK'
            : 'INLINE';
      add(i, end, role, role === 'BLOCK');
      continue;
    }
    if (format === 'typ' && ch === '<') {
      const label = /^<[\p{L}\p{N}_:.-]+>/u.exec(source.slice(i));
      if (label) {
        add(i, i + label[0].length, 'REF', true);
        continue;
      }
    }
    if (
      (markdown || format === 'typ') &&
      ch === '@' &&
      !/[\p{L}\p{N}_]/u.test(source[i - 1] ?? '')
    ) {
      const ref = /^@[\p{L}\p{N}_][\p{L}\p{N}_:./+-]*/u.exec(source.slice(i));
      if (ref) {
        const literal = ref[0].replace(/[.,;:]+$/u, '');
        let end = i + literal.length;
        const locator = /^\s*\[/u.exec(source.slice(end));
        if (locator) end = balancedEnd(source, end + locator[0].length - 1, format);
        add(
          i,
          end,
          /^@(?:fig|tbl|sec|eq|lst|thm|lem|tip|nte|wrn)-/u.test(literal) || format === 'typ'
            ? 'REF'
            : 'NCITE'
        );
        continue;
      }
    }
    if (markdown && (ch === '[' || (ch === '!' && source[i + 1] === '['))) {
      const begin = ch === '!' ? i + 1 : i;
      let end;
      try {
        end = balancedEnd(source, begin, format);
      } catch (error) {
        if (source.slice(begin, lineEnd(source, begin)).includes('@')) throw error;
        i++;
        continue;
      }
      if (/@[\p{L}\p{N}_]/u.test(source.slice(begin, end))) {
        add(start, end, 'CITE');
        continue;
      }
      if (source[end] === '{') {
        end = balancedEnd(source, end, format);
        add(start, end, 'INLINE', true);
        continue;
      }
      if (source[end] === '(') {
        end = balancedEnd(source, end, format);
        add(start, end, 'INLINE');
        continue;
      }
    }
    if (markdown && ch === '{' && /^[#.]/u.test(source[i + 1] ?? '')) {
      add(i, balancedEnd(source, i, format), 'INLINE', true);
      continue;
    }
    if ((markdown || format === 'typ') && /^https?:\/\//u.test(source.slice(i, i + 8))) {
      const match = /^https?:\/\/[^\s<>]+/u.exec(source.slice(i));
      const raw = match[0].replace(/[.,;]+$/u, '');
      add(i, i + raw.length, 'INLINE');
      continue;
    }
    if (ch === '{') braces.push(i);
    else if (ch === '}') {
      if (braces.length === 0) fail('Unbalanced closing brace');
      braces.pop();
    }
    i++;
  }
  if (braces.length) fail('Unclosed brace delimiter');
  if (divs.length) fail('Unclosed fenced div');
  return spans;
}
function lockPayload(lockfile) {
  const payload = { ...lockfile };
  delete payload.integritySha256;
  return payload;
}
export function maskDocument(source, format = 'md') {
  if (typeof source !== 'string') throw new TypeError('Source must be UTF-8 text');
  if (source.includes('[[AST_')) fail('Reserved AST placeholder namespace collision');
  const spans = extractProtectedSpans(source, format);
  const lines = [0];
  for (let n = 0; n < source.length; n++) if (source[n] === '\n') lines.push(n + 1);
  const lineAt = (index) => {
    let low = 0,
      high = lines.length;
    while (low < high) {
      const mid = (low + high) >>> 1;
      if (lines[mid] <= index) low = mid + 1;
      else high = mid;
    }
    return low;
  };
  let previous = 0,
    masked = '';
  const entries = spans.map((span, index) => {
    const token = `[[AST_${span.role}_${String(index + 1).padStart(4, '0')}]]`;
    const raw = source.slice(span.start, span.end);
    masked += source.slice(previous, span.start) + token;
    previous = span.end;
    return {
      token,
      raw,
      sha256: sha256(raw),
      role: span.role,
      structural: span.structural,
      start: span.start,
      end: span.end,
      startLine: lineAt(span.start),
      endLine: lineAt(span.end - 1),
    };
  });
  masked += source.slice(previous);
  const lockfile = {
    schemaVersion: '1.0.0',
    parser: 'bounded-lexical-shield',
    format: format.toLowerCase(),
    sourceSha256: sha256(source),
    maskedSha256: sha256(masked),
    sourceLength: source.length,
    entries,
  };
  lockfile.integritySha256 = sha256(JSON.stringify(lockfile));
  return { masked, lockfile };
}
function validateLockfile(lockfile, expectedSourceSha256) {
  if (
    !lockfile ||
    lockfile.schemaVersion !== '1.0.0' ||
    lockfile.parser !== 'bounded-lexical-shield' ||
    !FORMATS.has(lockfile.format) ||
    !Array.isArray(lockfile.entries)
  )
    fail('Invalid lockfile schema');
  for (const key of ['sourceSha256', 'maskedSha256', 'integritySha256']) {
    if (!/^[a-f0-9]{64}$/u.test(lockfile[key] ?? '')) fail('Invalid lockfile digest');
  }
  if (sha256(JSON.stringify(lockPayload(lockfile))) !== lockfile.integritySha256)
    fail('Lockfile integrity digest mismatch');
  if (expectedSourceSha256 && expectedSourceSha256 !== lockfile.sourceSha256)
    fail('Source digest does not match the pinned source hash');
  let previous = 0;
  for (const [index, entry] of lockfile.entries.entries()) {
    if (
      !ROLES.has(entry.role) ||
      entry.token !== `[[AST_${entry.role}_${String(index + 1).padStart(4, '0')}]]` ||
      typeof entry.raw !== 'string' ||
      entry.raw.includes('[[AST_')
    )
      fail('Invalid lockfile entry');
    if (sha256(entry.raw) !== entry.sha256)
      fail('Protected span digest mismatch for ' + entry.token);
    if (
      !Number.isInteger(entry.start) ||
      !Number.isInteger(entry.end) ||
      entry.start < previous ||
      entry.end <= entry.start ||
      entry.end > lockfile.sourceLength ||
      entry.end - entry.start !== entry.raw.length
    )
      fail('Invalid span offsets');
    if (
      !Number.isInteger(entry.startLine) ||
      !Number.isInteger(entry.endLine) ||
      entry.startLine < 1 ||
      entry.endLine < entry.startLine
    )
      fail('Invalid span line range');
    previous = entry.end;
  }
}
export function unmaskDocument(
  masked,
  lockfile,
  { allowDuplicateCites = false, expectedSourceSha256 } = {}
) {
  validateLockfile(lockfile, expectedSourceSha256);
  const byToken = new Map(lockfile.entries.map((e) => [e.token, e]));
  const counts = new Map(),
    structural = [],
    warnings = [];
  const matches = [...masked.matchAll(TOKEN)];
  for (const match of matches) {
    const entry = byToken.get(match[0]);
    if (!entry) fail('Unknown AST token ' + match[0], 'UNKNOWN_TOKEN');
    counts.set(entry.token, (counts.get(entry.token) ?? 0) + 1);
    if (entry.role === 'BLOCK' && !onOwnLine(masked, match.index, match.index + match[0].length))
      fail('Structural block token is no longer standalone');
    if (entry.role === 'BLOCK' || entry.structural) structural.push(entry.token);
  }
  for (const entry of lockfile.entries) {
    const n = counts.get(entry.token) ?? 0;
    if (!n) fail('Missing token ' + entry.token, 'MISSING_TOKEN');
    if (n > 1) {
      if (!allowDuplicateCites || !['CITE', 'NCITE'].includes(entry.role))
        fail('Duplicate token ' + entry.token, 'DUPLICATE_TOKEN');
      warnings.push({ code: 'DUPLICATE_CITATION_AUTHORISED', token: entry.token, count: n });
    }
  }
  const expectedOrder = lockfile.entries
    .filter((e) => e.role === 'BLOCK' || e.structural)
    .map((e) => e.token);
  if (JSON.stringify(expectedOrder) !== JSON.stringify(structural))
    fail('Structural token order changed');
  const prose = masked.replace(TOKEN, (m) => ' '.repeat(m.length));
  if (prose.includes('[[AST_')) fail('Malformed AST token');
  if (extractProtectedSpans(prose, lockfile.format).length)
    fail('Rewrite introduced unmasked raw protected syntax', 'UNMASKED_SYNTAX');
  const text = masked.replace(TOKEN, (token) => byToken.get(token).raw);
  extractProtectedSpans(text, lockfile.format);
  return {
    text,
    passed: true,
    restoredSpans: matches.length,
    sourceSha256: lockfile.sourceSha256,
    outputSha256: sha256(text),
    warnings,
  };
}

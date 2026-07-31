# JavaScript Style Guide

This repository uses ES modules, ESLint, Prettier, and the existing source as the
executable style contract.

## Source files

- Use UTF-8 and `.js` for JavaScript source.
- Use `import` and `export`; include `.js` in relative import paths.
- Prefer named exports unless an existing interface requires a default export.
- Keep generated files out of hand-edited source paths.

## Formatting

- Let Prettier decide mechanical layout.
- Use two spaces for indentation.
- Use braces for control structures.
- Use semicolons.
- Do not leave trailing whitespace.

## Language features

- Use `const` by default and `let` only when reassignment is required.
- Do not use `var`.
- Prefer strict equality.
- Prefer `for...of` for iterable values.
- Avoid `eval`, the `Function` constructor, and mutation of built-in
  prototypes.
- Keep filesystem and process side effects behind explicit functions so they
  can be tested.

## Naming and documentation

- Use `UpperCamelCase` for classes and `lowerCamelCase` for functions and
  variables.
- Use `CONSTANT_CASE` for true constants.
- Document non-obvious constraints and decisions, especially generated-file
  invariants and cross-platform behavior.
- Preserve technical literals in tests and fixtures exactly.

## Repository-specific checks

Run the configured gates rather than relying on this guide alone:

```powershell
npm run lint:js
npm run typecheck
npm run format:check
npm test
```

_Adapted from the Conductor upstream JavaScript setup asset at commit
`99ba10e1a11130fc159f681b7ba8803489239cbf`._

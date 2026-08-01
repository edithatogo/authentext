# Contributing to Authentext

Authentext is an Agent Skills source repository. Changes should stay within the
maintained surface described in `AGENTS.md`; `experiments/` and archived
Conductor tracks are not supported runtime targets.

## Development baseline

Use Node.js 24 or newer, then install the locked dependencies:

```bash
npm ci
```

Before opening a pull request, run:

```bash
npm run sync
npm run validate
npm run validate:hosts
npm run lint:all
npm test
npm run test:coverage
npm audit --audit-level=moderate
```

Generated `SKILL.md`, `SKILL_PROFESSIONAL.md`, references, and root manifests
must be produced with `npm run sync`, not edited independently of their canonical
`src/` fragments.

## Pull requests

Keep changes focused, explain the user-facing or maintenance outcome, and attach
the commands or hosted runs that support the claim. Automated checks and
self-review are the merge gates for this solo-maintainer repository; no second
reviewer, team assignment, or CODEOWNERS approval is required.

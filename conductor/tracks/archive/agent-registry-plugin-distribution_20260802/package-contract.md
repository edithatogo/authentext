# Deterministic Distribution Package Contract

## Purpose

This contract defines the evidence required for every generated Authentext
registry, plugin, extension, or native-skill package. The canonical repository
remains the only editable source. Distribution packages are reproducible build
outputs and must not become independent copies of the skill.

`package-manifest.schema.json` is the normative machine-readable contract.
`package-manifest.example.json` is illustrative and is not publication
evidence.

## Canonical inputs

Each build must identify an immutable Git commit and release tag. Its
`canonicalInputs` must list every repository path that can affect packaged
content, including:

- `src/`, the canonical skill fragments;
- `scripts/compile-skill.js`, the canonical compiler;
- `package.json` and `package-lock.json`, the build dependency lock;
- `SKILL.md`, `SKILL_PROFESSIONAL.md`, and `references/`, the compiled portable
  release surface; and
- the minimum host-manifest template when a target requires one.

The package builder must start from a clean checkout at the recorded commit,
run `npm ci` and `npm run sync`, and fail if generated portable files differ
from the committed release. Host manifests may supply installation metadata,
but must not restate or alter Authentext instructions.

## Deterministic build rules

For identical canonical inputs and builder version, two builds must produce
byte-identical package archives and matching SHA-256 digests.

- Normalize archive entry order lexicographically by portable path.
- Normalize path separators to `/`, file modes, owner/group identifiers, and
  Unicode filenames.
- Set archive modification times from `SOURCE_DATE_EPOCH`, derived from the
  source commit, rather than wall-clock time.
- Exclude nondeterministic timestamps from the archive manifest. Build-time
  observations belong in external provenance attestations.
- Use the locked dependency graph; network-fetched content must never be copied
  into the package.
- Record a SHA-256 digest for the archive, every packaged file, the SBOM, the
  provenance statement, and every provenance material.

## Required package contents

Every package contains only the minimum subset needed by its target:

1. the portable `SKILL.md` entry point;
2. referenced portable files required by that entry point;
3. the repository licence and required notices;
4. at most the minimum host manifest needed for discovery or installation; and
5. the package manifest, unless a host format requires it to be supplied as a
   detached release asset.

Each `contents` entry maps a packaged path back to a canonical `sourcePath` and
records its digest and role. Generated host metadata must map to its canonical
template or generator input.

## Mandatory exclusions

Packages must exclude development and governance material, including `.git/`,
`.github/`, `.env*`, credentials, caches, `node_modules/`, `test/`, `scripts/`,
`src/`, `conductor/`, `experiments/`, coverage output, editor state, and local
build logs. A package must also reject symlinks, absolute paths, `..` traversal,
device files, and any undeclared file.

The manifest records the exclusion policy identifiers
`repository-internals`, `credentials-and-secrets`, `development-inputs`,
`governance-history`, and `unsafe-filesystem-entries`. The build gate inspects
the archive rather than relying on ignore rules alone.

## SBOM and provenance

Each release package has detached, digest-linked evidence:

- an SPDX 2.3 JSON or CycloneDX 1.6 JSON SBOM covering the package files and any
  runtime components declared by a host manifest; and
- an in-toto Statement carrying SLSA provenance, with the builder identity,
  build type, invocation digest, source repository and commit, and digests for
  all materials.

The provenance predicate must state whether the build ran on a hosted or local
builder. Only hosted, release-controlled provenance is acceptable for a public
submission. Signing and transparency-log references are recorded when the
release channel supports them; their absence is explicit rather than implied.

## Capability boundary

Skill-only packages declare empty `apps`, `tools`, `hooks`, and `network`
capability arrays. A package that needs any executable integration is a new
security-reviewed product decision and cannot use this contract unchanged.

## Verification gate

Before publication, automation must:

1. validate the manifest against the schema;
2. rebuild twice in isolated workspaces and compare archive hashes;
3. verify every file digest and reject unlisted archive entries;
4. scan the archive for secrets and unsafe filesystem entries;
5. validate the SBOM and provenance statement and verify their hashes;
6. confirm the source commit is the commit named by the release tag; and
7. store the manifest, SBOM, provenance, archive hash, and hosted run URL as the
   publication receipt.

Passing this gate proves package integrity only. Registry submission,
acceptance, listing, and installation verification remain separate states and
separate external publication gates.

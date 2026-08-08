# Distribution operations

Authentext's repository is the editorial source of truth. Portable and
host-specific packages are generated release products. Registry automation may
inspect public state and open a drift issue, but it must never publish, upload,
tag, release, or mutate an external registry.

## Routine update

1. Run the repository sync, validation, tests, and distribution build gates.
2. Compare generated package receipts, versions, and digests with the intended
   immutable release commit.
3. Review each destination independently. Obtain explicit approval immediately
   before each submission or upload.
4. Submit destinations sequentially and retain separate submission receipts.
5. Record `accepted`, `listed`, or `verified` only after the corresponding
   hosted evidence exists. Add badges only after a clean install verifies the
   listing and canonical digest.
6. Run the registry monitor and resolve its issue only when the checked-in
   matrix and hosted evidence agree.

## Rollback

1. Stop further submissions and identify the last verified immutable version.
2. Use the destination's native rollback or version pin where supported. Do
   not rewrite an existing version with different bytes.
3. Verify a clean installation and compare its receipt digest with the known
   good canonical package.
4. Update the matrix with the observed state and hosted rollback receipt.
5. Prepare a corrective release if a destination cannot roll back safely.

## Deprecation, rename, and removal

- Deprecate before removal when the registry supports it, naming the supported
  replacement and a bounded migration period.
- Keep predecessor identity historically accurate. Never imply control of the
  legacy `blader/humanizer` package or listing.
- Treat redirects as destination-owned evidence and verify their final target.
- Remove badges and install commands as soon as a listing is no longer
  verified. Preserve the historical receipt rather than rewriting it.
- Removal from one channel does not delete or alter canonical repository
  history.

## Compromised release

1. Freeze publication and revoke affected registry credentials or tokens.
2. Mark affected channels as deferred or removed based on hosted evidence;
   never leave a false `verified` claim.
3. Capture package, manifest, provenance, workflow-run, and audit-log evidence
   without copying credentials or session material.
4. Notify registry maintainers through their documented security channel and
   request de-listing or revocation.
5. Rotate credentials, correct the canonical source, generate a new immutable
   version, and repeat all validation gates.
6. Publish a clear advisory and restoration receipt. Do not reuse the
   compromised version number or digest.

## Registry-maintainer handoff

The handoff must name the repository owner, destination, package identity,
package type, canonical source path, current immutable version and digest,
submission route, trust tier, sync policy, and latest hosted receipt. The new
maintainer must confirm access using least privilege. Rotate credentials after
the handoff, update repository secrets through the host UI, and verify that no
personal browser sessions or tokens entered repository artifacts.

## Scheduled monitor

`.github/workflows/registry-monitor.yml` runs weekly and on demand. It writes
`registry-drift.json`, uploads that JSON as a workflow artifact, and maintains
one open issue identified by `<!-- authentext-registry-monitor -->`. It closes
that issue when no findings remain.

Run the same check locally:

```powershell
node scripts/monitor-registry-distribution.js `
  --output registry-drift.json `
  --issue-body registry-drift.md
```

Optional observations can be supplied with `--observations <file>`. The JSON
object is keyed by channel ID and may contain `present`, `http_status`,
`manifest_sha256`, and `status`. `--probe-listings` performs read-only HEAD
requests only for explicit `evidence.listing_url` values. Findings cover stale
evidence/releases, changed manifests, broken or removed listings, state drift,
and acceptance claims without hosted receipts.

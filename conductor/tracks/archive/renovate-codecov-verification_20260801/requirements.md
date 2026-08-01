# Requirements: Renovate and Codecov Verification

## Must

- **M-001:** Use the shared Renovate preset.
- **M-002:** Keep Dependabot until Renovate is hosted-verified.
- **M-003:** Use pinned Codecov v5 with OIDC and `id-token: write`.
- **M-004:** Preserve native LCOV, JSON, thresholds, and artifact evidence.
- **M-005:** Verify hosted runs before closing the track.

## Should

- **S-001:** Avoid repository secrets for coverage upload.
- **S-002:** Remove obsolete Renovate rules for frozen legacy paths.

## Won't in this track

- Release or registry publication.
- Removing Dependabot without a Renovate Dashboard or pull request.

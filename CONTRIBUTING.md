# Contributing to Authentext

Thanks for contributing! Please run local validation before opening a PR to reduce CI noise.

Recommended steps:

```bash
# Ensure build outputs are up to date
npm install
npm run sync

# Run skill validation (Skillshare dry-run + optional AIX validation)
./scripts/validate-skill.sh
```

If CI fails on the skill distribution job, inspect the job logs and run the same commands locally. The job may fail due to:

- A new `SKILL.md` formatting issue
- Tooling changes in Skillshare/AIX

If you need help, open an issue referencing the failing workflow and include the workflow logs.

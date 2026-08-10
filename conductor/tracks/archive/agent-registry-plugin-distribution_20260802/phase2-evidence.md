# Phase 2 evidence: portable registries and cross-host installation

Checked 2026-08-08 against source commit `f27137f94f427f99dc9ffeb6a1a71b6cebdacb01`.

## Verified locally

- `skills-ref==0.1.1` accepts the root package.
- `gh skill publish --dry-run` accepts an ephemeral `skills/authentext/`
  projection generated from the maintained root surface.
- `gh skill preview edithatogo/authentext authentext` reports no skill because
  the canonical repository intentionally does not check in a duplicate
  `skills/authentext/` adapter tree.
- The deterministic portable staging package passes allow-list, digest,
  capability, legacy-identity, and unsafe-path checks.
- Clean isolated discovery simulations resolve the identical `SKILL.md` digest
  for Claude Code, Codex, GitHub Copilot, Gemini CLI, OpenCode, Cursor,
  Windsurf, Cline, AiderDesk, and AMP.

## Hosted registry observations

- `https://skills.sh/edithatogo/authentext/authentext` returns HTTP 200 but its
  rendered application state says that Authentext is unavailable. This is not
  listing evidence and no badge is added.
- VoltAgent still contains the historical `blader/humanizer` reference. A
  replacement entry is prepared below, but opening a third-party pull request
  remains a destination-specific publication action.
- Secondary directories remain researched or prepared only. No acceptance,
  listing, endorsement, or install claim is made without a durable hosted
  receipt.

## Prepared VoltAgent replacement

```markdown
- **[edithatogo/authentext](https://github.com/edithatogo/authentext)** -
  Restrained review and rewriting across technical, academic, governance, and
  general prose while preserving meaning, voice, citations, code, URLs, paths,
  and identifiers.
```

The stale entry should be replaced, not duplicated. The candidate must be
rebased against VoltAgent's current contribution format immediately before a
submission is authorized.

## Disposition

Package preparation and local verification are complete. GitHub publication,
the VoltAgent pull request, skills.sh catalog activation, and secondary
directory submissions remain externally controlled gaps to be retained as
follow-up issues during governed closeout.

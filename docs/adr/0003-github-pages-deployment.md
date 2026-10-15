# 0003 - GitHub Pages Deployment

**Status:** proposed
**Date:** 2026-10-15
**Spec:** N/A
**Deciders:** Project creator

## Context

todooren builds to a static bundle with no backend (ADR 0001), but had no hosting or CI.
Checks only ran locally through Husky hooks, which can be skipped.

## Decision

- Host the app on **GitHub Pages**, deployed by GitHub Actions (`actions/configure-pages`,
  `upload-pages-artifact`, `deploy-pages`), following the setup used in the `cheesse` project.
- `.github/workflows/deploy.yml` runs on every push to `main`: `npm ci`, lint,
  `test:coverage`, build, then publishes `dist/`. A failing check blocks the deploy.
- `.github/workflows/pr-check.yml` runs the same checks plus `format:check` on pull requests.
- Vite `base` is `./`, so asset URLs are relative and the build works under the
  `/todooren/` project-page subpath as well as at a domain root.

## Consequences

- `main` is always live; there is no staging environment.
- The repository's Pages source must be set to "GitHub Actions" once.
- All of the owner's project pages share the `<user>.github.io` origin and therefore one
  `localStorage`. The `todooren:` key prefix keeps the app's data separate.
- Relative `base` works only while the app has a single route; adding a history-mode
  router would need an absolute base (`/todooren/`) and a 404 fallback.

## Alternatives Considered

| Option             | Pros                        | Cons                               | Why Not                          |
| ------------------ | --------------------------- | ---------------------------------- | -------------------------------- |
| Netlify / Vercel   | PR previews, custom headers | Extra account and secrets          | Pages is free and already in use |
| Absolute base path | Works with history routing  | Breaks if the repo or host changes | No router; relative is simpler   |

## Links

- Supersedes: N/A
- Related: 0001-project-init.md, 0002-tooling-guardrails.md

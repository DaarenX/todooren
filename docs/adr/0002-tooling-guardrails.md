# 0002 - Tooling Guardrails

**Status:** accepted
**Date:** 2026-10-13
**Spec:** N/A
**Deciders:** Project creator (chose "Skills + guardrails" in /initialize-project)

## Context

The project had type checking but no linter, formatter, test runner, or commit hooks.
The working rules for this repo require TDD with 80% coverage, per-file and
per-function size limits, and a changelog entry in every commit.

## Decision

- **ESLint 10** flat config using `eslint-plugin-vue` and `@vue/eslint-config-typescript`.
  The size limits (200 lines per file, 20 per function, 3 parameters, depth 2) are
  enforced as **warnings**.
- **Prettier** with the style the code already used: no semicolons, single quotes,
  100 columns. Formatting rules are disabled in ESLint.
- **Vitest** with jsdom and Vue Test Utils, tests colocated as `*.test.ts`, v8
  coverage with 80% thresholds.
- **Husky + lint-staged** run ESLint and Prettier on staged files before each commit.
- **commitlint** enforces Conventional Commits.

## Consequences

- Commit messages must follow Conventional Commits; free-form messages are rejected.
- Files are formatted as they are staged, so the first commit touching an older file
  may include formatting changes.
- `npm run test:coverage` fails until component tests exist (coverage was about 4%
  when this was adopted). Coverage is not part of the pre-commit hook.
- Quality gates are warnings so that `PomodoroTimer.vue` (over 200 lines) does not
  block commits. Promote them to errors once existing code complies.
- No CI yet: the checks only run locally.

## Alternatives Considered

| Option                  | Pros                                    | Cons                                      | Why Not                                |
| ----------------------- | --------------------------------------- | ----------------------------------------- | -------------------------------------- |
| Biome                   | One fast tool for lint and format       | Weaker Vue SFC support                    | Vue templates need `eslint-plugin-vue` |
| Jest                    | Named in the bootstrap TypeScript skill | Separate transform setup for Vite and Vue | Vitest reuses the Vite config          |
| Quality gates as errors | Strict enforcement                      | Blocks commits on existing code           | Existing code exceeds the file limit   |

## Links

- Supersedes: N/A
- Related: 0001-project-init.md

# Changelog

All notable changes to this project are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com);
this project adheres to [Semantic Versioning](https://semver.org).

## [Unreleased]

### Added

- GitHub Pages deployment: `deploy.yml` lints, tests, builds, and publishes `dist/` on
  every push to `main`, and `pr-check.yml` runs the same checks on pull requests (see ADR 0003).
- Claude Code setup: `CLAUDE.md` and project skills in `.claude/skills/`.
- ESLint, Prettier, Vitest, Husky + lint-staged, and commitlint, so linting,
  formatting, tests, and commit-message checks run locally (see ADR 0002).
- Unit tests for the `useLocalStorage` composable.
- Component tests for `App`, `TodoBoard`, `TodoList`, and `TodoItem`, bringing coverage
  above the 80% threshold so `npm run test:coverage` passes.
- Architecture Decision Records in `docs/adr/` (0001 stack, 0002 tooling).
- `scripts/security-check.sh` for staged-secret scanning and `npm audit`.
- `.env.example` and `.gitignore` entries for env files, secrets, and agent directories.

### Changed

- Vite `base` set to `./` so the build loads its assets under the `/todooren/` Pages subpath.
- `format` and `format:check` now cover the whole repo instead of only `src/`, matching
  what lint-staged formats; `index.html` and `vite.config.ts` reformatted.
- `README.md` now describes todooren, its scripts, and contribution rules instead of the
  Vite template boilerplate.
- Split `PomodoroTimer.vue` (over the 200-line limit) into `usePomodoro`, `useChime`, and
  `useTimerSettings` composables, with unit tests for each and for the component.
- Repeated Tailwind class lists replaced by `focus-ring`, `accent-fill`, `btn-primary`,
  `icon-btn`, and `field-focus` utilities in `main.css`; no visual change.
- The Inter font is now bundled via `@fontsource-variable/inter` instead of loaded from
  Google Fonts, so the app makes no network requests (ADR 0001 updated).
- New todos get IDs from `crypto.randomUUID()` instead of a timestamp plus
  `Math.random()`, removing the small chance of collisions. Existing IDs are unchanged.
- `tailwindcss`, `@tailwindcss/vite`, and `@fontsource-variable/inter` moved to
  `devDependencies`, since they are only used at build time.

### Fixed

- Moving a task between Today and the backlog no longer flashes it in the list it
  left. Dropped items are removed from the source list at once instead of lingering
  for a frame or two in a leave transition, and items moved with the button are pinned
  to their own slot while they fade out, instead of dropping to the top of the list.

### Removed

- Unused `e2e/**` test exclude left over from the Vite template (there are no e2e tests).

### Security

# Changelog

All notable changes to this project are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com);
this project adheres to [Semantic Versioning](https://semver.org).

## [Unreleased]

### Added

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

- `format` and `format:check` now cover the whole repo instead of only `src/`, matching
  what lint-staged formats; `index.html` and `vite.config.ts` reformatted.
- `README.md` now describes todooren, its scripts, and contribution rules instead of the
  Vite template boilerplate.
- Split `PomodoroTimer.vue` (over the 200-line limit) into `usePomodoro`, `useChime`, and
  `useTimerSettings` composables, with unit tests for each and for the component.

### Fixed

### Removed

### Security

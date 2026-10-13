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
- Architecture Decision Records in `docs/adr/` (0001 stack, 0002 tooling).
- `scripts/security-check.sh` for staged-secret scanning and `npm audit`.
- `.env.example` and `.gitignore` entries for env files, secrets, and agent directories.

### Changed

### Fixed

### Removed

### Security

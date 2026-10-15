# CLAUDE.md

## Skills

Read and follow these skills before writing any code:

- .claude/skills/base/SKILL.md
- .claude/skills/security/SKILL.md
- .claude/skills/security-audit/SKILL.md
- .claude/skills/project-tooling/SKILL.md
- .claude/skills/session-management/SKILL.md
- .claude/skills/cross-agent-delegation/SKILL.md
- .claude/skills/existing-repo/SKILL.md
- .claude/skills/typescript/SKILL.md
- .claude/skills/demo-video/SKILL.md
- .claude/skills/code-graph/SKILL.md (reference only: the code graph MCP server is not configured for this project yet)

The bootstrap has no Vue skill. Where a skill assumes React or Jest, follow the
conventions in "Project-Specific Patterns" below instead.

## Project Overview

todooren is a single-page todo app with a built-in Pomodoro timer. Todos live on a
drag-and-drop board and everything is persisted in the browser's `localStorage`.
There is no backend, no accounts, and no network calls.

## Tech Stack

- Language: TypeScript 6 (strict, `noUncheckedIndexedAccess`)
- Framework: Vue 3 (`<script setup>` single-file components) + Vite 8
- Styling: Tailwind CSS 4 (via `@tailwindcss/vite`)
- Drag and drop: `vue-draggable-plus`
- Database: none (`localStorage` through `useLocalStorage`)
- Deployment: GitHub Pages via `.github/workflows/deploy.yml` on push to `main` (ADR 0003)
- Testing: Vitest + Vue Test Utils (jsdom), coverage via v8

## Key Commands

```bash
npm install            # Install dependencies (also installs Husky hooks)
npm run dev            # Start the dev server
npm run build          # Type-check and build for production
npm run type-check     # vue-tsc
npm run lint           # ESLint (lint:fix to autofix)
npm run format         # Prettier write (format:check to verify)
npm test               # Vitest, single run (test:watch for watch mode)
npm run test:coverage  # Vitest with coverage, 80% thresholds
./scripts/security-check.sh  # Staged-secret scan and npm audit
```

## Guardrails

- **Pre-commit** (Husky + lint-staged): ESLint autofix and Prettier on staged files.
- **Commit messages** (commitlint): Conventional Commits, e.g. `feat: add due dates`.
- **Quality gates** are ESLint warnings: 200 lines per file, 20 lines per function,
  3 parameters, nesting depth 2.
- **TDD**: write a failing test first, then the code. Coverage target is 80%.

## Documentation

- `docs/adr/` - Architecture Decision Records
- `CHANGELOG.md` - Updated in every commit

## Architecture Decision Records (ADR)

All architectural decisions are documented in `docs/adr/`.

### ADR Workflow

- Before making architectural choices, check existing ADRs
- Create new ADR before implementing architectural changes
- Code reviews verify ADR compliance
- Template: `docs/adr/TEMPLATE.md`

### ADR Format

Status: proposed → accepted → deprecated/superseded
Location: docs/adr/NNNN-title.md

## Changelog — Required for Every Commit

Every commit that changes behaviour, config, docs, or dependencies MUST update
`CHANGELOG.md` in the **same commit**. No feature, fix, or refactor lands without
a changelog line.

- Keep a root `CHANGELOG.md` following [Keep a Changelog](https://keepachangelog.com)
  with an `## [Unreleased]` section (Added / Changed / Fixed / Removed / Security).
- One entry per commit, staged together with the code.
- Exempt: pure formatting, comment typos, changes to the changelog itself.
- On release: rename `[Unreleased]` to the version + date, start a fresh block.

## Project-Specific Patterns

- Components are PascalCase SFCs in `src/components/`, using `<script setup lang="ts">`.
- Composables are `useX.ts` in `src/composables/`.
- Shared types live in `src/types.ts`.
- Import across directories with the `@/` alias; use relative imports for siblings.
- Tests are colocated as `*.test.ts` next to the file they cover and import
  `describe`/`it`/`expect` from `vitest` explicitly (no globals).
- Code style: no semicolons, single quotes, 100-column width (Prettier).
- Persist app state through `useLocalStorage` (keys are prefixed `todooren:`). The
  theme toggle in `App.vue` is the one place that calls `localStorage` directly.

# 0001 - Project Initialization

**Status:** accepted
**Date:** 2026-10-13
**Spec:** N/A
**Deciders:** Project creator (reverse-engineered from the codebase, confirmed 2026-10-13)

## Context

todooren is a personal todo app with a Pomodoro timer. It needs to run entirely in
the browser, with no accounts and no server to operate.

The original brief asked for a single-page Vue.js app styled with Tailwind CSS,
minimalist with a smooth dark mode, providing:

- A todo list: add, complete, delete, and edit todos, saved to local storage.
- Animated reordering whose order survives a page reload.
- A separate backlog area that todos can be moved into.
- A Pomodoro timer: 25 minutes work, 5 minutes break, configurable times, a visual
  countdown, and an audio alert on completion.

## Decision

- **Vue 3** single-file components with `<script setup lang="ts">`, built with **Vite 8**.
- **TypeScript 6** in strict mode with `noUncheckedIndexedAccess`, checked by `vue-tsc`.
- **Tailwind CSS 4** through the `@tailwindcss/vite` plugin.
- **vue-draggable-plus** for drag-and-drop ordering on the board.
- **No backend.** State is persisted as JSON in `localStorage` through the
  `useLocalStorage` composable.
- **No runtime network requests.** Assets, including the Inter font
  (`@fontsource-variable/inter`, added 2026-10-14), are bundled rather than loaded from a CDN.

## Consequences

- No hosting, auth, or database to maintain; the build is a static bundle.
- Data stays on one browser profile: no sync between devices, no backup, and it is
  lost if site data is cleared.
- `localStorage` is synchronous and capped at roughly 5 MB, which is fine for todos.
- A stored-data shape change needs a migration path, since old JSON is read back as-is.

## Alternatives Considered

| Option                             | Pros                         | Cons                             | Why Not                              |
| ---------------------------------- | ---------------------------- | -------------------------------- | ------------------------------------ |
| Backend + database (e.g. Supabase) | Sync across devices, backups | Auth, hosting, secrets to manage | Unneeded for a single-user local app |
| IndexedDB                          | Larger quota, async          | More code for the same result    | Todo data is small                   |

## Links

- Supersedes: N/A
- Related: 0002-tooling-guardrails.md

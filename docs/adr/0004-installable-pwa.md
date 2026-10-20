# 0004 - Installable Progressive Web App

**Status:** proposed
**Date:** 2026-10-19
**Spec:** N/A
**Deciders:** Project creator

## Context

todooren should be installable on Android as a local app: an icon on the home screen
that opens in its own window, without the browser UI. Chrome offers "Install app" only
when the page links a web app manifest with a name, a start URL, a standalone display
mode, and 192px and 512px icons, and is served over HTTPS (GitHub Pages, ADR 0003).
Because all data is in `localStorage` (ADR 0001), the app can also work fully offline
once its files are cached.

## Decision

- Use **vite-plugin-pwa** (`generateSW` mode, Workbox) as a dev dependency. Its options
  live in `pwa.config.ts` and are covered by `pwa.config.test.ts`.
- The plugin emits `manifest.webmanifest` and a service worker that precaches every
  built asset, so the installed app starts offline.
- `registerType: 'autoUpdate'` with a deferred `registerSW.js` script: a new deploy's
  service worker activates in the background and is used on the next launch. The page
  is never reloaded for an update, so a running Pomodoro is not reset.
- `start_url` and `scope` are `./`, matching the relative Vite `base`.
- Icons (`pwa-192x192.png`, `pwa-512x512.png`, `apple-touch-icon.png`) are rendered once
  from `public/icon.svg` and committed. The 512px icon is full-bleed with the clock inside
  the safe zone, so it doubles as the maskable icon.

## Consequences

- Android Chrome shows "Install app"; the installed app runs standalone and offline.
- An update reaches users one launch after it is deployed, not immediately.
- The app code still makes no network requests (ADR 0001). The only new traffic is
  the browser's own same-origin check for an updated `sw.js` and the precache download.
- Changing the icon means re-rendering the PNGs from `icon.svg` (e.g. with `sharp`).
- `localStorage` data is shared between the browser tab and the installed app, since
  both use the same origin.

## Alternatives Considered

| Option                         | Pros                 | Cons                                         | Why Not                                     |
| ------------------------------ | -------------------- | -------------------------------------------- | ------------------------------------------- |
| Hand-written manifest + SW     | No new dependency    | Must list hashed assets and handle cleanup   | Easy to get cache invalidation wrong        |
| Manifest only, no SW           | Simplest             | No offline start; older Chrome won't install | Offline is the point of a local app         |
| `prompt` update with a banner  | Updates apply sooner | Needs UI and a reload                        | A reload would interrupt a running Pomodoro |
| Native wrapper (TWA/Capacitor) | Play Store listing   | Android build tooling, signing, store review | Overkill for a personal static app          |

## Links

- Supersedes: N/A
- Related: 0001-project-init.md, 0003-github-pages-deployment.md

# todooren

A single-page todo app with a built-in Pomodoro timer.

- **Todos:** add, complete, edit, and delete tasks; reorder them by dragging or with the
  arrow keys on the drag handle.
- **Backlog:** park tasks for later and move them back to today with one click or a drag.
- **Pomodoro timer:** focus and break sessions (25 and 5 minutes by default, adjustable),
  a countdown ring, and a chime when a session ends.
- **Light and dark mode**, remembered per browser.
- **Installable:** on Android, open the site in Chrome and choose **Install app** (or
  **Add to Home screen**) from the menu. The installed app runs in its own window and
  works offline.

Everything is stored in the browser's `localStorage`. There is no backend and no account,
so data stays on one browser profile and is lost if site data is cleared.

## Deployment

Pushes to `main` are linted, tested, built, and published to GitHub Pages by
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). Pull requests run the same
checks without deploying. In the repository settings, set **Pages → Source** to
**GitHub Actions** once.

## Tech stack

Vue 3 (`<script setup>` SFCs), TypeScript, Vite, Tailwind CSS 4, and `vue-draggable-plus`.
Tests use Vitest and Vue Test Utils. See [`docs/adr/`](docs/adr/) for the reasoning
behind these choices.

## Getting started

Requires Node `^22.18.0` or `>=24.12.0`.

```sh
npm install   # also installs the Git hooks
npm run dev   # start the dev server
```

## Scripts

| Command                           | What it does                                   |
| --------------------------------- | ---------------------------------------------- |
| `npm run dev`                     | Dev server with hot reload                     |
| `npm run build`                   | Type-check and build for production (`dist/`)  |
| `npm run preview`                 | Serve the production build locally             |
| `npm run type-check`              | Run `vue-tsc`                                  |
| `npm run lint` / `lint:fix`       | ESLint                                         |
| `npm run format` / `format:check` | Prettier                                       |
| `npm test` / `test:watch`         | Vitest                                         |
| `npm run test:coverage`           | Vitest with coverage (80% thresholds)          |
| `./scripts/security-check.sh`     | Scan staged files for secrets, run `npm audit` |

## Contributing

- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org)
  (checked by commitlint).
- The pre-commit hook runs ESLint and Prettier on staged files.
- Every change that affects behaviour, config, docs, or dependencies gets an entry in
  [`CHANGELOG.md`](CHANGELOG.md) in the same commit.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Pomo is a Pomodoro-style productivity timer built as an installable PWA. React 19 + TypeScript (strict) + Vite, styled with Sass. Deployed to GitHub Pages at `https://ethan-mfb.github.io/pomo/`; pushes to `main` trigger `.github/workflows/deploy.yml` automatically.

## Commands

- `npm run dev` — Vite dev server (`--host`); PWA `devOptions` are enabled so the service worker is active in dev.
- `npm run build` — `tsc -b && vite build` (type check gates the build).
- `npm run preview` — serve the production build locally.
- `npm run lint` / `npm run lint:fix` — ESLint over `.ts,.tsx`.
- `npm run format` — Prettier write.

There is **no test harness** yet — `npm test` does not exist. Do not claim tests pass; verify via `npm run build` and manual dev runs.

## Conventions (enforced, not aspirational)

- **Explicit `.ts`/`.tsx` extensions in relative imports** are required — `module: NodeNext` with `allowImportingTsExtensions`. Omitting them breaks the type check.
- **`type` aliases only, never `interface`** (see `src/types.ts`).
- **Named exports** preferred over default (even `App` is a named export).
- Strict TypeScript; avoid `any` and broad `eslint-disable`. Use scoped `// eslint-disable-next-line <rule>` with a reason if truly needed.
- Magic numbers for time live in `src/constants.ts` (`SECONDS_IN_MINUTE`, `MILLISECONDS_IN_SECOND`, etc.) — reuse them.

`LLM_INSTRUCTIONS.md` holds the fuller style/architecture rationale. Note it and `README.md` say "React 18"; the project is actually on **React 19** (`package.json`) — trust `package.json`.

## Architecture

State is **local component state in `App.tsx`**, not a global store. `App.tsx` is the orchestrator that wires three custom hooks together and owns cross-hook glue state (`endTime`, `totalDuration`, `completedWorkSessions`, alarm-test flags). The conditional-render blocks in `App.tsx` are the app's state machine — config screen when idle, countdown when a timer exists, "Take a break" dismiss prompt when finished + alarm active.

The three hooks (`src/hooks/`) are the real engine:

- **`useTimer`** — the source of truth for timing. It stores a target `endTime` (epoch ms) and derives `timeRemaining` by computing `endTime - Date.now()` on a **100ms interval** (not 1s), which prevents drift and survives tab throttling. Pause works by snapshotting `pausedTimeRemaining` and clearing `endTime`; resume recomputes a fresh `endTime`. Calls the injected `onFinish` when it hits zero. This drift-free "derive from system time" model is deliberate — do not switch to a decrementing counter.
- **`useAlarm`** — lazily constructs one `HTMLAudioElement` for `alarm.mp3` (loaded via **relative path** so it resolves under the `/pomo/` base), maps volume 0–100 → 0.0–1.0, and cleans up on unmount. `isAlarmActive` is separate from `soundEnabled` so a muted alarm still drives the "take a break" UI.
- **`useAppTheme`** — initializes from `prefers-color-scheme`, syncs to OS changes, and reflects the theme onto `document.body[data-theme]`. Sass in `theme.scss` keys off that attribute.

`src/app.ts` (`startSession`) and the `SessionState` type are a **stubbed future engine** (throws `TODO`), not wired into the running app. Full-session/break-cycle logic described in `LLM_INSTRUCTIONS.md` is not implemented yet.

Components in `src/components/` are presentational (Button, Slider, Toggle, NumberInput, ProgressBar, ThemeToggle), each paired with its own `.scss`.

## PWA / build specifics

- `base: '/pomo/'` in `vite.config.ts` — all asset references must be relative or account for this base (this is why `useAlarm` uses `'alarm.mp3'`, not `/alarm.mp3`).
- App version is injected at build time: `vite.config.ts` reads `package.json` into `__APP_VERSION__`, surfaced via `src/version.ts` and shown in the footer.
- Service worker uses `registerType: 'autoUpdate'` + `skipWaiting`/`clientsClaim`. Workbox precache limit is raised to 15 MB to include the ~3.3 MB `alarm.mp3`; audio/js/css/images have runtime `StaleWhileRevalidate` caching.
- Do not hand-edit `dist/` or `dev-dist/` — build artifacts.

## Changelog & release

Uses `@mfbtech/changelog-generator`. Before opening a PR, run `npx ccg change` to create a change file and pick a version bump; `npx ccg publish --apply` updates `CHANGELOG.md` and bumps `package.json`. Comparison branch is `main` (`.changelog-generator.json`). Commit messages follow conventional prefixes (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`).

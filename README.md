# Pomo

React + TypeScript + Vite Progressive Web App scaffold (Sass styling).

## Scripts

- `npm run dev` - start dev server with PWA dev options
- `npm run build` - type check and production build
- `npm run preview` - locally preview the production build

## PWA

`vite-plugin-pwa` is configured with `autoUpdate` and basic manifest. Placeholder icons are empty files; replace with real PNG assets (192x192 & 512x512, plus maskable variants).

## Notes

- Strict TypeScript enabled.
- React 18 with automatic JSX runtime.
- Sass (`style.scss`) with variables & nesting.
- Adjust manifest in `vite.config.ts` as needed.

## Deployment

Hosted via GitHub Pages (project site):
`https://ethan-mfb.github.io/pomo/`

Changes deploy automatically on pushes to `main` through the workflow `.github/workflows/deploy.yml`.

### Status

![Deploy](https://github.com/ethan-mfb/pomo/actions/workflows/deploy.yml/badge.svg)

### Installing the PWA

1. Visit the URL above.
2. Use the browser’s install/Add to Home Screen option.
3. Launch the installed app; updates are pulled automatically (service worker `autoUpdate`).

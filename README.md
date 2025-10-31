# Pomo

React + TypeScript + Vite Progressive Web App scaffold (Sass styling).

## Scripts

- `npm run dev` - start dev server with PWA dev options
- `npm run build` - type check and production build
- `npm run preview` - locally preview the production build

## PWA

`vite-plugin-pwa` is configured with `autoUpdate` and basic manifest.

## Notes

- Strict TypeScript enabled.
- React 18 with automatic JSX runtime.
- Sass (`style.scss`) with variables & nesting.
- Adjust manifest in `vite.config.ts` as needed.

## Deployment

Hosted via GitHub Pages (project site): `https://ethan-mfb.github.io/pomo/`

Changes deploy automatically on pushes to `main`.

### Status

![Deploy](https://github.com/ethan-mfb/pomo/actions/workflows/deploy.yml/badge.svg)

### Installing the PWA

1. Visit the URL above.
2. Use the browser’s install/Add to Home Screen option.
3. Launch the installed app; updates are pulled automatically (service worker `autoUpdate`).

## Changelog & Release Workflow

This project uses `@mfbtech/changelog-generator` to manage change files and generate the `CHANGELOG.md`.

### Developer Flow

1. Create a feature/fix branch.
2. Implement changes and commit.
3. Run `npx ccg change` next to `package.json`.
   - Follow prompts to describe the change and select a version bump (major/minor/patch/none).
4. Commit the generated change file (stored under a `.change` directory created by the tool).
5. Run `npx ccg publish -a` next to `package.json` to update the changelog.
6. Open PR and merge.

### CI Verification (optional)

Run `npx ccg change --verify` in CI to ensure a change file exists for modified code.

### Publishing

To update the `CHANGELOG.md` and bump the version in `package.json`, run:

```bash
npx ccg publish --apply
```

For a dry-run (no file modifications) use:

```bash
npx ccg publish
```

### Additional Notes (Changelog System)

- Default comparison branch is `main` (configured in `.changelog-generator.json`). Adjust if your primary development branch differs.
- If you accidentally pick the wrong bump type, edit or delete the specific change file before publishing.
- Empty or trivial changes can use bump `none`; they will appear without version impact.

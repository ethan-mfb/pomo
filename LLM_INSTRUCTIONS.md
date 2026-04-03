# LLM Instructions for the Pomo Project

These instructions guide an AI assistant contributing to this repository. The assistant should follow them for consistent, high‑quality, minimal‑surprise changes.

## Project Summary

A Pomodoro timer PWA built with:

- React (function components + hooks)
- TypeScript (strict, NodeNext module resolution, explicit `.tsx` imports allowed)
- Vite + `@vitejs/plugin-react` + `vite-plugin-pwa`
- Sass for styling (`style.scss` root file; encourage modularization later)
- ESLint + Prettier enforced via provided configs
- Jest for unit and integration tests
- Playwright for e2e tests

## Architectural Principles

1. Keep components small, pure, and focused.
2. Lift state only when needed; prefer local component state over global until true cross-cutting concerns emerge.
3. Derive data instead of duplicating it (e.g., compute remaining time from start + duration rather than storing both start & remaining seconds separately when possible).
4. Favor explicitness over magic: clear prop names, explicit return types for complex exported functions.
5. Do not optimize unless explicitly asked to.

## TypeScript & Module Conventions

- Use explicit file extensions in relative imports because `NodeNext` + `allowImportingTsExtensions` is enabled.
- Use named exports over default.
- Use `type`s only and not `interface`s.
- Narrow types with type guards where runtime validation is needed.
- Use nominal typing.

## Logging Conventions

- Log entry shape:

  ```ts
  interface LogEntry {
    time: string;
    message: string;
    level?: 'info' | 'warn' | 'error';
  }
  ```

- Always ISO timestamps (`new Date().toISOString()`).
- Prepend newest logs to the array for O(1) append at front (as currently implemented) OR append at end and reverse in render—remain consistent.

## Styling

- Use [BEM methodology](https://getbem.com/) for naming CSS classes.
- Introduce partials (`_variables.scss`, `_mixins.scss`) when styles grow; then import into `style.scss`.
- Prefer flex or grid for layout; avoid deep nesting beyond 3 levels.

## Accessibility

- Ensure form controls have associated `<label>`.
- Announce session changes (future: ARIA live region `role="status"`).
- Use buttons, not clickable `<div>` elements.

## PWA

- Use [PWA best practices](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Best_practices).
- When changing manifest fields, update both the manifest in `vite.config.ts` and documentation if user-facing.

## ESLint & Prettier

- Run `npm run lint` and `npm run format` after significant changes.
- Do not disable rules broadly—prefer local `// eslint-disable-next-line <rule>` with rationale.

## File / Feature Introduction Process

When adding a new feature:

1. Define types & interfaces first (if non-trivial).
2. Add tests.
3. Implement feature with small, composable functions.
4. Update README or a new `docs/*.md` if behavior is user-visible.
5. Update LLM_INSTRUCTIONS.md only if process/architecture meaningfully evolves.

## Tests

Unit test business logic. If the business logic is surrounded by logic that is compositional (function/method calls) then write integration tests.

For every bug, one or more e2e tests must be written to reproduce the bug. Once the e2e test is written then the bug fix can be implemented.

For every feature, one or more e2e tests must be written to test the high level acceptance criteria of the feature. Once the e2e tests are written then the feature can be implemented.

## Commit Guidance (for generated commit messages)

- Use conventional summary: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `test:` etc.
- Keep subject <= 72 chars.
- Body (optional) wraps at 100 cols, explains what & why, not how.

## Anti-Patterns to Avoid

- Using `any` or disabling strict type checking without justification.
- Large monolithic components > 250 lines—split concerns.
- Polling faster than 1s unless animation demands it.

## How the LLM Should Respond to Requests

- If a user asks for a change: propose concrete diff(s) and apply them—avoid purely advisory answers when action is possible.
- Ask at most one clarifying question only if a critical requirement is ambiguous.
- Provide reasoning only when it materially helps; otherwise focus on concise, actionable output.

## Security / Privacy

- Do not introduce external network calls or analytics without explicit user request.
- Keep all data local to the browser (localStorage / IndexedDB) unless directed.

## Performance Considerations

- Timer accuracy > micro-optimizations. Use system time math to prevent drift.
- Lazy-load heavy future components if bundle size grows (dynamic `import()` + suspense).

## Documentation

- Prefer short `docs/*.md` files for domain topics (e.g., `docs/timer-logic.md`).
- Keep README high-level and user-centric; deeper technical guidance lives here.

---

Generated baseline instructions. Update this file as architecture evolves.

# LLM Instructions for the Pomo Project

These instructions guide an AI assistant contributing to this repository. The assistant should follow them for consistent, high‑quality, minimal‑surprise changes.

---

## Project Summary

A Pomodoro timer PWA built with:

- React (function components + hooks)
- TypeScript (strict, NodeNext module resolution, explicit `.tsx` imports allowed)
- Vite + `@vitejs/plugin-react` + `vite-plugin-pwa`
- Sass for styling (`style.scss` root file; encourage modularization later)
- ESLint + Prettier enforced via provided configs
- Jest for unit and integration tests
- Playwright for e2e tests

Live at: `https://ethan-mfb.github.io/pomo/`  
Auto-deployed via GitHub Actions on every push to `main`.

---

## AI-Assisted Development Workflow

The user does **not write code directly**. All development tasks — implementing features, fixing bugs, writing tests, making commits, opening pull requests, reviewing PRs, responding to PR feedback — are delegated to the AI. The user describes what they want; the AI handles everything else.

### What the AI Can Do

| Task                      | How to request                                             |
| ------------------------- | ---------------------------------------------------------- |
| Implement a feature       | "Add a feature that does X"                                |
| Fix a bug                 | "There's a bug where X happens — fix it"                   |
| Write a developer plan    | "Make a plan to implement X" or "Make a plan to fix bug X" |
| Run lint                  | "Run lint" or "Check for lint errors"                      |
| Fix lint errors           | "Fix all lint errors"                                      |
| Run formatter             | "Format the code"                                          |
| Run build / type check    | "Build the project" or "Check types"                       |
| Run tests                 | "Run the tests"                                            |
| Write tests               | "Write tests for X"                                        |
| Commit changes            | "Commit the changes"                                       |
| Create a branch           | "Create a branch for X"                                    |
| Open a pull request       | "Open a PR for this"                                       |
| Review a pull request     | "Review PR #N"                                             |
| Comment on a pull request | "Leave a comment on PR #N saying X"                        |
| Resolve PR comments       | "Resolve the comments on PR #N"                            |
| Update changelog          | "Generate the changelog entry for this change"             |
| Publish a release         | "Publish the changelog for this release"                   |

### Development Loop for Features

1. **Plan** — AI writes a developer plan describing the approach, files to change, and acceptance criteria.
2. **Tests first** — AI writes e2e tests for the acceptance criteria before implementing.
3. **Implement** — AI writes the feature code.
4. **Lint + format** — AI runs `npm run lint` and `npm run format`.
5. **Build** — AI runs `npm run build` to confirm no type errors.
6. **Changelog entry** — AI runs `npx ccg change` and commits the change file.
7. **Commit** — AI commits with a conventional commit message.
8. **Pull request** — AI opens a PR against `user/ai/main` via the GitHub CLI (`gh`).

### Development Loop for Bugs

1. **E2e test first** — AI writes one or more e2e tests that reproduce the bug.
2. **Fix** — AI implements the fix.
3. **Verify** — AI confirms the e2e test passes.
4. **Lint + format + build** — AI runs quality checks.
5. **Commit + PR** — AI commits and opens a PR.

### Pull Request Workflow

- PRs are created against `user/ai/main` using the GitHub CLI (`gh pr create`).
- The AI can open PRs, read PR review threads, reply to review comments, and check PR status using `gh` commands.
- When asked to "review PR #N", the AI reads the diff (`gh pr diff N`) and all existing comments (`gh pr view N --comments`), then provides inline feedback (`gh pr review`).
- When asked to "resolve comments on PR #N", the AI reads each open thread, implements the requested change, pushes the fix, and replies to the thread confirming resolution.

### Developer Plans

When asked for a plan (before implementing), the AI will produce a structured document with:

- **Problem / Goal** — what is being solved or built
- **Approach** — high-level strategy and alternatives considered
- **Files to change** — list of files and what changes to each
- **Acceptance criteria** — observable outcomes that confirm success
- **Test plan** — which tests to write and what they verify

Plans are output as text for user review. The user confirms or adjusts before implementation begins.

---

## Available Tools & Capabilities

### GitHub CLI (`gh`)

All Git and PR operations use the GitHub CLI — not ADO tooling. Key commands:

```bash
gh pr create --base user/ai/main --title "..." --body "..."
gh pr list
gh pr view <number> --comments
gh pr diff <number>
gh pr review <number> --comment --body "..."
gh pr comment <number> --body "..."
gh pr merge <number>
gh pr checks <number>
```

### Playwright MCP

Used for browser automation in e2e tests and for verifying UI behavior interactively.

**Do not test against the live deployed URL.** Instead, build the app locally with PWA disabled and run `npm run preview` to serve it, then point Playwright at `http://localhost:4173/pomo/`.

To build without PWA (so there is no service worker interference during tests):

```bash
VITE_PWA_DISABLED=true npm run build && npm run preview
```

> If `VITE_PWA_DISABLED` is not yet wired up in `vite.config.ts`, add it: conditionally omit the `VitePWA()` plugin when the env var is set.

Playwright operations available via MCP:

- Navigate to pages
- Click, fill, press keys, hover, drag
- Take screenshots
- Read console messages and network requests
- Assert on DOM snapshots

### Scripts (npm)

| Command            | What it does                                 |
| ------------------ | -------------------------------------------- |
| `npm run dev`      | Start local dev server                       |
| `npm run build`    | Type-check (`tsc -b`) + production build     |
| `npm run preview`  | Preview production build locally (port 4173) |
| `npm run lint`     | ESLint check on `.ts` and `.tsx` files       |
| `npm run lint:fix` | ESLint auto-fix                              |
| `npm run format`   | Prettier auto-format all files               |

### Changelog Tool

```bash
npx ccg change          # Create a change entry for this branch
npx ccg publish -a      # Aggregate change entries and publish CHANGELOG.md
```

Configuration in `.changelog-generator.json` (targets `main` on `origin` remote).

---

## Architectural Principles

1. Keep components small, pure, and focused.
2. Lift state only when needed; prefer local component state over global until true cross-cutting concerns emerge.
3. Derive data instead of duplicating it (e.g., compute remaining time from start + duration rather than storing both start & remaining seconds separately when possible).
4. Favor explicitness over magic: clear prop names, explicit return types for complex exported functions.
5. Do not optimize unless explicitly asked to.

---

## TypeScript & Module Conventions

- Use explicit file extensions in relative imports because `NodeNext` + `allowImportingTsExtensions` is enabled.
- Use named exports over default.
- Use `type`s only and not `interface`s.
- Narrow types with type guards where runtime validation is needed.
- Use nominal typing.

---

## Logging Conventions

Log entry shape:

```ts
type LogEntry = {
  time: string;
  message: string;
  level?: 'info' | 'warn' | 'error';
};
```

- Always ISO timestamps (`new Date().toISOString()`).
- Prepend newest logs to the array for O(1) append at front (as currently implemented) OR append at end and reverse in render — remain consistent.

---

## Styling

- Use [BEM methodology](https://getbem.com/) for naming CSS classes.
- Introduce partials (`_variables.scss`, `_mixins.scss`) when styles grow; then import into `style.scss`.
- Prefer flex or grid for layout; avoid deep nesting beyond 3 levels.

---

## Accessibility

- Ensure form controls have associated `<label>`.
- Announce session changes (future: ARIA live region `role="status"`).
- Use buttons, not clickable `<div>` elements.

---

## PWA

- Use [PWA best practices](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Best_practices).
- When changing manifest fields, update both the manifest in `vite.config.ts` and documentation if user-facing.
- Cache budget: max 15 MB per the Workbox config (accommodates 3.2 MB `alarm.mp3`).

---

## ESLint & Prettier

- Run `npm run lint` and `npm run format` after significant changes.
- Do not disable rules broadly — prefer local `// eslint-disable-next-line <rule>` with rationale.

---

## File / Feature Introduction Process

When adding a new feature:

1. Define types first (if non-trivial).
2. Write e2e tests for acceptance criteria.
3. Implement feature with small, composable functions.
4. Run `npm run lint`, `npm run format`, and `npm run build`.
5. Update README or a new `docs/*.md` if behavior is user-visible.
6. Update `LLM_INSTRUCTIONS.md` only if process/architecture meaningfully evolves.

---

## Tests

Unit test business logic. If the business logic is surrounded by logic that is compositional (function/method calls) then write integration tests.

For every bug, one or more e2e tests must be written to reproduce the bug. Once the e2e test is written then the bug fix can be implemented.

For every feature, one or more e2e tests must be written to test the high level acceptance criteria of the feature. Once the e2e tests are written then the feature can be implemented.

---

## Commit Guidance

- Use conventional summary: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `test:` etc.
- Keep subject <= 72 chars.
- Body (optional) wraps at 100 cols, explains what & why, not how.

---

## Anti-Patterns to Avoid

- Using `any` or disabling strict type checking without justification.
- Large monolithic components > 250 lines — split concerns.
- Polling faster than 1s unless animation demands it.

---

## How the AI Should Respond to Requests

- If a user asks for a change: apply it — avoid purely advisory answers when action is possible.
- Ask at most one clarifying question only if a critical requirement is ambiguous.
- Provide reasoning only when it materially helps; otherwise focus on concise, actionable output.
- After implementing, always run lint, format, and build to verify correctness before committing.

---

## Security / Privacy

- Do not introduce external network calls or analytics without explicit user request.
- Keep all data local to the browser (localStorage / IndexedDB) unless directed.

---

## Performance Considerations

- Timer accuracy > micro-optimizations. Use system time math to prevent drift.
- Lazy-load heavy future components if bundle size grows (dynamic `import()` + suspense).

---

## Documentation

- Prefer short `docs/*.md` files for domain topics (e.g., `docs/timer-logic.md`).
- Keep README high-level and user-centric; deeper technical guidance lives here.

---

_Update this file whenever the process, tooling, or architecture meaningfully evolves._

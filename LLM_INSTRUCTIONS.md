# LLM Instructions for the Pomo Project

These instructions guide an AI assistant contributing to this repository. The assistant should follow them for consistent, high‑quality, minimal‑surprise changes.

## Project Summary

A Pomodoro timer PWA built with:

- React 18 (function components + hooks)
- TypeScript (strict, NodeNext module resolution, explicit `.tsx` imports allowed)
- Vite + `@vitejs/plugin-react` + `vite-plugin-pwa`
- Sass for styling (`style.scss` root file; encourage modularization later)
- ESLint + Prettier enforced via provided configs

## Architectural Principles

1. Keep components small, pure, and focused.
2. Lift state only when needed; prefer local component state over global until true cross-cutting concerns emerge.
3. Derive data instead of duplicating it (e.g., compute remaining time from start + duration rather than storing both start & remaining seconds separately when possible).
4. Favor explicitness over magic: clear prop names, explicit return types for complex exported functions.
5. Avoid premature optimization; optimize after measuring.

## TypeScript & Module Conventions

- Use explicit file extensions in relative imports because `NodeNext` + `allowImportingTsExtensions` is enabled.
- Export one primary component per file; named exports preferred over default unless strongly conventional (App is a named export).
- Use `type`s only and not `interface`s.
- Narrow types with type guards where runtime validation is needed.

## State & Timer Logic (Future Guidance)

When implementing the Pomodoro engine:

- Core session types: `work`, `break`, `long_break`.
- Config object shape (proposed):
  ```ts
  interface PomoConfig {
    workMinutes: number;
    breakMinutes: number;
    longBreakMinutes: number;
    sessionsBeforeLongBreak: number;
  }
  ```
- Runtime session state (proposed):
  ```ts
  interface SessionState {
    index: number; // total sessions completed so far
    inProgress: boolean;
    type: 'work' | 'break' | 'long_break';
    startedAt: number; // epoch ms
    durationMs: number; // derived from config + type
    endsAt: number; // startedAt + durationMs
    remainingMs: number; // optionally derived on each tick
  }
  ```
- Use `requestAnimationFrame` or `setInterval(1000)` for ticking; keep drift minimal by computing remaining from `endsAt - now` each tick.
- Persist config + minimal historical log to `localStorage` keyed under `pomo:` prefix.

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

- Use semantic class names (`.config-panel`, `.timer-display`, `.log-list`).
- Introduce partials (`_variables.scss`, `_mixins.scss`) when styles grow; then import into `style.scss`.
- Prefer flex or grid for layout; avoid deep nesting beyond 3 levels.

## Accessibility

- Ensure form controls have associated `<label>`.
- Announce session changes (future: ARIA live region `role="status"`).
- Use buttons, not clickable `<div>` elements.

## PWA

- Do not manually modify files under `dist/` or `dev-dist/`—they are build artifacts.
- When changing manifest fields, update both the manifest in `vite.config.ts` and documentation if user-facing.

## ESLint & Prettier

- Run `npm run lint` and `npm run format` after significant changes.
- Do not disable rules broadly—prefer local `// eslint-disable-next-line <rule>` with rationale.

## File / Feature Introduction Process

When adding a new feature:

1. Define types & interfaces first (if non-trivial).
2. Add minimal tests (future: once test harness is introduced) or at least a usage example in comments.
3. Implement feature with small, composable functions.
4. Update README or a new `docs/*.md` if behavior is user-visible.
5. Update LLM_INSTRUCTIONS.md only if process/architecture meaningfully evolves.

## Commit Guidance (for generated commit messages)

- Use conventional summary: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `test:` etc.
- Keep subject <= 72 chars.
- Body (optional) wraps at 100 cols, explains what & why, not how.

## Anti-Patterns to Avoid

- Storing duplicate derived timer fields that can drift.
- Using `any` or disabling strict type checking without justification.
- Large monolithic components > 250 lines—split concerns.
- Polling faster than 1s unless animation demands it.

## Example Future Hook Sketch (Reference Only)

```ts
// usePomoEngine.ts (future)
import { useState, useEffect, useCallback } from 'react';
import type { PomoConfig, SessionState, LogEntry } from './types.ts';

export function usePomoEngine(config: PomoConfig) {
  const [session, setSession] = useState<SessionState | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);

  const startNext = useCallback(() => {
    const nextType = decideNextType(session, config);
    const durationMinutes = selectDuration(nextType, config);
    const startedAt = Date.now();
    const durationMs = durationMinutes * 60_000;
    const endsAt = startedAt + durationMs;
    const newSession: SessionState = {
      index: session ? session.index + 1 : 1,
      inProgress: true,
      type: nextType,
      startedAt,
      durationMs,
      endsAt,
      remainingMs: durationMs,
    };
    setSession(newSession);
    setLog((l) => [
      { time: new Date().toISOString(), message: `Started ${nextType} session` },
      ...l,
    ]);
  }, [session, config]);

  useEffect(() => {
    if (!session?.inProgress) return;
    const id = setInterval(() => {
      setSession((s) => {
        if (!s) return s;
        const remaining = s.endsAt - Date.now();
        if (remaining <= 0) {
          return { ...s, inProgress: false, remainingMs: 0 };
        }
        return { ...s, remainingMs: remaining };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [session]);

  return { session, log, startNext };
}
```

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

---
name: implement-feature
description: >
  Full workflow for implementing a new feature in the Pomo project. Trigger
  this skill whenever the user requests a new feature, says "I want X", "add
  X functionality", "implement X", "build X", or describes a capability they
  want in the app — even if they don't explicitly say "feature". This skill
  handles GitHub issue creation, branch setup, and the complete implementation
  loop through to a pull request. Always use this skill for feature work.
---

# Implement Feature

Complete workflow: GitHub issue → branch → implement → PR.

---

## Step 1: Clarify (if needed)

Before creating anything, make sure you understand:

- **What** the feature does (user-visible behavior)
- **Acceptance criteria** — the observable outcomes that confirm it's done

Ask at most one clarifying question if a critical requirement is ambiguous. If the description is clear enough to write acceptance criteria, proceed.

### Is the feature too large?

A feature is too large if any of these are true:

- It touches more than ~4 unrelated files
- It has more than ~5 independent acceptance criteria
- It bundles multiple user-visible behaviors that could ship independently

If the feature is too large, explain why and ask the user to break it into smaller pieces before proceeding. Don't start until scope is right-sized.

---

## Step 2: Create a GitHub Issue

Create the issue with a title, acceptance criteria checklist, and the `enhancement` label, assigned to `ethan-mfb`:

```bash
gh issue create \
  --title "<short descriptive title>" \
  --body "## Acceptance Criteria\n\n- [ ] <criterion 1>\n- [ ] <criterion 2>" \
  --assignee ethan-mfb \
  --label enhancement \
  --repo ethan-mfb/pomo
```

Note the issue number from the output (e.g., `https://github.com/ethan-mfb/pomo/issues/7` → issue **#7**).

Assigning the issue to `ethan-mfb` and adding the `enhancement` label marks it as actively in-progress.

---

## Step 3: Create the Feature Branch

Create and check out a branch named `feature/<issue-number>-<slug>`:

```bash
git checkout -b feature/<N>-<short-slug>
```

The slug should be lowercase, hyphen-separated, 3–5 words. Example: for issue #7 "Add pause button" → `feature/7-add-pause-button`.

---

## Step 4: Implement the Feature

Follow this loop exactly (from LLM_INSTRUCTIONS.md):

### 4a. Plan

Write a brief developer plan:

- **Goal** — what the feature does
- **Approach** — high-level strategy
- **Files to change** — which files and what changes
- **Acceptance criteria** — same as the issue

Share the plan as text in the conversation before writing any code.

### 4b. Tests first

Write Playwright e2e tests for each acceptance criterion _before_ implementing the feature. Tests should:

- Build and preview the app locally (`VITE_PWA_DISABLED=true npm run build && npm run preview`)
- Point at `http://localhost:4173/pomo/`
- Verify each acceptance criterion

### 4c. Implement

Write the feature code following the project's architectural principles:

- Keep components small and focused
- Define types first for non-trivial features
- Use named exports, explicit `.tsx` imports, BEM class naming

### 4d. Quality checks

Run all three in sequence:

```bash
npm run lint
npm run format
npm run build
```

Fix any errors before proceeding.

### 4e. Commit early and often

Commit and push small, buildable increments as you go — don't accumulate all changes into one final commit. Good commit points include:

- After adding types/interfaces
- After writing e2e tests (before implementing)
- After each logical piece of implementation (e.g., one component, one hook)
- After fixing lint/format/build errors

Each commit should leave the codebase in a buildable state (`npm run build` passes). Use conventional commit messages, subject ≤ 72 chars:

```
feat: <description>
test: add e2e tests for <feature>
refactor: <description>
```

Push after each commit:

```bash
git push -u origin feature/<N>-<slug>   # first push
git push                                 # subsequent pushes
```

### 4f. Changelog entry

After the feature is fully implemented, generate the changelog entry:

```bash
npx ccg change
```

Commit and push the generated change file.

### 4g. Open a Pull Request

```bash
gh pr create \
  --base user/ai/main \
  --title "feat: <description>" \
  --body "$(cat <<'EOF'
Closes #<N>

## Summary
<1-3 bullet points describing what changed>

## Test plan
- [ ] e2e tests pass
- [ ] `npm run build` passes
- [ ] Manually verified in preview
EOF
)"
```

Return the PR URL to the user.

---

## Quick Reference

| Item           | Value                      |
| -------------- | -------------------------- |
| Repo           | `ethan-mfb/pomo`           |
| PR base branch | `user/ai/main`             |
| Branch pattern | `feature/<issue-N>-<slug>` |
| Assignee       | `ethan-mfb`                |
| Feature label  | `enhancement`              |

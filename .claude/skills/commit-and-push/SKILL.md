---
name: commit-and-push
description: >
  Use this skill whenever the user wants to commit, save, or persist their
  code changes to git — including requests like "commit my changes", "push
  this to remote", "save this to git", "let's commit and push", "ship it",
  "push my work", or any request to record the current state of changes in
  version control. Also invoke this skill proactively after completing a
  coding task when the user hasn't explicitly said to commit but the context
  strongly implies they'd want their work saved (e.g., "ok that looks good"
  after a multi-file change). When in doubt, offer to commit.
---

# Commit and Push

This skill guides you through safely committing and optionally pushing
changes to a git remote.

## 1. Gather context first

Before staging anything, run these in parallel so you understand the full
picture:

- `git status` — what's modified, untracked, or staged
- `git diff HEAD` — the actual content of all changes
- `git log --oneline -5` — recent commit messages (to match their style)
- `git branch --show-current` — the current branch name
- `git remote -v` — whether a remote exists and what it's called

## 2. Decide what to stage

Stage files deliberately — prefer `git add <specific-file>` over `git add .`
or `git add -A`. The goal is to avoid accidentally including:

- `.env` files, credentials, or secrets
- Large binaries or build artifacts that shouldn't be tracked
- Unrelated changes the user didn't mention

If you see something unexpected in `git status` (e.g., a large file or a
secret-looking filename), flag it to the user before staging.

## 3. Write the commit message

Look at the recent commit log to understand the style used in this repo
(conventional commits like `feat:`, `fix:`, `chore:` vs plain prose). Match
that style.

A good commit message:

- Summarizes _what changed and why_ (not just "update files")
- Is under 72 characters for the subject line
- Uses imperative mood: "add", "fix", "remove" — not "added", "fixed"

Pass the message via a heredoc to preserve formatting:

```bash
git commit -m "$(cat <<'EOF'
feat(auth): add JWT refresh token rotation
EOF
)"
```

## 4. Push

After committing, push unless the user said not to:

```bash
git push                          # if tracking branch exists
git push -u origin <branch>       # if no upstream is set yet
```

If on `main` or `master` and pushing directly would be unusual for this
repo (e.g., a PR-based workflow is evident from the recent log), mention
that before pushing and ask if the user wants a branch instead.

## 5. Safety rules

- **Never use `--no-verify`** — if a pre-commit hook fails, fix the
  underlying issue and commit again as a new commit (don't amend the
  previous one after a hook failure).
- **Never force-push to `main`/`master`** without explicit user instruction.
- **Don't amend published commits** — create a new commit instead.
- If the user is on a detached HEAD, warn them before committing.

## 6. Report back

After pushing, tell the user:

- The commit hash (first 8 chars) and message
- The branch and remote it was pushed to
- Any warnings encountered (skipped files, hook failures fixed, etc.)

Keep the summary short — the user can read `git log` themselves.

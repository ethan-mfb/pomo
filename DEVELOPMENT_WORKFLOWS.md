# Development Workflows

All workflows use git worktrees to make changes to source code and do not make changes to source code in the root repository.

## Methodology (Scrum)

These workflows are **Scrum-informed**. Work starts from an ordered backlog
(GitHub issues), lands as small reviewable Increments (PRs into `develop`), and
must meet a shared **Definition of Done** before a PR opens. Each workflow below
maps onto a Scrum event or artifact:

| Scrum | Here |
| --- | --- |
| Product Backlog / Product Goal | GitHub issues, ordered; the pomo product vision |
| Sprint Planning (Why/What/How) | the **Plan** step + confirmation gate in each workflow |
| Increment + Definition of Done | a PR into `develop` that passes tests, lint, and build |
| Sprint Review | opening the PR + **running the app** for live review |
| Sprint (cadence) → production | integration on `develop`; **Release** ships `develop → main` |
| Product Owner / Developers / Scrum Master | the human / the agentic layer / the enforced guardrails |

The agentic layer carries the full methodology — the Scrum→factory mapping, the
five values as agent behavior, and the canonical **Definition of Done** — in
[`.claude/docs/scrum-methodology.md`](.claude/docs/scrum-methodology.md).
Skills consult it when a workflow decision isn't spelled out below.

## Implement Feature (issue → PR)

```mermaid
flowchart LR
    A[GitHub issue] --> B[Gather ACs]
    subgraph AI
        B[Gather ACs] --> C[Plan]
        C --> M[Mark issue active]
        M --> D["Write test(s)"]
        D --> F[Implement]
        F --> V{"Test(s) pass?"}
        V -->|No| F
        V -->|Yes| H[Open pull request]
    end
    H --> I[Run app]
```

## Bugfix (issue → PR)

```mermaid
flowchart LR
    A[GitHub issue] --> B[Reproduce]
    subgraph AI
        B[Reproduce] --> C[Plan]
        C --> M[Mark issue active]
        M --> D["Write e2e test(s)"]
        D --> E[Implement]
        E --> F{"Test(s) pass?"}
        F -->|No| E
        F -->|Yes| G[Open pull request]
    end
    G --> H[Run app]
```

## Chore (maintenance → PR)

Non-feature, non-bugfix upkeep — dependency bumps, config, docs, refactors,
tooling. There's no acceptance criteria or bug to reproduce, so the focus is on
scoping the change and verifying it doesn't regress the build.

```mermaid
flowchart LR
    A[Chore task] --> B[Scope change]
    subgraph AI
        B[Scope change] --> C[Plan]
        C --> D[Make changes]
        D --> E[Verify: lint, build, test]
        E --> F{"Checks pass?"}
        F -->|No| D
        F -->|Yes| G[Open pull request]
    end
    G --> H[Run app]
```

## Release (develop → main)

When `develop` is ready to ship. Change files are created per development PR
(`npx ccg change`) but are **not** published then — `ccg publish` runs only
here, at release, so all changes since the last release land in the changelog
together. See the README for the release diagram.

```mermaid
flowchart LR
    A["develop ready to ship"] --> B[Branch off develop]
    subgraph AI
        B --> C["Compile changelog (ccg publish --apply)"]
        C --> D["Bump version in package.json"]
        D --> E[Open PR into develop]
        E --> F[Merge into develop]
        F --> G[Open release PR develop → main]
    end
    G --> H[Merge release PR]
    H --> I([Deploy to GitHub Pages])
```

## Start E2E (set up, don't run)

Prepares the Playwright e2e environment so the suite can run immediately — it
does **not** run any specs.

```mermaid
flowchart LR
    subgraph AI
        A[Ensure deps] --> B[Install browsers]
        B --> C["Start KasmVNC (in container)"]
        C --> D[Build app]
        D --> E[Start preview server]
    end
    E --> F([Ready — run tests separately])
```

## Stop E2E (tear down)

Stops the preview server that Start E2E launched and cleans up its state,
leaving the KasmVNC display running.

```mermaid
flowchart LR
    subgraph AI
        A[Find tracked preview server] --> B{Running?}
        B -->|Yes| C[Stop preview server]
        B -->|No| D[Nothing to stop]
        C --> E[Clean up state]
        D --> E
    end
    E --> F([KasmVNC left running])
```

# Development Workflows

All workflows use git worktrees to make changes to source code and do not make changes to source code in the root repository.

## Implement Feature (issue → PR)

```mermaid
flowchart LR
    A[GitHub issue] --> B[Gather ACs]
    subgraph AI
        B[Gather ACs] --> C[Plan]
        C --> D["Write test(s)"]
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
        C --> D["Write e2e test(s)"]
        D --> E[Implement]
        E --> F{"Test(s) pass?"}
        F -->|No| E
        F -->|Yes| G[Open pull request]
    end
    G --> H[Run app]
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

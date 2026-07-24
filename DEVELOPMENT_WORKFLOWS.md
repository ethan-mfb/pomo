# Development Workflows

## Implement Feature (issue → PR)

```mermaid
flowchart LR
    A[GitHub issue] --> B[Gather ACs]
    subgraph AI
        B[Gather ACs] --> C[Plan]
        C --> D[Write tests]
        D --> F[Implement]
        F --> H[Open pull request]
    end
    H --> I[Run app for review]
```

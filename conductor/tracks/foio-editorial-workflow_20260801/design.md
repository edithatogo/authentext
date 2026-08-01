# Design: FOI-O Editorial Workflow

```mermaid
flowchart TD
    A["Editorial intake"] --> B["Capture protected material"]
    B --> C["Restrained Authentext edit"]
    C --> D["Deterministic preservation checks"]
    D -->|"pass"| E["Write evidence receipt"]
    D -->|"fail"| F["Reject output and report drift"]
    E --> G["Human editorial acceptance gate"]
    G -->|"approved externally"| H["Separate submission or publication process"]
    G -->|"not approved"| I["Retain as unpublished draft"]
```

## Components

- Canonical academic guidance describes when and how the workflow is invoked.
- A repository script compares protected semantic tokens between source and
  edited text and emits a deterministic JSON receipt.
- Tests exercise valid preservation and each fail-closed boundary.
- Conductor and GitHub retain implementation evidence; they do not confer
  editorial or publication approval.

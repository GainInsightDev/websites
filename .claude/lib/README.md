---
title: AgentFlow Shared Libraries
created: 2025-12-03
updated: 2025-12-03
last_checked: 2025-12-03
tags: [lib, utilities, typescript]
parent: ../README.md
code_files:
  - ./validation-state.ts
---

# Shared Libraries

Reusable TypeScript modules for AgentFlow.

## Files

| File | Purpose |
|------|---------|
| [validation-state.ts](./validation-state.ts) | Tracks quality agent validation state for incremental checks |

## Usage

These are **importable modules**, not standalone scripts. Used by quality agents:

```typescript
import { ValidationStateManager } from '.claude/lib/validation-state';

const manager = new ValidationStateManager();
const changedFiles = manager.getChangedFiles('docs-quality-agent');
```

## See Also

- [Scripts](../scripts/README.md) - Standalone executable scripts

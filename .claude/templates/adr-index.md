---
title: Architecture Decision Records
created: YYYY-MM-DD
updated: YYYY-MM-DD
last_checked: YYYY-MM-DD
tags: [adr, architecture, index]
parent: ../README.md
children:
  # Add ADRs as they are created
  # - ./adr-001-example.md
---

# Architecture Decision Records

This index provides a quick reference to all architectural decisions for this project. Read this file first to understand the architectural landscape before diving into specific ADRs.

## Decision Summary

<!-- One-line summary of each active decision. Update when ADRs change. -->

| Area | Decision | ADR |
|------|----------|-----|
| Authentication | [e.g., Cognito with custom attributes] | [ADR-001](./adr-001-auth.md) |
| Data Storage | [e.g., DynamoDB single-table design] | [ADR-002](./adr-002-data.md) |
| API Layer | [e.g., AppSync with Lambda resolvers] | [ADR-003](./adr-003-api.md) |
| Multi-tenancy | [e.g., Row-level isolation via tenant_id] | [ADR-004](./adr-004-tenancy.md) |

## Quick Reference

<!-- Expand this section with key facts an agent needs to make decisions -->

**Authentication:**
- [Summary of auth approach and key implications]

**Data Access:**
- [Summary of data patterns and constraints]

**API Design:**
- [Summary of API approach]

**Multi-tenancy:**
- [Summary of isolation strategy]

## All ADRs

### Active

| # | Title | Status | Date | Impact |
|---|-------|--------|------|--------|
| 001 | [Title](./adr-001-example.md) | Accepted | YYYY-MM-DD | Auth, Security |
| 002 | [Title](./adr-002-example.md) | Accepted | YYYY-MM-DD | Data layer |

### Superseded

| # | Title | Superseded By | Date |
|---|-------|---------------|------|
| - | - | - | - |

### Deprecated

| # | Title | Reason | Date |
|---|-------|--------|------|
| - | - | - | - |

## When to Create an ADR

Create an ADR when:
- Making a choice that affects multiple components
- Choosing between significantly different approaches
- Making a decision that's hard to reverse
- Future developers would ask "why did we do this?"

See `af-architecture-expertise` skill for detailed guidance.

## ADR Lifecycle

```
Proposed → Accepted → [Active]
                   ↓
              Superseded (by newer ADR)
                   ↓
              Deprecated (no longer relevant)
```

---

**Template:** `.claude/templates/adr-index.md`
**Last Updated:** YYYY-MM-DD

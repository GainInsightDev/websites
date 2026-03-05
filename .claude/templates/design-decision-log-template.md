---
title: Design Decision Log
created: {{DATE}}
updated: {{DATE}}
last_checked: {{DATE}}
tags: [design, decisions, ux, log, template]
---

# Design Decision Log

> **Purpose:** Prevent re-litigation and design amnesia. All UX decisions are recorded here.
> **Rule:** Decisions are immutable. New decisions may supersede old ones, but never edit history.
> **Storage:** Git-versioned (this file)

## How to Use This Log

1. **Before making a UX decision:** Search this log for prior decisions on the topic
2. **When reviewing UI:** Check if implementation aligns with logged decisions
3. **When disagreeing:** Propose a new decision that supersedes, don't argue about old ones
4. **During UX review:** Classify findings as Aligned, Tension, or Violation

---

## Decision Index

| ID | Date | Scope | Decision Summary | Status |
|----|------|-------|------------------|--------|
| DD-001 | {{DATE}} | [scope] | [one-line summary] | Active |
<!-- Add new decisions above this line -->

---

## Decisions

### DD-001: [Decision Title]

| Field | Value |
|-------|-------|
| **Date** | {{DATE}} |
| **Reviewer** | [Name/Role] |
| **Scope** | [e.g., "Navigation", "Forms", "Data Tables", "Modals"] |
| **Status** | Active / Superseded by DD-XXX / Deprecated |

**Context:**
> [What problem or question prompted this decision? What was unclear?]

**Decision:**
> [What was decided? Be specific and actionable.]

**Alternatives Considered:**

1. **[Alternative A]**
   - Pros: [...]
   - Cons: [...]
   - Why rejected: [...]

2. **[Alternative B]**
   - Pros: [...]
   - Cons: [...]
   - Why rejected: [...]

**Rationale:**
> [Why this decision over alternatives? Reference brand guidelines or reference class if applicable.]

**Tradeoffs Accepted:**
- [What we're giving up or accepting as a consequence]

**Implementation Notes:**
- [Any specific guidance for implementing this decision]

---

<!-- TEMPLATE FOR NEW DECISIONS - Copy this section -->
<!--
### DD-XXX: [Decision Title]

| Field | Value |
|-------|-------|
| **Date** | YYYY-MM-DD |
| **Reviewer** | [Name/Role] |
| **Scope** | [e.g., "Navigation", "Forms", "Data Tables", "Modals"] |
| **Status** | Active |

**Context:**
> [What problem or question prompted this decision?]

**Decision:**
> [What was decided?]

**Alternatives Considered:**

1. **[Alternative A]**
   - Pros: [...]
   - Cons: [...]
   - Why rejected: [...]

**Rationale:**
> [Why this decision?]

**Tradeoffs Accepted:**
- [...]

**Implementation Notes:**
- [...]

---
-->

## Decision Categories

Use these scopes for consistency:

| Scope | Covers |
|-------|--------|
| **Navigation** | Sidebar, breadcrumbs, tabs, routing patterns |
| **Forms** | Input validation, error display, submission flow |
| **Data Tables** | Sorting, filtering, pagination, row actions |
| **Modals** | Dialog vs Sheet vs Popover usage |
| **Feedback** | Loading states, success/error messages, toasts |
| **Layout** | Page structure, responsive behavior, density |
| **Typography** | Font usage, heading hierarchy, text styles |
| **Color** | Semantic color usage, theming |
| **Icons** | Icon library, sizing, labeling |
| **Accessibility** | Keyboard nav, screen reader, focus management |
| **Mobile** | Touch targets, gestures, platform-specific |

---

## Using Decisions During UX Review

When performing a UX review, classify each finding:

### Aligned
> Implementation matches a logged decision.
>
> **Action:** Note as "Reaffirming DD-XXX"

### Tension
> Implementation differs from logged decision, but may be intentional evolution.
>
> **Action:** Discuss with stakeholder. If change is intentional, create new decision that supersedes.

### Violation
> Implementation contradicts a logged decision without justification.
>
> **Action:** Flag for correction. Implementation should match decision, or decision should be formally superseded.

### No Prior Decision
> No logged decision exists for this area.
>
> **Action:** If significant, create a new decision. If trivial, note and move on.

---

## Superseding Decisions

When a decision needs to change:

1. **DO NOT** edit the original decision
2. **DO** create a new decision with:
   - Reference to superseded decision: "Supersedes DD-XXX"
   - Explanation of why the change is needed
   - Updated guidance
3. **DO** update the original decision's status to "Superseded by DD-YYY"
4. **DO** update the Decision Index

**Example:**
```
### DD-005: Use Sheet for All Side Panels

| Status | Superseded by DD-012 |

...original decision content...

---

### DD-012: Use Sheet for Context, Dialog for Tasks

| Status | Active |

**Context:**
> DD-005 established Sheet for all side panels, but we've found that task-completion flows work better as focused Dialogs. This supersedes DD-005.

...
```

---

*Decisions recorded here form the institutional memory of UX choices. Future developers and AI agents will reference this to maintain consistency.*

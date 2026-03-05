---
title: Atomic Requirements Guide
created: 2025-12-18
updated: 2026-01-30
last_checked: 2026-01-30
tags: [guide, requirements, atomic, features, behaviour, milestones, delivery-chunks]
parent: ./README.md
related:
  - ../../skills/af-discovery-process/SKILL.md
  - ../../skills/af-requirements-process/SKILL.md
  - ../../skills/af-work-management-expertise/SKILL.md
  - ../../skills/af-bdd-expertise/SKILL.md
---

# Atomic Requirements Guide

How AgentFlow structures work into Milestones, Features, Sub-issues, and Scenarios.

---

## Core Principle: Outside-In Development

> "A feature is a unit of functionality front-to-back that does a thing and deals with its edge cases, so long as its dependencies are there, and if they are not it creates them."

**Outside-in development means:**
1. Start with what the user can DO
2. Work backwards to what must exist
3. Create dependencies as you encounter them

This is why AgentFlow setup starts with "deploy hello world" - it forces CI/CD and infrastructure to exist.

---

## The Hierarchy

| Linear Construct | AgentFlow Meaning | Created When | Example |
|------------------|-------------------|--------------|---------|
| **Team** | Product/organisational boundary | Setup | "Agentview" |
| **Project** | Optional — only for "super-epics" | As needed | Rarely used |
| **Milestone** | Delivery goal (groups related features) | Discovery or Planning | "Auth MVP", "v1.0 Release" |
| **Issue (Parent)** | ONE unit of deliverable capability | Discovery | "User can sign up with email" |
| **Sub-issue** | Specification artifact | Requirements | [Behaviour] scenarios, [UX] Storybook |
| **Cycle** | Weekly time-box | Ongoing | Week of 2026-02-10 |

```
Team
  └── Milestone (delivery goal — serves as "Epic")
        └── Issue (one unit of deliverable capability)
              ├── [Behaviour] Sub-issue (scenarios — created in Requirements)
              ├── [UX] Sub-issue (Storybook/RTL — created in Requirements)
              └── Scenarios (in Mini-PRD Section 4)
                    └── Tests (generated from scenarios in Delivery)
```

**Note:** Milestones serve the role that "Epics" traditionally fill — grouping related features toward a delivery goal. Use Milestones (not parent issues with "epic" labels) for this purpose.

### Linear Structure

- **Milestone** = Linear Milestone, groups features toward a delivery goal
- **Feature** = Linear Issue, assigned to a Milestone
- **Sub-issue** = Linear Sub-issue with `type:behaviour` or `type:ux` label
- **Scenario** = Not in Linear; lives in Mini-PRD Section 4

### Branches and Estimates

| Linear Construct | Branch | Estimate |
|------------------|--------|----------|
| **Milestone** | — (no branch) | Sum of child issues (automatic) |
| **Issue (Parent)** | `{ISSUE-ID}` (delivery) | Total effort incl. specs + implementation |
| **[Behaviour] Sub-issue** | Works on `specs` branch | Part of parent total (typically 1-3 pts) |
| **[UX] Sub-issue** | Works on `specs` branch | Part of parent total (typically 1-3 pts) |

**Parent estimate includes sub-issue effort.** A parent at 8 points might break down as: 2 pts Behaviour + 2 pts UX + 4 pts implementation. Sub-issue estimates are a breakdown, not additions.

---

## What is a Feature?

### A Feature IS:

- **One unit of functionality** - it does ONE thing
- **Front-to-back** - from UI to backend to database
- **Complete with edge cases** - happy path + errors + boundaries
- **Independently deliverable** - given its dependencies exist
- **Dependency-creating** - if dependencies don't exist, it creates them

### A Feature is NOT:

- A collection of loosely related functionality
- Just the happy path
- Just the backend OR just the frontend
- An arbitrary grouping of work

---

## Example: Authentication Milestone

```
Milestone: Auth MVP
  │
  ├── Issue: User can sign up with email (8 pts)
  │     ├── [Behaviour] Sub-issue: Signup scenarios (2 pts) @QA
  │     ├── [UX] Sub-issue: Signup Storybook (2 pts) @UX
  │     ├── Scenarios: valid signup, invalid email, weak password, duplicate
  │     └── Dependencies: Cognito user pool, SES email (creates if not exist)
  │
  ├── Issue: User can verify email (5 pts)
  │     ├── [Behaviour] Sub-issue: Verification scenarios (1 pt)
  │     ├── [UX] Sub-issue: Verification Storybook (1 pt)
  │     ├── Scenarios: valid code, invalid code, expired code, resend
  │     └── Dependencies: Cognito, signup must exist
  │
  ├── Issue: User can sign in (5 pts)
  │     ├── [Behaviour] Sub-issue: Sign-in scenarios (1 pt)
  │     ├── [UX] Sub-issue: Sign-in Storybook (1 pt)
  │     ├── Scenarios: valid creds, invalid creds, unverified account
  │     └── Dependencies: Cognito, verified user must exist
  │
  ├── Issue: User can sign out (3 pts)
  │     ├── [Behaviour] Sub-issue: Sign-out scenarios (1 pt)
  │     ├── Scenarios: sign out clears session, redirect to home
  │     └── Dependencies: signed-in user
  │
  ├── Issue: User can reset password (5 pts)
  │     ├── [Behaviour] Sub-issue: Reset scenarios (1 pt)
  │     ├── [UX] Sub-issue: Reset Storybook (1 pt)
  │     ├── Scenarios: request reset, valid code, invalid code, expired
  │     └── Dependencies: Cognito, existing user
  │
  └── Issue: User can change password (3 pts)
        ├── [Behaviour] Sub-issue: Change password scenarios (1 pt)
        ├── Scenarios: correct current password, incorrect, history check
        └── Dependencies: signed-in user
```

Each Feature (Issue):
- Is one Linear Issue assigned to the Milestone
- Has [Behaviour] and optionally [UX] sub-issues for spec work
- Has one Mini-PRD (or section of parent Mini-PRD)
- Has one Playwright E2E test file
- Is independently deliverable (given dependencies)

---

## Outside-In Flow for a Feature

```
Feature: "User can sign up with email"
    │
    ▼ What does the user DO?
    Fill form, submit, see confirmation
    │
    ▼ What must exist for this to work?
    - Signup page (UI) ← create if not exist
    - Cognito user pool ← create if not exist
    - Email sending (SES) ← create if not exist
    │
    ▼ Work backwards, creating as needed
    │
    ▼ Feature is DONE when user can do the thing
```

---

## Mapping to Artifacts

| Concept | Linear | Specification | Test Files |
|---------|--------|---------------|------------|
| **Milestone** | Milestone | — | — |
| **Feature** | Issue (in Milestone) | Mini-PRD | `[feature].spec.ts` (E2E) |
| **[Behaviour]** | Sub-issue (`type:behaviour`) | Scenarios in Mini-PRD Section 4 | — |
| **[UX]** | Sub-issue (`type:ux`) | Storybook + RTL tests | `[Component].test.tsx` |
| **Scenario** | — | Section 4 of Mini-PRD | `test('scenario name', ...)` |

### File Structure

```
docs/requirements/[feature-name]/
  └── mini-prd.md                    # Specification for ONE feature

tests/
  ├── e2e/[capability]/
  │   └── [feature].spec.ts          # Playwright E2E tests
  ├── integration/[capability]/
  │   └── [feature].test.ts          # Jest integration tests
  └── selectors/
      └── [capability].ts            # Selector contract

stories/[capability]/
  └── [Feature].stories.tsx          # Storybook stories

src/components/[feature]/
  └── [Component].test.tsx           # RTL component tests (colocated)
```

**Note:** Files are organized by capability (Milestone level) with features inside.

---

## Scenarios Within a Feature

Each Feature contains multiple scenarios covering:

### Happy Path
The main success case - user achieves their goal.

### Error Cases
What happens when things go wrong:
- Invalid input
- Missing data
- System errors

### Edge Cases
Boundary conditions:
- Empty values
- Maximum lengths
- Special characters
- Concurrent access

### Example: "User can sign up with email"

```markdown
## Scenarios

### E2E: Successful signup
**Preconditions:**
- User is on signup page

**Steps:**
1. User enters valid email and strong password
2. User submits form

**Expected:**
- User sees verification page
- Verification email is sent

---

### E2E: Invalid email rejected
**Preconditions:**
- User is on signup page

**Steps:**
1. User enters malformed email

**Expected:**
- Form shows validation error
- Submit button disabled

---

### E2E: Weak password rejected
**Preconditions:**
- User is on signup page

**Steps:**
1. User enters password missing requirements

**Expected:**
- Strength indicator shows "Too weak"
- Requirements checklist shows what's missing

---

### E2E: Duplicate email handled
**Preconditions:**
- User with email already exists

**Steps:**
1. User enters existing email
2. User submits form

**Expected:**
- Generic error shown (security: don't reveal if email exists)
- User not created
```

---

## Supporting Artifacts

### Seed Data

Scenarios with preconditions like "Given X exists" require seed data:

| Precondition | Seed Data |
|--------------|-----------|
| "Super Admin exists" | User with `platform_role: super_admin` |
| "Organisation exists" | Org entity with tenant_id |
| "User is signed in" | Valid user + auth session |

**Location:** `/amplify/seed/[feature].ts`
**Command:** `npm run seed`
**Property:** Idempotent (checks before creating)

Seed data is:
- Specified in Mini-PRD Section 6
- Implemented during Delivery
- Used by E2E and Integration tests

### Selector Contract

Maps UI fields to test IDs - the bridge between design, implementation, and testing:

```typescript
// tests/selectors/auth.ts
export const AUTH = {
  signup: {
    form: 'signup-form',
    email: 'signup-email',
    password: 'signup-password',
    submit: 'signup-submit',
    successMessage: 'signup-success',
    errorMessage: 'signup-error',
  },
};
```

- **Design:** Storybook stories reference selectors
- **Implementation:** Components use `data-testid={AUTH.signup.email}`
- **Testing:** E2E/RTL tests query by selector

---

## Why Atomic Features Matter

### Problem with Bundled Features
When work items bundle multiple units of functionality:
- Harder to know when "done"
- Dependencies unclear
- Can't deliver incrementally
- Tests become monolithic

### Benefits of Atomic Features
- Clear definition of done
- Explicit dependencies
- Incremental delivery
- Focused tests
- Outside-in thinking

---

## Phase Mapping

| Phase | What Happens | Output |
|-------|--------------|--------|
| **Discovery** | Identify Milestones, break into atomic Features | Milestones + Feature issues in Linear |
| **Requirements** | Take ONE Feature, create Mini-PRD with Scenarios, create [Behaviour] and [UX] sub-issues | Mini-PRD, selector contract, Storybook, RTL tests |
| **Delivery** | Implement Feature, generate tests from Scenarios | E2E tests, Integration tests, working code |

### When Tests Are Written

Tests are split across phases for a reason:

- **Requirements:** RTL tests + Storybook (lock UI behavior BEFORE engineering)
- **Delivery RED:** E2E + Integration tests (generated FROM scenarios)
- **Delivery GREEN:** Implementation makes all tests pass

See [Testing Guide](./testing-guide.md) for the complete test writing timeline.

---

## PRD vs Delivery Chunking

### The Key Insight

**One PRD per Milestone is correct.** Chunking happens at **delivery**, not requirements.

Why? Requirements benefit from holistic thinking:
- Scenarios interact and inform each other
- Edge cases emerge when viewing the whole
- Consistency is easier to maintain
- One approval gate, one source of truth

### What is Delivery Chunking?

Delivery chunks are **independently shippable units** extracted from a Milestone:

| Chunk Property | Description |
|----------------|-------------|
| **Independent** | Can be implemented without other chunks |
| **Deployable** | Provides value when shipped alone |
| **Testable** | Has clear acceptance criteria |
| **Sized** | Fits in one PR, reviewable in one session |

### Milestone Detection Signals

Not all work items need a Milestone. Watch for these signals:

| Signal | Indicates Milestone needed? |
|--------|-----------------|
| Multiple distinct capabilities (2+ things it does) | YES |
| Multiple independent components that could ship separately | YES |
| Scope clearly exceeds one PR | YES |
| Title has multiple nouns ("Intake & Capture", "Auth & Tenancy") | LIKELY |
| 10+ scenarios anticipated | LIKELY |

**If you detect a Milestone-level scope:**
1. Create a Milestone in Linear (e.g., "Auth MVP")
2. Create Feature issues assigned to the Milestone
3. Complete ONE PRD covering all features
4. After approval, each feature is a delivery unit

### Where Chunks Are Documented

In the Mini-PRD, add Section 7: Delivery Chunks:

```markdown
## 7. Delivery Chunks

### Chunk 1: [Name]
**Scope:** [What this chunk implements]
**Scenarios:** [List scenario numbers from Section 4]
**Dependencies:** [Other chunks or external dependencies]
**Suggested Issue ID:** [Will be created after approval]

### Chunk 2: [Name]
...
```

### Example: Photo Capture Milestone

```markdown
## 7. Delivery Chunks

### Chunk 1: Photo Capture Flow
**Scope:** Camera UI, capture button, viewfinder, flash toggle
**Scenarios:** 1-8 (camera access, capture, quality check)
**Dependencies:** None - foundational chunk
**Linear Issue:** Feature issue in Milestone, created post-approval

### Chunk 2: Draft Recovery
**Scope:** IndexedDB persistence, recovery dialog
**Scenarios:** 9-12 (save draft, detect recovery, restore/discard)
**Dependencies:** Chunk 1 (needs photos to persist)
**Linear Issue:** Feature issue in Milestone, created post-approval

### Chunk 3: S3 Upload
**Scope:** Presigned URLs, upload progress, retry logic
**Scenarios:** 13-18 (upload flow, errors, progress)
**Dependencies:** Chunk 1 (needs photos to upload)
**Linear Issue:** Feature issue in Milestone, created post-approval

### Chunk 4: Lambda Thumbnails
**Scope:** S3 trigger, Sharp processing, metadata
**Scenarios:** 19-22 (thumbnail generation, variants)
**Dependencies:** Chunk 3 (needs uploaded photos)
**Linear Issue:** Feature issue in Milestone, created post-approval
```

### Post-Approval Workflow

After the human approves the PRD:

1. **Create Feature issues** in Linear for each delivery chunk (assigned to the Milestone)
2. **Link scenarios** to their chunk's issue
3. **Set dependencies** between chunks in Linear
4. **Delivery proceeds** chunk by chunk (each chunk = one PR)

This maintains:
- Single source of truth (PRD)
- Manageable PR sizes
- Clear progress tracking
- Dependency visibility

---

## Summary

```
Milestone (delivery goal)
  └── Feature / Issue (one unit of deliverable capability)
        ├── [Behaviour] Sub-issue (scenarios — Requirements phase)
        ├── [UX] Sub-issue (Storybook/RTL — Requirements phase)
        └── Scenarios (happy path + edge cases)
              └── Tests (generated from scenarios in Delivery)
```

**Key insight:** A Feature is atomic - it does ONE thing completely, including all its edge cases and creating any dependencies it needs. Milestones group related features toward a delivery goal (serving the role traditionally filled by "Epics").

---

## Related Documentation

- [Discovery Process](../../skills/af-discovery-process/SKILL.md) - Creating Milestones and Features
- [Requirements Process](../../skills/af-requirements-process/SKILL.md) - Feature → Mini-PRD → Scenarios
- [Behaviour/BDD Expertise](../../skills/af-bdd-expertise/SKILL.md) - Writing Behaviour scenarios
- [Testing Guide](./testing-guide.md) - Test writing timeline and patterns
- [Work Management](../../skills/af-work-management-expertise/SKILL.md) - Linear issue hierarchy

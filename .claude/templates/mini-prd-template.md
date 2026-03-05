---
title: [Feature Name] Mini-PRD
created: 2025-09-06
updated: 2026-01-02
last_checked: 2026-01-02
linear_issue: LIN-XXX
status: draft | approved | implemented
tags: [mini-prd, feature, capability]
parent: ./README.md
---

# [Feature Name] Mini-PRD

## 1. Feature Summary

### Description
[2-3 sentences describing what this feature does and why it's needed]

### Success Criteria
- [ ] [Specific measurable outcome 1]
- [ ] [Specific measurable outcome 2]
- [ ] [Specific measurable outcome 3]

### User Value
[1-2 sentences on the value to end users]

## 2. Discovery Context

### Related Research
- [Link to user research document]
- [Link to competitive analysis]
- [Link to technical spike]

### Key Decisions (ADRs)
- [ADR-XXX: Decision title](link)
- [ADR-YYY: Another decision](link)

### Constraints & Assumptions
- **Technical**: [e.g., Must use existing auth system]
- **Business**: [e.g., Must launch before Q2]
- **UX**: [e.g., Must work on mobile devices]

## 3. Technical Specification

### API Contracts

#### Endpoints
```yaml
GET /api/[resource]:
  description: [What it does]
  request:
    headers:
      Authorization: Bearer [token]
  response:
    200:
      body:
        id: string
        data: object
    400:
      body:
        error: string

POST /api/[resource]:
  description: [What it does]
  request:
    body:
      field1: type
      field2: type
  response:
    201:
      body:
        id: string
        created: timestamp
```

#### GraphQL Schema
```graphql
type [Entity] {
  id: ID!
  field1: String!
  field2: Int
  relationship: [RelatedEntity]
}

type Query {
  get[Entity](id: ID!): [Entity]
  list[Entities](filter: [EntityFilter]): [[Entity]]
}

type Mutation {
  create[Entity](input: [Entity]Input!): [Entity]
  update[Entity](id: ID!, input: [Entity]Input!): [Entity]
}
```

### Database Schema
```sql
-- If using SQL
CREATE TABLE [table_name] (
  id UUID PRIMARY KEY,
  field1 VARCHAR(255) NOT NULL,
  field2 INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

```yaml
# If using DynamoDB
TableName: [table-name]
PartitionKey:
  name: pk
  type: String
SortKey:
  name: sk
  type: String
Attributes:
  - field1: String
  - field2: Number
GSI:
  - name: GSI1
    partitionKey: field2
    sortKey: created_at
```

### Component Architecture
```
/components
  /[feature-name]
    - [Component1].tsx      # Main component
    - [Component1].test.tsx # RTL tests (colocated)
    - [Component2].tsx      # Sub-component
    - hooks.ts             # Custom hooks
    - types.ts             # TypeScript types
    - utils.ts             # Helper functions
```

## 4. BDD Scenarios

### Scenario Format
Scenarios use Markdown format with test type classification. Each scenario specifies:
- **Test Type**: E2E, Integration, Component, or Unit
- **Selectors**: Reference to selector contract (for UI scenarios)
- **Preconditions**: Initial state required
- **Steps**: User/system actions
- **Expected**: Verifiable outcomes

### E2E Scenarios
*Complete user journeys through real UI + real backend*

#### E2E: [Primary happy path]
**Test Type:** E2E (complete user journey)
**Selectors:** [CAPABILITY].[feature].*

**Preconditions:**
- [Initial context 1]
- [Initial context 2]

**Steps:**
1. [User action 1]
2. [User action 2]
3. [User action 3]

**Expected:**
- [Expected outcome 1]
- [Expected outcome 2]
- [Measurable verification]

---

#### E2E: [Error case]
**Test Type:** E2E
**Selectors:** [CAPABILITY].[feature].*

**Preconditions:**
- [Error-inducing context]

**Steps:**
1. [Action that causes error]

**Expected:**
- [Error message displayed]
- [User guidance shown]

---

### Integration Scenarios
*Backend/API behavior without UI*

#### Integration: [API behavior test]
**Test Type:** Integration (Jest + SDK)

**Preconditions:**
- [Backend state required]

**Steps:**
1. [API call or backend action]

**Expected:**
- [Response or state change]
- [Side effects verified]

---

### Component Scenarios
*UI component behavior with RTL*

#### Component: [Form validation behavior]
**Test Type:** Component (RTL)
**Selectors:** [CAPABILITY].[feature].*

**Preconditions:**
- [Component] rendered
- [Initial prop state]

**Steps:**
1. [User interaction]

**Expected:**
- [UI state change]
- [Accessibility requirement met]

---

### Unit Scenarios
*Pure logic, validation, calculations*

#### Unit: [Validation rules]
**Test Type:** Unit (pure logic)

**Test cases:**
| Input | Expected Result |
|-------|-----------------|
| [input 1] | [expected 1] |
| [input 2] | [expected 2] |
| [input 3] | [expected 3] |

---

### Scenario Coverage Summary
| Category | Count | Test Types |
|----------|-------|------------|
| Happy Paths | X | E2E: _, Integration: _, Component: _, Unit: _ |
| Error Cases | Y | E2E: _, Integration: _, Component: _, Unit: _ |
| Edge Cases | Z | E2E: _, Integration: _, Component: _, Unit: _ |
| Validation | W | E2E: _, Integration: _, Component: _, Unit: _ |
| **Total** | **N** | |

## 5. Visual Specifications

### Storybook Stories
`/stories/[capability]/[feature-name].stories.tsx`

Required stories:
- Default state
- Loading state
- Error state
- Success state
- Empty state
- Mobile viewport
- Tablet viewport

### Selector Contract

Location: `/tests/selectors/[capability].ts`

```typescript
export const [CAPABILITY] = {
  [feature]: {
    form: '[feature]-form',
    field1: '[feature]-[field1]',
    field2: '[feature]-[field2]',
    submit: '[feature]-submit',
    successMessage: '[feature]-success',
    errorMessage: '[feature]-error',
  },
};
```

Components MUST use these selectors:
```tsx
<Input data-testid={[CAPABILITY].[feature].field1} />
```

### RTL Tests (Component Behavior)

Location: `/src/components/[feature]/[Component].test.tsx`

RTL tests lock component behavior before engineering handoff. They assert:
- What the user can see
- What actions are possible
- What feedback appears
- What is enabled/disabled
- Accessibility roles and semantics

Example test structure:
```typescript
describe('[Component]', () => {
  it('[behavior from Component scenario]', async () => {
    render(<[Component] onSubmit={jest.fn()} />);

    // Arrange: preconditions
    await userEvent.type(screen.getByTestId([SELECTOR]), 'value');

    // Assert: expected outcomes
    expect(screen.getByTestId([SELECTOR])).toBeDisabled();
    expect(screen.getByText(/error message/i)).toBeInTheDocument();
  });
});
```

### Component Designs

#### Desktop Layout
- **Container**: [Max width, padding]
- **Grid**: [Columns, gaps]
- **Typography**: [Sizes, weights]
- **Colors**: [Primary, secondary, states]

#### Mobile Adaptations
- **Breakpoint**: 768px
- **Layout**: [Stack vs grid]
- **Touch targets**: Minimum 44px
- **Gestures**: [Swipe, tap, long-press]

#### Component States
- **Default**: [Description]
- **Loading**: [Skeleton or spinner]
- **Error**: [Error message display]
- **Success**: [Success feedback]
- **Empty**: [Empty state design]
- **Disabled**: [Disabled appearance]

### shadcn/ui Components Used
- `Card` - For container layout
- `Button` - For actions
- `Input` - For form fields
- `Select` - For dropdowns
- `Toast` - For notifications
- [Additional components]

### Accessibility Requirements
- **ARIA Labels**: All interactive elements
- **Keyboard Navigation**: Tab order defined
- **Screen Reader**: Announcements for state changes
- **Color Contrast**: WCAG 2.1 AA compliant
- **Focus Indicators**: Visible focus states

## 6. Implementation Notes

### Dependencies
- **NPM Packages**: [List any new packages needed]
- **Internal**: [Internal modules/services required]
- **External APIs**: [Third-party services]

### Seed Data Requirements

For scenarios with preconditions like "Given X exists", specify seed data:

**Users:**
| Email | Password | Type | Attributes |
|-------|----------|------|------------|
| [test-user@example.com] | [Password123!] | [User type] | [custom attributes] |

**[Domain Entities]:**
| Field 1 | Field 2 | Status |
|---------|---------|--------|
| [value] | [value] | [status] |

**Location:** `/amplify/seed/[feature].ts`
**Command:** `npm run seed`

Seed data is idempotent - checks existence before creating.

### Performance Considerations
- **Initial Load**: [Target metrics]
- **Interactions**: [Response time targets]
- **Data Volume**: [Expected scale]
- **Caching**: [Strategy if applicable]

### Security Considerations
- **Authentication**: [Required auth level]
- **Authorization**: [Permission checks]
- **Data Validation**: [Input sanitization]
- **Sensitive Data**: [PII handling]

### Migration/Rollback Plan
- **Feature Flag**: [Flag name if applicable]
- **Data Migration**: [If needed]
- **Rollback Steps**: [How to revert]

### Monitoring & Analytics
- **Metrics to Track**:
  - [Metric 1: Description]
  - [Metric 2: Description]
- **Success Indicators**:
  - [KPI 1: Target value]
  - [KPI 2: Target value]
- **Error Tracking**: Sentry integration configured

## 7. Effort Estimation

### Story Points
- **Estimated Points:** [X]
- **Total Hours:** [Y]
- **Total Days:** [Z]
- **Confidence:** [High | Medium | Low]

### Breakdown by Functional Area

| Area | Work | Hours | Role |
|------|------|-------|------|
| FE | [Frontend work description] | [X] | SE |
| BE | [Backend work description] | [X] | SE |
| INFRA | [Infrastructure work description] | [X] | SE |
| TEST | [Testing work description] | [X] | SE/QA |
| UX | [Design work description] | [X] | UX |
| DOCS | [Documentation work description] | [X] | PM/SE |
| **Total** | | **[X]** | |

### Sub-Issue Estimates (for features > 3 points)

| Sub-Issue | Scope | Hours | Points |
|-----------|-------|-------|--------|
| [ISSUE-ID]: [Title] | [Areas covered] | [X] | [X] |
| [ISSUE-ID]: [Title] | [Areas covered] | [X] | [X] |
| **Roll-Up Total** | | **[X]** | **[X]** |

### Estimation Basis
- **Requirements clarity:** [Clear | Moderate | Ambiguous]
- **Technical risk:** [Low | Medium | High]
- **Dependencies:** [List blocking issues or external factors]
- **Change from Discovery estimate:** [Discovery was X points / Y hours — refined because...]

## 8. Delivery Checklist

### Pre-Implementation (Requirements Complete)
- [ ] Mini-PRD approved by stakeholder (Gate 2)
- [ ] Effort estimate finalized (Section 7) with hours and points
- [ ] Story points set on Linear issue (and sub-issues if applicable)
- [ ] All BDD scenarios written in Markdown format
- [ ] Selector contract created
- [ ] Storybook stories created
- [ ] RTL tests created and passing
- [ ] API contracts finalized
- [ ] Database schema reviewed
- [ ] Seed data requirements documented

### Implementation
- [ ] E2E tests written from scenarios (failing first - TDD)
- [ ] E2E tests passing
- [ ] RTL tests still passing (design contract maintained)
- [ ] Storybook stories rendering
- [ ] API endpoints working
- [ ] Database migrations complete
- [ ] Error handling implemented

### Pre-Deployment
- [ ] Code review completed
- [ ] Security scan passed
- [ ] Performance tested
- [ ] Accessibility validated
- [ ] Documentation updated

### Post-Deployment
- [ ] Deployed to staging
- [ ] All tests passing in CI
- [ ] Monitoring configured
- [ ] Feature flag enabled (if applicable)
- [ ] Stakeholder sign-off

## Appendix

### Glossary Terms
[List all domain-specific terms used in this PRD with definitions]

### References
- [Linear Issue: LIN-XXX](link)
- [Storybook](link) - Source of truth for UI
- [Technical Spike](link)
- [Related PRDs](link)

---

**Status**: [Draft | In Review | Approved | Implemented]
**Approved By**: [Name] on [Date]
**Implemented By**: [Name] on [Date]

---
title: Requirements Phase Guide
created: 2025-09-06
updated: 2026-02-06
last_checked: 2026-02-06
tags: [guide, requirements, phase-3, mini-prd, bdd]
parent: ./README.md
related:
  - ../../skills/af-orchestration/SKILL.md
  - ../../skills/af-requirements-process/SKILL.md
  - ../../commands/requirements/README.md
  - ../../templates/mini-prd-template.md
---

# Requirements Phase Guide

This guide explains how to transform Linear Features from Discovery into comprehensive mini-PRDs with BDD specifications and visual designs.

## Overview

The Requirements phase is the critical bridge between Discovery (understanding what to build) and Delivery (building it). This phase produces a mini-PRD (Product Requirements Document) that serves as the single source of truth for implementation.

## Key Principles

### 1. Three Amigos Analysis
Every feature is analyzed from three perspectives:
- **Business**: What value does this deliver?
- **Development**: How should we build it?
- **QA**: What could go wrong?

### 2. Human-in-the-Loop
All major decisions require human approval:
- Technical approach must be validated
- Scenario coverage must be confirmed
- Final specs require explicit sign-off

### 3. Comprehensive Specification
The mini-PRD must contain everything needed for implementation:
- Business context and success criteria
- Technical architecture and API contracts
- BDD scenarios with complete coverage
- Visual designs as executable Storybook stories

## Step-by-Step Process

### Step 1: Start Requirements Refinement

```bash
# Run the refine-requirements command with a Linear Feature ID
/refine-requirements LIN-321
```

The Requirements Orchestrator will:
1. Read the Linear feature and related Discovery docs
2. Analyze from Three Amigos perspectives
3. Present initial analysis for your feedback

### Step 2: Collaborate on Approach

The orchestrator presents analysis like:

```markdown
## Three Amigos Analysis

**Business Perspective**: 
- Increases conversion by 15%
- Enables marketing campaigns
- Critical for Q2 revenue goals

**Development Perspective**:
- New PromoCode entity needed
- Integration with cart service
- Consider existing discount engine

**QA Perspective**:
- Edge cases: expired codes, limits
- Security: prevent brute force
- Performance: validation speed

Does this align with your vision?
```

You provide feedback until the approach is approved.

### Step 3: Mini-PRD Creation

Once approach is approved, the orchestrator:
1. Creates mini-PRD using the template
2. Fills in all known sections
3. Invokes specialized agents

#### BDD Agent Invocation
```markdown
Invoking bdd-agent to create Markdown scenarios...

Created:
- /docs/requirements/mini-prd/promo-codes.md (BDD section)
```

#### UX Design Agent Invocation
```markdown
Invoking ux-design-agent to create visual specs...

Created:
- /stories/billing/promo-codes.stories.tsx
- /docs/requirements/promo-codes/user-flow.md
```

### Step 4: Review Complete Mini-PRD

The orchestrator presents the complete mini-PRD:

```markdown
# Promotional Codes Mini-PRD

## 1. Feature Summary
Enable customers to apply promotional codes...

## 2. Discovery Context
- User Research: /docs/requirements/user-analysis.md
- ADR-006: Discount calculation strategy

## 3. Technical Specification
[API contracts, database schema, architecture]

## 4. BDD Scenarios
[Complete Markdown scenarios with all paths covered]

## 5. Visual Specifications
[Storybook stories, component designs]

## 6. Implementation Notes
[Dependencies, performance, security]

Please review and provide feedback.
```

### Step 5: Approve Requirements

When mini-PRD is complete:

```bash
/approve-requirements LIN-321
```

The approval command:
1. Verifies all artifacts exist
2. Runs quality checks
3. Gets your explicit approval
4. Updates Linear to "Approved"

## Mini-PRD Structure

### Section 1: Feature Summary
- **Purpose**: Business context and value
- **Contents**: Description, success criteria, user value
- **Example**: "Enable 15% conversion increase through targeted discounts"

### Section 2: Discovery Context
- **Purpose**: Link to research and decisions
- **Contents**: User research, ADRs, constraints
- **Example**: Links to Discovery docs, architectural decisions

### Section 3: Technical Specification
- **Purpose**: Define implementation approach
- **Contents**: API contracts, database schema, architecture diagrams
- **Examples**:
  - REST API with OpenAPI spec, PostgreSQL tables, Express handlers
  - GraphQL schema, DynamoDB tables, Lambda functions
  - gRPC services, MongoDB collections, Kubernetes deployments

### Section 4: BDD Scenarios
- **Purpose**: Complete test coverage
- **Contents**: Markdown scenarios (happy/error/edge)
- **Example**: User login, invalid credentials, account locked

### Section 5: Visual Specifications
- **Purpose**: UI/UX requirements
- **Contents**: Storybook stories, components, flows
- **Example**: Login form, error states, responsive design

### Section 6: Implementation Notes
- **Purpose**: Critical considerations
- **Contents**: Dependencies, performance, security
- **Example**: Auth integration, 200ms response time, OWASP compliance

### Section 7: Delivery Checklist
- **Purpose**: Track implementation progress
- **Contents**: Pre/during/post implementation checks
- **Example**: Tests passing, deployed to staging, monitoring active

## Agent Responsibilities

### BDD Agent
- Transforms requirements into Markdown scenarios
- Creates scenario sections in mini-PRDs
- Generates test type classification
- Ensures glossary compliance

### UX Design Agent
- Creates Storybook stories from BDD scenarios
- Selects shadcn/ui components
- Documents responsive behavior
- Specifies accessibility requirements

### Project Management Agent
- Updates Linear issue status
- Creates implementation sub-tasks
- Links all artifacts
- Tracks progress

## File Outputs

### Directory Structure
```
/docs/requirements/[feature-name]/
  ├── mini-prd.md           # Complete specification
  └── user-flow.md          # Mermaid flow diagrams

/tests/[layer]/[capability]/
  └── [feature-name].test.ts    # Implementation tests

/stories/[capability]/
  └── [feature-name].stories.tsx # Storybook stories
```

### Example Files

#### Markdown Scenario (in mini-PRD)
```markdown
## Scenario: Apply valid promotional code [UNIT]
@linear:LIN-321 @cap:billing @priority:high

**Preconditions:**
- Customer has items in cart
- Promotional code "SAVE10" exists and is active

**Steps:**
1. Customer enters code "SAVE10" in promo code field
2. Customer clicks "Apply"

**Expected:**
- Discount is calculated and shown
- Order total is reduced by discount amount
```

#### Storybook Story
```typescript
export const ApplyValidCode: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabel('Promo Code'), 'SAVE10');
    await userEvent.click(canvas.getByText('Apply'));
    await expect(canvas.getByText('10% discount applied')).toBeVisible();
  }
};
```

## Quality Checklist

Before approving requirements, verify:

### Completeness
- [ ] All Linear acceptance criteria addressed
- [ ] Discovery context properly linked
- [ ] Technical approach documented
- [ ] All scenarios covered (happy/error/edge)

### Quality
- [ ] Glossary compliance verified
- [ ] Design system consistency
- [ ] Accessibility requirements met
- [ ] Performance targets defined

### Artifacts
- [ ] Mini-PRD document created
- [ ] Markdown scenarios written (with test type classification)
- [ ] Storybook stories created
- [ ] User flows documented

## Common Patterns

### API-Heavy Features
**Focus on:**
- API contract definition (REST OpenAPI, GraphQL schemas, gRPC protobuf)
- Request/response examples with payloads and headers
- Error codes, messages, and HTTP status handling
- Rate limiting, throttling, and quota strategies
- Authentication/authorization requirements

**REST API Example:**
```yaml
# OpenAPI 3.0 specification
paths:
  /api/promo-codes/validate:
    post:
      summary: Validate promotional code
      requestBody:
        content:
          application/json:
            schema:
              properties:
                code: { type: string, pattern: '^[A-Z0-9]{6,12}$' }
                cartTotal: { type: number, minimum: 0 }
      responses:
        200:
          description: Valid code
          content:
            application/json:
              schema:
                properties:
                  discount: { type: number }
                  expiresAt: { type: string, format: date-time }
        404:
          description: Code not found or expired
```

**GraphQL Example:**
```graphql
type PromoCode {
  id: ID!
  code: String!
  discountPercent: Float!
  expiresAt: AWSDateTime!
  usageLimit: Int
  usageCount: Int!
}

input ValidatePromoCodeInput {
  code: String!
  cartTotal: Float!
}

type Mutation {
  validatePromoCode(input: ValidatePromoCodeInput!): PromoCodeValidation!
}
```

### UI-Heavy Features
**Focus on:**
- Storybook stories for all component states
- Component specifications with shadcn/ui or design system
- Responsive breakpoints and mobile behavior
- Interaction animations and transitions
- Accessibility requirements (ARIA, keyboard navigation)

**Example Storybook Story:**
```typescript
export const PromoCodeInput: Story = {
  args: {
    onApply: fn(),
    disabled: false,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Test valid code application
    await userEvent.type(canvas.getByLabel('Promo Code'), 'SAVE10');
    await userEvent.click(canvas.getByText('Apply'));
    await expect(args.onApply).toHaveBeenCalledWith('SAVE10');
  }
};
```

### Data-Heavy Features
**Focus on:**
- Database schema definition (SQL tables, NoSQL collections, relationships)
- Data migration plans with up/down scripts
- Backup/recovery procedures and RTO/RPO targets
- Data validation rules and constraints
- Query performance and indexing strategy

**SQL Database Example (PostgreSQL):**
```sql
-- Table: promo_codes
CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(12) UNIQUE NOT NULL,
  discount_percent DECIMAL(5,2) NOT NULL CHECK (discount_percent BETWEEN 0 AND 100),
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for code lookup
CREATE INDEX idx_promo_codes_code ON promo_codes(code) WHERE expires_at > NOW();

-- Index for expiration cleanup
CREATE INDEX idx_promo_codes_expires_at ON promo_codes(expires_at);
```

**NoSQL Database Example (DynamoDB):**
```yaml
# Table: PromoCodes
TableName: PromoCodes
KeySchema:
  - AttributeName: PK
    KeyType: HASH      # Partition key
  - AttributeName: SK
    KeyType: RANGE     # Sort key

AttributeDefinitions:
  - AttributeName: PK
    AttributeType: S   # String: "PROMO#<code>"
  - AttributeName: SK
    AttributeType: S   # String: "METADATA"
  - AttributeName: ExpiresAt
    AttributeType: N   # Number: Unix timestamp

GlobalSecondaryIndexes:
  - IndexName: ExpirationIndex
    KeySchema:
      - AttributeName: SK
        KeyType: HASH
      - AttributeName: ExpiresAt
        KeyType: RANGE
    Projection:
      ProjectionType: ALL
```

**NoSQL Database Example (MongoDB):**
```javascript
// Collection: promoCodes
{
  _id: ObjectId("..."),
  code: "SAVE10",
  discountPercent: 10.0,
  usageLimit: 1000,
  usageCount: 347,
  expiresAt: ISODate("2025-12-31T23:59:59Z"),
  createdAt: ISODate("2025-01-01T00:00:00Z"),
  updatedAt: ISODate("2025-12-09T14:23:11Z")
}

// Indexes
db.promoCodes.createIndex({ code: 1 }, { unique: true });
db.promoCodes.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
```

## Troubleshooting

### Issue: Incomplete Discovery Context
**Solution**: Return to Discovery phase to gather missing information

### Issue: Unclear Requirements
**Solution**: Schedule stakeholder meeting to clarify expectations

### Issue: Technical Constraints
**Solution**: Create ADR to document architectural decision

### Issue: Missing Glossary Terms
**Solution**: Update glossary.yml with approved terminology

## Working with Entity Epics from Discovery

When Discovery used entity-driven decomposition, you'll receive entity parent issues labeled as Epics, each with capability sub-issues. Here's how to handle them:

### Recognition

Check the Linear issue description. Entity Epics from Discovery will note: "This is an entity Epic. Capabilities are delivery chunks."

### One PRD Per Entity

Write **one PRD** covering the entire entity (all its capabilities). Don't write separate PRDs per capability — that creates unnecessary overhead and loses the holistic view of the entity.

### Capabilities as Delivery Chunks

Each capability sub-issue becomes a delivery chunk in Section 7 of the PRD:

```markdown
## Section 7: Delivery Chunks

| Chunk | Capability | Scenarios | Dependencies |
|-------|-----------|-----------|--------------|
| 1. Task Display | Show task details, status badge | 1-4 | App Shell |
| 2. Task Status Lifecycle | Status transitions, validation | 5-8 | Chunk 1 |
| 3. Task Estimates | Estimate vs actual comparison | 9-11 | Chunk 1 |
```

### Composition Views

Composition views (e.g., "My View" = my tasks + my time + my costs) reference entity capabilities from multiple entities. When refining a composition view:
- Check which entity capabilities it depends on
- Those entity PRDs should be written first (or concurrently)
- The composition view PRD references entity capabilities, not duplicating their specs

### Discovery Sketches, Requirements Specifies

Discovery's entity model is a sketch — entities, relationships, and indicative capabilities. Requirements does the detailed work:
- Three Amigos analysis may reveal new capabilities Discovery missed
- API contracts, BDD scenarios, and Storybook stories are Requirements' job
- Discovery's sketch provides helpful context but doesn't constrain Requirements

## Best Practices

1. **Start with Clear Linear Features**: Ensure Discovery phase completed properly
2. **Iterate on Three Amigos**: Don't rush the analysis phase
3. **Be Comprehensive**: Better to over-specify than under-specify
4. **Use the Template**: Consistency across mini-PRDs is crucial
5. **Get Explicit Approval**: Never assume approval - always confirm
6. **Check for Entity Epics**: If the issue came from entity-driven Discovery, read the entity model before starting Three Amigos

## Next Phase: Delivery

Once requirements are approved:
- Mini-PRD becomes source of truth
- Delivery Orchestrator takes over
- Implementation follows BDD cycle
- No spec changes without returning to Requirements

## Related Documentation

- [Discovery Guide](./discovery-guide.md) - Previous phase
- [Delivery Guide](./delivery-guide.md) - Next phase
- [BDD Expertise Skill](../../skills/af-bdd-expertise/SKILL.md) - Markdown scenario patterns
- [Work Management Guide](./work-management.md) - Linear integration
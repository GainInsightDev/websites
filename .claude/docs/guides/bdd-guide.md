---
title: BDD Guide - Behavior-Driven Development with Markdown Scenarios
created: 2026-01-03
updated: 2026-01-03
last_checked: 2026-01-03
tags: [guide, bdd, scenarios, testing, specifications, playwright, jest]
parent: ./README.md
related:
  - ../../skills/af-bdd-expertise/SKILL.md
---

# BDD Guide - Behavior-Driven Development

This guide provides comprehensive patterns and best practices for writing Markdown scenario specifications in AgentFlow projects.

## Overview

Behavior-Driven Development (BDD) transforms requirements into executable specifications using domain language. In AgentFlow V2:

- **All features require Markdown scenarios BEFORE implementation**
- **Glossary compliance is strictly enforced**
- **Comprehensive scenario coverage is mandatory** (happy, error, boundary, validation)
- **AI generates tests directly from Markdown specs** (no step definitions)

### Why Markdown Scenarios?

AgentFlow uses Markdown scenarios because:

1. **AI interprets Markdown directly** - Natural language specifications
2. **No step definition layer** - AI generates tests from intent
3. **Selector contracts solve alignment** - Single source of truth for test selectors
4. **Clear test type classification** - E2E/Integration/Component/Unit guides implementation

### The V2 BDD Workflow

```
Requirements → Three Amigos Analysis → Markdown Scenarios → AI Generates Tests → Implementation → Tests Pass
```

1. **Requirements Phase**: Capture user stories and acceptance criteria in Linear
2. **Three Amigos**: Developer, tester, and product owner refine scenarios
3. **Markdown Scenarios**: Write executable specifications in mini-PRD Section 4
4. **Selector Contracts**: Define shared test selectors in Section 5
5. **AI Generates Tests**: AI creates Playwright/Jest/RTL tests from specs
6. **Implementation**: Write code to make tests pass (Red → Green → Refactor)

## Scenario Format

### The Preconditions/Steps/Expected Structure

Every scenario follows this format:

```markdown
### [Test Type]: [Descriptive name]
**Test Type:** [E2E | Integration | Component | Unit]
**Selectors:** [NAMESPACE.group.*] (for UI scenarios)

**Preconditions:**
- [Initial state requirement]
- [Another precondition]

**Steps:**
1. [Action taken]
2. [Another action]

**Expected:**
- [Verifiable outcome]
- [Another expected result]
```

### Complete Example

```markdown
### E2E: User signs up with valid email
**Test Type:** E2E (complete user journey)
**Selectors:** AUTH.signup.*

**Preconditions:**
- User is not logged in
- Email address not already registered

**Steps:**
1. User navigates to /signup
2. User enters valid email and strong password
3. User submits form

**Expected:**
- Verification email sent
- User sees "Check your email" message
- User record created in Cognito (unverified)
```

## Test Type Classification

Every scenario MUST be classified by test type. This determines which framework generates the test.

### Decision Framework

```
Is it a COMPLETE USER JOURNEY through REAL UI + REAL BACKEND?
  └─ Yes → E2E (Playwright)
  └─ No  → Does it test BACKEND/API behavior without UI?
            └─ Yes → Integration (Jest + SDK)
            └─ No  → Does it test COMPONENT behavior?
                      └─ Yes → Component (RTL)
                      └─ No  → Unit (Jest isolated)
```

### Test Types Reference

| Test Type | Framework | Use For | Example |
|-----------|-----------|---------|---------|
| **E2E** | Playwright | Complete user journeys through real UI + real backend | User signs up, verifies email, lands on dashboard |
| **Integration** | Jest + SDK | Backend/API behavior without UI | Cognito creates user with correct attributes |
| **Component** | RTL | UI component behavior, accessibility | Button disables when form invalid |
| **Unit** | Jest | Pure logic, validation, calculations | Password validation returns correct errors |

### Classification Examples

```markdown
### E2E: Customer completes checkout
**Test Type:** E2E (complete user journey)
→ Tests full flow through real UI and real backend

### Integration: JWT contains correct tenant claims
**Test Type:** Integration (Jest + SDK)
→ Tests backend token generation without UI

### Component: Submit button disables during form submission
**Test Type:** Component (RTL)
→ Tests component behavior in isolation

### Unit: Password strength calculation
**Test Type:** Unit (pure logic)
→ Tests validation function with no external dependencies
```

### Test Pyramid Guidelines

Aim for this distribution (guideline, not enforcement):

| Feature Type | Unit | Component | Integration | E2E |
|--------------|------|-----------|-------------|-----|
| Pure business logic | 70% | 5% | 20% | 5% |
| API-heavy workflow | 30% | 10% | 50% | 10% |
| UI-driven journey | 20% | 40% | 15% | 25% |
| Form-heavy feature | 30% | 50% | 10% | 10% |

## Selector Contracts

Selector contracts are shared constants used by BOTH components AND tests, eliminating selector misalignment.

### Purpose

- Single source of truth for `data-testid` attributes
- Components and tests reference the same constants
- No more "selector not found" failures from typos

### Contract Structure

```typescript
// tests/selectors/auth.ts
export const AUTH = {
  signup: {
    form: 'signup-form',
    email: 'signup-email',
    password: 'signup-password',
    submit: 'signup-submit',
    successMessage: 'signup-success',
    passwordError: 'signup-password-error',
  },
  signin: {
    form: 'signin-form',
    email: 'signin-email',
    password: 'signin-password',
    submit: 'signin-submit',
    forgotPassword: 'signin-forgot-password',
    errorMessage: 'signin-error',
  },
};
```

### Usage in Components

```tsx
import { AUTH } from '@/tests/selectors/auth';

export function SignupForm() {
  return (
    <form data-testid={AUTH.signup.form}>
      <Input data-testid={AUTH.signup.email} />
      <Input data-testid={AUTH.signup.password} />
      <Button data-testid={AUTH.signup.submit}>Sign Up</Button>
    </form>
  );
}
```

### Usage in Tests

```typescript
// Playwright E2E
await page.fill(`[data-testid="${AUTH.signup.email}"]`, email);
await page.click(`[data-testid="${AUTH.signup.submit}"]`);

// RTL Component
expect(screen.getByTestId(AUTH.signup.submit)).toBeDisabled();
```

### Referencing in Scenarios

UI scenarios MUST reference their selector contract:

```markdown
### Component: Signup form shows password error
**Test Type:** Component (RTL)
**Selectors:** AUTH.signup.*

**Preconditions:**
- SignupForm component rendered
...
```

## Coverage Requirements

Every feature MUST have scenarios covering these categories:

### 1. Happy Path (Primary Success)

Tests the successful flow with valid inputs.

```markdown
### E2E: Successfully apply valid promo_code at checkout
**Test Type:** E2E

**Preconditions:**
- Customer is signed in
- Cart contains items totaling $100
- Active promo_code "SAVE10" exists with 10% discount

**Steps:**
1. Customer navigates to checkout
2. Customer enters "SAVE10" in promo code field
3. Customer applies the code

**Expected:**
- Discount of $10 applied
- order_total shows $90
- Success message: "Promo code applied successfully"
```

### 2. Error Handling

Tests validation failures, exceptions, and error states.

```markdown
### E2E: Reject expired promo_code
**Test Type:** E2E

**Preconditions:**
- Customer is signed in
- Cart contains items
- promo_code "OLD10" expired on 2024-01-01

**Steps:**
1. Customer attempts to apply "OLD10"

**Expected:**
- Error message: "This promo code has expired"
- order_total remains unchanged
- No discount applied

---

### Integration: Reject already-used promo_code
**Test Type:** Integration

**Preconditions:**
- Customer previously used promo_code "ONCE10" on order #12345
- "ONCE10" is single-use only

**Steps:**
1. System validates "ONCE10" for customer

**Expected:**
- Validation fails with "already_used" error
- No discount record created
```

### 3. Boundary Cases

Tests limits, boundaries, and special conditions.

```markdown
### Integration: Promo_code with minimum order - just under
**Test Type:** Integration

**Preconditions:**
- promo_code "MIN50" requires minimum order of $50
- Cart total is $49.99

**Steps:**
1. System validates "MIN50" against cart

**Expected:**
- Validation fails with "minimum_not_met" error
- Message includes required minimum ($50)

---

### Integration: Promo_code with minimum order - exactly at minimum
**Test Type:** Integration

**Preconditions:**
- promo_code "MIN50" requires minimum order of $50
- Cart total is $50.00

**Steps:**
1. System validates "MIN50" against cart

**Expected:**
- Validation passes
- Discount calculated correctly

---

### Integration: Maximum discount cap
**Test Type:** Integration

**Preconditions:**
- promo_code "SAVE50" provides 50% off up to $100 maximum
- Cart total is $500

**Steps:**
1. System calculates discount for "SAVE50"

**Expected:**
- Discount capped at $100 (not $250)
- order_total is $400
```

### 4. Validation Scenarios

Tests input validation and format checking.

```markdown
### Component: Reject promo_code with invalid characters
**Test Type:** Component (RTL)
**Selectors:** CHECKOUT.promo.*

**Preconditions:**
- PromoCodeInput component rendered

**Steps:**
1. User types "SAVE@#$!" in promo input

**Expected:**
- Error message: "Promo codes can only contain letters and numbers"
- Apply button remains disabled
- Error has accessible role

---

### Unit: Promo_code format validation
**Test Type:** Unit

**Test cases:**
| Input | Expected Result |
|-------|-----------------|
| "SAVE10" | { valid: true } |
| "save-10" | { valid: false, error: "invalid_characters" } |
| "" | { valid: false, error: "required" } |
| "TOOLONGPROMOCODE123" | { valid: false, error: "too_long" } |
```

## Glossary Compliance

### Purpose

Glossaries ensure consistent domain language across:
- BDD scenarios
- Documentation
- Code (variable names, functions)
- UI labels
- API contracts

### Glossary Location

**File:** `.claude/templates/glossary.yml` or `/docs/glossary.yml`

### Glossary Format

```yaml
approved_term:
  definition: Clear definition in domain context
  synonyms: [alternate, terms, to, replace]
  forbidden: [never, use, these]
  context: Optional usage context
```

### Example Glossary

```yaml
customer:
  definition: A registered user who can browse and purchase products
  synonyms: [user, shopper, buyer, member]
  forbidden: [client, consumer, patron]
  context: Use for any paying or potential paying user

promo_code:
  definition: An alphanumeric code that provides a discount at checkout
  synonyms: [promotional code, discount code, coupon code]
  forbidden: [voucher, rebate, offer code]
  context: Always use snake_case in scenarios

order:
  definition: A collection of items a customer intends to purchase
  synonyms: [purchase, transaction]
  forbidden: [basket, shopping bag]
  context: Use "cart" for pre-checkout, "order" for checkout and after
```

### Enforcement Rules

1. **Always use approved terms exactly as defined**
   ```markdown
   ✅ Given an active promo_code "SAVE10"
   ❌ Given an active coupon "SAVE10"
   ```

2. **Replace synonyms with approved terms**
   ```
   Input:  "The shopper applies a discount code"
   Output: "The customer applies a promo_code"
   ```

3. **Never use forbidden terms**
   ```
   ❌ voucher, rebate, client, consumer
   ✅ promo_code, customer
   ```

4. **Check glossary BEFORE writing scenarios**

5. **Use snake_case for compound terms**
   ```
   ✅ promo_code, order_total, tenant_id
   ❌ promoCode, orderTotal, tenantId
   ```

## Language Rules

### Rule 1: Use Domain Language, Not UI Language

Write scenarios in terms of business domain, not user interface elements.

**❌ Bad (UI-focused):**
```markdown
**Steps:**
1. I click the "Submit" button
2. I see a green success message
3. The form disappears
```

**✅ Good (Domain-focused):**
```markdown
**Steps:**
1. Customer applies the promo_code

**Expected:**
- order_total is reduced by 10%
- Discount is confirmed
```

### Rule 2: No Implementation Details

Keep scenarios focused on behavior, not technical implementation.

**❌ Bad (Implementation leaked):**
```markdown
**Preconditions:**
- Row exists in promo_codes table with status='active'

**Steps:**
1. Send POST /api/v1/apply-promo with body {"code": "SAVE10"}

**Expected:**
- Response status is 200
- Database record is updated
```

**✅ Good (Behavior focused):**
```markdown
**Preconditions:**
- Active promo_code "SAVE10" exists

**Steps:**
1. Customer applies code at checkout

**Expected:**
- Discount is applied to cart
- Customer sees reduced total
```

### Rule 3: Clear Actor Identification

Always specify who is performing the action.

**❌ Bad (Ambiguous):**
```markdown
**Steps:**
1. Order is placed
2. Payment is processed
3. Confirmation is sent
```

**✅ Good (Explicit actors):**
```markdown
**Steps:**
1. Customer places order

**Expected:**
- System processes payment
- System sends confirmation to customer
```

### Rule 4: Measurable Outcomes

Use specific, verifiable assertions.

**❌ Bad (Vague):**
```markdown
**Expected:**
- User is happy
- It works correctly
- Page loads fast
```

**✅ Good (Specific):**
```markdown
**Expected:**
- order_total shows $90.00 (10% discount applied)
- Customer receives confirmation email within 30 seconds
- Dashboard loads in under 2 seconds
```

## Common Patterns

### Shared Preconditions

When multiple scenarios share the same setup, extract to a shared section:

```markdown
## Scenarios

### Shared Preconditions (all scenarios)
- Customer is signed in
- Cart contains items totaling $100

---

### E2E: Apply valid code
**Test Type:** E2E
**Selectors:** CHECKOUT.promo.*

**Preconditions:**
- (Shared preconditions apply)
- Active promo_code "SAVE10" exists

**Steps:**
1. Customer applies the code

**Expected:**
- order_total shows $90

---

### E2E: Apply invalid code
**Test Type:** E2E
**Selectors:** CHECKOUT.promo.*

**Preconditions:**
- (Shared preconditions apply)

**Steps:**
1. Customer applies "INVALID"

**Expected:**
- Error: "Promo code not found"
```

### Data-Driven Scenarios (Tables)

Use tables when testing the same behavior with different data:

```markdown
### Unit: Validate promo_code input formats
**Test Type:** Unit

**Test cases:**
| Input | Expected |
|-------|----------|
| "SAVE10" | valid |
| "save10" | valid (case insensitive) |
| "SAVE-10" | invalid: "letters and numbers only" |
| "SAVE 10" | invalid: "no spaces allowed" |
| "" | invalid: "required" |
| "VERYLONGCODE123456789" | invalid: "max 20 characters" |
```

### Data Tables for Complex Setup

Use tables for structured precondition data:

```markdown
**Preconditions:**
- The following promo_codes are active:

| code | discount | type | min_order | max_uses |
|------|----------|------|-----------|----------|
| SAVE10 | 10% | percentage | $0 | unlimited |
| FLAT20 | $20 | fixed | $100 | 1000 |
| VIP50 | 50% | percentage | $200 | 100 |

- Cart contains:

| product | quantity | price |
|---------|----------|-------|
| Blue T-Shirt | 2 | $25.00 |
| Running Shoes | 1 | $89.99 |
```

### Multi-Line Expected Content

For email bodies, messages, or other multi-line content:

```markdown
**Expected:**
- Customer receives email with body:

  > Dear Customer,
  >
  > Your promo code SAVE10 has been applied successfully.
  > You saved $10.00 on this order.
  >
  > Thank you for shopping with us!
```

## File Organization

### Mini-PRD Structure

Scenarios live in mini-PRD documents, not separate files:

```
docs/requirements/mini-prd/
├── user-authentication.md
│   ├── Section 4: Scenarios      ← Markdown scenarios
│   └── Section 5: Selector Contract
├── promo-codes.md
└── checkout-flow.md
```

### Mini-PRD Sections 4 & 5

```markdown
## 4. Scenarios

### E2E: User signs up with valid email
...

### Component: Signup form shows password strength
...

### Unit: Password validation rules
...

---

## 5. Selector Contract

```typescript
export const AUTH = {
  signup: {
    form: 'signup-form',
    email: 'signup-email',
    password: 'signup-password',
    submit: 'signup-submit',
  },
};
```

### Implementation Notes
- Import from `@/tests/selectors/auth`
- Components use `data-testid={AUTH.signup.email}`
- Tests use `[data-testid="${AUTH.signup.email}"]`
```

### Test File Structure

```
tests/
├── e2e/                    # Playwright E2E tests
│   └── auth/
│       ├── signup.spec.ts
│       └── signin.spec.ts
├── integration/            # Jest + SDK tests
│   └── auth/
│       └── cognito.test.ts
├── unit/                   # Jest unit tests (or colocated)
├── selectors/              # Shared selector contracts
│   ├── auth.ts
│   ├── checkout.ts
│   └── index.ts
└── helpers/                # Test utilities
    └── gmail-helper.ts

src/components/
└── auth/
    ├── SignupForm.tsx
    ├── SignupForm.test.tsx    # RTL test (colocated)
    └── SignupForm.stories.tsx # Storybook story
```

## Complete Example: Feature Scenario Set

Here's a complete example showing comprehensive coverage for a promo code feature:

```markdown
## 4. Scenarios

### Shared Preconditions
- Customer is signed in
- Cart contains items

---

### E2E: Successfully apply valid promo_code
**Test Type:** E2E (complete user journey)
**Selectors:** CHECKOUT.promo.*
**Coverage:** Happy path

**Preconditions:**
- (Shared preconditions)
- Cart total is $100
- Active promo_code "SAVE10" exists (10% discount)

**Steps:**
1. Customer navigates to checkout
2. Customer enters "SAVE10" in promo input
3. Customer clicks apply

**Expected:**
- Discount of $10 displayed
- order_total shows $90
- Success message: "Promo code applied successfully"
- Promo input shows applied state

---

### E2E: Reject expired promo_code
**Test Type:** E2E
**Selectors:** CHECKOUT.promo.*
**Coverage:** Error handling

**Preconditions:**
- (Shared preconditions)
- promo_code "OLD10" expired on 2024-01-01

**Steps:**
1. Customer enters "OLD10"
2. Customer clicks apply

**Expected:**
- Error message: "This promo code has expired"
- order_total unchanged
- Promo input shows error state

---

### Integration: Validate minimum order requirement
**Test Type:** Integration
**Coverage:** Boundary

**Test cases:**
| Cart Total | Min Required | Expected |
|------------|--------------|----------|
| $49.99 | $50 | Fail: "Minimum order $50 required" |
| $50.00 | $50 | Pass |
| $50.01 | $50 | Pass |

---

### Integration: Cap discount at maximum
**Test Type:** Integration
**Coverage:** Boundary

**Preconditions:**
- promo_code "HALF" provides 50% off, max $100

**Test cases:**
| Cart Total | Expected Discount | order_total |
|------------|-------------------|-------------|
| $100 | $50 | $50 |
| $200 | $100 (capped) | $100 |
| $500 | $100 (capped) | $400 |

---

### Component: Promo input shows validation errors
**Test Type:** Component (RTL)
**Selectors:** CHECKOUT.promo.*
**Coverage:** Validation

**Preconditions:**
- PromoCodeInput component rendered

**Test cases:**
| User Input | Expected Error |
|------------|---------------|
| "SAVE@#$!" | "Letters and numbers only" |
| "" (submit empty) | "Please enter a promo code" |
| "VERYLONGCODE12345678901" | "Maximum 20 characters" |

**Accessibility:**
- Error messages have role="alert"
- Input has aria-invalid="true" on error
- Error linked via aria-describedby

---

### Component: Apply button state management
**Test Type:** Component (RTL)
**Selectors:** CHECKOUT.promo.*
**Coverage:** Validation

**Preconditions:**
- PromoCodeInput component rendered

**Steps and Expected:**
1. Initial render → Apply button disabled
2. User types valid code → Apply button enabled
3. User clicks apply → Button shows loading state, disabled
4. API returns success → Button shows "Applied", disabled
5. API returns error → Button enabled, can retry

---

### Unit: Promo code validation logic
**Test Type:** Unit
**Coverage:** Validation

**Test cases:**
| Input | Result |
|-------|--------|
| "SAVE10" | { valid: true } |
| "save10" | { valid: true } (case insensitive) |
| "SAVE-10" | { valid: false, error: "INVALID_CHARACTERS" } |
| "" | { valid: false, error: "REQUIRED" } |
| null | { valid: false, error: "REQUIRED" } |
| "A".repeat(21) | { valid: false, error: "TOO_LONG" } |

---

## 5. Selector Contract

```typescript
// tests/selectors/checkout.ts
export const CHECKOUT = {
  promo: {
    container: 'promo-code-container',
    input: 'promo-code-input',
    apply: 'promo-code-apply',
    error: 'promo-code-error',
    success: 'promo-code-success',
    discount: 'promo-code-discount',
  },
  summary: {
    subtotal: 'order-subtotal',
    discount: 'order-discount',
    total: 'order-total',
  },
};
```
```

## Integration with AgentFlow

### BDD in Requirements Phase

1. **Orchestrator** determines feature needs BDD specification
2. **af-bdd-agent** is invoked with requirements and Three Amigos decisions
3. **Agent** loads `af-bdd-expertise` skill for patterns
4. **Agent** reads glossary from `/docs/glossary.yml`
5. **Agent** generates Markdown scenarios in mini-PRD Section 4
6. **Agent** creates selector contract in mini-PRD Section 5
7. **Agent** returns files for human review

### Linear Integration

Every mini-PRD links to Linear:

```markdown
---
linear_issue: LIN-123
capability: billing
priority: high
---

# Promo Code Application

## 1. Overview
...
```

This enables:
- Traceability from requirements to tests
- Progress tracking in Linear
- Automated status updates

### Approval Gates

Before implementation begins:
1. ✅ Scenarios reviewed by product owner
2. ✅ Selector contract reviewed by developer
3. ✅ Glossary compliance verified
4. ✅ Scenario coverage complete (happy/error/boundary/validation)
5. ✅ Test type classification reviewed

## Common Pitfalls

### 1. UI Language Instead of Domain Language

**Problem:** Scenarios describe UI interactions instead of business behavior.

```markdown
❌ When I click the green "Apply" button in the promo section
✅ When customer applies the promo_code
```

### 2. Implementation Details Leaked

**Problem:** Scenarios expose technical details.

```markdown
❌ Given a record in the promotions table with id=123
❌ When I POST to /api/cart/promo with JSON body
✅ Given an active promo_code "SAVE10"
✅ When customer applies the promo_code at checkout
```

### 3. Ambiguous Actors

**Problem:** Unclear who is performing actions.

```markdown
❌ When the order is submitted
✅ When the customer submits the order
```

### 4. Vague Outcomes

**Problem:** Assertions are not specific or measurable.

```markdown
❌ Then it works correctly
❌ Then the user is satisfied
✅ Then the order_total shows $90.00
✅ Then customer receives confirmation email
```

### 5. Missing Test Type

**Problem:** Scenarios without E2E/Integration/Component/Unit classification.

**Impact:** No clear implementation path, all become slow E2E tests.

**Solution:** Classify each scenario during writing - ask "What's the minimum test scope?"

### 6. All Scenarios as E2E

**Problem:** Everything classified as E2E.

**Impact:** Slow test suite, brittle tests, expensive to maintain.

**Solution:** Push tests down the pyramid - Unit for logic, Component for UI behavior, Integration for APIs, E2E only for critical journeys.

### 7. Missing Selector Contract Reference

**Problem:** UI scenarios don't reference selector contract.

**Impact:** Tests use arbitrary selectors, components don't have test IDs.

**Solution:** Always specify which selector namespace scenarios use.

### 8. Scenarios Too Long

**Problem:** 15+ items in Steps or Expected.

**Impact:** Hard to read, debug failures, maintain.

**Solution:** Split into multiple focused scenarios, one behavior each.

### 9. Testing Multiple Things

**Problem:** One scenario tests multiple behaviors.

```markdown
❌ Scenario: Apply code, see discount, checkout, and receive email
✅ Scenario: Apply valid promo_code
✅ Scenario: Complete checkout with discount
✅ Scenario: Receive order confirmation email
```

### 10. Glossary Violations

**Problem:** Using synonyms or forbidden terms.

```markdown
❌ Given a valid voucher code (forbidden term)
❌ When the shopper applies the coupon (synonyms not approved)
✅ Given an active promo_code
✅ When the customer applies the promo_code
```

## References

- **Skill:** `.claude/skills/af-bdd-expertise/SKILL.md`
- **Glossary Template:** `.claude/templates/glossary.yml`
- **Selector Contract Template:** `.claude/templates/selector-contract.ts`
- **Playwright Documentation:** https://playwright.dev/
- **React Testing Library:** https://testing-library.com/docs/react-testing-library/intro/
- **Jest Documentation:** https://jestjs.io/

---

**Last Updated:** 2026-01-03

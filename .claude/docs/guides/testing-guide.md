---
title: Testing Guide - Comprehensive Testing Strategy
created: 2025-12-02
updated: 2026-01-03
last_checked: 2026-01-03
tags: [guide, testing, jest, playwright, rtl, tdd, bdd]
parent: ./README.md
related:
  - ../../skills/af-testing-expertise/SKILL.md
  - ../../skills/af-bdd-expertise/SKILL.md
---

# Testing Guide - Comprehensive Testing Strategy

This guide provides patterns and best practices for implementing tests in AgentFlow projects.

## Overview

AgentFlow uses a multi-layered testing strategy:

| Layer | Tool | Purpose | Coverage Target |
|-------|------|---------|-----------------|
| Unit | Jest | Pure functions, validation logic | 80%+ |
| Component | RTL (React Testing Library) | Component behavior, accessibility | Key components |
| Integration | Jest + SDK | Backend/API behavior | API contracts |
| E2E | Playwright | Critical user journeys from Markdown scenarios | All scenarios |

### The Testing Pyramid

```
           E2E Tests
          (few, slow)
             /\
            /  \
           /----\
      Integration Tests
       (some, medium)
         /        \
        /----------\
         Unit Tests
      (many, fast)
```

**Principles:**
- More unit tests (fast, isolated)
- Fewer integration tests (slower, realistic)
- Fewest E2E tests (slowest, most realistic)

## Test Writing Timeline

Tests are written at different phases of development for specific reasons. Understanding this timeline is crucial for knowing what to create when.

### When Each Test Type is Written

| Test Type | Phase | Created By | Rationale |
|-----------|-------|------------|-----------|
| **RTL (Component)** | Requirements | ux-design-agent | Locks UI behavior BEFORE engineering. Acts as the "design contract" - defines what components should do. |
| **Storybook Stories** | Requirements | ux-design-agent | Visual specifications showing all component states. Source of truth for design. |
| **E2E (Playwright)** | Delivery (RED) | AI from scenarios | Tests complete user journeys. Can only run once implementation exists. Generated from Mini-PRD Section 4 scenarios. |
| **Integration** | Delivery (RED) | AI from scenarios | Tests backend/API behavior. Generated from Mini-PRD scenarios tagged as Integration. |
| **Unit** | Delivery (RED) | Developer/AI | Tests pure logic. Written alongside implementation as needed. |

### The Key Insight

**Requirements phase** creates tests that define WHAT should be built:
- RTL tests lock component behavior (the contract)
- Storybook shows what components look like
- These exist BEFORE engineering starts

**Delivery phase** creates tests that verify the feature WORKS:
- E2E tests run through real UI + real backend
- Integration tests verify API contracts
- These are generated FROM the scenarios written in Requirements

### Visual Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        REQUIREMENTS PHASE                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Mini-PRD Created:                                                       │
│    Section 4: Markdown Scenarios ─────────────────────────────────┐     │
│    Section 5: Selector Contract ──────────────────────────────┐   │     │
│                                                               │   │     │
│  ux-design-agent creates:                                     │   │     │
│    ├── Storybook stories (visual specs)                       │   │     │
│    └── RTL tests (component behavior) ◄───uses selectors──────┘   │     │
│                                                                   │     │
│  OUTPUT: Component contracts locked, ready for engineering        │     │
│                                                                   │     │
└───────────────────────────────────────────────────────────────────│─────┘
                                                                    │
┌───────────────────────────────────────────────────────────────────│─────┐
│                         DELIVERY PHASE                            │     │
├───────────────────────────────────────────────────────────────────│─────┤
│                                                                   │     │
│  RED (Generate Tests):                                            │     │
│    AI reads scenarios from Mini-PRD ◄─────────────────────────────┘     │
│    Generates:                                                           │
│      ├── tests/e2e/[capability]/[feature].spec.ts (Playwright)          │
│      ├── tests/integration/[capability]/[feature].test.ts (Jest)        │
│      └── Unit tests as needed                                           │
│    Tests FAIL (implementation doesn't exist yet)                        │
│                                                                          │
│  GREEN (Implement):                                                      │
│    Write code to make tests pass                                         │
│    Components use selector contract: data-testid={AUTH.signup.email}     │
│    Tests use same selectors: page.getByTestId(AUTH.signup.email)         │
│                                                                          │
│  REFACTOR:                                                               │
│    Clean up code, all tests still pass                                   │
│                                                                          │
│  OUTPUT: Feature complete with passing tests                             │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Why This Split?

**RTL tests in Requirements:**
- Define the UI contract BEFORE engineering starts
- Engineers know exactly what behavior to implement
- Prevents "interpretation drift" between design and implementation
- Created by ux-design-agent alongside Storybook

**E2E/Integration tests in Delivery:**
- Can't test a flow that doesn't exist yet
- Generated directly from scenarios (no manual translation)
- AI converts Markdown scenarios to Playwright/Jest code
- Selector contract ensures tests use same IDs as components

### Practical Example

**Feature: User can sign up with email**

**Requirements Phase produces:**
```
docs/requirements/signup/mini-prd.md
  └── Section 4: Scenarios (E2E: valid signup, invalid email, etc.)
  └── Section 5: Selector contract (AUTH.signup.*)

stories/auth/Signup.stories.tsx (Storybook)
src/components/auth/SignupForm.test.tsx (RTL tests)
tests/selectors/auth.ts (selector contract)
```

**Delivery Phase produces:**
```
tests/e2e/auth/signup.spec.ts (Playwright - from scenarios)
tests/integration/auth/signup.test.ts (Jest - from scenarios)
src/components/auth/SignupForm.tsx (implementation)
```

### Common Questions

**Q: What if there's no UI (API-only feature)?**
A: Skip RTL tests and Storybook. Write Integration scenarios in Requirements, generate Integration tests in Delivery.

**Q: Who generates the E2E tests from scenarios?**
A: The AI (orchestrator or dev-test-agent) reads scenarios from Mini-PRD and generates Playwright specs. Human reviews and refines.

**Q: Can I write E2E tests in Requirements?**
A: You write E2E *scenarios* in Requirements. The executable test *files* are generated in Delivery RED phase.

**Q: What if RTL tests need to change during Delivery?**
A: Update them as needed, but treat changes as design changes - they should be intentional, not drift.

---

## TDD Workflow

### Red → Green → Refactor

**Step 1: Red (Write Failing Test)**

```typescript
// Write test first - it will fail because implementation doesn't exist
describe('calculateDiscount', () => {
  test('applies percentage discount correctly', () => {
    const result = calculateDiscount(100, { type: 'percentage', value: 10 });
    expect(result).toBe(90);
  });
});

// Run: npm test
// Result: ❌ FAIL - ReferenceError: calculateDiscount is not defined
```

**Step 2: Green (Make It Pass)**

```typescript
// Write minimal code to pass the test
function calculateDiscount(
  price: number,
  discount: { type: string; value: number }
): number {
  if (discount.type === 'percentage') {
    return price * (1 - discount.value / 100);
  }
  return price;
}

// Run: npm test
// Result: ✅ PASS
```

**Step 3: Refactor (Improve Quality)**

```typescript
// Improve code without breaking tests
type DiscountType = 'percentage' | 'fixed';

interface Discount {
  type: DiscountType;
  value: number;
}

function calculateDiscount(price: number, discount: Discount): number {
  if (price < 0) throw new Error('Price cannot be negative');
  if (discount.value < 0) throw new Error('Discount cannot be negative');

  switch (discount.type) {
    case 'percentage':
      return Math.round(price * (1 - discount.value / 100) * 100) / 100;
    case 'fixed':
      return Math.max(0, price - discount.value);
    default:
      return price;
  }
}

// Run: npm test
// Result: ✅ PASS (refactoring didn't break behavior)
```

## Unit Testing with Jest

### Setup

```bash
npm install --save-dev jest @types/jest ts-jest
```

**jest.config.js:**
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
  coverageThreshold: {
    global: { branches: 80, functions: 80, lines: 80, statements: 80 }
  }
};
```

### Test Structure

```typescript
// src/lib/discount.test.ts
import { calculateDiscount, validatePromoCode } from './discount';

describe('calculateDiscount', () => {
  describe('percentage discounts', () => {
    test('applies 10% discount correctly', () => {
      expect(calculateDiscount(100, { type: 'percentage', value: 10 })).toBe(90);
    });

    test('applies 50% discount correctly', () => {
      expect(calculateDiscount(100, { type: 'percentage', value: 50 })).toBe(50);
    });

    test('handles 0% discount', () => {
      expect(calculateDiscount(100, { type: 'percentage', value: 0 })).toBe(100);
    });
  });

  describe('fixed discounts', () => {
    test('applies $20 discount correctly', () => {
      expect(calculateDiscount(100, { type: 'fixed', value: 20 })).toBe(80);
    });

    test('does not go below zero', () => {
      expect(calculateDiscount(10, { type: 'fixed', value: 20 })).toBe(0);
    });
  });

  describe('edge cases', () => {
    test('throws for negative price', () => {
      expect(() => calculateDiscount(-10, { type: 'percentage', value: 10 }))
        .toThrow('Price cannot be negative');
    });
  });
});
```

### React Component Testing

```typescript
// src/components/PromoCodeInput.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PromoCodeInput } from './PromoCodeInput';

describe('PromoCodeInput', () => {
  test('renders input field and apply button', () => {
    render(<PromoCodeInput onApply={() => {}} />);

    expect(screen.getByLabelText('Promo Code')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument();
  });

  test('calls onApply with entered code when button clicked', async () => {
    const user = userEvent.setup();
    const onApply = jest.fn();
    render(<PromoCodeInput onApply={onApply} />);

    await user.type(screen.getByLabelText('Promo Code'), 'SAVE10');
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(onApply).toHaveBeenCalledWith('SAVE10');
  });

  test('displays error message when provided', () => {
    render(<PromoCodeInput onApply={() => {}} error="Invalid code" />);

    expect(screen.getByText('Invalid code')).toBeInTheDocument();
    expect(screen.getByLabelText('Promo Code')).toHaveAttribute('aria-invalid', 'true');
  });

  test('disables button while loading', () => {
    render(<PromoCodeInput onApply={() => {}} isLoading />);

    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled();
  });

  test('clears input after successful apply', async () => {
    const user = userEvent.setup();
    const onApply = jest.fn().mockResolvedValue({ success: true });
    render(<PromoCodeInput onApply={onApply} />);

    await user.type(screen.getByLabelText('Promo Code'), 'SAVE10');
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    await waitFor(() => {
      expect(screen.getByLabelText('Promo Code')).toHaveValue('');
    });
  });
});
```

### Mocking

**Mock Functions:**
```typescript
const mockOnApply = jest.fn();
mockOnApply.mockReturnValue({ discount: 0.1 });
mockOnApply.mockResolvedValue({ discount: 0.1 }); // async
mockOnApply.mockRejectedValue(new Error('Failed'));
```

**Mock Modules:**
```typescript
// Mock entire module
jest.mock('./api/promo-codes', () => ({
  applyPromoCode: jest.fn().mockResolvedValue({ discount: 0.1 }),
}));

// Mock with implementation
jest.mock('./api/promo-codes', () => ({
  applyPromoCode: jest.fn((code) => {
    if (code === 'SAVE10') return Promise.resolve({ discount: 0.1 });
    return Promise.reject(new Error('Invalid code'));
  }),
}));
```

**Mock External Services:**
```typescript
// __mocks__/aws-amplify/auth.ts
export const signIn = jest.fn().mockResolvedValue({
  userId: 'mock-user-123',
  tokens: { accessToken: 'mock-token' }
});

export const signOut = jest.fn().mockResolvedValue(undefined);
```

### Test Fixtures

```typescript
// tests/fixtures/promo-codes.ts
import { PromoCode } from '@/types';

export const createPromoCode = (overrides: Partial<PromoCode> = {}): PromoCode => ({
  id: 'promo-123',
  code: 'SAVE10',
  discountType: 'percentage',
  discountValue: 10,
  minOrderAmount: 0,
  maxUses: null,
  currentUses: 0,
  expiresAt: new Date('2025-12-31'),
  active: true,
  createdAt: new Date(),
  ...overrides,
});

export const validPromoCode = createPromoCode();
export const expiredPromoCode = createPromoCode({
  code: 'OLD10',
  expiresAt: new Date('2020-01-01'),
  active: false
});
export const usedUpPromoCode = createPromoCode({
  code: 'USED10',
  maxUses: 100,
  currentUses: 100
});
```

## E2E Testing from Markdown Scenarios

AgentFlow uses Markdown scenario specifications. AI generates Playwright tests directly from these specifications.

### The V2 Workflow

```
Markdown Scenarios (mini-PRD) → AI → Playwright Tests → Execution
```

No step definitions required. The specification is the source of truth.

### Markdown Scenario (from Requirements Phase)

Scenarios are written in mini-PRD Section 4:

```markdown
## 4. Scenarios

### E2E: Apply valid promo code at checkout
**Test Type:** E2E (complete user journey)
**Selectors:** CHECKOUT.promo.*

**Preconditions:**
- Customer is signed in
- Cart contains items totaling $100
- Active promo_code "SAVE10" exists with 10% discount

**Steps:**
1. Customer navigates to checkout
2. Customer enters "SAVE10" in promo input
3. Customer clicks apply

**Expected:**
- order_total shows $90 (10% discount applied)
- Success message: "Promo code applied successfully"

---

### E2E: Reject expired promo code
**Test Type:** E2E
**Selectors:** CHECKOUT.promo.*

**Preconditions:**
- Customer is signed in
- Cart contains items totaling $100
- promo_code "OLD10" expired on 2024-01-01

**Steps:**
1. Customer enters "OLD10" in promo input
2. Customer clicks apply

**Expected:**
- Error message: "This promo code has expired"
- order_total remains $100
```

### Selector Contract (mini-PRD Section 5)

```typescript
// tests/selectors/checkout.ts
export const CHECKOUT = {
  promo: {
    input: 'promo-input',
    apply: 'promo-apply',
    error: 'promo-error',
    success: 'promo-success',
  },
  summary: {
    total: 'order-total',
  },
};
```

### Generated Playwright Test

AI generates tests like this from the Markdown scenarios:

```typescript
// tests/e2e/checkout/promo-codes.spec.ts
import { test, expect } from '@playwright/test';
import { CHECKOUT } from '../../selectors/checkout';

test.describe('Promo Code Application', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Sign in customer
    await signInTestCustomer(page);
    // Setup: Add items to cart
    await addItemsToCart(page, 100);
  });

  test('E2E: Apply valid promo code at checkout', async ({ page }) => {
    // Precondition: Create active promo code
    await createPromoCode({ code: 'SAVE10', discount: 10, active: true });

    // Steps
    await page.goto('/checkout');
    await page.fill(`[data-testid="${CHECKOUT.promo.input}"]`, 'SAVE10');
    await page.click(`[data-testid="${CHECKOUT.promo.apply}"]`);

    // Expected
    await expect(page.locator(`[data-testid="${CHECKOUT.summary.total}"]`))
      .toContainText('$90');
    await expect(page.locator(`[data-testid="${CHECKOUT.promo.success}"]`))
      .toContainText('Promo code applied successfully');
  });

  test('E2E: Reject expired promo code', async ({ page }) => {
    // Precondition: Create expired promo code
    await createPromoCode({
      code: 'OLD10',
      discount: 10,
      expiresAt: new Date('2024-01-01')
    });

    // Steps
    await page.goto('/checkout');
    await page.fill(`[data-testid="${CHECKOUT.promo.input}"]`, 'OLD10');
    await page.click(`[data-testid="${CHECKOUT.promo.apply}"]`);

    // Expected
    await expect(page.locator(`[data-testid="${CHECKOUT.promo.error}"]`))
      .toContainText('This promo code has expired');
    await expect(page.locator(`[data-testid="${CHECKOUT.summary.total}"]`))
      .toContainText('$100');
  });
});
```

### Run E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npm run test:e2e -- checkout/promo-codes.spec.ts

# Run with UI mode (interactive)
npm run test:e2e -- --ui

# Run headed (see browser)
npm run test:e2e -- --headed
```

## E2E Testing with Playwright

### Setup

```bash
npm init playwright@latest
```

**playwright.config.ts:**
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E Test Structure

```typescript
// e2e/checkout-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Create test user and login
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
  });

  test('complete checkout with promo code', async ({ page }) => {
    // Add item to cart
    await page.goto('/products/blue-tshirt');
    await page.click('[data-testid="add-to-cart"]');
    await expect(page.locator('[data-testid="cart-count"]')).toContainText('1');

    // Go to checkout
    await page.click('[data-testid="checkout-button"]');
    await page.waitForURL('/checkout');

    // Apply promo code
    await page.fill('[data-testid="promo-input"]', 'SAVE10');
    await page.click('[data-testid="apply-promo"]');
    await expect(page.locator('[data-testid="discount-line"]')).toContainText('$2.50');

    // Fill payment details
    await page.fill('[data-testid="card-number"]', '4242424242424242');
    await page.fill('[data-testid="card-expiry"]', '12/25');
    await page.fill('[data-testid="card-cvc"]', '123');

    // Submit order
    await page.click('[data-testid="submit-order"]');

    // Verify success
    await page.waitForURL('/order-confirmation');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-number"]')).toBeVisible();
  });

  test('shows error for invalid promo code', async ({ page }) => {
    await page.goto('/checkout');
    await page.fill('[data-testid="promo-input"]', 'INVALID');
    await page.click('[data-testid="apply-promo"]');

    await expect(page.locator('[data-testid="promo-error"]'))
      .toContainText('Invalid promo code');
  });
});
```

### Page Object Model

```typescript
// e2e/pages/checkout.page.ts
import { Page, Locator, expect } from '@playwright/test';

export class CheckoutPage {
  readonly page: Page;
  readonly promoInput: Locator;
  readonly applyPromoButton: Locator;
  readonly promoError: Locator;
  readonly discountLine: Locator;
  readonly orderTotal: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.promoInput = page.getByTestId('promo-input');
    this.applyPromoButton = page.getByTestId('apply-promo');
    this.promoError = page.getByTestId('promo-error');
    this.discountLine = page.getByTestId('discount-line');
    this.orderTotal = page.getByTestId('order-total');
    this.submitButton = page.getByTestId('submit-order');
  }

  async goto() {
    await this.page.goto('/checkout');
  }

  async applyPromoCode(code: string) {
    await this.promoInput.fill(code);
    await this.applyPromoButton.click();
  }

  async expectDiscount(amount: string) {
    await expect(this.discountLine).toContainText(amount);
  }

  async expectPromoError(message: string) {
    await expect(this.promoError).toContainText(message);
  }

  async expectTotal(amount: string) {
    await expect(this.orderTotal).toContainText(amount);
  }
}

// Usage in test
test('apply promo code', async ({ page }) => {
  const checkout = new CheckoutPage(page);
  await checkout.goto();
  await checkout.applyPromoCode('SAVE10');
  await checkout.expectDiscount('$2.50');
});
```

## Best Practices

### 1. Test Naming Convention

```typescript
// Format: describe what's being tested and expected outcome
test('returns 404 when promo code not found', ...)
test('applies 10% discount for valid SAVE10 code', ...)
test('shows error message when cart is empty', ...)

// Bad examples
test('test1', ...)
test('it works', ...)
test('promo code', ...)
```

### 2. Arrange-Act-Assert (AAA)

```typescript
test('applies discount correctly', () => {
  // Arrange - Setup test data and conditions
  const price = 100;
  const discount = { type: 'percentage', value: 10 };

  // Act - Execute the code under test
  const result = calculateDiscount(price, discount);

  // Assert - Verify the outcome
  expect(result).toBe(90);
});
```

### 3. Test Independence

- Each test should run independently
- No shared state between tests
- Use beforeEach/afterEach for setup/cleanup

```typescript
describe('PromoCodeService', () => {
  let service: PromoCodeService;
  let db: TestDatabase;

  beforeEach(async () => {
    db = await TestDatabase.create();
    service = new PromoCodeService(db);
  });

  afterEach(async () => {
    await db.cleanup();
  });

  test('creates promo code', async () => {
    const code = await service.create({ code: 'NEW10' });
    expect(code).toBeDefined();
  });
});
```

### 4. Avoid Test Pollution

```typescript
// Bad: Tests depend on each other
test('create user', () => { /* creates user */ });
test('update user', () => { /* expects user from previous test */ });

// Good: Each test is independent
test('update user', async () => {
  const user = await createTestUser(); // Create own data
  const updated = await updateUser(user.id, { name: 'New Name' });
  expect(updated.name).toBe('New Name');
});
```

### 5. Use Meaningful Assertions

```typescript
// Bad: Not specific enough
expect(result).toBeTruthy();
expect(array.length).toBeGreaterThan(0);

// Good: Specific and clear
expect(result).toEqual({ discount: 0.1, applied: true });
expect(array).toHaveLength(3);
expect(array).toContain('SAVE10');
```

## Running Tests

### Commands

```bash
# Unit tests
npm test                          # Run all
npm test -- --coverage            # With coverage
npm test -- --watch               # Watch mode
npm test -- discount.test.ts      # Specific file

# Integration tests (Jest + SDK)
npm run test:integration          # All integration tests

# E2E tests (Playwright)
npm run test:e2e                  # All browsers
npm run test:e2e -- --project=chromium
npm run test:e2e -- --ui          # Interactive mode
npm run test:e2e -- --headed      # See browser
```

### CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3

  integration:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:integration  # Jest + SDK tests

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## Coverage Requirements

| Test Type | Target | Measurement |
|-----------|--------|-------------|
| Unit | 80%+ | Jest coverage report |
| Integration | 100% scenarios | All BDD scenarios pass |
| E2E | Critical paths | Defined user journeys |

## Seed Data Management

When scenarios require data states (Given steps), maintain seed data that can bootstrap any environment.

### Seed Data Principles

1. **Version controlled** - Seed data lives in the repo, evolves with features
2. **Idempotent** - Check if exists before creating (safe to run multiple times)
3. **Environment-agnostic** - Same seed script works for sandbox, dev, test
4. **Minimal** - Only seed what tests require, not full production-like data

### Seed Data Structure

```
amplify/
└── seed/
    ├── index.ts          # Main seed runner
    ├── users.ts          # Test user accounts
    ├── tenants.ts        # Test organisations
    └── data.ts           # Domain-specific test data
```

### Seed Script Pattern

```typescript
// amplify/seed/users.ts
import { CognitoIdentityProviderClient, AdminGetUserCommand, AdminCreateUserCommand } from '@aws-sdk/client-cognito-identity-provider';

interface TestUser {
  email: string;
  password: string;
  attributes: Record<string, string>;
}

const TEST_USERS: TestUser[] = [
  {
    email: 'superadmin@example.com',
    password: 'SuperAdmin123!',
    attributes: {
      'custom:platform_role': 'super_admin',
      'custom:user_type': 'platform',
    },
  },
];

async function userExists(client: CognitoIdentityProviderClient, userPoolId: string, email: string): Promise<boolean> {
  try {
    await client.send(new AdminGetUserCommand({ UserPoolId: userPoolId, Username: email }));
    return true;
  } catch (error: any) {
    if (error.name === 'UserNotFoundException') return false;
    throw error;
  }
}

export async function seedUsers(userPoolId: string): Promise<void> {
  const client = new CognitoIdentityProviderClient({});

  for (const user of TEST_USERS) {
    if (await userExists(client, userPoolId, user.email)) {
      console.log(`User ${user.email} already exists, skipping`);
      continue;
    }

    await client.send(new AdminCreateUserCommand({
      UserPoolId: userPoolId,
      Username: user.email,
      UserAttributes: [
        { Name: 'email', Value: user.email },
        { Name: 'email_verified', Value: 'true' },
        ...Object.entries(user.attributes).map(([k, v]) => ({ Name: k, Value: v })),
      ],
      TemporaryPassword: user.password,
      MessageAction: 'SUPPRESS',
    }));

    console.log(`Created user ${user.email}`);
  }
}
```

## Amplify Gen 2 Integration Testing

For AgentFlow projects using AWS Amplify Gen 2, integration tests require access to branch-specific sandbox resources.

### Branch-Specific Sandbox Pattern

Each developer branch creates its own isolated AWS sandbox via `npx ampx sandbox`. Configuration is stored in `amplify_outputs.json` (gitignored).

**Integration test setup pattern:**
```typescript
// tests/integration/setup.ts
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

interface AmplifyOutputs {
  auth?: {
    user_pool_id: string;
    user_pool_client_id: string;
    aws_region: string;
  };
}

function loadAmplifyOutputs(): AmplifyOutputs | null {
  const outputsPath = join(process.cwd(), 'amplify_outputs.json');
  if (existsSync(outputsPath)) {
    return JSON.parse(readFileSync(outputsPath, 'utf-8'));
  }
  return null;
}

const amplifyOutputs = loadAmplifyOutputs();

export const testConfig = {
  userPoolId: amplifyOutputs?.auth?.user_pool_id ?? process.env.COGNITO_USER_POOL_ID,
  clientId: amplifyOutputs?.auth?.user_pool_client_id ?? process.env.COGNITO_CLIENT_ID,
  region: amplifyOutputs?.auth?.aws_region ?? process.env.AWS_REGION ?? 'eu-west-2',
};
```

### E2E Infrastructure Requirements

For E2E tests involving authentication and email verification:

**Cognito + Custom SES Configuration:**
- Cognito's default email sender has a hard 50/day limit
- Configure Cognito User Pool to use custom SES identity
- Move SES out of sandbox mode before E2E tests

```typescript
// amplify/auth/resource.ts
emailConfiguration: {
  emailSendingAccount: 'DEVELOPER',
  sourceArn: 'arn:aws:ses:eu-west-2:ACCOUNT:identity/your-domain.com',
  from: 'noreply@your-domain.com',
}
```

**Playwright Worker Limit:**
```typescript
// playwright.config.ts - Stay under SES rate limit (14 emails/second)
export default defineConfig({
  workers: 10,
});
```

**Request-Derived Email URLs:**
```typescript
// Derive base URL from request for environment-agnostic emails
const protocol = request.headers.get("x-forwarded-proto") || "https";
const host = request.headers.get("host") || "localhost:3000";
const baseUrl = `${protocol}://${host}`;
```

### E2E-Ready Authentication Checklist

- [ ] SES domain verified in AWS console
- [ ] SES moved to production mode (not sandbox)
- [ ] Cognito User Pool configured to use custom SES
- [ ] Email-sending endpoints derive URLs from request headers
- [ ] Playwright worker limit set (e.g., 10 workers)
- [ ] Gmail testing infrastructure configured (if using Gmail for test email verification)

## References

- **BDD Expertise Skill:** `.claude/skills/af-bdd-expertise/SKILL.md`
- **Testing Expertise Skill:** `.claude/skills/af-testing-expertise/SKILL.md`
- **Jest:** https://jestjs.io/
- **Playwright:** https://playwright.dev/
- **BDD Guide:** `.claude/docs/guides/bdd-guide.md`
- **React Testing Library:** https://testing-library.com/react

---

**Last Updated:** 2026-01-02

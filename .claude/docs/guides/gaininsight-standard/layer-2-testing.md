---
title: "GainInsight Standard - Layer 2: Testing Framework"
sidebar_label: "Layer 2 Testing"
sidebar_position: 2
created: 2025-12-15
updated: 2026-01-25
last_checked: 2026-01-25
tags: [guide, gaininsight, testing, jest, playwright, rtl]
parent: ./README.md
related:
  - ./layer-1-infrastructure.md
  - ./layer-3-ui-styling.md
  - ../../../skills/af-gaininsight-standard/SKILL.md
  - ../bdd-guide.md
---

# Layer 2: Testing Framework

Complete step-by-step instructions for setting up Jest, Playwright, RTL, and test reports.

> **Reference Implementation:** Juncan (`/data/worktrees/juncan/develop`) has working examples.

**Prerequisites:**
- Layer 1 (Environment & Infrastructure) is complete
- Project has a working Next.js application
- Project uses npm as package manager
- All Layer 1 tests pass

## Overview

Layer 2 sets up a comprehensive testing framework:

| Component | Purpose |
|-----------|---------|
| **Jest** | Unit tests for functions, hooks, utilities |
| **React Testing Library** | Component testing (behavior, accessibility) |
| **Playwright** | E2E tests for complete user journeys |
| **Test Reports** | Dashboard linking all report types |

**Key principle:** AI generates Playwright tests directly from Markdown scenarios in mini-PRDs. E2E tests use Playwright's native test runner.

---

## 2.0 Install Test Specifications (RED Phase)

**Purpose:** Copy Layer 2 test templates to target project. Tests will FAIL initially - this is expected (Red phase of Red-Green-Refactor).

**Why tests first:**
- Tests are the *specification* of what Layer 2 should deliver
- Running tests now establishes our "red" baseline
- After setup, tests should turn "green"
- This is proper BDD/TDD workflow

**Steps:**

```bash
# Copy Layer 2 test files from AgentFlow templates
cp -r {agentflow-path}/.claude/templates/gaininsight-standard/tests/gaininsight-stack \
   {target-project}/tests/

# Navigate to test directory
cd {target-project}/tests/gaininsight-stack

# Install dependencies
npm install

# Run Layer 2 tests to confirm RED state
doppler run --project {project-name} --config dev -- \
  npx playwright test --project=layer-2 --grep-invert @runtime
```

**Expected result:** Tests FAIL because:
- Directory structure doesn't exist yet
- Jest/Playwright not installed
- Config files not created
- Sample tests not written

**This is correct!** We now have our specification. Proceed with Layer 2 setup.

---

## 2.1 Create Directory Structure

**Purpose:** Set up the test directory layout.

**Steps:**

```bash
mkdir -p tests/unit
mkdir -p tests/e2e
mkdir -p tests/fixtures
mkdir -p reports
```

**Result:**
```
tests/
├── unit/           # Jest unit tests
├── e2e/            # Playwright E2E tests
└── fixtures/       # Shared test data and mocks
reports/            # Test reports output
```

---

## 2.2 Install Jest

**Purpose:** Set up Jest for unit testing with TypeScript and React support.

**Steps:**

```bash
npm install --save-dev jest @types/jest ts-jest
npm install --save-dev @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event
npm install --save-dev jest-environment-jsdom
```

**Create `jest.config.js`:**

> **Note:** Next.js uses `jsx: 'preserve'` in tsconfig.json, but Jest/ts-jest needs `jsx: 'react-jsx'` to transform JSX. The config below overrides this for Jest.

```javascript
/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  testMatch: ['**/tests/unit/**/*.test.ts', '**/tests/unit/**/*.test.tsx'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      // Override jsx for Jest (tsconfig uses 'preserve' for Next.js)
      useESM: false,
      tsconfig: {
        jsx: 'react-jsx',
      },
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/unit/setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  coverageDirectory: 'reports/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80,
    },
  },
};

module.exports = config;
```

**Create `tests/unit/setup.ts`:**

```typescript
import '@testing-library/jest-dom';
```

**Add to `package.json` scripts:**

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## 2.3 Create Sample Jest Test

**Purpose:** Verify Jest is working with a sample test that includes React component testing.

> **Note:** Use `.tsx` extension for tests that include React components (JSX syntax).

**Create `tests/unit/example.test.tsx`:**

```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// =============================================================================
// Basic Assertions
// =============================================================================
describe('Basic Assertions', () => {
  it('should perform equality checks', () => {
    expect(1 + 1).toBe(2);
    expect({ name: 'test' }).toEqual({ name: 'test' });
  });
});

// =============================================================================
// Async Testing
// =============================================================================
describe('Async Testing', () => {
  it('should handle promises', async () => {
    const fetchData = () => Promise.resolve('data');
    const result = await fetchData();
    expect(result).toBe('data');
  });
});

// =============================================================================
// Mocking
// =============================================================================
describe('Mocking', () => {
  it('should mock functions', () => {
    const mockFn = jest.fn((x: number) => x * 2);
    mockFn(1);
    mockFn(2);
    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn).toHaveBeenCalledWith(1);
  });
});

// =============================================================================
// React Component Testing
// =============================================================================
function Counter({ initialCount = 0 }: { initialCount?: number }) {
  const [count, setCount] = React.useState(initialCount);
  return (
    <div>
      <p data-testid="count">Count: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>Increment</button>
    </div>
  );
}

describe('React Component Testing', () => {
  it('should render a component', () => {
    render(<Counter />);
    expect(screen.getByTestId('count')).toHaveTextContent('Count: 0');
  });

  it('should handle user interactions', async () => {
    const user = userEvent.setup();
    render(<Counter initialCount={5} />);
    await user.click(screen.getByText('Increment'));
    expect(screen.getByTestId('count')).toHaveTextContent('Count: 6');
  });
});
```

**Verify:**

```bash
npm test -- --testPathPattern=example
```

---

## 2.4 Install Playwright

**Purpose:** Set up Playwright for E2E browser testing.

**Steps:**

```bash
npm install --save-dev @playwright/test
npx playwright install
```

**Create `playwright.config.ts`:**

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './reports/playwright',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'reports/playwright' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Desktop Firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'Desktop Safari',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## 2.5 Create Sample E2E Test

**Purpose:** Verify Playwright is working with a sample E2E test.

**Create `tests/e2e/hello-world.spec.ts`:**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Hello World Application', () => {
  test('displays the homepage', async ({ page }) => {
    await page.goto('/');

    // Check page loaded
    await expect(page).toHaveTitle(/Hello/i);
  });

  test('shows Hello World heading', async ({ page }) => {
    await page.goto('/');

    const heading = page.getByRole('heading', { name: /Hello World/i });
    await expect(heading).toBeVisible();
  });

  test('shows API response message', async ({ page }) => {
    await page.goto('/');

    // Wait for API data to load
    await expect(page.getByText(/Hello World from Amplify/i)).toBeVisible({ timeout: 15000 });
  });
});
```

**Add to `package.json` scripts:**

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed"
  }
}
```

**Verify:**

```bash
npm run test:e2e
```

---

## 2.6 Create Test Reports Dashboard

**Purpose:** Create a landing page that links to all test reports.

**Prerequisites:** `PORT_INFO.md` exists from Layer 1 with `TEST_REPORT_PORT` defined.

**Create `reports/index.html`:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Reports Dashboard</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      background: #f5f5f5;
    }
    h1 { color: #333; }
    .reports {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      margin-top: 2rem;
    }
    .report-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .report-card h2 { margin-top: 0; color: #2563eb; }
    .report-card a {
      display: inline-block;
      margin-top: 1rem;
      padding: 0.5rem 1rem;
      background: #2563eb;
      color: white;
      text-decoration: none;
      border-radius: 4px;
    }
    .report-card a:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <h1>Test Reports Dashboard</h1>
  <p>Generated test reports for this project.</p>

  <div class="reports">
    <div class="report-card">
      <h2>Unit Tests</h2>
      <p>Jest unit test coverage report.</p>
      <a href="coverage/index.html">View Report</a>
    </div>

    <div class="report-card">
      <h2>E2E Tests</h2>
      <p>Playwright E2E test results.</p>
      <a href="playwright/index.html">View Report</a>
    </div>

    <div class="report-card">
      <h2>Storybook</h2>
      <p>Component documentation and visual testing.</p>
      <a href="storybook/index.html">View Storybook</a>
    </div>
  </div>

  <footer style="margin-top: 3rem; color: #666; font-size: 0.875rem;">
    <p>Run <code>npm run reports:serve</code> to start the report server.</p>
  </footer>
</body>
</html>
```

---

## 2.7 Configure ESLint

**Purpose:** Set up ESLint for code linting. Required for CI workflow in Layer 4.

**Install dependencies:**

```bash
npm install --save-dev eslint@8 eslint-config-next@15
```

**Note:** Use ESLint 8 and eslint-config-next@15 for compatibility.

**Create `.eslintrc.json`:**

```json
{
  "extends": ["next/core-web-vitals", "next/typescript"]
}
```

**Verify:**

```bash
npm run lint
# Should output: No ESLint warnings or errors
```

---

## 2.8 Add NPM Scripts

**Purpose:** Add all test-related scripts to package.json.

**Add to `package.json` scripts:**

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:all": "npm run test && npm run test:e2e",
    "reports:serve": "npx serve reports -p ${TEST_REPORT_PORT:-9000} -s",
    "reports:open": "open reports/index.html"
  }
}
```

---

## 2.9 Update .gitignore

**Purpose:** Ensure test artifacts are not committed.

**Add to `.gitignore`:**

```
# Test reports (generated)
reports/coverage/
reports/playwright/
reports/storybook/
!reports/index.html

# Playwright artifacts
/test-results/
/playwright/.cache/
```

---

## 2.10 Create Project Documentation

**Purpose:** Add testing quick reference to project docs.

**Copy templates from AgentFlow:**

```bash
# Create docs directory if needed
mkdir -p docs

# Copy documentation templates
cp .claude/templates/gaininsight-standard/docs/README.md docs/
cp .claude/templates/gaininsight-standard/docs/testing.md docs/

# Replace {{DATE}} placeholder with current date
DATE=$(date +%Y-%m-%d)
sed -i "s/{{DATE}}/$DATE/g" docs/README.md docs/testing.md
```

**Result:** Project has `docs/README.md` and `docs/testing.md` with proper frontmatter and bidirectional links.

---

## 2.11 Verify All Tests Pass

**Purpose:** Run all test suites to verify setup is complete.

**Steps:**

```bash
# Run unit tests
npm test

# Run E2E tests (requires dev server)
npm run test:e2e

# Or run all
npm run test:all
```

**Expected result:** All tests pass.

---

## 2.12 Validate Layer 2 Setup (GI Stack Tests)

**Purpose:** Run GainInsight Stack validation tests to verify the testing framework is correctly configured.

> **CRITICAL: BOTH quick AND runtime tests must pass.** Layer 2 is NOT complete until runtime validation succeeds.

### Step 1: Quick Validation

Fast configuration checks that verify files and dependencies exist:

```bash
cd tests/gaininsight-stack
doppler run --project {project-name} --config dev -- npm run test:layer-2:quick
```

**What it validates:**
- Directory structure exists
- Config files present (jest.config.js, playwright.config.ts)
- Dependencies installed
- NPM scripts defined
- Sample test files exist

### Step 2: Runtime Validation (MANDATORY)

**You MUST run runtime validation.** Quick tests only verify files exist - runtime tests prove they actually work.

**First, start the dev server:**

```bash
# From project root
cd {project-root}
npm run dev &
sleep 10  # Wait for server to be ready
```

**Then run runtime tests:**

```bash
cd tests/gaininsight-stack
doppler run --project {project-name} --config dev -- npx playwright test --project=layer-2 --grep @runtime
```

**What it validates:**
- Jest tests actually run and pass
- E2E tests actually run and pass
- Reports are generated in correct locations
- Reports server starts and responds with HTTP 200

**After runtime tests complete, stop the dev server:**

```bash
kill %1  # Or: pkill -f "next dev"
```

### Full Validation (Both Quick + Runtime)

Run all Layer 2 tests at once:

```bash
# 1. Start dev server
cd {project-root}
npm run dev &
sleep 10

# 2. Run ALL Layer 2 tests
cd tests/gaininsight-stack
doppler run --project {project-name} --config dev -- npm run test:layer-2

# 3. Stop dev server
kill %1
```

---

## Layer 2 Checkpoint

**Layer 2 is complete ONLY when ALL of these are true:**

- Jest configured for unit testing with coverage
- React Testing Library for component tests
- Playwright for E2E browser testing
- Test reports dashboard with PORT_INFO.md integration
- All npm scripts configured
- Project documentation (`docs/testing.md` quick reference)
- **Quick validation tests passing** (`npm run test:layer-2:quick`)
- **Runtime validation tests passing** (Playwright with `@runtime` tag)

**If runtime tests fail, Layer 2 is NOT complete.** Debug and fix until they pass.

**Next: Layer 3 - UI & Styling** will add:
- Tailwind CSS configuration and design tokens
- shadcn/ui component library
- Theme configuration (light/dark mode)
- Storybook for component documentation

See [Layer 3: UI & Styling](./layer-3-ui-styling.md) to continue.

---

## Troubleshooting

### Jest can't find modules with @ alias

Ensure `moduleNameMapper` in `jest.config.js` matches your `tsconfig.json` paths:

```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
},
```

### Playwright browsers not installed

Run:
```bash
npx playwright install
```

### Coverage reports not generating

Run Jest with coverage flag:
```bash
npm test -- --coverage
```

### E2E tests require running dev server

E2E tests need the application running. Either:

1. **Start dev server manually:**
   ```bash
   npm run dev  # in another terminal
   npm run test:e2e
   ```

2. **Use Playwright's webServer option** (configured in playwright.config.ts):
   ```bash
   # Playwright will start the dev server automatically
   npm run test:e2e
   ```

3. **Test against deployed environment:**
   ```bash
   BASE_URL=https://your-app.example.com npm run test:e2e
   ```

### Port 3000 already in use

GainInsight Standard uses port 3001 by default to avoid conflicts with Metabase and other services commonly found on port 3000.

### Test reports dashboard not accessible

1. **Generate reports first:**
   ```bash
   npm run test:coverage  # Jest coverage
   npm run test:e2e       # Playwright report
   ```

2. **Serve reports:**
   ```bash
   npm run reports:serve
   # Opens http://localhost:9000 (or TEST_REPORT_PORT)
   ```

---

## Mobile Testing (If Flutter Installed)

If you added Flutter mobile support after Layer 1, include these additional tests.

### Widget Tests

Flutter's equivalent of RTL component tests:

```bash
cd packages/mobile
flutter test
```

**Key patterns:**
- `testWidgets()` for component behavior
- `find.byKey()` with Key objects (like data-testid)
- `tester.pumpWidget()` to render
- `tester.tap()` for interactions

### Golden Tests

Visual regression testing (like Percy/Chromatic):

```bash
flutter test --update-goldens  # Update baselines
flutter test                    # Compare against baselines
```

### Running All Tests

Update root package.json to include mobile tests:

```json
{
  "scripts": {
    "test": "npm run test:web && npm run test:mobile",
    "test:web": "npm run test --workspace=@{project}/web",
    "test:mobile": "cd packages/mobile && flutter test"
  }
}
```

**Reference:** See [Flutter Mobile Setup Guide](./flutter-mobile-setup.md) for complete testing patterns.

---
title: Testing Component Template
created: 2026-01-25
updated: 2026-01-25
tags: [template, component, testing, jest, playwright]
parent: ../README.md
---

# Testing Component

Adds Jest for unit tests and Playwright for E2E tests.

## What Gets Installed

### Files Created
```
tests/
├── unit/
│   └── sample.test.ts      # Sample unit test (delete after adding real tests)
└── e2e/
    └── sample.spec.ts      # Sample E2E test (delete after adding real tests)

jest.config.js              # Jest configuration
playwright.config.ts        # Playwright configuration
```

### Dependencies Added
```json
{
  "devDependencies": {
    "jest": "^29.7.0",
    "@types/jest": "^29.5.0",
    "ts-jest": "^29.1.0",
    "@playwright/test": "^1.40.0"
  }
}
```

### Scripts Added
```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --selectProjects unit",
    "test:e2e": "playwright test",
    "test:all": "npm run test:unit && npm run test:e2e"
  }
}
```

## Installation Steps

1. Copy config files to project root
2. Create `tests/unit/` and `tests/e2e/` directories
3. Copy sample tests
4. Merge scripts into `package.json`
5. Run `npm install` to add dependencies
6. Run `npx playwright install chromium` for browser

## Validation

After installation, verify:
- `npm run test:unit` runs without error
- `npm run test:e2e` runs (may skip if no server running)
- `tests/unit/` and `tests/e2e/` directories exist

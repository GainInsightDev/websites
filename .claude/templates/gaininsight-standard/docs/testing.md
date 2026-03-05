---
title: Testing Quick Reference
created: {{DATE}}
updated: {{DATE}}
last_checked: {{DATE}}
tags: [testing, quick-reference, gaininsight-standard]
parent: ./README.md
---

# Testing Quick Reference

## Commands

| Command | Purpose |
|---------|---------|
| `npm test` | Run unit tests (Jest) |
| `npm run test:watch` | Run unit tests in watch mode |
| `npm run test:coverage` | Run with coverage report |
| `npm run test:e2e` | Run E2E tests (Playwright) |
| `npm run test:e2e:ui` | Run E2E with Playwright UI |
| `npm run test:e2e:headed` | Run E2E in headed browser |
| `npm run test:all` | Run all test suites |
| `npm run reports:serve` | Serve reports dashboard |
| `npm run reports:open` | Open reports in browser |

## Reports

| Report | Location |
|--------|----------|
| Jest Coverage | `reports/coverage/index.html` |
| Playwright | `reports/playwright/index.html` |
| Dashboard | `reports/index.html` |

**Remote access:** See `TEST_REPORT_URL` in `PORT_INFO.md`

## Test Structure

```
tests/
├── unit/           # Jest unit tests (*.test.ts)
├── e2e/            # Playwright E2E tests (*.spec.ts)
└── fixtures/       # Shared test data and mocks
```

## Quick Examples

### Run specific unit test
```bash
npm test -- --testPathPattern=example
```

### Run E2E on specific browser
```bash
npm run test:e2e -- --project="Desktop Chrome"
```

### Run E2E by tag
```bash
npm run test:e2e -- --grep "@smoke"
```

## Learn More

For testing patterns and best practices:
- Testing expertise: `.claude/skills/af-testing-expertise/SKILL.md`
- GainInsight setup: `.claude/docs/guides/gaininsight-standard/layer-2-testing.md`

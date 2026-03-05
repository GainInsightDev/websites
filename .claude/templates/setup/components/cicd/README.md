---
title: CI/CD Component Template
created: 2026-01-25
updated: 2026-01-25
tags: [template, component, cicd, github-actions]
parent: ../README.md
---

# CI/CD Component

Adds GitHub Actions workflows for continuous integration and optional Claude Code review.

## What Gets Installed

### Files Created
```
.github/
└── workflows/
    ├── ci.yml              # Main CI workflow (lint, test, build)
    └── claude-review.yml   # Optional: AI code review on PRs
```

### Workflow Variants

| Stack | Workflow | Features |
|-------|----------|----------|
| Base (any) | `ci-base.yml` | Lint, unit tests, build |
| Directus | `ci-directus.yml` | + PostgreSQL service, migrations |
| Amplify | Use GI Standard Layer 4 | + Amplify outputs generation |

## Installation Steps

1. Create `.github/workflows/` directory
2. Copy appropriate `ci-*.yml` as `ci.yml`
3. Optionally copy `claude-review.yml`
4. Configure required secrets (see below)

## Required Secrets

### For Claude Review (optional)
```bash
gh secret set CLAUDE_CODE_OAUTH_TOKEN --body "<token>"
```

### For Directus (if using integration tests)
Database credentials are provided via GitHub Actions services - no secrets needed.

## Validation

After installation, verify:
- `.github/workflows/ci.yml` exists
- Workflow YAML is valid: `yq eval '.' .github/workflows/ci.yml`
- Workflow appears in GitHub Actions tab

## Customization

### Add E2E tests to CI
```yaml
- name: Install Playwright
  run: npx playwright install --with-deps chromium

- name: E2E tests
  run: npm run test:e2e
  env:
    BASE_URL: http://localhost:3000
```

### Add deployment step
For deployment, consider:
- Amplify: Automatic via branch-based deploys
- Directus/Lightsail: Add SSH deploy step
- Vercel: Automatic via Vercel GitHub integration

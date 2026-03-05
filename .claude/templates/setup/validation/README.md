---
title: Module Validation Tests
created: 2026-01-25
updated: 2026-02-19
tags: [template, validation, testing, modules]
parent: ../README.md
---

# Module Validation Tests

Playwright tests that verify setup modules were installed correctly. One-time validation — run after setup to confirm, then no longer needed.

Each module in the [Module Registry](../../docs/reference/module-registry.yml) has a corresponding validation spec.

## Usage

### Run All Modules

```bash
PROJECT_ROOT=/path/to/project npx playwright test
```

### Run Specific Module

```bash
PROJECT_ROOT=/path/to/project npx playwright test --project=amplify
PROJECT_ROOT=/path/to/project npx playwright test --project=testing
```

### AWS-Dependent Modules

Modules that check AWS resources (aws-infrastructure, amplify, auth, email) need credentials:

```bash
doppler run --project {project} --config dev -- npx playwright test --project=aws-infrastructure
```

### Run GI Standard Combination

All modules in the GI Standard combination:

```bash
PROJECT_ROOT=/path/to/project npx playwright test \
  --project=aws-infrastructure \
  --project=amplify \
  --project=auth \
  --project=email \
  --project=testing \
  --project=ui-styling \
  --project=cicd \
  --project=posthog \
  --project=security
```

## Test Specs

### Core Modules (Minimal Setup)

| Spec | Module | Validates |
|------|--------|-----------|
| `agentflow.spec.ts` | agentflow | .claude/ directory, framework file, CLAUDE.md import |
| `linear.spec.ts` | linear | Linear references in CLAUDE.md, linearis CLI |
| `git.spec.ts` | git | Git repo, remote, branches, .gitignore |
| `docs.spec.ts` | documentation | Docs structure, frontmatter, CLAUDE.md |

### Infrastructure Modules

| Spec | Module | Validates |
|------|--------|-----------|
| `aws-infrastructure.spec.ts` | aws-infrastructure | AWS OU, accounts, DNS, Doppler (needs AWS creds) |
| `amplify.spec.ts` | amplify | amplify/ dir, backend.ts, config, Amplify app (needs AWS creds) |

### Auth & Email Modules

| Spec | Module | Validates |
|------|--------|-----------|
| `auth.spec.ts` | auth | Auth resource, Cognito User Pool (needs AWS creds) |
| `email.spec.ts` | email | SES domain, DKIM, sandbox status (needs AWS creds) |

### Other Modules

| Spec | Module | Validates |
|------|--------|-----------|
| `testing.spec.ts` | testing | Jest + Playwright, directories, scripts, runtime |
| `ui-styling.spec.ts` | ui-styling | Tailwind, shadcn/ui, Storybook, design tokens |
| `cicd.spec.ts` | cicd | GitHub Actions workflows, YAML validity |
| `posthog.spec.ts` | posthog | PostHog SDK, provider, API key |
| `flutter.spec.ts` | flutter | Flutter SDK, project structure, Widgetbook |
| `security.spec.ts` | security | Dependabot, .gitignore security |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PROJECT_ROOT` | `process.cwd()` | Path to project being validated |
| `DOPPLER_PROJECT` | - | Project name (auto-set by `doppler run`) |
| `TEST_PROJECT_NAME` | - | Override project name for tests |

## Adding New Validations

1. Create new spec file in `specs/`
2. Add project to `playwright.config.ts`
3. Add `validation_spec` field to module in `module-registry.yml`

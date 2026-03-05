---
title: GainInsight Standard Guides
sidebar_label: GainInsight Standard
sidebar_position: 10
created: 2025-12-15
updated: 2026-02-09
last_checked: 2026-02-09
tags: [guides, gaininsight, infrastructure, aws, amplify]
parent: ../README.md
children:
  - ./layer-1-infrastructure.md
  - ./auth-setup.md
  - ./flutter-mobile-setup.md
  - ./layer-2-testing.md
  - ./layer-3-ui-styling.md
  - ./layer-4-cicd.md
  - ./teardown.md
related:
  - ../../../skills/af-gaininsight-standard/SKILL.md
  - ../posthog-guide.md
  - ../../../skills/af-posthog-expertise/SKILL.md
---

# GainInsight Standard Guides

Complete step-by-step instructions for the GainInsight Standard 4-layer stack setup.

## Overview

The GainInsight Standard stack provides a production-ready infrastructure for Next.js applications:

| Layer | Name | What It Provides |
|-------|------|------------------|
| **1** | [Infrastructure](./layer-1-infrastructure.md) | AWS accounts (dev/test/prod), Doppler secrets, Amplify apps, IAM roles |
| **+** | [Flutter Mobile](./flutter-mobile-setup.md) *(optional)* | iOS/Android app sharing Amplify backend, Widgetbook |
| **2** | [Testing](./layer-2-testing.md) | Jest, Playwright, E2E test structure (+ widget tests if mobile) |
| **3** | [UI & Styling](./layer-3-ui-styling.md) | Tailwind config, shadcn/ui components, Storybook, PostHog analytics & flags (+ Widgetbook if mobile) |
| **4** | [CI/CD](./layer-4-cicd.md) | GitHub Actions, branch protection, deployments (+ Codemagic iOS if mobile) |

**Total setup time:** ~2 hours for complete stack

## How to Use These Guides

1. **Invoke the skill first**: Use the `af-gaininsight-standard` skill to understand when and why to use each layer
2. **Follow layers in order**: Layer 2 depends on Layer 1, etc.
3. **Run validation tests**: Each layer has BDD tests - run them before and after setup
4. **Stop at any layer**: You can stop after any layer has a complete, useful setup

## Reference Implementation

**Juncan** (`/data/worktrees/juncan/develop`) is the most recent complete GainInsight Standard implementation. Reference it for:
- Working BDD tag patterns (@layer-1, @infrastructure, @slow)
- ESM configuration in `amplify/package.json`
- Test organization in `tests/features/`
- GitHub Actions workflows

## Guide Contents

### [Layer 1: Infrastructure](./layer-1-infrastructure.md)
Complete AWS and Doppler setup:
- AWS Organization Unit creation
- Multi-account setup (dev/test/prod)
- DNS delegation and hosted zones
- Git branch strategy
- Doppler project configuration
- CDK bootstrap
- Amplify app creation
- Custom domain configuration
- Hello World application deployment
- Console access setup

### [Auth Setup](./auth-setup.md)
Cognito and SES email infrastructure:
- Cognito User Pool with custom attributes (mutability rules)
- SES domain verification with DKIM
- Sandbox vs production mode
- Cognito-SES integration (sender identity, volume limits)
- E2E testing integration (Gmail verification)

### [Flutter Mobile Setup](./flutter-mobile-setup.md) *(Optional)*
Add Flutter mobile support after Layer 1:
- Monorepo structure (packages/web + packages/mobile)
- Amplify Flutter SDK integration
- Stack validation (same Todo.list() as web)
- Widgetbook component catalog
- CI/CD strategy (GHA for Android, Codemagic for iOS)

### Cross-Cutting: PostHog Analytics & Feature Flags

PostHog is the standard platform for product analytics, feature flags, and session replay ([ADR-010](../../../../.agentflow/adr/adr-010-posthog-analytics-feature-flags.md)).

PostHog setup spans multiple layers:
- **After Layer 1**: Register PostHog account (EU), add API keys to Doppler, store credentials in Bitwarden
- **Layer 3**: Install `posthog-js`, create `src/posthog/` module, wrap app with `PostHogProvider`
- **Layer 4**: Doppler injects `NEXT_PUBLIC_POSTHOG_KEY` in CI/CD builds

See [PostHog Integration Guide](../posthog-guide.md) for step-by-step instructions.

### [Layer 2: Testing](./layer-2-testing.md)
Testing framework configuration:
- Directory structure
- Jest unit testing setup
- Playwright E2E testing
- Test reports dashboard
- npm scripts for test commands

### [Layer 3: UI & Styling](./layer-3-ui-styling.md)
Component library and design system:
- Additional shadcn/ui components
- Tailwind CSS theme customization
- Storybook configuration
- Component documentation

### [Layer 4: CI/CD](./layer-4-cicd.md)
Continuous integration and deployment:
- GitHub Actions workflows
- Claude Code PR review
- Branch protection rules
- Storybook hosting on CloudFront

### [Teardown](./teardown.md)
Safe destruction procedures:
- Layer-by-layer teardown instructions
- Resource cleanup verification
- Partial teardown options

## Quick Reference

**Prerequisites:**
- Greenfield setup complete (GitHub repo, Linear team, `.claude/` synced)
- Doppler CLI authenticated (`doppler login`)
- AWS credentials available via Doppler `gi` project
- Access to GainInsight AWS Organization

**Key Doppler Variables:**
| Variable | Config | Purpose |
|----------|--------|---------|
| `AWS_ACCESS_KEY_ID` | dev/stg/prd | IAM user credentials |
| `AWS_SECRET_ACCESS_KEY` | dev/stg/prd | IAM user credentials |
| `AWS_DEFAULT_REGION` | dev/stg/prd | Always `eu-west-2` |
| `AMPLIFY_APP_ID` | dev/stg/prd | Amplify app identifier |
| `LINEAR_TEAM_ID` | dev | Linear integration |
| `NEXT_PUBLIC_POSTHOG_KEY` | dev/stg/prd | PostHog project API key |
| `NEXT_PUBLIC_POSTHOG_HOST` | dev/stg/prd | PostHog ingest host (EU) |
| `POSTHOG_PERSONAL_API_KEY` | dev | PostHog management API |

**Branch to Environment Mapping:**
| Branch | Doppler Config | AWS Account |
|--------|----------------|-------------|
| develop | dev | {project}-dev |
| staging | stg | {project}-test |
| main | prd | {project}-prod |

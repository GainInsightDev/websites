---
title: Integration Guides
sidebar_label: Integrations
created: 2026-02-18
updated: 2026-02-18
last_checked: 2026-02-18
tags: [integrations, modules, guides]
parent: ../README.md
children:
  - ./amplify-esm.md
  - ./auth-testing.md
  - ./cognito-ses.md
  - ./ses-per-account.md
  - ./cicd-amplify-polling.md
  - ./flutter-monorepo.md
---

# Integration Guides

Cross-module integration knowledge for combining modules during AgentFlow setup. These guides address constraints that arise when two or more modules are used together.

## Available Integration Guides

### [Amplify ESM Configuration](./amplify-esm.md)

Configuration coordination for Amplify Gen 2's ECMAScript Modules support.

**Applies when:** Using Amplify backend

**Key topics:**
- `amplify/package.json` must declare `"type": "module"`
- Root `tsconfig.json` must exclude `amplify` directory
- Why both configurations are required together
- Troubleshooting module resolution errors

**Use this when:**
- Setting up Amplify backend for the first time
- Seeing "Cannot find module" errors
- Configuring TypeScript for an Amplify project

### [Auth + Testing Integration](./auth-testing.md)

E2E testing patterns for Cognito authentication that must be configured during setup, not during test implementation.

**Applies when:** Using auth + testing modules together

**Key topics:**
- Custom attribute mutability requirements for testing
- Admin auth flow enablement via CDK escape hatch
- E2E test email pattern (`testing+{project}@gaininsight.global`)
- Gmail API access for reading test emails
- SES sandbox email verification constraints

**Use this when:**
- Setting up E2E tests for authenticated flows
- Defining Cognito custom attributes
- Creating test users programmatically
- Configuring email verification for E2E tests

### [Cognito + SES Integration](./cognito-ses.md)

SES configuration for Cognito email delivery (verification, password reset, MFA).

**Applies when:** Using auth + email modules together

**Key topics:**
- SES domain verification with DKIM in same AWS account
- SES production access request process and timing
- Amplify `fromEmail` configuration
- Lambda SES IAM permissions for custom email sending
- Consistent sender identity patterns

**Use this when:**
- Setting up Cognito with SES email delivery
- Configuring domain verification
- Requesting SES production access
- Sending custom emails from Lambda functions

### [SES Per-Account Architecture](./ses-per-account.md)

Multi-account SES configuration for dev/test/prod environments.

**Applies when:** Using multi-account AWS setup with email

**Key topics:**
- SES is scoped per AWS account (not per domain)
- DKIM records are shared across accounts
- Production access must be requested per account
- Region must match across SES, Cognito, Lambda
- Domain admin credentials for Route53 access

**Use this when:**
- Setting up multi-account infrastructure
- Configuring SES in dev, test, and prod accounts
- Understanding SES production access timeline (24-48 hours per account)
- Troubleshooting cross-account email delivery issues

### [CI/CD + Amplify Polling](./cicd-amplify-polling.md)

GitHub Actions integration with Amplify's automatic deployments.

**Applies when:** Using CI/CD + Amplify modules together

**Key topics:**
- Why polling is required (Amplify auto-builds on push)
- Poll by commit SHA to avoid race conditions
- Polling loop pattern and timing
- Environment variables at build time (PostHog, etc.)
- E2E test sequencing after deployment

**Use this when:**
- Setting up CI/CD for Amplify projects
- Configuring GitHub Actions to wait for deployments
- Running E2E tests against deployed environments
- Troubleshooting deployment timing issues

### [Flutter + Amplify Monorepo](./flutter-monorepo.md)

Monorepo structure for projects with both web and mobile clients sharing an Amplify backend.

**Applies when:** Using Amplify + Flutter modules together

**Key topics:**
- Monorepo conversion must happen before adding Flutter
- Target structure with `packages/web` and `packages/mobile`
- Shared Amplify backend at project root
- Flutter prerequisites (Layer 1 must be complete first)
- `amplify_outputs.json` sync from root to mobile
- Two package managers (npm and pub) coexisting
- Port allocation for dev servers and design tools

**Use this when:**
- Adding Flutter mobile support to web project
- Converting existing web project to monorepo
- Setting up shared backend for multiple platforms
- Understanding mobile-specific setup order and dependencies

---

## How to Use These Guides

**When setting up modules:**
1. Check the module registry (`.claude/docs/reference/module-registry.yml`)
2. Look for `integrations:` section in selected modules
3. Read the listed integration guide BEFORE implementation
4. Follow checklists to ensure constraints are met from the start

**Why integration guides matter:**
Some constraints (like Cognito attribute mutability or SES verification scope) cannot be changed retroactively without destructive operations (user pool recreation, account reconfiguration). Reading integration guides during setup prevents costly mistakes.

**Related documentation:**
- Module registry: `.claude/docs/reference/module-registry.yml`
- Layer guides: `.claude/docs/guides/gaininsight-standard/`
- AWS Amplify guide: `.claude/docs/guides/aws-amplify-guide.md`

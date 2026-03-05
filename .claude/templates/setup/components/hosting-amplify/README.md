---
title: Amplify Hosting Component
created: 2026-01-25
updated: 2026-01-25
last_checked: 2026-01-25
tags: [template, setup, amplify, hosting]
parent: ../README.md
---

# Amplify Hosting Component

Sets up AWS Amplify Gen 2 for hosting Next.js applications with GraphQL backends.

## What This Provides

- CDK bootstrapped in all AWS accounts
- Amplify app per environment (dev/test/prod)
- Service roles with correct permissions
- Branch-based auto-deployments
- Custom domain configuration
- Hello World app with GraphQL backend
- Build configuration (amplify.yml)

## Prerequisites

- AWS Infrastructure component completed
- Next.js project initialized (from greenfield setup)
- GitHub repo connected

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Amplify Gen 2                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────────┐  │
│  │  Next.js   │  │  AppSync   │  │    DynamoDB    │  │
│  │  Frontend  │  │  GraphQL   │  │    Tables      │  │
│  └────────────┘  └────────────┘  └────────────────┘  │
│        │               │                │            │
│        └───────────────┴────────────────┘            │
│                 Amplify Backend                      │
└──────────────────────────────────────────────────────┘
               │
          CloudFront
               │
       Custom Domain
```

## Branch → Environment Mapping

| Branch | Environment | Domain |
|--------|-------------|--------|
| develop | dev | dev.{project}.gaininsight.global |
| staging | test | test.{project}.gaininsight.global |
| main | prod | {project}.gaininsight.global |

## Files Installed

| File | Purpose |
|------|---------|
| `setup-guide.md` | Step-by-step Amplify setup |
| `amplify.yml` | Build configuration |
| `amplify/backend.ts` | Backend entry point |
| `amplify/data/resource.ts` | GraphQL schema |
| `amplify/package.json` | ESM config for amplify dir |

## Doppler Variables Added

| Variable | Purpose |
|----------|---------|
| `AMPLIFY_APP_ID` | Per-environment app ID |

## Usage

This component is installed via `/af:setup` after selecting AWS Infrastructure and choosing "Amplify" as the hosting option.

## GainInsight Standard

For full production setup with testing, CI/CD, and more, follow the GainInsight Standard layers after this component.

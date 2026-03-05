---
title: AWS Infrastructure Component
created: 2026-01-25
updated: 2026-01-25
last_checked: 2026-01-25
tags: [template, setup, aws, infrastructure]
parent: ../README.md
---

# AWS Infrastructure Component

Sets up the foundational AWS infrastructure that other hosting components build upon.

## What This Provides

- AWS Organization Unit for the project
- AWS Accounts (configurable: dev+prod, dev+test+prod, or just prod)
- IAM users with deployment credentials
- Doppler project with per-environment secrets
- Route53 subdomain delegation (optional)
- Git branch structure matching environments

## Prerequisites

- Doppler CLI authenticated (`doppler login`)
- AWS credentials available via Doppler `gi` project
- Access to GainInsight AWS Organization
- GitHub repo created (from greenfield setup)

## Environment Models

| Model | Accounts | Branches | Use Case |
|-------|----------|----------|----------|
| **Simple** | prod only | main | Small projects, prototypes |
| **Standard** | dev + prod | develop, main | Most projects |
| **Full** | dev + test + prod | develop, staging, main | Enterprise, regulated |

## Usage

This component is installed via `/af:setup` when you select "AWS Infrastructure" in the components list.

After installation, choose a hosting component:
- `hosting-amplify` - For Next.js + Amplify Gen 2
- `hosting-lightsail` - For Docker/Directus deployments
- `hosting-ecs` - For containerized workloads (coming soon)

## Files Installed

| File | Purpose |
|------|---------|
| `setup-guide.md` | Step-by-step AWS setup instructions |
| `scripts/create-ou.sh` | Create Organization Unit |
| `scripts/create-accounts.sh` | Create AWS accounts |
| `scripts/setup-doppler.sh` | Configure Doppler project |
| `scripts/setup-dns.sh` | Route53 delegation |

## Doppler Variables Set

| Variable | Scope | Description |
|----------|-------|-------------|
| `AWS_ACCESS_KEY_ID` | Per environment | IAM user credentials |
| `AWS_SECRET_ACCESS_KEY` | Per environment | IAM user credentials |
| `AWS_DEFAULT_REGION` | Per environment | Always `eu-west-2` |
| `AWS_ACCOUNT_ID` | Per environment | Account ID for reference |

## Next Steps

After AWS Infrastructure setup:
1. Choose and install a hosting component
2. The hosting component will use the AWS accounts and Doppler config created here

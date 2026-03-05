---
title: CI/CD Workflow Templates
created: 2026-01-05
updated: 2026-01-05
last_checked: 2026-01-05
tags: [templates, cicd, github-actions, amplify]
parent: ../README.md
code_files:
  - ./lint-and-test.yml.tpl
  - ./deploy-simple.yml.tpl
  - ./deploy-with-e2e.yml.tpl
related:
  - ../../../skills/af-gaininsight-standard/SKILL.md
  - ../../../docs/guides/gaininsight-standard/layer-4-cicd.md
---

# CI/CD Workflow Templates

GitHub Actions workflow templates for GainInsight Standard Amplify projects.

## Templates

| Template | Purpose | Triggers |
|----------|---------|----------|
| `lint-and-test.yml.tpl` | PR validation (lint, type check, unit/integration tests) | PRs to develop/staging/main |
| `deploy-simple.yml.tpl` | Dev/prod deployment monitoring | Push to develop/main |
| `deploy-with-e2e.yml.tpl` | Staging deployment + E2E tests | Push to staging |
| `e2e-manual.yml.tpl` | On-demand E2E test trigger | Manual workflow dispatch |

## Installation

1. Copy templates to `.github/workflows/`:
   ```bash
   cp .claude/templates/gaininsight-standard/cicd/*.tpl .github/workflows/
   ```

2. Rename to `.yml`:
   ```bash
   for f in .github/workflows/*.tpl; do mv "$f" "${f%.tpl}"; done
   ```

3. Replace placeholders:
   ```bash
   sed -i 's/{{PROJECT_NAME}}/juncan/g' .github/workflows/*.yml
   sed -i 's/{{AWS_REGION}}/eu-west-2/g' .github/workflows/*.yml
   sed -i 's/{{AMPLIFY_APP_ID_DEV}}/d2lold1hfmmh0w/g' .github/workflows/*.yml
   sed -i 's/{{AMPLIFY_APP_ID_STG}}/d3by70p51514xi/g' .github/workflows/*.yml
   sed -i 's/{{AMPLIFY_APP_ID_PRD}}/d26r28chsh66qs/g' .github/workflows/*.yml
   sed -i 's/{{BASE_URL_DEV}}/https:\/\/dev.juncan.gaininsight.global/g' .github/workflows/*.yml
   sed -i 's/{{BASE_URL_STG}}/https:\/\/test.juncan.gaininsight.global/g' .github/workflows/*.yml
   sed -i 's/{{BASE_URL_PRD}}/https:\/\/juncan.gaininsight.global/g' .github/workflows/*.yml
   ```

## Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{PROJECT_NAME}}` | Doppler project name | `juncan` |
| `{{AWS_REGION}}` | AWS region | `eu-west-2` |
| `{{AMPLIFY_APP_ID_DEV}}` | Dev Amplify app ID | `d2lold1hfmmh0w` |
| `{{AMPLIFY_APP_ID_STG}}` | Staging Amplify app ID | `d3by70p51514xi` |
| `{{AMPLIFY_APP_ID_PRD}}` | Production Amplify app ID | `d26r28chsh66qs` |
| `{{BASE_URL_DEV}}` | Dev environment URL | `https://dev.project.com` |
| `{{BASE_URL_STG}}` | Staging environment URL | `https://test.project.com` |
| `{{BASE_URL_PRD}}` | Production environment URL | `https://project.com` |
| `{{S3_REPORTS_BUCKET}}` | S3 bucket for E2E reports | `reports-project-gaininsight` |

## Required GitHub Secrets

| Secret | Required For | Description |
|--------|--------------|-------------|
| `AWS_ACCESS_KEY_ID` | All deployments | AWS credentials for Amplify/SES |
| `AWS_SECRET_ACCESS_KEY` | All deployments | AWS credentials |
| `GMAIL_TESTING_SERVICE_ACCOUNT` | E2E tests | Gmail API credentials for email verification |
| `CODECOV_TOKEN` | Coverage reports | (Optional) Codecov integration |

## Architecture

These workflows implement a **hybrid architecture**:

1. **Amplify handles deployment** (triggered by git push)
2. **GitHub Actions waits for deployment** (polling)
3. **GitHub Actions runs E2E tests** (after deployment succeeds)

This is necessary because:
- `aws amplify create-deployment` API doesn't work with git-connected apps
- Amplify's `postBuild` runs BEFORE deployment completes (no `postDeploy` hook)

## Key Features

### Commit-Specific Job Tracking

The polling script finds the Amplify job for the specific commit SHA, not just "the latest job":

```bash
JOB_ID=$(aws amplify list-jobs --query "jobSummaries[?commitId=='$COMMIT_SHA'].jobId")
```

This prevents race conditions when multiple pushes happen quickly.

### Timing Expectations

| Stage | Duration |
|-------|----------|
| Amplify deployment | ~13-14 min |
| CloudFront propagation | 30s |
| E2E test suite | ~1-2 min |
| **Total staging pipeline** | **~17 min** |

Fresh deployments with User Pool creation can take 18+ minutes.

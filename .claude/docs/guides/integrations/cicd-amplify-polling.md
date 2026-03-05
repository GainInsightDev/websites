---
title: "Integration: CI/CD + Amplify Polling"
created: 2026-02-18
updated: 2026-02-18
last_checked: 2026-02-18
tags: [integration, cicd, amplify, github-actions]
parent: ./README.md
related:
  - ../aws-amplify-guide.md
  - ../gaininsight-standard/layer-4-cicd.md
  - ../delivery-guide.md
---

# Integration: CI/CD + Amplify Polling

Amplify apps connected to a GitHub repository trigger their own builds on push. This means the standard `create-deployment` API approach does not work. Instead, use a hybrid architecture where Amplify handles the build and GitHub Actions polls for completion before running E2E tests.

## Why Polling Is Required

Amplify apps with GitHub source connections build automatically when commits are pushed. The `create-deployment` API is only available for apps using manual deployments (no source connection). Since GainInsight Standard projects use Amplify's GitHub integration for automatic deployments, GitHub Actions must poll the Amplify API to detect when the deployment finishes.

## Poll by Commit SHA, Not Latest Job

**Always poll by the specific commit SHA**, not by "latest job." Multiple PRs may push commits simultaneously, and polling for the latest job creates a race condition where one workflow reads the status of another PR's deployment.

### Polling Command

```bash
aws amplify list-jobs \
  --app-id "$AMPLIFY_APP_ID" \
  --branch-name "$BRANCH_NAME" \
  --query "jobSummaries[?commitId=='$COMMIT_SHA'] | [0]" \
  --output json
```

This filters jobs to the exact commit, avoiding confusion with concurrent deployments.

### Polling Loop Pattern

```bash
MAX_ATTEMPTS=60  # 60 x 15s = 15 minutes
POLL_INTERVAL=15

for i in $(seq 1 $MAX_ATTEMPTS); do
  JOB=$(aws amplify list-jobs \
    --app-id "$AMPLIFY_APP_ID" \
    --branch-name "$BRANCH_NAME" \
    --query "jobSummaries[?commitId=='$COMMIT_SHA'] | [0]" \
    --output json)

  STATUS=$(echo "$JOB" | jq -r '.status // "NOT_FOUND"')

  case "$STATUS" in
    "SUCCEED")
      echo "Deployment successful"
      break
      ;;
    "FAILED"|"CANCELLED")
      echo "Deployment failed with status: $STATUS"
      exit 1
      ;;
    *)
      echo "Attempt $i/$MAX_ATTEMPTS: status=$STATUS, waiting ${POLL_INTERVAL}s..."
      sleep $POLL_INTERVAL
      ;;
  esac
done
```

## Deployment Timing

Typical timing for a GainInsight Standard deployment pipeline:

| Phase | Duration |
|-------|----------|
| Amplify build + deploy | ~13-14 minutes |
| E2E test suite | ~3 minutes |
| **Total pipeline** | **~17 minutes** |

E2E tests **must** wait for the Amplify deployment to complete before running. The polling loop above ensures this sequencing.

## Environment Variables at Build Time

PostHog and other runtime environment variables are injected by Doppler at Amplify build time, not at GitHub Actions time:

- `NEXT_PUBLIC_POSTHOG_KEY` — PostHog project API key
- `NEXT_PUBLIC_POSTHOG_HOST` — PostHog ingestion endpoint

These are set in Amplify's environment variables configuration (sourced from Doppler) and baked into the Next.js build as public environment variables. They are not available in GitHub Actions and do not need to be.

## Architecture Diagram

```
Push to GitHub
      │
      ├──► Amplify auto-build (triggered by webhook)
      │         │
      │         ▼
      │    Build → Deploy → Live URL
      │
      └──► GitHub Actions workflow
                │
                ▼
           Poll Amplify API (by commit SHA)
                │
                ▼
           Wait for SUCCEED status
                │
                ▼
           Run E2E tests against deployed URL
                │
                ▼
           Report results
```

## Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Polling finds no jobs | Amplify webhook hasn't fired yet | Add initial delay (30-60s) before first poll |
| Wrong deployment status | Polling latest job instead of by SHA | Use `commitId` filter in query |
| E2E tests hit old version | Tests started before deployment completed | Ensure polling loop confirms `SUCCEED` |
| Build succeeds but deploy fails | Amplify deployment phase error | Check Amplify console for deployment logs |

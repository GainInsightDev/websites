---
title: "GainInsight Standard - Layer 4: CI/CD Pipeline"
sidebar_label: "Layer 4 CI/CD"
sidebar_position: 4
created: 2025-12-15
updated: 2026-01-03
last_checked: 2026-01-03
tags: [guide, gaininsight, cicd, github-actions, claude-code, storybook]
parent: ./README.md
related:
  - ./layer-3-ui-styling.md
  - ./teardown.md
  - ../../../skills/af-gaininsight-standard/SKILL.md
---

# Layer 4: CI/CD Pipeline

**Purpose:** Add GitHub Actions for pre-merge validation, Claude Code review, and Storybook hosting.

> **Reference Implementation:** Juncan (`/data/worktrees/juncan/develop`) has working GitHub Actions workflows in `.github/workflows/`.

**Prerequisites:**
- Layer 1 complete (infrastructure, branch protection)
- Layer 2 complete (testing framework)
- Layer 3 complete (UI & Storybook)

**Time:** ~20 minutes

---

## Overview

Layer 4 adds continuous integration WITHOUT replacing Amplify deployment:

| Component | Technology | Purpose |
|-----------|------------|---------|
| Pre-merge checks | GitHub Actions | Run tests, lint, type check, security audit before merge |
| Code review | Claude Code Action | AI-assisted PR review on develop |
| Storybook hosting | S3 + CloudFront | Component documentation site |
| Deployment | Amplify (existing) | Branch-based auto-deployment |

**Key principle:** Amplify handles deployment. GitHub Actions handles validation.

---

## 4.0 Install Test Specifications (RED Phase)

**Purpose:** Copy Layer 4 BDD test templates to target project. Tests will FAIL initially - this is expected (Red phase of Red-Green-Refactor).

**Why tests first:**
- Tests are the *specification* of what Layer 4 should deliver
- Running tests now establishes our "red" baseline
- After setup, tests should turn "green"
- This is proper BDD/TDD workflow

**Steps:**

```bash
# If not already done, ensure test templates are in project
# (Tests were copied in Layer 1 step 1.0)
cd {target-project}/tests/gaininsight-stack

# Install test dependencies if needed
npm install

# Run Layer 4 tests to confirm RED state
doppler run --project {project-name} --config dev -- \
  npx cucumber-js --tags "@layer-4 and not @runtime"
```

**Expected result:** Tests FAIL because:
- GitHub workflows don't exist yet
- GitHub secrets not configured
- S3 bucket not created
- CloudFront not set up
- Branch protection not updated

**This is correct!** We now have our specification. Proceed with Layer 4 setup.

**Note on step definitions:** Layer 4 tests reuse shared steps from earlier layers:
- `"the project has a GitHub repository"` → defined in layer-1.steps.ts
- `"{string} should exist"` → defined in layer-3.steps.ts
- `"I should receive HTTP status {int}"` → defined in layer-2.steps.ts
- `"the response should contain {string}"` → defined in layer-2.steps.ts

Do NOT duplicate these in layer-4.steps.ts - Cucumber loads all step files and duplicates cause errors.

---

## 4.1 Create Pre-merge Checks Workflow

**Purpose:** Run tests, linting, and type checking on every PR.

**Create `.github/workflows/ci.yml`:**

```yaml
name: CI

on:
  workflow_dispatch:
  pull_request:
    branches: [develop, staging, main]
  push:
    branches: [develop]

jobs:
  validate:
    name: Validate
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Security audit
        run: npm audit --audit-level=high

      - name: Generate Amplify outputs
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_REGION: eu-west-2
        run: npx ampx generate outputs --app-id ${{ vars.AMPLIFY_APP_ID }} --branch ${{ github.base_ref || github.ref_name }}

      - name: Type check
        run: npx tsc --noEmit

      - name: Lint
        run: npm run lint

      - name: Unit tests
        run: npm test -- --coverage --coverageThreshold='{}'

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          fail_ci_if_error: false

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: validate

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Generate Amplify outputs
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_REGION: eu-west-2
        run: npx ampx generate outputs --app-id ${{ vars.AMPLIFY_APP_ID }} --branch ${{ github.base_ref || github.ref_name }}

      - name: Build Next.js
        run: npm run build

      - name: Build Storybook
        run: npm run build-storybook
```

**Notes:**
- Runs on PRs to protected branches and pushes to develop
- Validates before Amplify builds (fail fast)
- Coverage upload is optional (won't fail if no Codecov token)
- **Generate Amplify outputs** step creates `amplify_outputs.json` which is gitignored but required for type checking and builds. Uses the deployed backend for the target branch.

**Required repository variable:**
```bash
# Set the Amplify app ID as a repository variable (not secret - it's not sensitive)
gh variable set AMPLIFY_APP_ID --body "{app-id}"
```

Get the app ID from Amplify console or:
```bash
doppler run --project {project-name} --config dev -- \
  aws amplify list-apps --query "apps[?name=='{project-name}'].appId" --output text
```

---

## 4.2 Create Claude Code Review Workflow

**Purpose:** AI-assisted code review on develop branch PRs.

**Create `.github/workflows/claude-code-review.yml`:**

```yaml
name: Claude Code Review

on:
  pull_request:
    types: [opened, synchronize]
    branches: [develop]

jobs:
  claude-review:
    name: Claude Review
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Claude Code Review
        uses: anthropics/claude-code-action@v1
        env:
          LINEAR_API_KEY: ${{ secrets.LINEAR_API_KEY }}
          LINEAR_TEAM_ID: ${{ secrets.LINEAR_TEAM_ID }}
        with:
          claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
          prompt: |
            Please review this pull request and provide feedback on:
            - Code quality and best practices
            - Potential bugs or issues
            - Performance considerations
            - Security concerns
            - Test coverage

            Use the repository's CLAUDE.md for guidance on style and conventions. Be constructive and helpful in your feedback.

            Use `gh pr comment` with your Bash tool to leave your review as a comment on the PR.

            **For significant issues**, create a Linear issue to track the fix:

            First, get available labels for the team:
            ```bash
            curl -s -X POST https://api.linear.app/graphql \
              -H "Authorization: $LINEAR_API_KEY" \
              -H "Content-Type: application/json" \
              -d '{"query": "{ team(id: \"'"$LINEAR_TEAM_ID"'\") { labels { nodes { id name } } } }"}' \
              | jq '.data.team.labels.nodes'
            ```

            Then create the issue with appropriate label:
            - **Bugs** (incorrect behavior, errors, crashes) → apply "bug" label
            - **Technical debt** (code quality, maintainability, security concerns) → apply "debt" label

            ```bash
            curl -X POST https://api.linear.app/graphql \
              -H "Authorization: $LINEAR_API_KEY" \
              -H "Content-Type: application/json" \
              -d '{
                "query": "mutation($input: IssueCreateInput!) { issueCreate(input: $input) { issue { id identifier url } } }",
                "variables": {
                  "input": {
                    "teamId": "'"$LINEAR_TEAM_ID"'",
                    "title": "PR Review: <brief issue title>",
                    "description": "Found in PR #${{ github.event.pull_request.number }}\n\n<detailed description>\n\n---\nPR: ${{ github.event.pull_request.html_url }}",
                    "labelIds": ["<label-id-from-above>"]
                  }
                }
              }'
            ```

            Include the Linear issue link in your PR comment.
          claude_args: '--allowed-tools "Bash(gh issue view:*),Bash(gh search:*),Bash(gh issue list:*),Bash(gh pr comment:*),Bash(gh pr diff:*),Bash(gh pr view:*),Bash(gh pr list:*),Bash(curl:*)"'
```

**Required secrets:**
- `CLAUDE_CODE_OAUTH_TOKEN` - OAuth token for Claude Code
- `LINEAR_API_KEY` - Linear API key for issue creation
- `LINEAR_TEAM_ID` - Linear team ID (from project setup)

**Notes:**
- Only runs on PRs to develop (not staging/main)
- Staging and main PRs rely on human review
- Review is additive, doesn't block merge
- Significant issues get tracked in Linear automatically

---

## 4.3 Create On-demand Claude Workflow

**Purpose:** Allow developers to invoke Claude via @claude mention in PR comments.

**Create `.github/workflows/claude-on-demand.yml`:**

```yaml
name: Claude On-demand

on:
  issue_comment:
    types: [created]

jobs:
  claude-respond:
    name: Claude Response
    if: |
      github.event.issue.pull_request &&
      contains(github.event.comment.body, '@claude')
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Claude Response
        uses: anthropics/claude-code-action@v1
        with:
          claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
          prompt: |
            Respond to the following comment on this pull request:

            ${{ github.event.comment.body }}

            Be helpful and specific. If asked to make changes, explain what needs to be done.
          claude_args: '--allowed-tools "Bash(gh pr comment:*),Bash(gh pr diff:*)"'
```

**Usage:** Comment `@claude please review the error handling` on a PR.

---

## 4.3.1 Create E2E Tests Workflow

**Purpose:** Run BDD/E2E tests against deployed dev environment after Amplify deploys.

**Create `.github/workflows/e2e-tests.yml`:**

```yaml
name: E2E Tests

on:
  workflow_dispatch:
  push:
    branches: [develop]

jobs:
  e2e:
    name: E2E Tests
    runs-on: ubuntu-latest

    steps:
      - name: Wait for Amplify deployment
        run: |
          echo "Waiting 5 minutes for Amplify to deploy..."
          sleep 300

      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          BASE_URL: https://dev.{project-name}.gaininsight.global

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: reports/playwright/
          retention-days: 7
```

**Notes:**
- Waits 5 minutes for Amplify to complete deployment
- Tests run against the deployed dev environment (not localhost)
- Playwright config must use `BASE_URL` env var
- Test reports uploaded as artifacts for debugging failures

---

## 4.4 Configure GitHub Secrets

**Purpose:** Add required secrets for CI workflows.

**Two approaches:**

| Approach | Pros | Cons |
|----------|------|------|
| **Runtime Fetch** (recommended) | Single token, auto-sync, audit trail | Requires Doppler action in workflows |
| **Manual Copy** | Simple workflows, no runtime dependency | Manual sync, drift risk |

### Option A: Doppler Runtime Fetch (Recommended)

Use a Doppler service token so workflows fetch secrets at runtime. This is fully automatable by agents.

**Step 1: Create Doppler service token**

```bash
# Create token for dev config
DOPPLER_TOKEN=$(doppler configs tokens create \
  --project {project-name} \
  --config dev \
  --name github-actions \
  --plain)
```

**Step 2: Set as GitHub secret**

```bash
gh secret set DOPPLER_TOKEN \
  --repo {owner}/{repo} \
  --body "$DOPPLER_TOKEN"
```

**Step 3: Update workflows to use Doppler**

Add to workflow jobs that need secrets:

```yaml
steps:
  - name: Fetch secrets from Doppler
    uses: dopplerhq/secrets-fetch-action@v1.2.0
    with:
      doppler-token: ${{ secrets.DOPPLER_TOKEN }}
      inject-env-vars: true

  # Subsequent steps have all Doppler secrets as env vars
  - name: Build
    run: npm run build  # AWS_ACCESS_KEY_ID, etc. available
```

**Benefits:**
- Single secret to manage (DOPPLER_TOKEN)
- New secrets in Doppler immediately available to CI
- No manual sync when secrets rotate
- Audit trail in Doppler

**For multiple environments (staging/prod deploys):**

```bash
# Create per-environment tokens
doppler configs tokens create --project {project} --config stg --name gha-stg --plain
doppler configs tokens create --project {project} --config prd --name gha-prd --plain

# Set as separate secrets
gh secret set DOPPLER_TOKEN_STG --body "$STG_TOKEN"
gh secret set DOPPLER_TOKEN_PRD --body "$PRD_TOKEN"
```

---

### Option B: Manual Secret Copy

Copy individual secrets from Doppler to GitHub. Use this if you prefer simpler workflows without runtime Doppler dependency.

**Required secrets:**

| Secret | Source | Required for |
|--------|--------|--------------|
| `CLAUDE_CODE_OAUTH_TOKEN` | Claude Code OAuth | AI code review |
| `LINEAR_API_KEY` | Linear API settings | Issue creation |
| `LINEAR_TEAM_ID` | Linear team URL | Issue creation |
| `CODECOV_TOKEN` | Codecov.io (optional) | Coverage reporting |

**Note:** PostHog environment variables (`NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`) are injected by Doppler at build time. If using Option A (Doppler Runtime Fetch), they're available automatically. If using Option B, add them as GitHub secrets or repository variables.

### Getting Linear API Key

**Note:** `LINEAR_API_KEY` is stored centrally in Doppler `gi/prd`. Skip this if already configured.

1. Go to [Linear](https://linear.app) → click your avatar (bottom-left)
2. Go to **Settings** → **Security and Access** → **API**
3. Under "Personal API keys", click **Create key**
4. Label: `GitHub Actions`
5. Copy the key (starts with `lin_api_`)
6. Store centrally: `doppler secrets set LINEAR_API_KEY=<key> --project gi --config prd`

### Getting Linear Team ID

**Important:** Use the UUID, NOT the short key (KZN, AFT, etc.)

```bash
# Get your Linear API key from Doppler
LINEAR_API_KEY=$(doppler secrets get LINEAR_API_KEY --project gi --config prd --plain)

# Query teams to find UUID
curl -s -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ teams { nodes { id name key } } }"}' \
  https://api.linear.app/graphql | jq '.data.teams.nodes'
```

2. Find your team and note the `id` field (UUID like `57571325-b1b2-4616-9c1f-3add47a5ea7c`)
3. Store in Doppler: `doppler secrets set LINEAR_TEAM_ID=<uuid> --project {project-name} --config dev`

**Add secrets to GitHub (from Doppler):**

```bash
# Set all secrets from Doppler
gh secret set LINEAR_API_KEY --body "$(doppler secrets get LINEAR_API_KEY --project gi --config prd --plain)"
gh secret set LINEAR_TEAM_ID --body "$(doppler secrets get LINEAR_TEAM_ID --project {project-name} --config dev --plain)"
gh secret set CLAUDE_CODE_OAUTH_TOKEN --body "$(doppler secrets get CLAUDE_CODE_OAUTH_TOKEN --project gi --config prd --plain)"
gh secret set AWS_ACCESS_KEY_ID --body "$(doppler secrets get AWS_ACCESS_KEY_ID --project {project-name} --config dev --plain)"
gh secret set AWS_SECRET_ACCESS_KEY --body "$(doppler secrets get AWS_SECRET_ACCESS_KEY --project {project-name} --config dev --plain)"
```

**Note on Claude Code OAuth token:**

The `CLAUDE_CODE_OAUTH_TOKEN` is an Anthropic OAuth token (not a GitHub token). It's stored centrally in Doppler `gi/prd`.

If you need to refresh it, the token comes from your local Claude Code config:
```bash
# Extract from local Claude config
cat ~/.claude/.credentials.json | jq -r '.claudeAiOauth.accessToken'

# Store in Doppler for sharing
doppler secrets set CLAUDE_CODE_OAUTH_TOKEN=<token> --project gi --config prd
```

---

## 4.5 Configure Storybook Hosting (S3 + CloudFront)

**Purpose:** Host Storybook static site for component documentation with HTTPS.

**Architecture:**
- S3 bucket stores Storybook build (static website hosting)
- CloudFront distribution for HTTPS and caching
- ACM certificate in us-east-1 (required for CloudFront)
- Route 53 CNAME pointing to CloudFront
- URL: `storybook.{project}.gaininsight.global`

**Step 1: Create S3 bucket**

```bash
# Create bucket in dev account
doppler run --project {project-name} --config dev -- \
  aws s3 mb s3://storybook-{project-name}-gaininsight

# Enable static website hosting
doppler run --project {project-name} --config dev -- \
  aws s3 website s3://storybook-{project-name}-gaininsight \
    --index-document index.html \
    --error-document index.html

# Disable Block Public Access (required before setting bucket policy)
doppler run --project {project-name} --config dev -- \
  aws s3api put-public-access-block \
    --bucket storybook-{project-name}-gaininsight \
    --public-access-block-configuration \
    "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
```

**Step 2: Configure bucket policy**

```bash
# Allow public read for CloudFront
doppler run --project {project-name} --config dev -- \
  aws s3api put-bucket-policy \
    --bucket storybook-{project-name}-gaininsight \
    --policy '{
      "Version": "2012-10-17",
      "Statement": [{
        "Sid": "PublicReadGetObject",
        "Effect": "Allow",
        "Principal": "*",
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::storybook-{project-name}-gaininsight/*"
      }]
    }'
```

**Step 3: Create ACM certificate (us-east-1)**

```bash
# Request certificate (must be us-east-1 for CloudFront)
doppler run --project {project-name} --config dev -- aws acm request-certificate \
  --domain-name storybook.{project-name}.gaininsight.global \
  --validation-method DNS \
  --region us-east-1 \
  --output json

# Get validation record
doppler run --project {project-name} --config dev -- bash -c 'aws acm describe-certificate \
  --certificate-arn {certificate-arn} \
  --region us-east-1 \
  --output json | jq ".Certificate.DomainValidationOptions[0].ResourceRecord"'

# Add validation CNAME to Route 53 (using domain admin credentials)
doppler run --project gi --config prd -- bash -c '
AWS_ACCESS_KEY_ID=$DOMAIN_ADMIN_AWS_ACCESS_KEY_ID \
AWS_SECRET_ACCESS_KEY=$DOMAIN_ADMIN_AWS_SECRET_ACCESS_KEY \
aws route53 change-resource-record-sets \
  --hosted-zone-id {project-zone-id} \
  --change-batch '"'"'{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "{validation-record-name}",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [{"Value": "{validation-record-value}"}]
      }
    }]
  }'"'"''
```

**Step 4: Create CloudFront distribution**

```bash
doppler run --project {project-name} --config dev -- aws cloudfront create-distribution \
  --distribution-config '{
    "CallerReference": "storybook-{project-name}-'$(date +%s)'",
    "Comment": "Storybook for {project-name}",
    "Enabled": true,
    "Origins": {
      "Quantity": 1,
      "Items": [{
        "Id": "S3-storybook",
        "DomainName": "storybook-{project-name}-gaininsight.s3-website.eu-west-2.amazonaws.com",
        "CustomOriginConfig": {
          "HTTPPort": 80,
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "http-only"
        }
      }]
    },
    "DefaultCacheBehavior": {
      "TargetOriginId": "S3-storybook",
      "ViewerProtocolPolicy": "redirect-to-https",
      "AllowedMethods": {"Quantity": 2, "Items": ["GET", "HEAD"]},
      "CachePolicyId": "658327ea-f89d-4fab-a63d-7e88639e58f6",
      "Compress": true
    },
    "Aliases": {"Quantity": 1, "Items": ["storybook.{project-name}.gaininsight.global"]},
    "ViewerCertificate": {
      "ACMCertificateArn": "{certificate-arn}",
      "SSLSupportMethod": "sni-only",
      "MinimumProtocolVersion": "TLSv1.2_2021"
    },
    "DefaultRootObject": "index.html"
  }' --output json
```

Note the CloudFront domain from the output (e.g., `dXXX.cloudfront.net`).

**Step 5: Add Route 53 CNAME**

```bash
doppler run --project gi --config prd -- bash -c '
AWS_ACCESS_KEY_ID=$DOMAIN_ADMIN_AWS_ACCESS_KEY_ID \
AWS_SECRET_ACCESS_KEY=$DOMAIN_ADMIN_AWS_SECRET_ACCESS_KEY \
aws route53 change-resource-record-sets \
  --hosted-zone-id {project-zone-id} \
  --change-batch '"'"'{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "storybook.{project-name}.gaininsight.global",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [{"Value": "{cloudfront-domain}.cloudfront.net"}]
      }
    }]
  }'"'"''
```

**Step 6: Add deploy workflow**

**Create `.github/workflows/storybook-deploy.yml`:**

```yaml
name: Deploy Storybook

on:
  workflow_dispatch:
  push:
    branches: [develop]
    paths:
      - 'src/components/**'
      - 'stories/**'
      - '.storybook/**'

jobs:
  deploy:
    name: Deploy Storybook
    runs-on: ubuntu-latest
    environment: development

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build Storybook
        run: npm run build-storybook

      - name: Deploy to S3
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_DEFAULT_REGION: eu-west-2
        run: |
          aws s3 sync reports/storybook s3://storybook-${{ github.event.repository.name }}-gaininsight \
            --delete \
            --cache-control "max-age=31536000" \
            --exclude "*.html" \
            --exclude "*.json"
          aws s3 sync reports/storybook s3://storybook-${{ github.event.repository.name }}-gaininsight \
            --cache-control "no-cache" \
            --include "*.html" \
            --include "*.json"
```

**Required secrets:**
- `AWS_ACCESS_KEY_ID` - From Doppler dev config
- `AWS_SECRET_ACCESS_KEY` - From Doppler dev config

**Result:** Storybook accessible at `https://storybook.{project-name}.gaininsight.global`

---

## 4.5.1 Enable Amplify PR Previews

**Purpose:** Ensure Amplify builds PRs before merge, catching deployment failures early.

**Why this matters:** GitHub CI checks (tests, lint) can pass while Amplify deployments fail (e.g., Cognito schema changes, CloudFormation errors). PR previews build the PR branch in Amplify and report status back to GitHub, preventing broken code from being merged.

**Enable on develop branch only:**

```bash
# Dev account - develop branch (feature PRs land here)
doppler run --project {project-name} --config dev -- \
  aws amplify update-branch \
    --app-id $(doppler run --project {project-name} --config dev -- printenv AMPLIFY_APP_ID) \
    --branch-name develop \
    --enable-pull-request-preview
```

**Why only develop?**
- PRs to develop are the first time code is tested against Amplify build
- PRs to staging/main contain code already built successfully on develop
- Enabling on staging/main adds build time without significant benefit
- Environment-specific issues (different AWS accounts) are rare

**Result:**
- PRs to develop get temporary preview URLs (e.g., `pr-13.{app-id}.amplifyapp.com`)
- Amplify build status appears as a GitHub check on the PR
- Preview environments auto-delete after PR is merged/closed (TTL: 5 days)
- Failed Amplify builds block merge when added as required check in 4.6

**Verify:**

```bash
# Check PR preview is enabled on develop
doppler run --project {project-name} --config dev -- \
  aws amplify get-branch --app-id {app-id} --branch-name develop \
  --query "branch.enablePullRequestPreview"
# Expected: true
```

---

## 4.6 Update Branch Protection (Status Checks)

**Purpose:** Require CI checks to pass before merge.

**Steps:**

```bash
# Update staging branch protection
gh api repos/{owner}/{project-name}/branches/staging/protection -X PUT \
  --input - << 'EOF'
{
  "required_pull_request_reviews": {
    "required_approving_review_count": 1
  },
  "required_status_checks": {
    "strict": true,
    "contexts": ["Validate", "Build"]
  },
  "enforce_admins": false,
  "restrictions": null
}
EOF

# Update main branch protection
gh api repos/{owner}/{project-name}/branches/main/protection -X PUT \
  --input - << 'EOF'
{
  "required_pull_request_reviews": {
    "required_approving_review_count": 1
  },
  "required_status_checks": {
    "strict": true,
    "contexts": ["Validate", "Build"]
  },
  "enforce_admins": false,
  "restrictions": null
}
EOF
```

**Notes:**
- `strict: true` requires branch to be up-to-date before merge
- CI jobs must pass before PR can be merged
- Admins can still bypass if needed (enforce_admins: false)

---

## 4.7 Create Workflow Documentation

**Purpose:** Document CI/CD setup for the project.

**Create `docs/cicd.md`:**

```markdown
---
title: CI/CD Pipeline
created: {{DATE}}
updated: {{DATE}}
tags: [docs, cicd, github-actions]
parent: ./README.md
---

# CI/CD Pipeline

## Overview

This project uses GitHub Actions for validation and Amplify for deployment.

## Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| CI | PR to develop/staging/main | Tests, lint, build |
| E2E Tests | Push to develop | BDD/E2E tests against deployed dev |
| Claude Review | PR to develop | AI code review |
| Claude On-demand | @claude in PR comment | Interactive AI help |
| Storybook Deploy | Push to develop (component changes) | Update Storybook site |

## Deployment

Deployment is handled by Amplify, not GitHub Actions:

| Branch | Environment | URL |
|--------|-------------|-----|
| develop | dev | dev.{project}.gaininsight.global |
| staging | test | test.{project}.gaininsight.global |
| main | prod | {project}.gaininsight.global |

## Required Secrets

| Secret | Purpose |
|--------|---------|
| CLAUDE_CODE_OAUTH_TOKEN | AI code review |
| LINEAR_API_KEY | Create issues from reviews |
| LINEAR_TEAM_ID | Target team for issues |
| AWS_ACCESS_KEY_ID | Storybook S3 deploy |
| AWS_SECRET_ACCESS_KEY | Storybook S3 deploy |
| CODECOV_TOKEN | Coverage reporting (optional) |

## Storybook

Component documentation is hosted at:
`https://storybook.{project}.gaininsight.global`

Updated automatically when component files change on develop.
```

---

## 4.8 Verify Setup

**Purpose:** Confirm all workflows are correctly configured.

**Steps:**

```bash
# Check workflows exist
ls .github/workflows/
# Expected: ci.yml, claude-code-review.yml, claude-on-demand.yml, e2e-tests.yml, storybook-deploy.yml

# Validate workflow syntax
gh workflow list

# Check secrets are configured
gh secret list
# Expected: CLAUDE_CODE_OAUTH_TOKEN, LINEAR_API_KEY, LINEAR_TEAM_ID, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY

# Trigger CI manually
gh workflow run ci.yml

# Check branch protection
gh api repos/{owner}/{project}/branches/staging/protection | jq '.required_status_checks'
gh api repos/{owner}/{project}/branches/main/protection | jq '.required_status_checks'
```

---

## 4.9 Verify Layer 4 Setup (GREEN Phase)

**Purpose:** Run BDD tests to verify all Layer 4 infrastructure is correctly configured. This completes the Red-Green cycle started in step 4.0.

### Quick Validation (@quick)

```bash
cd tests/gaininsight-stack
doppler run --project {project-name} --config dev -- \
  npx cucumber-js --tags "@layer-4 and not @runtime"
```

**Time:** ~5 seconds

**Expected result:** All tests PASS (GREEN).

### Full Validation (@runtime)

```bash
cd tests/gaininsight-stack
doppler run --project {project-name} --config dev -- \
  npx cucumber-js --tags "@layer-4"
```

**Time:** ~1-2 minutes

**Note:** Runtime tests require CloudFront to have finished deploying (~10-15 minutes).

### If Tests Fail

Review the failing step output and fix the corresponding infrastructure:

| Failing Test | Likely Cause | Fix |
|--------------|--------------|-----|
| Workflow files missing | Workflows not created | Steps 4.1-4.3 |
| Secrets not configured | GitHub secrets missing | Step 4.4 |
| S3 bucket not found | Bucket not created | Step 4.5 |
| CloudFront not found | Distribution not created | Step 4.5 |
| DNS not resolving | Route 53 record missing | Step 4.5 |
| Branch protection wrong | Status checks not set | Step 4.6 |

---

## Layer 4 Checkpoint

**Layer 4 is complete!** You now have:
- GitHub Actions for pre-merge validation (tests, lint, build)
- E2E tests against deployed dev environment
- Claude Code AI review on develop branch PRs
- On-demand Claude help via @claude mentions
- Storybook hosting via S3 + CloudFront with HTTPS
- Branch protection with required status checks

**GainInsight Standard setup is complete!**

All 4 layers are configured:
1. Environment & Infrastructure
2. Testing Framework
3. UI & Styling
4. CI/CD Pipeline

Your project is production-ready with the full GainInsight Standard stack.

---

## Troubleshooting

### Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Claude review not running | Wrong branch | Only triggers on PRs to develop |
| `CLAUDE_CODE_OAUTH_TOKEN` not found | Secret not configured | Add secret in repo settings |
| Linear issue not created | Missing LINEAR_API_KEY | Add Linear API key to secrets |
| Linear 401 error | Invalid API key | Generate new key in Linear settings |
| Linear issue in wrong team | Wrong LINEAR_TEAM_ID | Use UUID from API, not team key |
| S3 sync fails | AWS credentials wrong | Verify secrets match Doppler dev config |
| Storybook 403 error | Bucket policy missing | Re-run bucket policy command |
| CI checks not required | Branch protection outdated | Re-run protection API calls |
| CloudFront 403 error | Certificate not validated | Check ACM certificate status |
| Storybook not loading | CloudFront still deploying | Wait 10-15 mins for distribution |

### Test Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| "Multiple step definitions match" | Duplicate step in layer-4.steps.ts | Remove duplicate; use shared step from layer-1 or layer-3 |
| "Project name not found" | Not running via Doppler | Use `doppler run --project X --config dev -- npx cucumber-js` |
| Job name check fails | Boolean conversion bug | Ensure `hasJob` uses `!!` to convert to boolean |

### CI Workflow Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| `npm ci` fails with "Missing from lock file" | package-lock.json out of sync | Run `npm install` locally, commit updated lock file |
| Workflow can't be triggered manually | Missing `workflow_dispatch` | Add `workflow_dispatch:` to workflow `on:` triggers |
| Storybook deploy 404 | S3 bucket empty | Manually trigger `storybook-deploy.yml` workflow |
| Type check fails on js-yaml | Missing @types/js-yaml | `npm install --save-dev @types/js-yaml` in root project |
| Lint fails: Cannot find package 'eslint-plugin-storybook' | eslint-plugin-storybook 10.x requires Storybook 10 | Install compatible version: `npm install --save-dev eslint-plugin-storybook@0.11.6` |
| Lint fails on `.claude/scripts/` files | Framework files have `any` types, unused vars | Add `globalIgnores([".claude/scripts/**", ".claude/lib/**"])` to ESLint config |
| Lint fails: `require()` style import forbidden | Tailwind config uses CommonJS require | Convert to ESM: `import tailwindcssAnimate from "tailwindcss-animate"` |
| Unit tests fail: "Missing script: test:unit" | Script name mismatch | Use `npm test` or `npm run test:coverage` instead |
| Unit tests fail on coverage threshold | Coverage thresholds set but no tests | Override with `--coverageThreshold='{}'` in CI, or lower thresholds |

### Workflow Debugging

```bash
# View workflow runs
gh run list --workflow=ci.yml

# View specific run logs
gh run view {run-id} --log

# Re-run failed workflow
gh run rerun {run-id}
```

### Claude Code Not Responding

1. Check token is valid: Generate a new OAuth token
2. Check permissions: PR must have write access for comments
3. Check quota: Claude Code has usage limits

### Storybook Not Updating

1. Check workflow triggered: `gh run list --workflow=storybook-deploy.yml`
2. Check S3 sync: View workflow logs for errors
3. Check CloudFront: `curl -I https://storybook.{project-name}.gaininsight.global`
4. Invalidate CloudFront cache if needed:
   ```bash
   doppler run --project {project-name} --config dev -- \
     aws cloudfront create-invalidation --distribution-id {dist-id} --paths "/*"
   ```
5. Clear browser cache: Storybook assets are cached aggressively

---

## Teardown Playbook

**Purpose:** Remove all Layer 4 CI/CD infrastructure. Use when decommissioning a project or starting fresh.

**Warning:** This is destructive. Ensure you have backups if needed.

### Order of Operations

Teardown must happen in reverse order to avoid dependency issues:

1. Disable workflows (stop new runs)
2. Remove branch protection status checks
3. Delete Route 53 records (storybook CNAME)
4. Disable and delete CloudFront distribution
5. Delete ACM certificate
6. Empty and delete S3 bucket
7. Remove GitHub secrets
8. Delete workflow files
9. Remove documentation

---

### T.1 Disable GitHub Workflows

```bash
# Disable all Layer 4 workflows
gh workflow disable ci.yml
gh workflow disable claude-code-review.yml
gh workflow disable claude-on-demand.yml
gh workflow disable e2e-tests.yml
gh workflow disable storybook-deploy.yml

# Verify disabled
gh workflow list
```

---

### T.2 Remove Branch Protection Status Checks

```bash
# Remove status check requirements from staging
gh api repos/{owner}/{project-name}/branches/staging/protection -X PUT \
  --input - << 'EOF'
{
  "required_pull_request_reviews": {
    "required_approving_review_count": 1
  },
  "required_status_checks": null,
  "enforce_admins": false,
  "restrictions": null
}
EOF

# Remove status check requirements from main
gh api repos/{owner}/{project-name}/branches/main/protection -X PUT \
  --input - << 'EOF'
{
  "required_pull_request_reviews": {
    "required_approving_review_count": 1
  },
  "required_status_checks": null,
  "enforce_admins": false,
  "restrictions": null
}
EOF
```

---

### T.3 Delete Route 53 Records

```bash
# Delete storybook CNAME record
doppler run --project gi --config prd -- bash -c '
AWS_ACCESS_KEY_ID=$DOMAIN_ADMIN_AWS_ACCESS_KEY_ID \
AWS_SECRET_ACCESS_KEY=$DOMAIN_ADMIN_AWS_SECRET_ACCESS_KEY \
aws route53 change-resource-record-sets \
  --hosted-zone-id {project-zone-id} \
  --change-batch '"'"'{
    "Changes": [{
      "Action": "DELETE",
      "ResourceRecordSet": {
        "Name": "storybook.{project-name}.gaininsight.global",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [{"Value": "{cloudfront-domain}.cloudfront.net"}]
      }
    }]
  }'"'"''

# Delete ACM validation CNAME (if still exists)
# First, get the validation record details from ACM
doppler run --project {project-name} --config dev -- bash -c '
CERT_ARN=$(aws acm list-certificates --region us-east-1 \
  --query "CertificateSummaryList[?DomainName==\`storybook.{project-name}.gaininsight.global\`].CertificateArn" \
  --output text)
aws acm describe-certificate --certificate-arn "$CERT_ARN" --region us-east-1 \
  --query "Certificate.DomainValidationOptions[0].ResourceRecord"'

# Then delete the validation CNAME using the values from above
doppler run --project gi --config prd -- bash -c '
AWS_ACCESS_KEY_ID=$DOMAIN_ADMIN_AWS_ACCESS_KEY_ID \
AWS_SECRET_ACCESS_KEY=$DOMAIN_ADMIN_AWS_SECRET_ACCESS_KEY \
aws route53 change-resource-record-sets \
  --hosted-zone-id {project-zone-id} \
  --change-batch '"'"'{
    "Changes": [{
      "Action": "DELETE",
      "ResourceRecordSet": {
        "Name": "{validation-record-name}",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [{"Value": "{validation-record-value}"}]
      }
    }]
  }'"'"''
```

---

### T.4 Delete CloudFront Distribution

CloudFront distributions must be disabled before deletion.

```bash
# Get distribution ID
DIST_ID=$(doppler run --project {project-name} --config dev -- \
  aws cloudfront list-distributions \
  --query "DistributionList.Items[?Aliases.Items[0]=='storybook.{project-name}.gaininsight.global'].Id" \
  --output text)

echo "Distribution ID: $DIST_ID"

# Get current config and ETag
doppler run --project {project-name} --config dev -- \
  aws cloudfront get-distribution-config --id "$DIST_ID" > /tmp/cf-config.json

ETAG=$(jq -r '.ETag' /tmp/cf-config.json)

# Disable the distribution (set Enabled to false)
jq '.DistributionConfig.Enabled = false' /tmp/cf-config.json | \
  jq '.DistributionConfig' > /tmp/cf-config-disabled.json

doppler run --project {project-name} --config dev -- \
  aws cloudfront update-distribution \
    --id "$DIST_ID" \
    --if-match "$ETAG" \
    --distribution-config file:///tmp/cf-config-disabled.json

# Wait for distribution to be disabled (status: Deployed)
echo "Waiting for distribution to be disabled (this may take 10-15 minutes)..."
doppler run --project {project-name} --config dev -- \
  aws cloudfront wait distribution-deployed --id "$DIST_ID"

# Get new ETag after disable
NEW_ETAG=$(doppler run --project {project-name} --config dev -- \
  aws cloudfront get-distribution --id "$DIST_ID" --query 'ETag' --output text)

# Delete the distribution
doppler run --project {project-name} --config dev -- \
  aws cloudfront delete-distribution --id "$DIST_ID" --if-match "$NEW_ETAG"

echo "CloudFront distribution deleted"
```

---

### T.5 Delete ACM Certificate

```bash
# Get certificate ARN
CERT_ARN=$(doppler run --project {project-name} --config dev -- \
  aws acm list-certificates --region us-east-1 \
  --query "CertificateSummaryList[?DomainName=='storybook.{project-name}.gaininsight.global'].CertificateArn" \
  --output text)

echo "Certificate ARN: $CERT_ARN"

# Delete certificate
doppler run --project {project-name} --config dev -- \
  aws acm delete-certificate --certificate-arn "$CERT_ARN" --region us-east-1

echo "ACM certificate deleted"
```

---

### T.6 Delete S3 Bucket

```bash
# Empty the bucket first (required before deletion)
doppler run --project {project-name} --config dev -- \
  aws s3 rm s3://storybook-{project-name}-gaininsight --recursive

# Delete the bucket
doppler run --project {project-name} --config dev -- \
  aws s3 rb s3://storybook-{project-name}-gaininsight

echo "S3 bucket deleted"
```

---

### T.7 Remove GitHub Secrets

```bash
# Remove Layer 4 specific secrets
gh secret delete AWS_ACCESS_KEY_ID
gh secret delete AWS_SECRET_ACCESS_KEY
gh secret delete CLAUDE_CODE_OAUTH_TOKEN
gh secret delete LINEAR_API_KEY
gh secret delete LINEAR_TEAM_ID
gh secret delete CODECOV_TOKEN

# Verify removal
gh secret list
```

**Note:** Some secrets (AWS credentials, Linear) may be shared with other layers. Only delete if fully decommissioning.

---

### T.8 Delete Workflow Files

```bash
# Remove workflow files
rm .github/workflows/ci.yml
rm .github/workflows/claude-code-review.yml
rm .github/workflows/claude-on-demand.yml
rm .github/workflows/e2e-tests.yml
rm .github/workflows/storybook-deploy.yml

# Remove .github/workflows directory if empty
rmdir .github/workflows 2>/dev/null || true
rmdir .github 2>/dev/null || true

# Commit removal
git add -A .github/
git commit -m "chore: remove Layer 4 CI/CD workflows"
git push
```

---

### T.9 Remove Documentation

```bash
# Remove CI/CD documentation
rm docs/cicd.md

# Update docs/README.md to remove cicd.md reference (if applicable)

# Commit
git add docs/
git commit -m "chore: remove Layer 4 documentation"
git push
```

---

### T.10 Verify Teardown

```bash
# Verify workflows removed
ls .github/workflows/ 2>/dev/null || echo "No workflows directory"

# Verify secrets removed
gh secret list

# Verify S3 bucket gone
doppler run --project {project-name} --config dev -- \
  aws s3 ls s3://storybook-{project-name}-gaininsight 2>&1 | grep -q "NoSuchBucket" && \
  echo "S3 bucket confirmed deleted"

# Verify CloudFront distribution gone
doppler run --project {project-name} --config dev -- \
  aws cloudfront list-distributions \
  --query "DistributionList.Items[?Aliases.Items[0]=='storybook.{project-name}.gaininsight.global'].Id" \
  --output text | grep -q "^$" && \
  echo "CloudFront distribution confirmed deleted"

# Verify DNS removed
dig storybook.{project-name}.gaininsight.global +short | grep -q "^$" && \
  echo "DNS record confirmed removed"
```

---

### Partial Teardown Options

**Remove only Storybook hosting (keep CI):**
- Run T.3 through T.6
- Delete only `storybook-deploy.yml` in T.8
- Keep other workflows and secrets

**Remove only Claude review (keep CI and Storybook):**
- Delete `claude-code-review.yml` and `claude-on-demand.yml`
- Remove `CLAUDE_CODE_OAUTH_TOKEN` secret
- Keep Linear secrets if used elsewhere

**Remove only E2E tests:**
- Delete `e2e-tests.yml`
- No infrastructure to remove

---

### Teardown Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| CloudFront won't delete | Still enabled | Wait for disable to complete (check status) |
| S3 bucket won't delete | Not empty | Run `aws s3 rm --recursive` first |
| ACM cert won't delete | Still in use by CloudFront | Delete CloudFront first |
| Route 53 delete fails | Record doesn't match | Get exact record values and retry |
| Secrets still showing | Cache | Refresh page or wait a minute |

---

## Mobile CI/CD (If Flutter Installed)

If you added Flutter mobile support after Layer 1, add mobile CI jobs.

### Strategy: Hybrid Approach

| Platform | CI Tool | Trigger |
|----------|---------|---------|
| Android | GitHub Actions (free) | All branches |
| iOS | Codemagic (macOS required) | staging + main only |

**Rationale:** Flutter is 90-95% cross-platform consistent. Android on free Linux runners, iOS only when shipping.

### GitHub Actions (Android)

Add to `.github/workflows/mobile.yml`:

```yaml
name: Mobile CI

on:
  push:
    branches: [develop, staging, main]
    paths: ['packages/mobile/**']
  pull_request:
    paths: ['packages/mobile/**']

jobs:
  test:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: packages/mobile
    steps:
      - uses: actions/checkout@v4
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.24.5'
      - run: flutter pub get
      - run: flutter test
      - run: flutter analyze

  build-android:
    needs: test
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: packages/mobile
    steps:
      - uses: actions/checkout@v4
      - uses: subosito/flutter-action@v2
      - run: flutter pub get
      - run: flutter build apk --release
```

### Codemagic (iOS)

Create `packages/mobile/codemagic.yaml` for iOS builds on staging/main only.

See [Flutter Mobile Setup Guide](./flutter-mobile-setup.md) for complete Codemagic configuration.

### Cost

| Activity | Platform | Cost |
|----------|----------|------|
| PR/develop Android | GHA Linux | Free |
| staging/main iOS | Codemagic macOS | ~$2/month |

**Reference:** See [Flutter Expertise Skill](../../../skills/af-flutter-expertise/SKILL.md) for CI/CD patterns.

---
title: "GainInsight Standard - Layer 1: Infrastructure"
sidebar_label: "Layer 1 Infrastructure"
sidebar_position: 1
created: 2025-12-15
updated: 2025-12-15
last_checked: 2025-12-15
tags: [guide, gaininsight, infrastructure, aws, amplify, doppler]
parent: ./README.md
related:
  - ./layer-2-testing.md
  - ../../../skills/af-setup-gaininsight-stack/SKILL.md
---

# Layer 1: Environment & Infrastructure

Complete step-by-step instructions for setting up AWS multi-account infrastructure, Doppler secrets management, and Amplify deployments.

> **Reference Implementation:** Juncan (`/data/worktrees/juncan/develop`) is the most recent complete implementation. Reference it for working examples of BDD tests, Amplify configuration, and Doppler setup.

## Component Architecture

Layer 1 is composed of two reusable components that can be used independently:

```
Layer 1 = AWS Infrastructure Component + Amplify Hosting Component
```

| Component | Location | Standalone Use |
|-----------|----------|----------------|
| **AWS Infrastructure** | `.claude/templates/setup/components/aws-infrastructure/` | Any AWS project (Lightsail, ECS, etc.) |
| **Amplify Hosting** | `.claude/templates/setup/components/hosting-amplify/` | Requires AWS Infrastructure first |

**For non-Amplify projects** (e.g., Directus + Lightsail), use:
- AWS Infrastructure component (steps 1.1-1.5, 1.14-1.15)
- Lightsail Hosting component instead of Amplify (`.claude/templates/setup/components/hosting-lightsail/`)

**This guide covers the full GainInsight Standard path** (AWS + Amplify + 3 environments).

**Time estimate:** ~45 minutes

**Prerequisites:**
- Greenfield setup complete (GitHub repo, Linear team, `.claude/` synced)
- Doppler CLI authenticated (`doppler login`)
- AWS credentials available via Doppler `gi` project
- Access to GainInsight AWS Organization

**What Layer 1 provides:**
- 3 AWS accounts (dev/test/prod) in dedicated OU
- IAM credentials stored in Doppler
- CDK bootstrapped in all accounts
- Amplify apps created with service roles
- Branch-based deployments configured
- Hello World app deployed with GraphQL backend
- Cost tracking enabled
- Console access credentials in Bitwarden

---

## 1.0 Install Test Specifications (RED Phase)

**Purpose:** Copy BDD test templates to target project. Tests will FAIL - this is expected and correct (Red phase of Red-Green-Refactor).

**Why tests first:**
- Tests are the *specification* of what Layer 1 should deliver
- Running tests now establishes our "red" baseline
- After infrastructure setup, tests should turn "green"
- This is proper BDD/TDD workflow

**Prerequisites:**
- Target project repo exists (from greenfield setup)
- Doppler project created (will be done in step 1.5, so tests will fail until then)

**Steps:**

```bash
# From the AgentFlow repo, copy test templates to target project
cp -r .claude/templates/gaininsight-standard/tests/gaininsight-stack {target-project}/tests/

# Navigate to target project
cd {target-project}

# Install test dependencies
cd tests/gaininsight-stack
npm install
```

**Run tests to confirm RED state:**

```bash
# Tests will fail - infrastructure doesn't exist yet
# Note: This will error because Doppler project doesn't exist yet
doppler run --project {project-name} --config dev -- npm test

# Expected: All scenarios FAIL with missing resources/credentials errors
```

> **Note:** The test suite uses ES modules (ESM) with tsx for TypeScript execution. The `npm test` command includes `NODE_OPTIONS='--import tsx'` to enable ESM support.

**This is correct!** We now have our specification. The failing tests tell us exactly what Layer 1 must deliver.

**Doppler Variables for Tests:**

Layer 1 setup populates these values in Doppler. Tests read them via `doppler run`:

| Variable | Config | Source | When Set |
|----------|--------|--------|----------|
| `AWS_ACCESS_KEY_ID` | dev/stg/prd | IAM user credentials | Step 1.5 |
| `AWS_SECRET_ACCESS_KEY` | dev/stg/prd | IAM user credentials | Step 1.5 |
| `AWS_DEFAULT_REGION` | dev/stg/prd | Always `eu-west-2` | Step 1.5 |
| `AMPLIFY_APP_ID` | dev/stg/prd | Amplify app creation | Step 1.7 |

**Auto-derived values (no Doppler storage needed):**

| Variable | Derived From |
|----------|--------------|
| `DOPPLER_PROJECT` | Automatically set by `doppler run` - used as project name |
| GitHub org | Parsed from `git remote get-url origin` in step definitions |

**Running tests after Doppler is configured:**

```bash
# From tests/gaininsight-stack directory
doppler run --project {project-name} --config dev -- npm test
```

**No .env files needed** - all configuration comes from Doppler.

---

## 1.1 Create AWS Organization Unit

**Purpose:** Create isolated OU for the project under the GainInsight org.

**Doppler config:** `gi` project, `prd` config (organization management)

**Steps:**

```bash
# Get the Projects OU ID (parent for all project OUs)
doppler run --project gi --config prd -- \
  aws organizations list-organizational-units-for-parent \
  --parent-id r-tmup --output json

# Projects OU ID: ou-tmup-nfmu3ia2

# Create the project OU
doppler run --project gi --config prd -- \
  aws organizations create-organizational-unit \
  --parent-id ou-tmup-nfmu3ia2 \
  --name {project-name} \
  --output json
```

**Output:** OU ID (e.g., `ou-tmup-cewspiuv`)

**Notes:**
- Root ID is `r-tmup`
- Projects OU is `ou-tmup-nfmu3ia2`
- All project OUs go under Projects, not directly under Root

---

## 1.2 Create AWS Accounts

**Purpose:** Create 3 AWS accounts for dev/test/prod environments.

**Steps:**

```bash
# Create dev account
doppler run --project gi --config prd -- \
  aws organizations create-account \
  --email aws+{project-name}-dev@gaininsight.global \
  --account-name "{project-name}-dev" \
  --output json

# Create test account
doppler run --project gi --config prd -- \
  aws organizations create-account \
  --email aws+{project-name}-test@gaininsight.global \
  --account-name "{project-name}-test" \
  --output json

# Create prod account
doppler run --project gi --config prd -- \
  aws organizations create-account \
  --email aws+{project-name}-prod@gaininsight.global \
  --account-name "{project-name}-prod" \
  --output json
```

**Important:** Account creation is async. Check status with:

```bash
doppler run --project gi --config prd -- \
  aws organizations describe-create-account-status \
  --create-account-request-id {request-id} \
  --output json
```

**After accounts are created, move them to the project OU:**

```bash
doppler run --project gi --config prd -- \
  aws organizations move-account \
  --account-id {account-id} \
  --source-parent-id r-tmup \
  --destination-parent-id {project-ou-id}
```

---

## 1.3 Configure DNS Delegation

**Purpose:** Create subdomain zone and delegate from parent zone.

**Doppler config:** Uses `DOMAIN_ADMIN_AWS_ACCESS_KEY_ID` and `DOMAIN_ADMIN_AWS_SECRET_ACCESS_KEY` from `gi/prd` config.

**Steps:**

```bash
# Create hosted zone for project subdomain
doppler run --project gi --config prd -- bash -c '
  AWS_ACCESS_KEY_ID=$DOMAIN_ADMIN_AWS_ACCESS_KEY_ID \
  AWS_SECRET_ACCESS_KEY=$DOMAIN_ADMIN_AWS_SECRET_ACCESS_KEY \
  AWS_DEFAULT_REGION=eu-west-2 \
  aws route53 create-hosted-zone \
    --name {project-name}.gaininsight.global \
    --caller-reference "{project-name}-$(date +%s)" \
    --output json'
```

**Output:** Note the NameServers from the response.

```bash
# Add NS delegation to parent zone (gaininsight.global)
# Parent zone ID: Z08261483JJZ016GFVDDQ
doppler run --project gi --config prd -- bash -c '
  AWS_ACCESS_KEY_ID=$DOMAIN_ADMIN_AWS_ACCESS_KEY_ID \
  AWS_SECRET_ACCESS_KEY=$DOMAIN_ADMIN_AWS_SECRET_ACCESS_KEY \
  AWS_DEFAULT_REGION=eu-west-2 \
  aws route53 change-resource-record-sets \
    --hosted-zone-id Z08261483JJZ016GFVDDQ \
    --change-batch '"'"'{
      "Changes": [{
        "Action": "CREATE",
        "ResourceRecordSet": {
          "Name": "{project-name}.gaininsight.global",
          "Type": "NS",
          "TTL": 300,
          "ResourceRecords": [
            {"Value": "{ns1}"},
            {"Value": "{ns2}"},
            {"Value": "{ns3}"},
            {"Value": "{ns4}"}
          ]
        }
      }]
    }'"'"' --output json'
```

**Notes:**
- Parent zone `gaininsight.global` ID is `Z08261483JJZ016GFVDDQ`
- Domain admin credentials are stored in Doppler gi/prd
- Subdomain records (dev-*, test-*, prod) will be added when Amplify is configured

---

## 1.4 Set Up Git Branches

**Purpose:** Create deployment branches and protection rules.

**Branch structure:**
- `develop` -> deploys to dev environment
- `staging` -> deploys to test environment
- `main` -> deploys to prod environment

**Steps:**

```bash
# Get the SHA of develop branch
DEVELOP_SHA=$(gh api repos/{owner}/{project-name}/git/refs/heads/develop --jq '.object.sha')

# Create staging branch from develop
gh api repos/{owner}/{project-name}/git/refs -X POST \
  -f ref="refs/heads/staging" \
  -f sha="$DEVELOP_SHA"

# Create main branch from develop
gh api repos/{owner}/{project-name}/git/refs -X POST \
  -f ref="refs/heads/main" \
  -f sha="$DEVELOP_SHA"
```

**Add branch protection:**

```bash
# Protect staging branch
gh api repos/{owner}/{project-name}/branches/staging/protection -X PUT \
  --input - << 'EOF'
{
  "required_pull_request_reviews": {
    "required_approving_review_count": 1
  },
  "enforce_admins": false,
  "required_status_checks": null,
  "restrictions": null
}
EOF

# Protect main branch (same settings)
gh api repos/{owner}/{project-name}/branches/main/protection -X PUT \
  --input - << 'EOF'
{
  "required_pull_request_reviews": {
    "required_approving_review_count": 1
  },
  "enforce_admins": false,
  "required_status_checks": null,
  "restrictions": null
}
EOF
```

**Notes:**
- Protection requires at least one PR review before merge
- CI status checks will be added in Layer 4 (CI/CD Pipeline)
- `develop` stays unprotected for feature branch workflow

---

## 1.5 Configure Doppler Project

**Purpose:** Create Doppler project with per-environment AWS credentials.

**Steps:**

```bash
# Create the project
doppler projects create {project-name} --description "{Project Description}"

# Doppler auto-creates dev, stg, prd configs
```

**Create IAM users in each AWS account:**

For each account (dev, test, prod), assume the OrganizationAccountAccessRole and create an IAM user:

```bash
# Get temporary credentials to access the account
CREDS=$(doppler run --project gi --config prd -- aws sts assume-role \
  --role-arn arn:aws:iam::{account-id}:role/OrganizationAccountAccessRole \
  --role-session-name {project-name}-setup \
  --output json)

export AWS_ACCESS_KEY_ID=$(echo $CREDS | jq -r '.Credentials.AccessKeyId')
export AWS_SECRET_ACCESS_KEY=$(echo $CREDS | jq -r '.Credentials.SecretAccessKey')
export AWS_SESSION_TOKEN=$(echo $CREDS | jq -r '.Credentials.SessionToken')
export AWS_DEFAULT_REGION=eu-west-2

# Create IAM user for deployments
aws iam create-user --user-name {project-name}-deploy --output json

# Attach AdministratorAccess (needed for Amplify)
aws iam attach-user-policy --user-name {project-name}-deploy \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess

# Create access key
aws iam create-access-key --user-name {project-name}-deploy --output json
```

**Store credentials in Doppler:**

```bash
# For each environment (dev, stg, prd)
doppler secrets set \
  AWS_ACCESS_KEY_ID={access-key} \
  AWS_SECRET_ACCESS_KEY={secret-key} \
  AWS_DEFAULT_REGION=eu-west-2 \
  --project {project-name} --config {dev|stg|prd}
```

**Account to config mapping:**
| Doppler Config | AWS Account | Purpose |
|----------------|-------------|---------|
| dev | {project}-dev | Development |
| stg | {project}-test | Testing/Staging |
| prd | {project}-prod | Production |

**Store Linear Team ID:**

The Linear team was created during greenfield setup. Look up and store the team ID for Layer 4 CI/CD integration:

```bash
# Get the team ID from Linear API (LINEAR_API_KEY stored in gi/prd)
LINEAR_API_KEY=$(doppler secrets get LINEAR_API_KEY --project gi --config prd --plain)

# Find your team's UUID (replace {TEAM_KEY} with your team key, e.g., JCN, KZN)
curl -s -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ teams { nodes { id name key } } }"}' \
  https://api.linear.app/graphql | jq '.data.teams.nodes[] | select(.key == "{TEAM_KEY}")'

# Store the team ID in Doppler (use the UUID "id" field, not the short "key")
doppler secrets set LINEAR_TEAM_ID={team-uuid} --project {project-name} --config dev
```

This enables Claude Code review in Layer 4 to create Linear issues for significant findings.

---

## 1.6 Bootstrap CDK (CRITICAL)

**Purpose:** Bootstrap AWS CDK in each account/region. This is REQUIRED before any Amplify Gen 2 deployment can succeed.

**Why this is needed:**
- Amplify Gen 2 uses AWS CDK under the hood
- CDK requires a bootstrap stack (S3 bucket, IAM roles, SSM parameters)
- Without bootstrap, Amplify builds fail with "BootstrapDetectionError"

**Steps for each account:**

```bash
# Bootstrap dev account
doppler run --project {project-name} --config dev -- \
  npx cdk bootstrap aws://{dev-account-id}/eu-west-2

# Bootstrap test account
doppler run --project {project-name} --config stg -- \
  npx cdk bootstrap aws://{test-account-id}/eu-west-2

# Bootstrap prod account
doppler run --project {project-name} --config prd -- \
  npx cdk bootstrap aws://{prod-account-id}/eu-west-2
```

**What gets created:**
- CloudFormation stack `CDKToolkit`
- S3 bucket for CDK assets
- IAM roles for deployment
- SSM parameter `/cdk-bootstrap/hnb659fds/version`

**Notes:**
- This is a one-time operation per account/region
- Bootstrap must complete before first Amplify build
- Run from a project directory with `cdk` as a dependency

---

## 1.7 Create Amplify Apps

**Purpose:** Create one Amplify app per environment, each connected to its deployment branch.

**CRITICAL: All Three Environments Required**

You MUST create Amplify apps for ALL THREE environments (dev, test, prod). Do not stop after creating just the dev app. Each environment:
- Has its own AWS account
- Has its own Amplify app
- Connects to its own branch (develop, staging, main)
- Has its own custom domain

**Architecture:**
- 3 Amplify apps (one per AWS account)
- Each app connects to the same GitHub repo
- Each app tracks one branch: develop, staging, or main
- Custom domains: dev-{project}, test-{project}, {project}.gaininsight.global

**Prerequisite:** GitHub Personal Access Token stored in Doppler `gi/prd` as `GITHUB_ACCESS_TOKEN`.

**Steps:**

```bash
# Create dev app in dev account
doppler run --project {project-name} --config dev -- aws amplify create-app \
  --name {project-name}-dev \
  --repository "https://github.com/{owner}/{project-name}" \
  --access-token "$(doppler secrets get GITHUB_ACCESS_TOKEN --project gi --config prd --plain)" \
  --enable-branch-auto-build \
  --output json

# Connect develop branch
doppler run --project {project-name} --config dev -- aws amplify create-branch \
  --app-id {dev-app-id} \
  --branch-name develop \
  --enable-auto-build \
  --output json
```

```bash
# Create test app in test account
doppler run --project {project-name} --config stg -- aws amplify create-app \
  --name {project-name}-test \
  --repository "https://github.com/{owner}/{project-name}" \
  --access-token "$(doppler secrets get GITHUB_ACCESS_TOKEN --project gi --config prd --plain)" \
  --enable-branch-auto-build \
  --output json

# Connect staging branch
doppler run --project {project-name} --config stg -- aws amplify create-branch \
  --app-id {test-app-id} \
  --branch-name staging \
  --enable-auto-build \
  --output json
```

```bash
# Create prod app in prod account
doppler run --project {project-name} --config prd -- aws amplify create-app \
  --name {project-name}-prod \
  --repository "https://github.com/{owner}/{project-name}" \
  --access-token "$(doppler secrets get GITHUB_ACCESS_TOKEN --project gi --config prd --plain)" \
  --enable-branch-auto-build \
  --output json

# Connect main branch
doppler run --project {project-name} --config prd -- aws amplify create-branch \
  --app-id {prod-app-id} \
  --branch-name main \
  --enable-auto-build \
  --output json
```

**Store App IDs in Doppler:**

```bash
doppler secrets set AMPLIFY_APP_ID={dev-app-id} --project {project-name} --config dev
doppler secrets set AMPLIFY_APP_ID={test-app-id} --project {project-name} --config stg
doppler secrets set AMPLIFY_APP_ID={prod-app-id} --project {project-name} --config prd
```

**App to environment mapping:**
| Amplify App | AWS Account | Branch | Domain |
|-------------|-------------|--------|--------|
| {project}-dev | {project}-dev | develop | dev.{project}.gaininsight.global |
| {project}-test | {project}-test | staging | test.{project}.gaininsight.global |
| {project}-prod | {project}-prod | main | {project}.gaininsight.global |

**Configure Service Role (CRITICAL):**

Amplify needs an IAM service role to deploy Gen 2 backends. Without this, builds fail with permission errors.

```bash
# Create service role in each account
for config in dev stg prd; do
  # Create the role
  doppler run --project {project-name} --config $config -- aws iam create-role \
    --role-name AmplifyServiceRole \
    --assume-role-policy-document '{
      "Version": "2012-10-17",
      "Statement": [{
        "Effect": "Allow",
        "Principal": {"Service": "amplify.amazonaws.com"},
        "Action": "sts:AssumeRole"
      }]
    }' \
    --description "Service role for Amplify Gen 2 deployments"

  # Attach Amplify admin policy
  doppler run --project {project-name} --config $config -- aws iam attach-role-policy \
    --role-name AmplifyServiceRole \
    --policy-arn arn:aws:iam::aws:policy/AdministratorAccess-Amplify

  # Get the app ID
  APP_ID=$(doppler secrets get AMPLIFY_APP_ID --project {project-name} --config $config --plain)

  # Assign role to Amplify app
  doppler run --project {project-name} --config $config -- aws amplify update-app \
    --app-id $APP_ID \
    --iam-service-role-arn arn:aws:iam::$(doppler run --project {project-name} --config $config -- aws sts get-caller-identity --query Account --output text):role/AmplifyServiceRole
done
```

**Configure Platform for Next.js SSR:**

For Next.js 15 with SSR (not static export), set platform to WEB_COMPUTE:

```bash
for config in dev stg prd; do
  APP_ID=$(doppler secrets get AMPLIFY_APP_ID --project {project-name} --config $config --plain)
  doppler run --project {project-name} --config $config -- aws amplify update-app \
    --app-id $APP_ID \
    --platform WEB_COMPUTE
done
```

**Platform options:**
- `WEB` - Static sites only (no SSR)
- `WEB_COMPUTE` - Next.js SSR, API routes, server components
- `WEB_DYNAMIC` - Legacy option, use WEB_COMPUTE instead

---

## 1.8 Configure Custom Domains

**Purpose:** Map custom subdomains to each Amplify app.

**Domain naming convention:**
- `dev.{project}.gaininsight.global` -> dev environment
- `test.{project}.gaininsight.global` -> test environment
- `{project}.gaininsight.global` -> prod environment (apex)

Each environment gets its OWN unique domain name - do NOT try to use the same domain with different branch prefixes across accounts.

**Prerequisites:**
- Hosted zone exists for {project}.gaininsight.global
- Zone ID stored or known
- Domain admin credentials available in Doppler gi/prd

**Steps:**

```bash
# Create domain association for dev app (dev.{project} subdomain)
doppler run --project {project-name} --config dev -- aws amplify create-domain-association \
  --app-id {dev-app-id} \
  --domain-name dev.{project-name}.gaininsight.global \
  --sub-domain-settings branchName=develop,prefix="" \
  --output json

# Create domain association for test app (test.{project} subdomain)
doppler run --project {project-name} --config stg -- aws amplify create-domain-association \
  --app-id {test-app-id} \
  --domain-name test.{project-name}.gaininsight.global \
  --sub-domain-settings branchName=staging,prefix="" \
  --output json

# Create domain association for prod app (apex domain)
doppler run --project {project-name} --config prd -- aws amplify create-domain-association \
  --app-id {prod-app-id} \
  --domain-name {project-name}.gaininsight.global \
  --sub-domain-settings branchName=main,prefix="" \
  --output json
```

**Verify Branch Mapping (CRITICAL):**

After creating each domain association, verify the branch was mapped correctly:

```bash
# Check that subDomains is NOT empty
doppler run --project {project-name} --config dev -- \
  aws amplify get-domain-association \
    --app-id {dev-app-id} \
    --domain-name dev.{project-name}.gaininsight.global \
  | jq '.domainAssociation.subDomains'

# Expected output (branch mapped):
# [{"subDomainSetting": {"branchName": "develop", "prefix": ""}, "verified": false, "dnsRecord": "..."}]

# Problem output (branch NOT mapped):
# []
```

**If subDomains is empty**, the branch mapping failed. Fix with `update-domain-association`:

```bash
doppler run --project {project-name} --config dev -- aws amplify update-domain-association \
  --app-id {dev-app-id} \
  --domain-name dev.{project-name}.gaininsight.global \
  --sub-domain-settings "prefix=,branchName=develop"
```

Without the branch mapping, the domain will show as "AVAILABLE" but SSL handshakes will fail because CloudFront doesn't know which branch to serve.

**DNS Records:**

After domain association, Amplify provides validation records. Add them to the hosted zone using domain admin credentials:

```bash
doppler run --project gi --config prd -- bash -c '
  AWS_ACCESS_KEY_ID=$DOMAIN_ADMIN_AWS_ACCESS_KEY_ID \
  AWS_SECRET_ACCESS_KEY=$DOMAIN_ADMIN_AWS_SECRET_ACCESS_KEY \
  AWS_DEFAULT_REGION=eu-west-2 \
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
    }'"'"' --output json'
```

**Notes:**
- Domain validation takes a few minutes
- Amplify handles certificate provisioning automatically
- Once validated, the domain routes to the Amplify app

**Important: Cross-Account Domain Configuration**

Amplify apps in different AWS accounts CAN share a parent domain, but each must have its **own unique domain name**. The hosted zone can be in ANY account - what matters is that the DNS records get created.

**What works:**
- `dev.{project}.gaininsight.global` -> dev account (unique domain)
- `test.{project}.gaininsight.global` -> test account (unique domain)
- `{project}.gaininsight.global` -> prod account (unique domain)

**What does NOT work:**
- Associating the same domain (e.g., `{project}.gaininsight.global`) to multiple apps across accounts with different branch prefixes. Only the first account to claim it succeeds.

**DNS records needed for each domain:**

1. **Certificate validation CNAME** - ACM validation record (different for each domain)
   - `_xxxx.dev.{project}.gaininsight.global` -> `_yyyy.acm-validations.aws.`

2. **Traffic CNAME** - Routes to CloudFront
   - `dev.{project}.gaininsight.global` -> `dXXX.cloudfront.net`

**For apex domains (no subdomain prefix):**
- Cannot use CNAME at zone apex
- Use A record with ALIAS to CloudFront
- CloudFront hosted zone ID is always `Z2FDTNDATAQYW2`

**Domain status progression:**
1. `CREATING` - Initial setup
2. `PENDING_VERIFICATION` - Waiting for DNS records
3. `PENDING_DEPLOYMENT` - SSL verified, waiting for app deployment
4. `AVAILABLE` - Ready to serve traffic

---

## 1.9 Create Hello World Application

**Purpose:** Create the initial Next.js + Amplify Gen 2 + shadcn/ui application that will be deployed to all environments.

**Why this step is important:**
- Provides a working baseline to verify infrastructure
- Tests the full deployment pipeline end-to-end
- Includes GraphQL backend to validate Amplify Gen 2 setup
- Gives immediate visual feedback that everything works
- Includes shadcn/ui components ready for rapid UI development

**Template location:** `.claude/templates/gaininsight-standard/hello-world-app/`

**Files to copy:**
- `amplify/` - Backend configuration with GraphQL schema
  - `amplify/package.json` - **Required:** `{"type": "module"}` for ESM
  - `amplify/tsconfig.json` - TypeScript config for Node.js execution
  - `amplify/backend.ts` - Backend entry point
  - `amplify/data/resource.ts` - GraphQL schema definition
- `src/app/page.tsx` - Hello World page with API integration
- `src/components/ui/` - shadcn/ui components (Button, Card)
- `src/lib/utils.ts` - shadcn utility functions (cn helper)
- `components.json` - shadcn configuration
- `amplify.yml` - Build configuration
- `package.json` - Dependencies (includes shadcn deps)
- `tsconfig.json` - TypeScript configuration
- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS + shadcn theme
- `doppler.yaml` - Doppler auto-config (replace `{{project-name}}`)
- `.start-work-hooks` - GI server worktree setup (runs npm install)
- `PORT_INFO.md` - Default ports for local dev (auto-replaced by start-work)

**Steps:**

```bash
# Navigate to target project
cd {target-project}

# Copy template files
cp -r {agentflow-path}/.claude/templates/gaininsight-standard/hello-world-app/* .

# Install dependencies
npm install
```

**What the Hello World app includes:**

1. **GraphQL Backend** (`amplify/data/resource.ts`):
   ```typescript
   const schema = a.schema({
     HelloWorld: a.model({
       message: a.string().required(),
       timestamp: a.string().required(),
     }).authorization((allow) => [allow.publicApiKey()]),
   });
   ```
   Uses Amplify's auto-generated CRUD operations - no Lambda needed.

2. **shadcn/ui Components** (`src/components/ui/`):
   - `button.tsx` - Styled button with variants
   - `card.tsx` - Card container with header/content/footer
   - Ready to add more via `npx shadcn@latest add <component>`

3. **Frontend Page** (`src/app/page.tsx`):
   - Uses shadcn Card and Button components
   - Fetches/creates HelloWorld entry via GraphQL
   - Displays message with timestamp
   - Refresh button to reload data
   - Proper loading and error states

**Verification:**

```bash
# Test locally with sandbox
doppler run --project {project-name} --config dev -- npx ampx sandbox

# In another terminal, start dev server
npm run dev

# Visit http://localhost:3000 and verify:
# - "Hello World" heading displays
# - API message appears after loading
# - Timestamp is shown
```

**Notes:**
- Template uses npm (not pnpm) for Amplify compatibility
- `amplify_outputs.json` is generated by sandbox/deploy (gitignored)
- Uses `publicApiKey` auth (simpler than guest which requires Cognito)

**CRITICAL: Amplify ESM Configuration**

The `amplify/` directory MUST have its own `package.json` with `"type": "module"`:

```json
// amplify/package.json
{
  "type": "module"
}
```

Without this, `npx ampx sandbox` fails with:
```
Cannot find module '.../amplify/data/resource' imported from .../amplify/backend.ts
```

The root `tsconfig.json` should also exclude the `amplify/` directory:
```json
"exclude": ["node_modules", ".amplify", "amplify", "tests"]
```

This allows the amplify directory to use its own TypeScript config optimized for Node.js execution.

**CRITICAL: Test locally before pushing:**

```bash
# 1. After copying template, install and regenerate lock file
npm install

# 2. Build locally to verify compilation
npm run build

# 3. If build succeeds, commit and push
git add . && git commit -m "feat: Add Hello World app" && git push
```

**Common Issues:**

| Issue | Cause | Fix |
|-------|-------|-----|
| `Cannot find module 'autoprefixer'` | Missing dependency | Template includes this - verify devDependencies |
| `Cannot find module '@cucumber/cucumber'` | Tests included in build | Template excludes tests - verify tsconfig.json |
| `package-lock.json out of sync` | Template has no lock file | Run `npm install` after copying template |

**Adding more shadcn components:**

```bash
# Add any shadcn component as needed
npx shadcn@latest add input
npx shadcn@latest add dialog
npx shadcn@latest add table
# See full list: https://ui.shadcn.com/docs/components
```

---

## 1.9.1 Create doppler.yaml

**Purpose:** Enable automatic Doppler configuration when `start-work` creates a worktree.

**Template includes:** `doppler.yaml` with `{{project-name}}` placeholder.

**After copying template:**

```bash
# Replace placeholder with actual project name
sed -i 's/{{project-name}}/juncan/g' doppler.yaml
```

**Result:**
```yaml
setup:
  project: juncan
  config: dev
```

When `start-work` creates a worktree, it automatically runs `doppler setup` if this file exists.

---

## 1.10 Configure Amplify Build

**Purpose:** Set up the build configuration for Next.js + Amplify Gen 2.

**Recommendation:** Use npm with `package-lock.json` for Amplify builds. This is the simplest, most reliable approach.

**Working amplify.yml:**

```yaml
version: 1
backend:
  phases:
    build:
      commands:
        - nvm use 20
        - npm ci
        - npx ampx pipeline-deploy --branch $AWS_BRANCH --app-id $AWS_APP_ID
frontend:
  phases:
    build:
      commands:
        - nvm use 20
        - npm ci
        - npx ampx generate outputs --branch $AWS_BRANCH --app-id $AWS_APP_ID
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - "**/*"
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

**Key points:**
- `npm ci` - Fast, deterministic installs from lock file
- `package-lock.json` must be committed to the repo
- `npx ampx generate outputs` generates `amplify_outputs.json` before frontend build
- `npx ampx pipeline-deploy` deploys backend resources
- Artifacts are in `.next/` for Next.js (use `out/` for static export)

**Important:** Do NOT have multiple lock files (e.g., both `pnpm-lock.yaml` and `package-lock.json`). Amplify will fail with "Multiple package lock files found".

**Notes:**
- Use npm for Amplify CI builds (simplest, officially supported)
- pnpm can be used locally if preferred, but commit `package-lock.json` for CI
- No need for environment-specific logic since each environment has its own app

---

## 1.11 Configure Start-Work Hook

**Purpose:** Run project-specific setup when `start-work` creates a worktree.

**Template includes:** `.start-work-hooks` that runs `npm install`.

**How it works:**
1. `start-work` creates worktree and allocates ports
2. `start-work` auto-generates `PORT_INFO.md` with allocated ports
3. `start-work` runs `.start-work-hooks` if it exists
4. Hook runs `npm install` to set up dependencies

**The hook script:**
```bash
#!/bin/bash
# Called by start-work with: $1 = worktree path, $2 = issue key
cd "$1"
echo "Installing npm dependencies..."
npm install --silent
echo "Done installing dependencies"
```

**Verify hook is executable:**
```bash
chmod +x .start-work-hooks
```

**Note:** `PORT_INFO.md` is auto-generated by `start-work` - you don't need to create it manually. The template includes a default version for local development without `start-work`.

---

## 1.12 Developer Sandbox (How It Works)

**Purpose:** Enable developers to run isolated cloud sandboxes for local development on feature branches.

**IMPORTANT: Develop Branch vs Feature Branches**

| Branch Type | Backend Source | How to Get `amplify_outputs.json` |
|-------------|----------------|-----------------------------------|
| `develop` | Amplify Hosting (CI/CD deployed) | `npx ampx generate outputs --app-id <id> --branch develop` |
| Feature branches | Sandbox (local dev) | `npx ampx sandbox --identifier <branch>` |

**On the `develop` branch:**
- The backend is deployed automatically by Amplify Hosting CI/CD
- `amplify_outputs.json` is pulled from the deployed backend, NOT a sandbox
- CloudFormation stacks use format: `amplify-{app-id}-{branch}-branch-{hash}`

**On feature branches (worktrees):**
- Each developer/worktree gets its own isolated sandbox
- Sandboxes are separate from branch deployments (dev/test/prod)
- Uses branch name to derive unique sandbox identifier
- Integrated with GI server's `start-work`/`stop-work` scripts

**Layer 1 BDD Tests (Deployed Backend):**
- Validate that `amplify_outputs.json` exists with valid GraphQL configuration
- Check that Amplify CloudFormation stacks exist (either deployed or sandbox)
- Do NOT start a sandbox on develop branch - they validate the deployed backend

**Layer 1 BDD Tests (Worktree/Sandbox Workflow):**

These tests validate the full developer workflow using GI server's `start-work`/`stop-work`.

**Location:** `tests/gaininsight-stack/` (Playwright test specs)

**How to run:**
```bash
cd {target-project}/tests/gaininsight-stack
doppler run --project {project-name} --config dev -- npm run test:sandbox
```

**What these tests validate:**
| Check | What It Proves |
|-------|----------------|
| Sandbox deployed | CF stack created, `amplify_outputs.json` populated |
| Frontend accessible | Dev server running, Caddy proxy configured |
| Cleanup works | Stack deleted, worktree removed |

**Note:** These tests take ~10 minutes due to sandbox deployment time. They test outcomes (sandbox works, cleanup works), not internal mechanisms like state files.

**Prerequisites:**
- Must run on GI server (start-work/stop-work available)
- Layer 1 infrastructure tests must pass first
- Test creates/reuses a Linear issue named "Sandbox Workflow Test"

**Sandbox naming convention:**
```
amplify-{project-name}-{identifier}-sandbox
```

Where `{identifier}` is derived from the branch name (first 9 alphanumeric chars + 4-char hash).

**Running a sandbox manually:**

```bash
# Start sandbox with branch-based identifier
doppler run --project {project-name} --config dev -- \
  npx ampx sandbox --identifier $(git branch --show-current)

# Delete sandbox when done
doppler run --project {project-name} --config dev -- \
  npx ampx sandbox delete --identifier $(git branch --show-current)
```

**GI Server Integration:**

Projects include hook scripts that are called by the GI server's `start-work` and `stop-work` commands:

**`.start-work-hooks`** - Called when developer starts work on a worktree:
1. Pre-flight checks (Doppler auth, AWS auth, port availability)
2. Install dependencies (`npm install` or `pnpm install`)
3. Deploy Amplify sandbox with branch identifier
4. Wait for `amplify_outputs.json` to be generated
5. Optionally seed data from production
6. Start frontend dev server
7. Track state in `/tmp/.hooks-state-{ISSUE_KEY}`

**`.stop-work-hooks`** - Called when worktree is removed:
1. Load state from state file
2. Kill all processes (dev server, sandbox)
3. Delete CloudFormation stack
4. Clean up artifacts (.next, logs)
5. Remove state file

**`.git-hook-helpers.sh`** - Shared library with:
- `get_sandbox_identifier()` - Derive unique ID from branch name
- Process management (kill, wait, check running)
- CloudFormation helpers (find stack, delete stack, wait for deletion)
- Logging utilities (colored output, timestamps)

**Sandbox identifier derivation:**

```bash
get_sandbox_identifier() {
    local branch_name="$1"
    # Match Amplify's formula: strip non-alphanumeric, take first 9 chars + 4-char hash
    local branch_part=$(echo "$branch_name" | sed 's/[^a-zA-Z0-9]//g' | cut -c1-9)
    local hash_part=$(echo "$branch_name" | md5sum | cut -c1-4)
    echo "${branch_part}${hash_part}"
}
```

**Example workflow:**

```bash
# Developer starts work
start-work KZN-123
# -> Creates worktree
# -> Calls .start-work-hooks
# -> Deploys sandbox: amplify-kzn-KZN123abcd-sandbox
# -> Starts dev server on allocated port

# Developer works on feature...

# Developer finishes work
stop-work KZN-123
# -> Calls .stop-work-hooks
# -> Kills processes
# -> Deletes CloudFormation stack
# -> Cleans up artifacts
# -> Removes worktree
```

**State file format (`/tmp/.hooks-state-{ISSUE_KEY}`):**

```bash
# PIDs
SANDBOX_PID=12345
DEV_PID=12346

# Config
PORT=3001
REGION=eu-west-2
SANDBOX_ID=KZN123abcd

# Status
PHASE=complete
SANDBOX_READY=true
DEV_READY=true
```

**Templates:**

Hook templates are available at `.claude/templates/gaininsight-standard/`:
- `.git-hook-helpers.sh.template` - Shared helper functions
- `.start-work-hooks.template` - Sandbox deploy, dev server startup
- `.stop-work-hooks.template` - Cleanup, sandbox deletion
- `amplify.yml.template` - Amplify build configuration

See the template README for installation instructions.

---

## 1.13 Trigger and Monitor Builds

**Purpose:** After setup, trigger initial builds and monitor deployment to all environments.

**Triggering builds:**

```bash
# For branch deployments, push to trigger auto-build
git push origin develop  # Triggers dev deployment
# Later: PR develop->staging, merge triggers test deployment
# Later: PR staging->main, merge triggers prod deployment

# Manual trigger via CLI
doppler run --project {project-name} --config dev -- \
  aws amplify start-job --app-id {app-id} --branch-name develop --job-type RELEASE
```

**Monitoring builds (run in background):**

Amplify builds take 3-10 minutes. Check status without blocking:

```bash
# Quick status check
doppler run --project {project-name} --config dev -- \
  aws amplify list-jobs --app-id {app-id} --branch-name develop --max-items 1 | \
  jq '.jobSummaries[0] | {status, jobId}'

# Detailed step status
doppler run --project {project-name} --config dev -- \
  aws amplify get-job --app-id {app-id} --branch-name develop --job-id {job-id} | \
  jq '.job.steps[] | {stepName, status}'
```

**Build phases:**
1. `BUILD` - npm install, ampx pipeline-deploy, frontend build
2. `DEPLOY` - Upload to CloudFront, update Lambda@Edge
3. `VERIFY` - Health check on deployed URL

**Tip:** Don't wait synchronously for builds. Run status checks periodically or set up Zulip notifications via Amplify webhooks.

---

## 1.14 Register with Cost Dashboard and Docs Portal

**Purpose:** Add project to the GI server's project registry for cost tracking and docs portal.

**Location:** `project-registry` CLI (server project registry)

**Add project via `project-registry` CLI** (see `af-setup-project` skill for full insert example), then set fields:

```bash
project-registry set {project-name} name "{Project Name}"
project-registry set {project-name} linear.team_key "{TEAM_KEY}"
project-registry set {project-name} linear.team_id "{team-uuid}"
project-registry set {project-name} zulip.stream "#{channel}"
project-registry set {project-name} zulip.stream_id "XXXXXXXXXX"
project-registry set {project-name} github.repo "{owner}/{project-name}"
project-registry set {project-name} repo_path "/srv/repos/{project-name}.git"
project-registry set {project-name} worktree_base "/srv/worktrees/{project-name}"
project-registry set {project-name} run_as "tmux-shared"
project-registry set {project-name} doppler.project "{project-name}"
project-registry set {project-name} doppler.config "dev"
```

**Steps:**

```bash
# Verify the project was added
project-registry {project-name}

# Verify accounts were added
project-registry accounts

# Run the cost collector to pick up new accounts
sudo /usr/local/bin/collect-aws-costs

# Verify in dashboard
curl -u gaininsight:letmein https://costs.gaininsight.co.uk
```

**Notes:**
- The project registry is the single source of truth for both cost dashboard and docs portal
- Dashboard shows daily/monthly costs per account
- Cost collector runs on cron but can be triggered manually
- Use `project-registry {project-name} aws` to view account config
- Use `project-registry docs-sources` to view all docs sources

---

## 1.15 Set Up Console Access (Human + AI Collaboration)

**Purpose:** Create root user passwords and store credentials in Bitwarden for human console access.

**Context:** The AWS accounts were created with programmatic access only. For humans to log into the AWS Console, root user passwords must be set.

**Workflow overview:**
1. Human resets password and sets up MFA in AWS Console
2. Human provides credentials to AI
3. AI stores credentials in Bitwarden via CLI

**For each account (dev, test, prod):**

### Step 1: Human - Reset Root Password
1. Go to https://console.aws.amazon.com/
2. Select **"Root user"** (NOT "IAM user")
3. Enter the account email: `aws+{project-name}-{env}@gaininsight.global`
4. Click "Forgot password"
5. You'll receive an email with a **password reset link** - click it
6. Set a strong password and **tell the AI what password you set**

### Step 2: Human - Start MFA Setup
1. Log in with the new password
2. You may receive a **verification code email** - enter it if prompted
3. Go to IAM -> Security credentials (or you may be prompted automatically)
4. Click "Assign MFA device"
5. For device name, enter: `Bitwarden`
6. Choose "Authenticator app"
7. Click **"Show secret key"** (important: don't just scan QR code)
8. **Tell the AI the secret key** (a long base32 string like `UBXTGC5JCTQISSS4GPN67VQNNZTK5STIEB7PGELPNS64CVUNMXWZYOMJVGTCYWUB`)

### Step 3: AI - Generate TOTP Codes

**Important:** Ask "Ready for codes?" before generating - codes expire in 30 seconds.

Use Node.js (always available on gidev):
```bash
node -e "
const crypto = require('crypto');
function base32Decode(s) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (const c of s.toUpperCase()) {
    const val = alphabet.indexOf(c);
    if (val >= 0) bits += val.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substr(i, 8), 2));
  }
  return Buffer.from(bytes);
}
function generateTOTP(secret) {
  const key = base32Decode(secret);
  const time = Math.floor(Date.now() / 1000 / 30);
  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeBigInt64BE(BigInt(time));
  const hmac = crypto.createHmac('sha1', key).update(timeBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code = ((hmac[offset] & 0x7f) << 24 | hmac[offset+1] << 16 | hmac[offset+2] << 8 | hmac[offset+3]) % 1000000;
  return code.toString().padStart(6, '0');
}
const secret = '{secret}';
console.log('Code 1:', generateTOTP(secret));
const remaining = 30 - (Math.floor(Date.now() / 1000) % 30);
console.log('Waiting', remaining, 'seconds...');
setTimeout(() => console.log('Code 2:', generateTOTP(secret)), (remaining + 1) * 1000);
"
```

### Step 4: Human - Complete MFA Setup
1. Enter the two codes the AI provides into the AWS MFA setup form **immediately**
2. Click "Add MFA" to complete setup

### Step 5: Human - Confirm to AI
Tell the AI:
- Account ID (e.g., `279930135428`)
- Confirm the setup is complete

The AI already has the email, password, and TOTP secret from earlier steps.

### Step 6: AI - Store in Bitwarden
The AI will:

1. **Unlock Bitwarden vault:**
   ```bash
   BW_PASSWORD=$(sudo -u tmux-shared doppler secrets get BITWARDEN_PASSWORD --project gi --config prd --plain)
   BW_SESSION=$(echo "$BW_PASSWORD" | bw unlock --raw)
   ```

2. **Get the GI collection ID:**
   ```bash
   bw list collections --session "$BW_SESSION" | jq -r '.[] | select(.name=="GI") | .id'
   ```

3. **Create the Bitwarden item:**

   **Naming convention:** `AWS {Project} {Env}` (title case, e.g., "AWS Juncan Dev")

   **URI format:** Account-specific URL so Bitwarden recognizes it when bookmarked:
   `https://{account-id}.signin.aws.amazon.com/console`

   ```bash
   echo '{"type":1,"name":"AWS {Project} {Env}","login":{"username":"aws+{project-name}-{env}@gaininsight.global","password":"{password}","totp":"{totp-secret}","uris":[{"uri":"https://{account-id}.signin.aws.amazon.com/console"}]},"organizationId":"df5ed389-4ee7-478d-9c6d-b36800a69e55","collectionIds":["e9bdc180-df3e-4460-88e2-b36d00a3a171"]}' | bw encode | xargs -I {} bw create item {} --session "$BW_SESSION"
   ```

4. **Sync the vault:**
   ```bash
   bw sync --session "$BW_SESSION"
   ```

   **Important:** The user must also sync in their **browser extension** (Bitwarden icon -> Settings -> Sync -> "Sync Vault Now") to see the new entries.

5. **Verify with TOTP generation:**
   ```bash
   bw get totp "AWS {Project} {Env}" --session "$BW_SESSION"
   ```

**Bookmarkable URLs:** Users can bookmark these account-specific URLs for quick access:
- `https://{dev-account-id}.signin.aws.amazon.com/console` -> Dev
- `https://{test-account-id}.signin.aws.amazon.com/console` -> Test
- `https://{prod-account-id}.signin.aws.amazon.com/console` -> Prod

**Bitwarden organization details:**
- Organization ID: `df5ed389-4ee7-478d-9c6d-b36800a69e55`
- GI Collection ID: `e9bdc180-df3e-4460-88e2-b36d00a3a171`
- Server: `vault.bitwarden.eu`

**Accounts to set up:**
| Environment | Email | Account ID |
|-------------|-------|------------|
| dev | aws+{project-name}-dev@gaininsight.global | {dev-account-id} |
| test | aws+{project-name}-test@gaininsight.global | {test-account-id} |
| prod | aws+{project-name}-prod@gaininsight.global | {prod-account-id} |

**Troubleshooting:**
- If `bw status` shows "unauthenticated", see `/srv/docs/CREDENTIALS.md` for re-login instructions (requires OTP from email)
- If `bw status` shows "locked", just unlock with the password from Doppler
- Always use `--session "$BW_SESSION"` with bw commands

---

## 1.16 Summary of Critical Steps

To get Amplify Gen 2 working on a fresh AWS account:

1. **CDK Bootstrap** - Run `npx cdk bootstrap aws://ACCOUNT_ID/REGION` in each account
2. **IAM Service Role** - Create `AmplifyServiceRole` with `AdministratorAccess-Amplify` policy
3. **Assign Service Role** - Attach the role to each Amplify app via `aws amplify update-app`
4. **Set Platform** - Configure `WEB_COMPUTE` for Next.js SSR apps
5. **Use npm** - Commit `package-lock.json` and use `npm install` in builds

Without these steps, builds will fail with cryptic CDK bootstrap or permission errors.

---

## 1.17 Verify Layer 1 (GREEN Phase)

**Purpose:** Run BDD tests to verify all infrastructure is correctly configured. This completes the Red-Green cycle.

**Step 1: Run Infrastructure Tests**

```bash
# Navigate to test directory in target project
cd {target-project}/tests/gaininsight-stack

# Run Layer 1 infrastructure tests via Doppler
doppler run --project {project-name} --config dev -- npm run test:layer-1
```

**Expected result:** All Layer 1 infrastructure scenarios should PASS (GREEN).

**Step 2: Run Sandbox Workflow Test (on GI server)**

After infrastructure tests pass, validate the full developer experience:

```bash
# This test must run on GI server where start-work/stop-work are available
cd {target-project}/tests/gaininsight-stack

# Run sandbox workflow test
doppler run --project {project-name} --config dev -- npm run test:sandbox
```

**What this tests:**
1. Creates a test Linear issue (or reuses existing one)
2. Runs `start-work` with the test issue ID
3. Verifies: worktree created, sandbox deployed, dev server running, Caddy URL accessible
4. Runs `stop-work` for the test issue
5. Verifies: sandbox deleted, worktree removed, no orphaned processes

**Note:** This test takes ~10 minutes due to sandbox deployment time. It's a separate test from the infrastructure validation because it creates real resources.

**Expected result:** Sandbox workflow scenario should PASS.

**If tests fail:**
1. Review the failing step output
2. Identify which infrastructure component is misconfigured
3. Fix the issue using the relevant step (1.1-1.16)
4. Re-run tests until all pass

**How tests work with Doppler:**

The tests are Doppler-native - they fetch configuration from Doppler automatically:
- `AMPLIFY_APP_ID` is fetched from each config (dev/stg/prd)
- AWS account IDs are obtained via STS for each environment
- No `.env` file is needed - Doppler is the single source of truth

**Common failures and fixes:**
| Failure | Likely Cause | Fix |
|---------|--------------|-----|
| "Doppler project not found" | Project not created | Run step 1.5 |
| "AWS account not found" | Accounts not created/moved | Run steps 1.1-1.2 |
| "AMPLIFY_APP_ID not set" | App ID not stored | Run step 1.7 |
| "Cannot assume role" | IAM credentials wrong | Re-run step 1.5 |
| "CDK bootstrap required" | CDK not bootstrapped | Run step 1.6 |
| "Hello World not displayed" | App not deployed | Run step 1.9, then step 1.13 |
| "staging/main branch has no deployments" | Branches not created | Create and push staging/main branches from develop |

---

## Layer 1 Checkpoint

**Layer 1 is complete!** You now have:
- BDD test specifications installed (step 1.0)
- 3 AWS accounts (dev/test/prod) in dedicated OU
- IAM credentials stored in Doppler
- CDK bootstrapped in all accounts
- Amplify apps created with service roles
- Branch-based deployments configured
- Hello World app deployed with GraphQL backend (step 1.9)
- PORT_INFO.md created with default ports (step 1.9.1)
- Cost tracking enabled
- Console access credentials in Bitwarden
- All Layer 1 tests PASSING (step 1.17)

**Your app is now deployable** to all three environments via git push.

**Before Layer 2:** Register a PostHog account (EU region) and add API keys to Doppler. See the [PostHog Integration Guide](../posthog-guide.md) for account setup steps. The SDK integration happens in Layer 3.

**Next: Layer 2 - Testing Framework** will add:
- Jest for unit tests
- React Testing Library for component testing
- Playwright for E2E tests
- Test directory structure and npm scripts

See [Layer 2: Testing](./layer-2-testing.md) to continue.

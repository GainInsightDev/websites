---
title: Amplify Hosting Setup Guide
created: 2026-01-25
updated: 2026-01-25
last_checked: 2026-01-25
tags: [template, setup, amplify, guide, hosting]
parent: ./README.md
---

# Amplify Hosting Setup Guide

Step-by-step instructions for deploying Next.js applications with AWS Amplify Gen 2.

## Prerequisites

- AWS Infrastructure component completed
- Doppler project with AWS credentials per environment
- Next.js project initialized
- GitHub repo with develop/main branches

---

## Step 1: Bootstrap CDK (CRITICAL)

CDK must be bootstrapped in each account before Amplify can deploy.

```bash
# Bootstrap dev account
doppler run --project {project-name} --config dev -- \
  npx cdk bootstrap aws://{dev-account-id}/eu-west-2

# Bootstrap prod account
doppler run --project {project-name} --config prd -- \
  npx cdk bootstrap aws://{prod-account-id}/eu-west-2
```

For full model (with test):
```bash
doppler run --project {project-name} --config stg -- \
  npx cdk bootstrap aws://{test-account-id}/eu-west-2
```

**What gets created:**
- CloudFormation stack `CDKToolkit`
- S3 bucket for CDK assets
- IAM roles for deployment
- SSM parameter `/cdk-bootstrap/hnb659fds/version`

---

## Step 2: Create Amplify Apps

Create one Amplify app per environment. Each app connects to the same GitHub repo but tracks different branches.

**Get GitHub token:**
```bash
GITHUB_TOKEN=$(doppler secrets get GITHUB_ACCESS_TOKEN --project gi --config prd --plain)
```

### Dev App:

```bash
# Create dev app
doppler run --project {project-name} --config dev -- aws amplify create-app \
  --name {project-name}-dev \
  --repository "https://github.com/{owner}/{project-name}" \
  --access-token "$GITHUB_TOKEN" \
  --enable-branch-auto-build \
  --output json

# Connect develop branch
doppler run --project {project-name} --config dev -- aws amplify create-branch \
  --app-id {dev-app-id} \
  --branch-name develop \
  --enable-auto-build \
  --output json

# Store app ID
doppler secrets set AMPLIFY_APP_ID={dev-app-id} --project {project-name} --config dev
```

### Prod App:

```bash
# Create prod app
doppler run --project {project-name} --config prd -- aws amplify create-app \
  --name {project-name}-prod \
  --repository "https://github.com/{owner}/{project-name}" \
  --access-token "$GITHUB_TOKEN" \
  --enable-branch-auto-build \
  --output json

# Connect main branch
doppler run --project {project-name} --config prd -- aws amplify create-branch \
  --app-id {prod-app-id} \
  --branch-name main \
  --enable-auto-build \
  --output json

# Store app ID
doppler secrets set AMPLIFY_APP_ID={prod-app-id} --project {project-name} --config prd
```

---

## Step 3: Configure Service Roles

Amplify needs a service role to deploy Gen 2 backends.

```bash
for config in dev prd; do
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

  # Attach policy
  doppler run --project {project-name} --config $config -- aws iam attach-role-policy \
    --role-name AmplifyServiceRole \
    --policy-arn arn:aws:iam::aws:policy/AdministratorAccess-Amplify

  # Get app ID and account ID
  APP_ID=$(doppler secrets get AMPLIFY_APP_ID --project {project-name} --config $config --plain)
  ACCOUNT_ID=$(doppler run --project {project-name} --config $config -- aws sts get-caller-identity --query Account --output text)

  # Assign role to app
  doppler run --project {project-name} --config $config -- aws amplify update-app \
    --app-id $APP_ID \
    --iam-service-role-arn arn:aws:iam::${ACCOUNT_ID}:role/AmplifyServiceRole
done
```

---

## Step 4: Configure Platform for Next.js SSR

For Next.js with server-side rendering:

```bash
for config in dev prd; do
  APP_ID=$(doppler secrets get AMPLIFY_APP_ID --project {project-name} --config $config --plain)
  doppler run --project {project-name} --config $config -- aws amplify update-app \
    --app-id $APP_ID \
    --platform WEB_COMPUTE
done
```

**Platform options:**
- `WEB` - Static sites only
- `WEB_COMPUTE` - Next.js SSR, API routes, server components

---

## Step 5: Configure Custom Domains

Each environment gets its own unique domain.

### Dev Domain:

```bash
APP_ID=$(doppler secrets get AMPLIFY_APP_ID --project {project-name} --config dev --plain)

doppler run --project {project-name} --config dev -- aws amplify create-domain-association \
  --app-id $APP_ID \
  --domain-name dev.{project-name}.gaininsight.global \
  --sub-domain-settings branchName=develop,prefix="" \
  --output json
```

### Prod Domain:

```bash
APP_ID=$(doppler secrets get AMPLIFY_APP_ID --project {project-name} --config prd --plain)

doppler run --project {project-name} --config prd -- aws amplify create-domain-association \
  --app-id $APP_ID \
  --domain-name {project-name}.gaininsight.global \
  --sub-domain-settings branchName=main,prefix="" \
  --output json
```

### Add DNS Records:

After domain association, Amplify provides validation records. Add them to Route53:

```bash
# Get validation records from Amplify domain status
# Then add to hosted zone using domain admin credentials
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

---

## Step 6: Create Amplify Backend

Copy the backend template to your project:

```bash
# Create amplify directory
mkdir -p amplify/data

# Create backend.ts
cat > amplify/backend.ts << 'EOF'
import { defineBackend } from '@aws-amplify/backend';
import { data } from './data/resource';

defineBackend({
  data,
});
EOF

# Create data/resource.ts
cat > amplify/data/resource.ts << 'EOF'
import { a, defineData, type ClientSchema } from '@aws-amplify/backend';

const schema = a.schema({
  HelloWorld: a.model({
    message: a.string().required(),
    timestamp: a.string().required(),
  }).authorization((allow) => [allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;
export const data = defineData({ schema });
EOF

# Create amplify/package.json (CRITICAL for ESM)
cat > amplify/package.json << 'EOF'
{
  "type": "module"
}
EOF
```

---

## Step 7: Create Build Configuration

Create `amplify.yml` in project root:

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

---

## Step 8: Trigger Initial Deployment

```bash
# Commit and push
git add amplify/ amplify.yml
git commit -m "feat: Add Amplify Gen 2 backend"
git push origin develop

# Monitor build
APP_ID=$(doppler secrets get AMPLIFY_APP_ID --project {project-name} --config dev --plain)
doppler run --project {project-name} --config dev -- \
  aws amplify list-jobs --app-id $APP_ID --branch-name develop --max-items 1 | \
  jq '.jobSummaries[0] | {status, jobId}'
```

---

## Verification

```bash
# Check app is accessible
curl -s https://dev.{project-name}.gaininsight.global | head -20

# Check GraphQL endpoint
curl -s https://dev.{project-name}.gaininsight.global/api/graphql

# View in Amplify console
open https://eu-west-2.console.aws.amazon.com/amplify/home
```

---

## Local Development with Sandbox

For feature branch development:

```bash
# Start local sandbox
doppler run --project {project-name} --config dev -- \
  npx ampx sandbox --identifier $(git branch --show-current)

# In another terminal
npm run dev

# Delete sandbox when done
doppler run --project {project-name} --config dev -- \
  npx ampx sandbox delete --identifier $(git branch --show-current)
```

---

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| BootstrapDetectionError | CDK not bootstrapped | Run Step 1 |
| Permission denied | Missing service role | Run Step 3 |
| Domain AVAILABLE but no response | Branch not mapped | Verify subdomain settings |
| ESM module error | Missing amplify/package.json | Add `{"type": "module"}` |

---

## Next Steps

For full production setup, continue with GainInsight Standard:
- Layer 2: Testing Framework
- Layer 3: UI/Styling
- Layer 4: CI/CD Pipeline

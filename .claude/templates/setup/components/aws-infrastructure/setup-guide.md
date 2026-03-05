---
title: AWS Infrastructure Setup Guide
created: 2026-01-25
updated: 2026-01-25
last_checked: 2026-01-25
tags: [template, setup, aws, guide, infrastructure]
parent: ./README.md
---

# AWS Infrastructure Setup Guide

Step-by-step instructions for setting up AWS multi-account infrastructure with Doppler secrets management.

## Prerequisites

- Doppler CLI authenticated (`doppler login`)
- AWS credentials via Doppler `gi` project
- Access to GainInsight AWS Organization
- GitHub repo exists

## Environment Configuration

Choose your environment model before starting:

| Model | Creates | Best For |
|-------|---------|----------|
| `simple` | prod only | Prototypes, small projects |
| `standard` | dev + prod | Most projects (recommended) |
| `full` | dev + test + prod | Enterprise, regulated environments |

---

## Step 1: Create AWS Organization Unit

Create an isolated OU for the project under the GainInsight org.

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

**Output:** OU ID (e.g., `ou-tmup-cewspiuv`) - save this for the next step.

---

## Step 2: Create AWS Accounts

Create accounts based on your environment model.

### For Standard Model (dev + prod):

```bash
# Create dev account
doppler run --project gi --config prd -- \
  aws organizations create-account \
  --email aws+{project-name}-dev@gaininsight.global \
  --account-name "{project-name}-dev" \
  --output json

# Create prod account
doppler run --project gi --config prd -- \
  aws organizations create-account \
  --email aws+{project-name}-prod@gaininsight.global \
  --account-name "{project-name}-prod" \
  --output json
```

### For Simple Model (prod only):

```bash
# Create prod account only
doppler run --project gi --config prd -- \
  aws organizations create-account \
  --email aws+{project-name}-prod@gaininsight.global \
  --account-name "{project-name}-prod" \
  --output json
```

### For Full Model (dev + test + prod):

```bash
# Create all three accounts
for env in dev test prod; do
  doppler run --project gi --config prd -- \
    aws organizations create-account \
    --email aws+{project-name}-${env}@gaininsight.global \
    --account-name "{project-name}-${env}" \
    --output json
done
```

**Check account creation status:**

```bash
doppler run --project gi --config prd -- \
  aws organizations describe-create-account-status \
  --create-account-request-id {request-id} \
  --output json
```

**Move accounts to project OU:**

```bash
doppler run --project gi --config prd -- \
  aws organizations move-account \
  --account-id {account-id} \
  --source-parent-id r-tmup \
  --destination-parent-id {project-ou-id}
```

---

## Step 3: Configure Doppler Project

Create Doppler project with per-environment credentials.

```bash
# Create the project
doppler projects create {project-name} --description "{Project Description}"
```

Doppler auto-creates configs based on your model:
- Standard: `dev`, `prd`
- Full: `dev`, `stg`, `prd`

### Create IAM Users

For each account, assume the OrganizationAccountAccessRole and create an IAM user:

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

# Attach AdministratorAccess
aws iam attach-user-policy --user-name {project-name}-deploy \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess

# Create access key
aws iam create-access-key --user-name {project-name}-deploy --output json
```

### Store Credentials in Doppler

```bash
# For each environment
doppler secrets set \
  AWS_ACCESS_KEY_ID={access-key} \
  AWS_SECRET_ACCESS_KEY={secret-key} \
  AWS_DEFAULT_REGION=eu-west-2 \
  AWS_ACCOUNT_ID={account-id} \
  --project {project-name} --config {dev|prd}
```

**Config mapping:**

| Doppler Config | AWS Account | Branch |
|----------------|-------------|--------|
| dev | {project}-dev | develop |
| stg | {project}-test | staging |
| prd | {project}-prod | main |

---

## Step 4: Configure DNS (Optional)

If using `gaininsight.global` subdomain:

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

Note the NameServers, then add NS delegation to parent zone:

```bash
# Parent zone ID: Z08261483JJZ016GFVDDQ (gaininsight.global)
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

---

## Step 5: Set Up Git Branches

Create branches matching your environment model:

### For Standard Model:

```bash
# develop already exists from greenfield setup
# Create main branch from develop
DEVELOP_SHA=$(gh api repos/{owner}/{project-name}/git/refs/heads/develop --jq '.object.sha')

gh api repos/{owner}/{project-name}/git/refs -X POST \
  -f ref="refs/heads/main" \
  -f sha="$DEVELOP_SHA"

# Protect main branch
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

### For Full Model:

Also create staging branch:

```bash
gh api repos/{owner}/{project-name}/git/refs -X POST \
  -f ref="refs/heads/staging" \
  -f sha="$DEVELOP_SHA"

# Protect staging
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
```

---

## Step 6: Register with Project Registry

Add project to the Turso cloud registry via `project-registry` CLI:

```bash
# If project doesn't exist yet, insert via Turso HTTP API (see af-setup-process skill)
# Then set fields:
project-registry set {project-name} name "{Project Name}"
project-registry set {project-name} linear.team_key "{TEAM_KEY}"
project-registry set {project-name} github.repo "{owner}/{project-name}"
project-registry set {project-name} repo_path "/srv/repos/{project-name}.git"
project-registry set {project-name} worktree_base "/srv/worktrees/{project-name}"
project-registry set {project-name} doppler.project "{project-name}"
project-registry set {project-name} doppler.config "dev"
        doppler:
          config: "prd"
```

```bash
# Validate and refresh
project-registry validate
sudo /usr/local/bin/collect-aws-costs
```

---

## Step 7: Console Access (Optional)

See the full console access guide in GainInsight Standard Layer 1, step 1.15 for:
- Root password reset workflow
- MFA setup with Bitwarden
- Credential storage

---

## Verification

After completing these steps, verify:

```bash
# Check Doppler project exists
doppler projects | grep {project-name}

# Check AWS credentials work
doppler run --project {project-name} --config dev -- aws sts get-caller-identity

# Check accounts are in correct OU
doppler run --project gi --config prd -- \
  aws organizations list-accounts-for-parent --parent-id {project-ou-id}
```

---

## Next Steps

AWS Infrastructure is ready. Now install a hosting component:

| Hosting | Command | Use Case |
|---------|---------|----------|
| Amplify | Continue to `hosting-amplify` | Next.js SSR, GraphQL |
| Lightsail | Continue to `hosting-lightsail` | Docker, Directus |

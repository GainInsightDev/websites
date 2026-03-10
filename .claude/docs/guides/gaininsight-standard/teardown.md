---
title: GainInsight Standard - Full Stack Teardown
sidebar_label: Teardown
sidebar_position: 5
created: 2025-12-15
updated: 2025-12-15
last_checked: 2025-12-15
tags: [guide, gaininsight, teardown, cleanup, aws]
parent: ./README.md
related:
  - ./layer-4-cicd.md
  - ./layer-1-infrastructure.md
  - ../../../skills/af-setup-gaininsight-stack/SKILL.md
---

# Full Stack Teardown

Complete instructions for safely decommissioning a GainInsight Standard project.

```
+------------------------------------------------------------------------------+
|                                                                              |
|   WARNING: DESTRUCTIVE OPERATION - THIS CANNOT BE UNDONE                     |
|                                                                              |
|   This teardown will PERMANENTLY DELETE:                                     |
|   - All AWS resources (accounts, Amplify apps, databases, S3 buckets)        |
|   - All Doppler secrets and configurations                                   |
|   - All GitHub repository content and history                                |
|   - All Linear issues and project data                                       |
|   - All DNS records and SSL certificates                                     |
|                                                                              |
|   CONFIRM with user before proceeding. Ask: "Are you sure you want to        |
|   permanently delete ALL resources for {project-name}? Type the project      |
|   name to confirm."                                                          |
|                                                                              |
+------------------------------------------------------------------------------+
```

**When to use this:** Decommissioning a GainInsight Standard project completely. This is for TEST projects (like AFT) that need full cleanup before re-testing, not for production projects with valuable data.

**Order:** Reverse dependency order - remove things that depend on other things FIRST.

---

## T.1 Pre-Teardown: Document What Exists

Before deleting anything, capture the current state for reference:

```bash
# Project identifiers
PROJECT_NAME={project-name}
GITHUB_ORG={owner}

# Get account IDs from Doppler
DEV_ACCOUNT=$(doppler secrets get AWS_ACCESS_KEY_ID --project $PROJECT_NAME --config dev --plain 2>/dev/null && doppler run --project $PROJECT_NAME --config dev -- aws sts get-caller-identity --query Account --output text)
TEST_ACCOUNT=$(doppler run --project $PROJECT_NAME --config stg -- aws sts get-caller-identity --query Account --output text 2>/dev/null)
PROD_ACCOUNT=$(doppler run --project $PROJECT_NAME --config prd -- aws sts get-caller-identity --query Account --output text 2>/dev/null)

# Get Amplify App IDs
DEV_APP_ID=$(doppler secrets get AMPLIFY_APP_ID --project $PROJECT_NAME --config dev --plain 2>/dev/null)
TEST_APP_ID=$(doppler secrets get AMPLIFY_APP_ID --project $PROJECT_NAME --config stg --plain 2>/dev/null)
PROD_APP_ID=$(doppler secrets get AMPLIFY_APP_ID --project $PROJECT_NAME --config prd --plain 2>/dev/null)

# Get Route 53 zone ID for project subdomain
ZONE_ID=$(doppler run --project gi --config prd -- bash -c '
  AWS_ACCESS_KEY_ID=$DOMAIN_ADMIN_AWS_ACCESS_KEY_ID \
  AWS_SECRET_ACCESS_KEY=$DOMAIN_ADMIN_AWS_SECRET_ACCESS_KEY \
  aws route53 list-hosted-zones --query "HostedZones[?Name==\`'$PROJECT_NAME'.gaininsight.global.\`].Id" --output text' | sed 's|/hostedzone/||')

echo "=== Project State ==="
echo "Project: $PROJECT_NAME"
echo "Dev Account: $DEV_ACCOUNT"
echo "Test Account: $TEST_ACCOUNT"
echo "Prod Account: $PROD_ACCOUNT"
echo "Dev App ID: $DEV_APP_ID"
echo "Test App ID: $TEST_APP_ID"
echo "Prod App ID: $PROD_APP_ID"
echo "Zone ID: $ZONE_ID"
```

---

## T.2 Delete Layer 4: CI/CD Resources

**Delete GitHub Actions secrets:**
```bash
# List and delete repository secrets
gh secret list --repo $GITHUB_ORG/$PROJECT_NAME
gh secret delete AWS_ACCESS_KEY_ID --repo $GITHUB_ORG/$PROJECT_NAME
gh secret delete AWS_SECRET_ACCESS_KEY --repo $GITHUB_ORG/$PROJECT_NAME
gh secret delete ANTHROPIC_API_KEY --repo $GITHUB_ORG/$PROJECT_NAME
gh secret delete LINEAR_API_KEY --repo $GITHUB_ORG/$PROJECT_NAME
gh secret delete LINEAR_TEAM_ID --repo $GITHUB_ORG/$PROJECT_NAME
```

**Delete Storybook CloudFront distribution:**
```bash
# Get distribution ID
DIST_ID=$(doppler run --project $PROJECT_NAME --config dev -- \
  aws cloudfront list-distributions \
  --query "DistributionList.Items[?contains(Aliases.Items, 'storybook.$PROJECT_NAME.gaininsight.global')].Id" \
  --output text)

if [ -n "$DIST_ID" ]; then
  # Disable distribution first (required before deletion)
  doppler run --project $PROJECT_NAME --config dev -- \
    aws cloudfront get-distribution-config --id $DIST_ID > /tmp/cf-config.json
  ETAG=$(jq -r '.ETag' /tmp/cf-config.json)
  jq '.DistributionConfig.Enabled = false' /tmp/cf-config.json > /tmp/cf-disabled.json
  doppler run --project $PROJECT_NAME --config dev -- \
    aws cloudfront update-distribution --id $DIST_ID \
    --distribution-config "$(jq '.DistributionConfig' /tmp/cf-disabled.json)" \
    --if-match $ETAG

  echo "Waiting for CloudFront to disable (this takes several minutes)..."
  doppler run --project $PROJECT_NAME --config dev -- \
    aws cloudfront wait distribution-deployed --id $DIST_ID

  # Now delete
  NEW_ETAG=$(doppler run --project $PROJECT_NAME --config dev -- \
    aws cloudfront get-distribution --id $DIST_ID --query 'ETag' --output text)
  doppler run --project $PROJECT_NAME --config dev -- \
    aws cloudfront delete-distribution --id $DIST_ID --if-match $NEW_ETAG
fi
```

**Delete Storybook S3 bucket:**
```bash
BUCKET_NAME="storybook-$PROJECT_NAME-gaininsight"
doppler run --project $PROJECT_NAME --config dev -- \
  aws s3 rb s3://$BUCKET_NAME --force
```

**Delete ACM certificate for Storybook:**
```bash
CERT_ARN=$(doppler run --project $PROJECT_NAME --config dev -- \
  aws acm list-certificates --region us-east-1 \
  --query "CertificateSummaryList[?DomainName=='storybook.$PROJECT_NAME.gaininsight.global'].CertificateArn" \
  --output text)

if [ -n "$CERT_ARN" ]; then
  doppler run --project $PROJECT_NAME --config dev -- \
    aws acm delete-certificate --certificate-arn $CERT_ARN --region us-east-1
fi
```

---

## T.3 Delete Amplify Applications

**For each environment (dev, stg, prd):**
```bash
for config in dev stg prd; do
  APP_ID=$(doppler secrets get AMPLIFY_APP_ID --project $PROJECT_NAME --config $config --plain 2>/dev/null)
  if [ -n "$APP_ID" ]; then
    echo "Deleting Amplify app $APP_ID in $config..."
    doppler run --project $PROJECT_NAME --config $config -- \
      aws amplify delete-app --app-id $APP_ID
  fi
done
```

---

## T.4 Delete Route 53 DNS Records and Hosted Zone

**Delete all records in project zone:**
```bash
if [ -n "$ZONE_ID" ]; then
  # List all records except NS and SOA (can't delete those directly)
  RECORDS=$(doppler run --project gi --config prd -- bash -c '
    AWS_ACCESS_KEY_ID=$DOMAIN_ADMIN_AWS_ACCESS_KEY_ID \
    AWS_SECRET_ACCESS_KEY=$DOMAIN_ADMIN_AWS_SECRET_ACCESS_KEY \
    aws route53 list-resource-record-sets --hosted-zone-id '$ZONE_ID' \
    --query "ResourceRecordSets[?Type!=\`NS\` && Type!=\`SOA\`]"')

  # Delete each record
  echo "$RECORDS" | jq -c '.[]' | while read record; do
    doppler run --project gi --config prd -- bash -c '
      AWS_ACCESS_KEY_ID=$DOMAIN_ADMIN_AWS_ACCESS_KEY_ID \
      AWS_SECRET_ACCESS_KEY=$DOMAIN_ADMIN_AWS_SECRET_ACCESS_KEY \
      aws route53 change-resource-record-sets \
        --hosted-zone-id '$ZONE_ID' \
        --change-batch '"'"'{"Changes":[{"Action":"DELETE","ResourceRecordSet":'"$record"'}]}'"'"''
  done

  # Delete the hosted zone itself
  doppler run --project gi --config prd -- bash -c '
    AWS_ACCESS_KEY_ID=$DOMAIN_ADMIN_AWS_ACCESS_KEY_ID \
    AWS_SECRET_ACCESS_KEY=$DOMAIN_ADMIN_AWS_SECRET_ACCESS_KEY \
    aws route53 delete-hosted-zone --id '$ZONE_ID''
fi
```

**Delete NS delegation from parent zone (gaininsight.global):**
```bash
# Parent zone ID: Z08261483JJZ016GFVDDQ
# First, look up the actual NS records
doppler run --project gi --config prd -- bash -c '
  AWS_ACCESS_KEY_ID=$DOMAIN_ADMIN_AWS_ACCESS_KEY_ID \
  AWS_SECRET_ACCESS_KEY=$DOMAIN_ADMIN_AWS_SECRET_ACCESS_KEY \
  aws route53 list-resource-record-sets --hosted-zone-id Z08261483JJZ016GFVDDQ \
  --query "ResourceRecordSets[?Name==\`'$PROJECT_NAME'.gaininsight.global.\` && Type==\`NS\`]"'

# Then delete with actual NS values
doppler run --project gi --config prd -- bash -c '
  AWS_ACCESS_KEY_ID=$DOMAIN_ADMIN_AWS_ACCESS_KEY_ID \
  AWS_SECRET_ACCESS_KEY=$DOMAIN_ADMIN_AWS_SECRET_ACCESS_KEY \
  aws route53 change-resource-record-sets \
    --hosted-zone-id Z08261483JJZ016GFVDDQ \
    --change-batch '"'"'{
      "Changes": [{
        "Action": "DELETE",
        "ResourceRecordSet": {
          "Name": "'$PROJECT_NAME'.gaininsight.global",
          "Type": "NS",
          "TTL": 300,
          "ResourceRecords": [
            {"Value": "REPLACE_WITH_ACTUAL_NS1"},
            {"Value": "REPLACE_WITH_ACTUAL_NS2"},
            {"Value": "REPLACE_WITH_ACTUAL_NS3"},
            {"Value": "REPLACE_WITH_ACTUAL_NS4"}
          ]
        }
      }]
    }'"'"''
```

---

## T.5 Delete IAM Users in Each Account

**For each account:**
```bash
for config in dev stg prd; do
  echo "Deleting IAM user in $config account..."

  # List and delete access keys first
  KEYS=$(doppler run --project $PROJECT_NAME --config $config -- \
    aws iam list-access-keys --user-name $PROJECT_NAME-deploy \
    --query 'AccessKeyMetadata[].AccessKeyId' --output text 2>/dev/null)

  for key in $KEYS; do
    doppler run --project $PROJECT_NAME --config $config -- \
      aws iam delete-access-key --user-name $PROJECT_NAME-deploy --access-key-id $key
  done

  # Detach policies
  doppler run --project $PROJECT_NAME --config $config -- \
    aws iam detach-user-policy --user-name $PROJECT_NAME-deploy \
    --policy-arn arn:aws:iam::aws:policy/AdministratorAccess 2>/dev/null

  # Delete user
  doppler run --project $PROJECT_NAME --config $config -- \
    aws iam delete-user --user-name $PROJECT_NAME-deploy 2>/dev/null
done
```

---

## T.6 Delete CDK Bootstrap Stacks

**For each account:**
```bash
for config in dev stg prd; do
  echo "Deleting CDK bootstrap in $config account..."
  doppler run --project $PROJECT_NAME --config $config -- \
    aws cloudformation delete-stack --stack-name CDKToolkit --region eu-west-2
done
```

---

## T.7 Delete Amplify Service Roles

**For each account:**
```bash
for config in dev stg prd; do
  echo "Deleting AmplifyServiceRole in $config account..."

  # Detach policy first
  doppler run --project $PROJECT_NAME --config $config -- \
    aws iam detach-role-policy --role-name AmplifyServiceRole \
    --policy-arn arn:aws:iam::aws:policy/AdministratorAccess-Amplify 2>/dev/null

  # Delete role
  doppler run --project $PROJECT_NAME --config $config -- \
    aws iam delete-role --role-name AmplifyServiceRole 2>/dev/null
done
```

---

## T.8 Close AWS Accounts

**IMPORTANT:** AWS accounts cannot be instantly deleted. They must be closed from the management account.

```bash
# Close each account (from organization management account)
for account_id in $DEV_ACCOUNT $TEST_ACCOUNT $PROD_ACCOUNT; do
  if [ -n "$account_id" ]; then
    echo "Closing AWS account $account_id..."
    doppler run --project gi --config prd -- \
      aws organizations close-account --account-id $account_id
  fi
done
```

**Note:** Closed accounts:
- Enter a 90-day suspension period
- Cannot be reopened after closure
- Are removed from the organization after suspension
- May still incur charges during suspension if resources weren't deleted

**Delete the Organizational Unit:**
```bash
# First, find the OU ID
OU_ID=$(doppler run --project gi --config prd -- \
  aws organizations list-organizational-units-for-parent \
  --parent-id ou-tmup-nfmu3ia2 \
  --query "OrganizationalUnits[?Name=='$PROJECT_NAME'].Id" --output text)

if [ -n "$OU_ID" ]; then
  # OU must be empty before deletion (accounts moved/closed)
  doppler run --project gi --config prd -- \
    aws organizations delete-organizational-unit --organizational-unit-id $OU_ID
fi
```

---

## T.9 Delete Doppler Project

```bash
# Delete the Doppler project (removes all configs and secrets)
doppler projects delete $PROJECT_NAME --yes
```

---

## T.10 Delete Bitwarden Entries

```bash
# Unlock Bitwarden
BW_PASSWORD=$(sudo -u tmux-shared doppler secrets get BITWARDEN_PASSWORD --project gi --config prd --plain)
BW_SESSION=$(echo "$BW_PASSWORD" | bw unlock --raw)

# Find and delete entries for this project
for env in Dev Test Prod; do
  ITEM_ID=$(bw list items --search "AWS ${PROJECT_NAME^} $env" --session "$BW_SESSION" | jq -r '.[0].id')
  if [ -n "$ITEM_ID" ] && [ "$ITEM_ID" != "null" ]; then
    echo "Deleting Bitwarden entry: AWS ${PROJECT_NAME^} $env"
    bw delete item $ITEM_ID --session "$BW_SESSION"
  fi
done

# Sync vault
bw sync --session "$BW_SESSION"
```

---

## T.11 Remove from Cost Dashboard

```bash
# Edit /srv/aws-cost-dashboard/accounts.config.json
# Remove the entries for {project-name}-dev, {project-name}-test, {project-name}-prod
sudo vim /srv/aws-cost-dashboard/accounts.config.json
```

---

## T.12 Archive/Delete GitHub Repository

**Option A: Archive (preserves history, makes read-only):**
```bash
gh repo archive $GITHUB_ORG/$PROJECT_NAME --yes
```

**Option B: Delete (permanent, cannot be undone):**
```bash
gh repo delete $GITHUB_ORG/$PROJECT_NAME --yes
```

---

## T.13 Archive/Delete Linear Team

**Archive team (preserves issues, hides from view):**
```bash
LINEAR_API_KEY=$(doppler secrets get LINEAR_API_KEY --project gi --config prd --plain)
LINEAR_TEAM_ID=$(doppler secrets get LINEAR_TEAM_ID --project $PROJECT_NAME --config dev --plain)

curl -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { teamArchive(id: \"'$LINEAR_TEAM_ID'\") { success } }"
  }'
```

**Note:** Linear doesn't support team deletion via API. Teams can only be archived. Full deletion requires Linear admin access through the web UI.

---

## T.14 Clean Up Local Worktrees

```bash
# Remove any local worktrees for this project
# Check /srv/worktrees/ and /data/worktrees/
ls -la /srv/worktrees/ | grep $PROJECT_NAME
ls -la /data/worktrees/ | grep $PROJECT_NAME

# Remove worktrees
rm -rf /srv/worktrees/$PROJECT_NAME
rm -rf /data/worktrees/$PROJECT_NAME
```

---

## Teardown Verification Checklist

After teardown, verify these resources are gone:

| Resource | Verification Command |
|----------|---------------------|
| Amplify apps | `aws amplify list-apps` (should not list project apps) |
| Route 53 zone | `aws route53 list-hosted-zones` (zone should be gone) |
| NS delegation | Check parent zone for NS record |
| Doppler project | `doppler projects list` (should not list project) |
| GitHub repo | `gh repo view $GITHUB_ORG/$PROJECT_NAME` (should error or show archived) |
| Bitwarden entries | Search for "AWS {Project}" in Bitwarden |
| CloudFront | `aws cloudfront list-distributions` (Storybook dist should be gone) |
| S3 bucket | `aws s3 ls` (Storybook bucket should be gone) |
| Cost dashboard | Check accounts.config.json |

---

## Partial Teardown

If you only need to tear down specific layers:

| Scope | Steps to Run |
|-------|--------------|
| **Layer 4 only** | Run T.2 (CI/CD resources) |
| **Layers 3-4** | Run T.2 (Layer 4 deletes Storybook hosting) |
| **Infrastructure reset** | Run T.3-T.8 (Amplify, DNS, AWS accounts) but keep GitHub/Linear/Doppler |
| **Full teardown** | Run all steps T.1-T.14 |

**Layer 4 teardown (CI/CD only):**
See [Layer 4: CI/CD](./layer-4-cicd.md) for layer-specific teardown instructions.

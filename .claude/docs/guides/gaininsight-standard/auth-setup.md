---
title: Authentication & Email Setup
sidebar_label: Auth Setup
sidebar_position: 7
created: 2026-02-08
updated: 2026-02-08
last_checked: 2026-02-08
tags: [guide, gaininsight, cognito, ses, authentication, email, dkim]
parent: ./README.md
related:
  - ../../../skills/af-configure-cognito-auth/SKILL.md
  - ../../../skills/af-configure-ses-email/SKILL.md
  - ../../../skills/af-setup-gaininsight-stack/SKILL.md
  - ../../../skills/af-provision-infrastructure/SKILL.md
  - ../../../skills/af-build-amplify-features/SKILL.md
---

# Authentication & Email Setup

Complete guide for setting up Cognito authentication and SES email in GainInsight Standard projects. This covers everything discovered during Juncan (JCN-3) multi-tenant auth implementation.

**Prerequisites:** Layer 1 Infrastructure complete (AWS accounts, Doppler, Amplify apps deployed).

**Skills that reference this guide:**
- `af-configure-cognito-auth` — Cognito User Pool setup, custom attributes, auth triggers
- `af-configure-ses-email` — SES domain verification, sandbox/production, DKIM

---

## Cognito User Pool Setup

### Custom Attributes

Amplify Gen 2 defines auth in `amplify/auth/resource.ts`. Custom attributes extend the default user profile.

**Critical rule: ALL custom attributes MUST be `mutable: true`.**

Setting `mutable: false` blocks ALL updates including `AdminUpdateUserAttributes` called by Lambda functions with IAM permissions. This is enforced at the Cognito service level, not IAM.

**Impact of immutable attributes:**
- Super admin grant/revoke breaks (`custom:platform_role`)
- User removal from orgs breaks (`custom:tenant_id`, `custom:user_type`)
- Post-confirmation Lambda attribute updates break

**Changing attribute mutability requires User Pool recreation (deletes all users).** Plan attributes carefully before first deployment.

```typescript
// amplify/auth/resource.ts
import { defineAuth } from "@aws-amplify/backend";

export const auth = defineAuth({
  loginWith: {
    email: {
      verificationEmailStyle: "CODE",
      verificationEmailSubject: "Your verification code",
    },
  },
  userAttributes: {
    "custom:tenant_id": {
      dataType: "String",
      mutable: true,      // MUST be true
      maxLen: 36,
    },
    "custom:user_type": {
      dataType: "String",
      mutable: true,      // MUST be true
      maxLen: 20,
    },
    "custom:platform_role": {
      dataType: "String",
      mutable: true,      // MUST be true
      maxLen: 20,
    },
  },
});
```

### Auth Flow Configuration

Amplify Gen 2 creates User Pool Clients with limited auth flows. Integration tests using `AdminInitiateAuthCommand` need `ALLOW_ADMIN_USER_PASSWORD_AUTH`.

**Add CDK escape hatch in `amplify/backend.ts`:**

```typescript
import { backend } from "./backend";

// Enable admin auth flow for integration tests
const cfnUserPoolClient = backend.auth.resources.cfnResources.cfnUserPoolClient;
cfnUserPoolClient.explicitAuthFlows = [
  "ALLOW_CUSTOM_AUTH",
  "ALLOW_REFRESH_TOKEN_AUTH",
  "ALLOW_USER_SRP_AUTH",
  "ALLOW_ADMIN_USER_PASSWORD_AUTH", // Required for integration tests
];
```

Without this, integration tests fail with `InvalidParameterException: Auth flow not enabled for this client`.

### Auth Triggers

Cognito triggers (post-confirmation, pre-signup) are Lambda functions wired in `amplify/auth/resource.ts`:

```typescript
export const auth = defineAuth({
  // ... login config above
  triggers: {
    postConfirmation: defineFunction({
      name: "project-post-confirmation",
      entry: "./post-confirmation/handler.ts",
      resourceGroupName: "auth",
    }),
  },
});
```

**Key patterns for auth trigger Lambdas:**
- Use `resourceGroupName: "auth"` (not `"data"`) to avoid circular dependencies with auth stack
- Grant IAM permissions in `backend.ts` for any AWS service calls (Cognito Admin, DynamoDB, SES)
- Access user attributes via `event.request.userAttributes`

---

## SES Domain Verification

### Architecture

SES is per-AWS-account, not per-Amplify-app. Each account (dev, test, prod) needs its own SES configuration:

```
project-dev account  → SES config (shared by all sandboxes in this account)
project-test account → SES config (separate)
project-prod account → SES config (separate)
```

### Domain Verification Workflow

**Step 1: Create domain identity**

```bash
doppler run --project {project} --config dev -- \
  aws sesv2 create-email-identity --email-identity {project}.gaininsight.global
```

**Step 2: Get DKIM tokens**

```bash
doppler run --project {project} --config dev -- \
  aws sesv2 get-email-identity --email-identity {project}.gaininsight.global \
  --query 'DkimAttributes.Tokens'
```

This returns 3 tokens. Each needs a CNAME record.

**Step 3: Add DKIM CNAME records**

DNS for GainInsight domains is managed via domain admin credentials in the `gi` Doppler project (not individual project accounts):

```bash
# For each of the 3 tokens, add a CNAME record:
# {token}._domainkey.{project}.gaininsight.global → {token}.dkim.amazonses.com

doppler run --project gi --config prd -- bash -c '
  AWS_ACCESS_KEY_ID=$DOMAIN_ADMIN_AWS_ACCESS_KEY_ID \
  AWS_SECRET_ACCESS_KEY=$DOMAIN_ADMIN_AWS_SECRET_ACCESS_KEY \
  aws route53 change-resource-record-sets \
    --hosted-zone-id {project-zone-id} \
    --change-batch '"'"'{
      "Changes": [{
        "Action": "CREATE",
        "ResourceRecordSet": {
          "Name": "{token}._domainkey.{project}.gaininsight.global",
          "Type": "CNAME",
          "TTL": 300,
          "ResourceRecords": [{"Value": "{token}.dkim.amazonses.com"}]
        }
      }]
    }'"'"''
```

See `af-provision-infrastructure` for domain admin credential patterns.

**Step 4: Verify DKIM is active**

```bash
doppler run --project {project} --config dev -- \
  aws sesv2 get-email-identity --email-identity {project}.gaininsight.global \
  --query 'DkimAttributes.{Status:Status,SigningEnabled:SigningEnabled}'
```

DKIM verification typically takes 2-72 hours. Status should show `SUCCESS` and `SigningEnabled: true`.

### Repeat for Each Account

Run Steps 1-4 for each environment (dev, stg, prd) using the corresponding Doppler config. The DKIM records are shared (same domain), but SES identities are per-account.

---

## SES Sandbox vs Production

### Sandbox Mode

New AWS accounts start in SES sandbox mode:
- Can only send to **verified** email addresses
- 200 emails per 24 hours, 1 email per second
- Plus addressing (`user+tag@domain`) requires **separate verification** for each variant

**Verify individual emails for sandbox testing:**

```bash
doppler run --project {project} --config dev -- \
  aws sesv2 create-email-identity --email-identity user@example.com
```

### Request Production Access

```bash
doppler run --project {project} --config dev -- \
  aws sesv2 put-account-details \
    --mail-type TRANSACTIONAL \
    --website-url "https://dev.{project}.gaininsight.global" \
    --use-case-description "Transactional emails for user authentication (verification codes, password reset) and application notifications (invitations, status updates). Expected volume: under 100 emails/day." \
    --production-access-enabled
```

**Typical approval time:** 24-48 hours per account. Request for all accounts early.

**Check account status:**

```bash
doppler run --project {project} --config dev -- \
  aws sesv2 get-account --query 'ProductionAccessEnabled'
```

### Cognito Email Volume Limit

Cognito defaults to sending via its own internal domain (50 emails/day limit). For higher volume or E2E tests creating multiple users, configure Cognito to use your verified SES identity. Without this, tests hit `LimitExceededException`.

Configure in `amplify/auth/resource.ts`:

```typescript
export const auth = defineAuth({
  loginWith: {
    email: {
      verificationEmailStyle: "CODE",
      verificationEmailSubject: "Your verification code",
      // Use project SES identity instead of Cognito default
      fromEmail: `noreply@${project}.gaininsight.global`,
    },
  },
});
```

This requires the SES domain identity to be verified with DKIM in the same AWS account.

---

## Cognito-SES Integration

### Sender Identity

Use a consistent sender identity across Cognito and custom emails:

| Email Type | Sender | Source |
|------------|--------|--------|
| Verification codes | `noreply@{project}.gaininsight.global` | Cognito (via SES) |
| Password reset | `noreply@{project}.gaininsight.global` | Cognito (via SES) |
| Invitation emails | `noreply@{project}.gaininsight.global` | Lambda (via SES) |
| Notifications | `noreply@{project}.gaininsight.global` | Lambda (via SES) |

**Why consistent sender?** Gmail groups emails by sender. Mixed senders (Cognito default + custom domain) cause deliverability issues and confusing inbox behavior.

### Lambda SES Permissions

Lambda functions that send email need explicit IAM policies:

```typescript
// amplify/backend.ts
import { PolicyStatement, Effect } from "aws-cdk-lib/aws-iam";

backend.inviteUserFunction.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ["ses:SendEmail", "ses:SendRawEmail"],
    resources: [`arn:aws:ses:eu-west-2:*:identity/{project}.gaininsight.global`],
  })
);
```

### Custom Email Sending Pattern

```typescript
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

const sesClient = new SESv2Client({ region: "eu-west-2" });

await sesClient.send(new SendEmailCommand({
  FromEmailAddress: `noreply@${process.env.DOMAIN}`,
  Destination: {
    ToAddresses: [recipientEmail],
  },
  Content: {
    Simple: {
      Subject: { Data: "You've been invited" },
      Body: {
        Html: { Data: htmlContent },
        Text: { Data: textContent },
      },
    },
  },
}));
```

---

## E2E Testing Integration

### Test Email Pattern

Use the `testing+{project}@gaininsight.global` pattern for E2E email verification:

```
testing+juncan@gaininsight.global → Gmail inbox (read via service account)
```

- Gmail API access via service account stored in Doppler (`GMAIL_TESTING_SERVICE_ACCOUNT` in `gi/prd`)
- See `af-test-email-delivery` skill for Gmail verification workflow
- See `af-configure-test-frameworks` for helper patterns

### SES Verified Recipients for Sandbox

In sandbox mode, the test email address must be verified:

```bash
doppler run --project {project} --config dev -- \
  aws sesv2 create-email-identity --email-identity testing+{project}@gaininsight.global
```

**Plus addressing caveat:** Each `+tag` variant needs separate verification. If tests use `testing+{project}+signup@gaininsight.global`, that's a different identity.

### E2E-Ready Authentication Checklist

Before E2E tests involving auth can pass:

| Requirement | Check Command | Impact if Missing |
|-------------|---------------|-------------------|
| SES production access | `aws sesv2 get-account --query ProductionAccessEnabled` | Emails don't send beyond sandbox |
| Domain DKIM verified | `aws sesv2 get-email-identity --email-identity {domain} --query 'DkimAttributes.Status'` | Custom emails rejected by Gmail |
| Cognito using SES identity | Check `amplify/auth/resource.ts` for `fromEmail` | 50 email/day limit, tests fail |
| Test email verified (sandbox) | `aws sesv2 get-email-identity --email-identity testing+{project}@gaininsight.global` | Sandbox rejects unverified recipients |
| Gmail service account | `doppler secrets get GMAIL_TESTING_SERVICE_ACCOUNT --project gi --config prd` | Can't read verification emails |
| Cognito attributes mutable | Check `amplify/auth/resource.ts` | Can't update user attributes in tests |
| Admin auth flow enabled | Check `amplify/backend.ts` CDK escape hatch | Integration tests can't authenticate |

---

## Key Doppler Secrets

| Secret | Project/Config | Purpose |
|--------|----------------|---------|
| `DOMAIN_ADMIN_AWS_ACCESS_KEY_ID` | `gi/prd` | Route 53 access for DKIM DNS records |
| `DOMAIN_ADMIN_AWS_SECRET_ACCESS_KEY` | `gi/prd` | Route 53 access for DKIM DNS records |
| `GMAIL_TESTING_SERVICE_ACCOUNT` | `gi/prd` | Gmail API for E2E email verification |
| `AWS_ACCESS_KEY_ID` | `{project}/dev` | SES API access per-account |
| `AWS_SECRET_ACCESS_KEY` | `{project}/dev` | SES API access per-account |

---

## SES Commands Reference

```bash
# Create domain identity
aws sesv2 create-email-identity --email-identity domain.com

# Get DKIM tokens
aws sesv2 get-email-identity --email-identity domain.com --query 'DkimAttributes.Tokens'

# Verify individual email (sandbox testing)
aws sesv2 create-email-identity --email-identity user@domain.com

# Check DKIM status
aws sesv2 get-email-identity --email-identity domain.com \
  --query 'DkimAttributes.{Status:Status,SigningEnabled:SigningEnabled}'

# Request production access
aws sesv2 put-account-details \
  --mail-type TRANSACTIONAL \
  --website-url "https://app.domain.com" \
  --use-case-description "..." \
  --production-access-enabled

# Check account sending status
aws sesv2 get-account

# Check sending quota
aws sesv2 get-account --query 'SendQuota'
```

---

## Common Pitfalls

### 1. Immutable Custom Attributes

**Problem:** `AdminUpdateUserAttributes` fails silently or throws error.
**Cause:** Custom attributes defined with `mutable: false`.
**Solution:** Set ALL custom attributes to `mutable: true`. Enforce security at application/API level. Changing mutability requires User Pool recreation.

### 2. Auth Flow Not Enabled

**Problem:** `InvalidParameterException: Auth flow not enabled for this client`
**Cause:** Amplify Gen 2 creates clients with limited auth flows.
**Solution:** Add CDK escape hatch for `ALLOW_ADMIN_USER_PASSWORD_AUTH`. See [Auth Flow Configuration](#auth-flow-configuration) above.

### 3. SES Sandbox Blocks Emails

**Problem:** E2E tests timeout waiting for emails that never arrive.
**Cause:** SES in sandbox mode, test recipient not verified.
**Solution:** Either verify test recipient or request production access (24-48h).

### 4. Plus Addressing Requires Separate Verification

**Problem:** `testing+app@domain` verified but `testing+app+tag@domain` emails bounce.
**Cause:** SES treats each `+tag` variant as a separate identity in sandbox.
**Solution:** Verify each variant used in tests, or request production access.

### 5. DKIM Missing for Custom Emails

**Problem:** Cognito emails arrive but Lambda-sent emails don't.
**Cause:** Cognito uses its configured identity with DKIM. Lambda emails sent without DKIM get rejected.
**Solution:** Send from a domain with DKIM configured. See [Domain Verification Workflow](#domain-verification-workflow).

### 6. Cognito 50 Email/Day Limit

**Problem:** `LimitExceededException` during E2E test runs.
**Cause:** Cognito using default sending (not project SES identity).
**Solution:** Configure `fromEmail` in auth resource to use project domain. See [Cognito Email Volume Limit](#cognito-email-volume-limit).

### 7. Wrong SES Region

**Problem:** Emails don't send despite production access.
**Cause:** SES identity created in wrong region (e.g., us-east-1 instead of eu-west-2).
**Solution:** Create SES identity in `eu-west-2` (GainInsight standard region). Cognito and Lambda must use same region as SES identity.

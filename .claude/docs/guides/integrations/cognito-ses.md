---
title: "Integration: Cognito + SES"
created: 2026-02-18
updated: 2026-02-18
last_checked: 2026-02-18
tags: [integration, cognito, ses, auth, email]
parent: ./README.md
related:
  - ../aws-amplify-guide.md
  - ../gaininsight-standard/auth-setup.md
  - ./ses-per-account.md
  - ./auth-testing.md
---

# Integration: Cognito + SES

Cognito uses SES to send verification emails, password resets, and MFA codes. Without proper SES configuration, Cognito falls back to its built-in email sender which has a hard limit of 50 emails per day — unsuitable for any environment beyond early development.

## SES Domain Verification

The SES domain **must** be verified with DKIM records in the **same AWS account** where the Cognito User Pool lives. Cross-account SES sending is not supported by Cognito.

### Verification Steps

1. Verify the domain identity in SES (e.g., `gaininsight.global`)
2. Add the three DKIM CNAME records to Route53
3. Wait for DKIM verification status to show `SUCCESS` (usually 1-5 minutes)
4. Only then configure `fromEmail` in Amplify auth

### Configure Amplify Auth

In `amplify/auth/resource.ts`, set the `fromEmail` **after** SES domain verification is complete:

```typescript
export const auth = defineAuth({
  loginWith: {
    email: {
      fromEmail: 'noreply@{project}.gaininsight.global',
    },
  },
});
```

Without this configuration, Cognito uses its sandbox email sender with the 50 emails/day limit.

## SES Production Access

SES starts in sandbox mode in every AWS account. Sandbox mode restricts sending to verified email addresses only and enforces low sending limits.

**Request production access early** — approval takes 24-48 hours per account, and you must request it separately for each AWS account (dev, test, prod). Do not wait until you need to send emails to real users.

To request production access:
1. Open SES console in the correct region
2. Navigate to Account Dashboard
3. Click "Request production access"
4. Provide use case details (transactional auth emails)

## Consistent Sender Identity

Use a consistent sender format across all email types:

```
noreply@{project}.gaininsight.global
```

This applies to:
- Cognito verification emails
- Cognito password reset emails
- Cognito MFA codes
- Application transactional emails sent via Lambda

A consistent sender identity improves deliverability and avoids spam filters.

## Lambda SES Permissions

Lambda functions that send emails via SES need explicit IAM policies. Amplify does not grant SES permissions by default.

Add an explicit IAM policy for `ses:SendEmail` and `ses:SendRawEmail`:

```typescript
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';

const sesClient = new SESv2Client({ region: 'eu-west-2' });

await sesClient.send(new SendEmailCommand({
  FromEmailAddress: 'noreply@{project}.gaininsight.global',
  Destination: {
    ToAddresses: [recipientEmail],
  },
  Content: {
    Simple: {
      Subject: { Data: subject },
      Body: { Html: { Data: htmlBody } },
    },
  },
}));
```

The Lambda execution role must include:

```json
{
  "Effect": "Allow",
  "Action": [
    "ses:SendEmail",
    "ses:SendRawEmail"
  ],
  "Resource": "arn:aws:ses:eu-west-2:*:identity/*"
}
```

## Validation Checklist

Before considering Cognito + SES integration complete:

- [ ] SES domain verified with DKIM in the correct AWS account
- [ ] `fromEmail` configured in `amplify/auth/resource.ts`
- [ ] SES production access requested (and approved) for this account
- [ ] Test email delivery works end-to-end (sign up, verify, reset password)
- [ ] Lambda SES IAM policies in place (if custom email sending is used)
- [ ] Consistent sender identity (`noreply@{project}.gaininsight.global`)
- [ ] SES region matches Cognito region (eu-west-2 for GainInsight)
- [ ] Repeat above for each AWS account (dev, test, prod)

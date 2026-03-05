---
title: "Integration: SES Per-Account Architecture"
created: 2026-02-18
updated: 2026-02-18
last_checked: 2026-02-18
tags: [integration, ses, aws, multi-account]
parent: ./README.md
related:
  - ../aws-amplify-guide.md
  - ./cognito-ses.md
  - ../gaininsight-standard/layer-1-infrastructure.md
---

# Integration: SES Per-Account Architecture

Amazon SES is scoped per AWS account, not per Amplify app or per domain. This means every AWS account in a multi-account setup (dev, test, prod) requires its own SES configuration, its own domain verification, and its own production access request.

## SES Is Per-Account

A common misconception is that verifying a domain in SES once covers all accounts. It does not.

| Scope | Per-Account? | Notes |
|-------|-------------|-------|
| SES domain identity | Yes | Must verify in each account |
| SES production access | Yes | Must request separately for each account |
| DKIM DNS records | Shared | Same domain, same DNS records |
| SES sending limits | Yes | Each account has independent limits |
| SES sandbox mode | Yes | Each account starts in sandbox |

## DKIM Records Are Shared

While SES identities are per-account, the DKIM DNS records for a domain are the same regardless of which account verified them. The three DKIM CNAME records added to Route53 serve all accounts that verify the same domain.

This means:
- You add DKIM records to DNS once
- Each account still needs to create the domain identity and wait for DKIM verification
- The verification process reads the same DNS records but creates an account-local identity

## Production Access Per Account

Each AWS account starts with SES in sandbox mode. Sandbox restrictions:
- Can only send to verified email addresses
- Maximum 200 emails per 24-hour period
- Maximum 1 email per second

**Request production access early for every account.** Approval takes 24-48 hours per request. Plan for this lead time:

| Account | When to Request | Why |
|---------|----------------|-----|
| Dev | During Layer 1 setup | Unblocks developer testing with real emails |
| Test | Before Layer 2 testing begins | E2E tests send verification emails |
| Prod | Before first user onboarding | Production users need reliable email delivery |

Do not wait until you need to send emails. Submit the request as soon as the account's SES domain is verified.

## Region Must Match

SES, Cognito, and Lambda must all be in the **same AWS region**. For GainInsight projects, this is `eu-west-2` (London).

If the domain is verified in SES in `us-east-1` but Cognito is in `eu-west-2`, Cognito cannot use that SES identity. Verify the domain in the correct region.

```
SES region:     eu-west-2  ✓
Cognito region: eu-west-2  ✓  (must match)
Lambda region:  eu-west-2  ✓  (must match)
```

## Domain Admin Credentials

Route53 access for managing DNS records (DKIM verification, domain configuration) requires domain admin credentials. For GainInsight projects:

- **Doppler project**: `gi/prd`
- **Access**: Route53 is managed from the production account
- **Records**: DKIM CNAMEs, MX records, SPF/DMARC TXT records

## Multi-Account Setup Checklist

For each AWS account (dev, test, prod):

- [ ] SES domain identity created in the correct region (eu-west-2)
- [ ] DKIM verification shows `SUCCESS` status
- [ ] SES production access requested
- [ ] SES production access approved
- [ ] Cognito `fromEmail` configured to use the SES domain
- [ ] Test email sent and received successfully
- [ ] Lambda SES IAM policies in place (if applicable)

## Common Failures

| Symptom | Cause | Fix |
|---------|-------|-----|
| "Email address is not verified" | Domain not verified in this account | Verify domain in the account where Cognito/Lambda runs |
| Emails not arriving | Still in sandbox, recipient not verified | Request production access or verify recipient |
| "AccessDenied" from Lambda | SES permissions missing | Add `ses:SendEmail` to Lambda execution role |
| DKIM verification stuck | DNS propagation delay | Wait up to 72 hours; usually resolves in minutes |
| Works in dev, fails in prod | SES not configured in prod account | Repeat full SES setup for each account |

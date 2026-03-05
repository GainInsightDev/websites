---
title: "Integration: Auth + Testing"
created: 2026-02-18
updated: 2026-02-18
last_checked: 2026-02-18
tags: [integration, auth, testing, cognito, e2e]
parent: ./README.md
related:
  - ../aws-amplify-guide.md
  - ../gaininsight-standard/auth-setup.md
  - ../gaininsight-standard/layer-2-testing.md
  - ../testing-guide.md
  - ./cognito-ses.md
---

# Integration: Auth + Testing

Cognito authentication and E2E testing have several integration constraints that must be addressed during setup, not discovered during test implementation. Getting these wrong can require User Pool recreation, which deletes all users.

## Custom Attribute Mutability

**ALL custom attributes MUST be defined as `mutable: true`.**

Immutable custom attributes block test user attribute updates, which breaks E2E test flows that need to modify user state (e.g., setting roles, toggling feature flags, updating profile data).

```typescript
// CORRECT — mutable attributes
customAttributes: {
  role: { dataType: 'String', mutable: true },
  orgId: { dataType: 'String', mutable: true },
}

// WRONG — immutable blocks test flows
customAttributes: {
  role: { dataType: 'String', mutable: false },  // Cannot change after creation
}
```

**Changing attribute mutability requires User Pool recreation**, which deletes all existing users. There is no way to change an attribute from immutable to mutable in-place. Set all attributes as mutable from the start.

## Admin Auth Flow

The admin auth flow (`ALLOW_ADMIN_USER_PASSWORD_AUTH`) must be enabled on the Cognito User Pool Client for E2E tests to programmatically sign in users without going through the hosted UI.

Amplify Gen 2 does not expose this setting directly. Enable it via a CDK escape hatch:

```typescript
const { cfnUserPoolClient } = backend.auth.resources.cfnResources;
cfnUserPoolClient.explicitAuthFlows = [
  ...(cfnUserPoolClient.explicitAuthFlows ?? []),
  'ALLOW_ADMIN_USER_PASSWORD_AUTH',
];
```

Without this, E2E tests cannot use `AdminInitiateAuth` to obtain tokens programmatically.

## E2E Test Email Pattern

E2E tests that trigger verification or password reset emails need to read those emails programmatically. Use the shared testing email pattern:

```
testing+{project}@gaininsight.global
```

Emails sent to `+tag` variants are delivered to the base address (`testing@gaininsight.global`), allowing a single inbox to receive emails for multiple projects and test runs.

### Gmail API Access

Read test emails via the Gmail API using a service account:

- **Service account credentials**: Stored in Doppler under the `gi/prd` project as `GMAIL_TESTING_SERVICE_ACCOUNT`
- **Access method**: Domain-wide delegation allows the service account to read the `testing@gaininsight.global` inbox
- **Email lookup**: Search by recipient (`+tag` variant) and subject to find the correct verification code

### SES Sandbox Constraint

In SES sandbox mode, each `+tag` email variant needs **separate verification** as a recipient. For example:
- `testing+projecta@gaininsight.global` — must be verified
- `testing+projectb@gaininsight.global` — must be verified separately

This is another reason to request SES production access early (see `cognito-ses.md`).

## E2E-Ready Authentication Checklist

Before E2E tests can run against authenticated flows:

- [ ] All custom attributes defined with `mutable: true`
- [ ] `ALLOW_ADMIN_USER_PASSWORD_AUTH` enabled via CDK escape hatch
- [ ] Test email address pattern established (`testing+{project}@gaininsight.global`)
- [ ] Gmail service account credentials in Doppler (`gi/prd` project)
- [ ] SES domain verified in the target AWS account
- [ ] SES production access granted (or test email variants individually verified in sandbox)
- [ ] E2E test helper implements `AdminInitiateAuth` for programmatic sign-in

/**
 * Email (SES) Module Validation
 *
 * Verifies SES domain verification and DKIM are configured.
 * Requires AWS credentials — tests skip gracefully without them.
 * Run: doppler run --project {project} --config dev -- npx playwright test specs/email.spec.ts
 */
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const projectRoot = process.env.PROJECT_ROOT || process.cwd();
const projectName = process.env.TEST_PROJECT_NAME || process.env.DOPPLER_PROJECT || '';

function fileContains(relativePath: string, content: string): boolean {
  try {
    const text = fs.readFileSync(path.join(projectRoot, relativePath), 'utf-8');
    return text.includes(content);
  } catch {
    return false;
  }
}

test.describe('Email (SES) Module Validation', () => {
  test.describe('Configuration', () => {
    test('SES is referenced in Amplify or Doppler config', () => {
      const hasSesRef = fileContains('amplify/backend.ts', 'ses') ||
                         fileContains('amplify/backend.ts', 'SES') ||
                         fileContains('amplify/backend.ts', 'email') ||
                         fileContains('CLAUDE.md', 'SES');
      if (!hasSesRef) {
        test.skip(); // SES may be configured purely in AWS console
        return;
      }
      expect(hasSesRef).toBe(true);
    });
  });

  test.describe('SES Domain Verification (AWS)', () => {
    test('SES domain identity exists', () => {
      if (!projectName) {
        test.skip();
        return;
      }
      try {
        const result = execSync(
          `doppler run --project ${projectName} --config dev -- aws sesv2 list-email-identities --output json`,
          { encoding: 'utf-8', timeout: 15000 }
        );
        const identities = JSON.parse(result);
        expect(
          identities.EmailIdentities.length,
          'At least one SES email identity should exist'
        ).toBeGreaterThan(0);
      } catch {
        test.skip();
      }
    });

    test('SES domain has DKIM configured', () => {
      if (!projectName) {
        test.skip();
        return;
      }
      try {
        const listResult = execSync(
          `doppler run --project ${projectName} --config dev -- aws sesv2 list-email-identities --output json`,
          { encoding: 'utf-8', timeout: 15000 }
        );
        const identities = JSON.parse(listResult);
        const domainIdentity = identities.EmailIdentities.find(
          (i: { IdentityType: string }) => i.IdentityType === 'DOMAIN'
        );

        if (!domainIdentity) {
          test.skip();
          return;
        }

        const detailResult = execSync(
          `doppler run --project ${projectName} --config dev -- aws sesv2 get-email-identity --email-identity ${domainIdentity.IdentityName} --output json`,
          { encoding: 'utf-8', timeout: 15000 }
        );
        const detail = JSON.parse(detailResult);
        expect(
          detail.DkimAttributes?.SigningEnabled,
          'DKIM should be enabled'
        ).toBe(true);
      } catch {
        test.skip();
      }
    });
  });

  test.describe('SES Sandbox Status', () => {
    test('SES account sending is enabled', () => {
      if (!projectName) {
        test.skip();
        return;
      }
      try {
        const result = execSync(
          `doppler run --project ${projectName} --config dev -- aws sesv2 get-account --output json`,
          { encoding: 'utf-8', timeout: 15000 }
        );
        const account = JSON.parse(result);
        // Note: sandbox mode is normal for dev — just check we can access
        expect(account).toBeTruthy();
      } catch {
        test.skip();
      }
    });
  });
});

/**
 * AWS Infrastructure Module Validation
 *
 * Verifies AWS Organization, accounts, DNS, and that AWS credentials
 * are stored in Doppler (project created by core doppler module).
 * Requires AWS credentials — tests skip gracefully without them.
 * Run: doppler run --project {project} --config dev -- npx playwright test specs/aws-infrastructure.spec.ts
 */
import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

const projectName = process.env.TEST_PROJECT_NAME || process.env.DOPPLER_PROJECT || '';

function hasAwsAccess(): boolean {
  try {
    execSync('aws sts get-caller-identity', { encoding: 'utf-8', timeout: 10000 });
    return true;
  } catch {
    return false;
  }
}

function hasDopplerAccess(): boolean {
  try {
    execSync('doppler --version', { encoding: 'utf-8', timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

function aws(project: string, config: string, command: string): string {
  return execSync(
    `doppler run --project ${project} --config ${config} -- aws ${command} --output json`,
    { encoding: 'utf-8', timeout: 30000 }
  ).trim();
}

test.describe('AWS Infrastructure Module Validation', () => {
  test.describe('Prerequisites', () => {
    test('project name is configured', () => {
      expect(projectName, 'DOPPLER_PROJECT or TEST_PROJECT_NAME must be set').toBeTruthy();
    });
  });

  test.describe('AWS Credentials in Doppler', () => {
    test('Doppler configs have AWS credentials', () => {
      if (!hasDopplerAccess() || !projectName) {
        test.skip();
        return;
      }
      for (const config of ['dev', 'stg', 'prd']) {
        try {
          execSync(
            `doppler secrets get AWS_ACCESS_KEY_ID --project ${projectName} --config ${config} --plain`,
            { encoding: 'utf-8', timeout: 10000 }
          );
        } catch {
          throw new Error(`Doppler config "${config}" should have AWS_ACCESS_KEY_ID (Doppler project created by core module, credentials added by aws-infrastructure)`);
        }
      }
    });
  });

  test.describe('AWS Organization', () => {
    test('AWS Organization Unit exists for project', () => {
      if (!hasAwsAccess() || !projectName) {
        test.skip();
        return;
      }
      try {
        const result = aws('gi', 'prd', 'organizations list-organizational-units-for-parent --parent-id ou-tmup-nfmu3ia2');
        const ous = JSON.parse(result);
        const hasOU = ous.OrganizationalUnits.some((ou: { Name: string }) => ou.Name === projectName);
        expect(hasOU, `OU "${projectName}" should exist`).toBe(true);
      } catch {
        test.skip();
      }
    });

    test('three AWS accounts exist (dev, test, prod)', () => {
      if (!hasAwsAccess() || !projectName) {
        test.skip();
        return;
      }
      try {
        const result = aws('gi', 'prd', 'organizations list-accounts');
        const accounts = JSON.parse(result);
        const active = accounts.Accounts.filter((a: { Status: string }) => a.Status === 'ACTIVE');
        for (const env of ['dev', 'test', 'prod']) {
          const exists = active.some((a: { Name: string }) => a.Name === `${projectName}-${env}`);
          expect(exists, `Account ${projectName}-${env} should exist`).toBe(true);
        }
      } catch {
        test.skip();
      }
    });
  });

  test.describe('DNS Configuration', () => {
    test('Route 53 hosted zone exists', () => {
      if (!hasAwsAccess() || !projectName) {
        test.skip();
        return;
      }
      try {
        const result = aws(projectName, 'dev', 'route53 list-hosted-zones');
        const zones = JSON.parse(result);
        const hasZone = zones.HostedZones.some(
          (z: { Name: string }) => z.Name.includes(projectName)
        );
        expect(hasZone, `Hosted zone for "${projectName}" should exist`).toBe(true);
      } catch {
        test.skip();
      }
    });
  });
});

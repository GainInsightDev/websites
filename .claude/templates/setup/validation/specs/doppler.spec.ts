/**
 * Doppler Core Module Validation
 *
 * Verifies Doppler CLI is available and project exists with basic configs.
 * This is a core module — always included in Minimal Setup.
 * AWS credentials are validated separately by aws-infrastructure.spec.ts.
 *
 * Run: PROJECT_ROOT=/path/to/project npx playwright test specs/doppler.spec.ts
 */
import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

const projectName = process.env.TEST_PROJECT_NAME || process.env.DOPPLER_PROJECT || '';

function hasDopplerCli(): boolean {
  try {
    execSync('doppler --version', { encoding: 'utf-8', timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

test.describe('Doppler Core Module Validation', () => {
  test.describe('CLI', () => {
    test('Doppler CLI is installed', () => {
      if (!hasDopplerCli()) {
        test.skip();
        return;
      }
      const version = execSync('doppler --version', { encoding: 'utf-8' });
      expect(version).toMatch(/v\d+/);
    });
  });

  test.describe('Project', () => {
    test('project name is configured', () => {
      expect(projectName, 'DOPPLER_PROJECT or TEST_PROJECT_NAME must be set').toBeTruthy();
    });

    test('Doppler project exists', () => {
      if (!hasDopplerCli() || !projectName) {
        test.skip();
        return;
      }
      try {
        const result = execSync(
          `doppler projects get ${projectName} --json 2>/dev/null`,
          { encoding: 'utf-8', timeout: 15000 }
        );
        expect(result).toBeTruthy();
      } catch {
        throw new Error(`Doppler project "${projectName}" should exist`);
      }
    });

    test('Doppler project has dev config', () => {
      if (!hasDopplerCli() || !projectName) {
        test.skip();
        return;
      }
      try {
        const result = execSync(
          `doppler configs --project ${projectName} --json 2>/dev/null`,
          { encoding: 'utf-8', timeout: 15000 }
        );
        const configs = JSON.parse(result);
        const configNames = Array.isArray(configs)
          ? configs.map((c: { name?: string }) => c.name)
          : [];
        expect(configNames).toContain('dev');
      } catch {
        throw new Error(`Doppler project "${projectName}" should have a "dev" config`);
      }
    });
  });
});

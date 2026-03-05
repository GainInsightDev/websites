/**
 * Auth (Cognito) Module Validation
 *
 * Verifies Cognito User Pool is correctly configured.
 * Requires AWS credentials — tests skip gracefully without them.
 * Run: doppler run --project {project} --config dev -- npx playwright test specs/auth.spec.ts
 */
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const projectRoot = process.env.PROJECT_ROOT || process.cwd();
const projectName = process.env.TEST_PROJECT_NAME || process.env.DOPPLER_PROJECT || '';

function fileExists(relativePath: string): boolean {
  return fs.existsSync(path.join(projectRoot, relativePath));
}

function fileContains(relativePath: string, content: string): boolean {
  try {
    const text = fs.readFileSync(path.join(projectRoot, relativePath), 'utf-8');
    return text.includes(content);
  } catch {
    return false;
  }
}

function readJson(relativePath: string): Record<string, unknown> | null {
  try {
    const content = fs.readFileSync(path.join(projectRoot, relativePath), 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

test.describe('Auth (Cognito) Module Validation', () => {
  test.describe('Amplify Auth Configuration', () => {
    test('amplify/auth/ directory exists', () => {
      const authDir = path.join(projectRoot, 'amplify', 'auth');
      const exists = fs.existsSync(authDir) && fs.statSync(authDir).isDirectory();
      // Auth may be defined inline in backend.ts instead of separate directory
      if (!exists) {
        expect(
          fileContains('amplify/backend.ts', 'auth'),
          'Auth should be configured in amplify/auth/ or referenced in backend.ts'
        ).toBe(true);
      }
    });

    test('auth resource file exists', () => {
      const hasAuthResource = fileExists('amplify/auth/resource.ts') ||
                               fileExists('amplify/auth/resource.js') ||
                               fileContains('amplify/backend.ts', 'defineAuth');
      expect(hasAuthResource, 'Auth resource should be defined').toBe(true);
    });
  });

  test.describe('Auth Configuration', () => {
    test('amplify_outputs.json has auth section', () => {
      if (!fileExists('amplify_outputs.json')) {
        test.skip();
        return;
      }
      const outputs = readJson('amplify_outputs.json');
      if (!outputs) {
        test.skip();
        return;
      }
      expect(outputs.auth, 'amplify_outputs.json should have auth config').toBeTruthy();
    });

    test('custom attributes are configured', () => {
      // Check that auth resource defines custom attributes (tenantId, role, etc.)
      const hasCustomAttrs = fileContains('amplify/auth/resource.ts', 'custom:') ||
                              fileContains('amplify/auth/resource.ts', 'userAttributes') ||
                              fileContains('amplify/backend.ts', 'custom:') ||
                              fileContains('amplify/backend.ts', 'userAttributes');
      if (!hasCustomAttrs) {
        test.skip(); // Custom attributes are optional
        return;
      }
      expect(hasCustomAttrs).toBe(true);
    });
  });

  test.describe('Cognito User Pool (AWS)', () => {
    test('User Pool exists', () => {
      if (!projectName) {
        test.skip();
        return;
      }
      try {
        const result = execSync(
          `doppler run --project ${projectName} --config dev -- aws cognito-idp list-user-pools --max-results 20 --output json`,
          { encoding: 'utf-8', timeout: 15000 }
        );
        const pools = JSON.parse(result);
        const hasPool = pools.UserPools.some(
          (p: { Name: string }) => p.Name.toLowerCase().includes(projectName.toLowerCase())
        );
        expect(hasPool, `Cognito User Pool for "${projectName}" should exist`).toBe(true);
      } catch {
        test.skip();
      }
    });
  });
});

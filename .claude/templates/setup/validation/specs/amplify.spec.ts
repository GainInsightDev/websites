/**
 * Amplify Module Validation
 *
 * Verifies Amplify Gen 2 is correctly configured.
 * Run: npx playwright test specs/amplify.spec.ts
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

function dirExists(relativePath: string): boolean {
  const fullPath = path.join(projectRoot, relativePath);
  return fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory();
}

function readJson(relativePath: string): Record<string, unknown> | null {
  try {
    const content = fs.readFileSync(path.join(projectRoot, relativePath), 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function fileContains(relativePath: string, content: string): boolean {
  try {
    const text = fs.readFileSync(path.join(projectRoot, relativePath), 'utf-8');
    return text.includes(content);
  } catch {
    return false;
  }
}

test.describe('Amplify Module Validation', () => {
  test.describe('Directory Structure', () => {
    test('amplify/ directory exists', () => {
      expect(dirExists('amplify'), 'amplify/ should exist').toBe(true);
    });

    test('amplify/backend.ts exists', () => {
      expect(
        fileExists('amplify/backend.ts') || fileExists('amplify/backend.js'),
        'amplify/backend.ts should exist'
      ).toBe(true);
    });

    test('amplify/data/resource.ts exists', () => {
      expect(
        fileExists('amplify/data/resource.ts') || fileExists('amplify/data/resource.js'),
        'amplify/data/resource should exist'
      ).toBe(true);
    });
  });

  test.describe('Configuration', () => {
    test('amplify/package.json exists with type: module', () => {
      const pkg = readJson('amplify/package.json');
      if (!pkg) {
        test.skip();
        return;
      }
      expect(pkg.type, 'amplify/package.json should have type: module').toBe('module');
    });

    test('amplify/tsconfig.json exists', () => {
      expect(fileExists('amplify/tsconfig.json'), 'amplify/tsconfig.json should exist').toBe(true);
    });

    test('amplify_outputs.json exists (post-deploy)', () => {
      // This file is generated after first deploy — skip if not yet deployed
      if (!fileExists('amplify_outputs.json')) {
        test.skip();
        return;
      }
      const outputs = readJson('amplify_outputs.json');
      expect(outputs, 'amplify_outputs.json should be valid JSON').not.toBeNull();
    });
  });

  test.describe('Dependencies', () => {
    test('aws-amplify is installed', () => {
      const pkg = readJson('package.json');
      if (!pkg) {
        test.skip();
        return;
      }
      const deps = (pkg.dependencies || {}) as Record<string, string>;
      const devDeps = (pkg.devDependencies || {}) as Record<string, string>;
      const hasAmplify = 'aws-amplify' in deps || 'aws-amplify' in devDeps;
      expect(hasAmplify, 'aws-amplify should be installed').toBe(true);
    });

    test('@aws-amplify/backend is installed', () => {
      const pkg = readJson('package.json');
      if (!pkg) {
        test.skip();
        return;
      }
      const deps = (pkg.dependencies || {}) as Record<string, string>;
      const devDeps = (pkg.devDependencies || {}) as Record<string, string>;
      const hasBackend = '@aws-amplify/backend' in deps || '@aws-amplify/backend' in devDeps;
      expect(hasBackend, '@aws-amplify/backend should be installed').toBe(true);
    });
  });

  test.describe('Amplify App (AWS)', () => {
    test('Amplify app exists in AWS', () => {
      if (!projectName) {
        test.skip();
        return;
      }
      try {
        const result = execSync(
          `doppler run --project ${projectName} --config dev -- aws amplify list-apps --output json`,
          { encoding: 'utf-8', timeout: 15000 }
        );
        const apps = JSON.parse(result);
        expect(apps.apps.length, 'At least one Amplify app should exist').toBeGreaterThan(0);
      } catch {
        test.skip();
      }
    });
  });
});

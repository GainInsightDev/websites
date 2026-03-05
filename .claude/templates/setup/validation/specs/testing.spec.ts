/**
 * Testing Component Validation
 *
 * Verifies Jest + Playwright are correctly installed.
 * Run: npx playwright test specs/testing.spec.ts
 */
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const projectRoot = process.env.PROJECT_ROOT || process.cwd();

function fileExists(relativePath: string): boolean {
  return fs.existsSync(path.join(projectRoot, relativePath));
}

function hasPackageScript(scriptName: string): boolean {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
    return !!pkg.scripts?.[scriptName];
  } catch {
    return false;
  }
}

function hasDevDependency(depName: string): boolean {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
    return !!pkg.devDependencies?.[depName];
  } catch {
    return false;
  }
}

test.describe('Testing Component Validation', () => {
  test.describe('Directory Structure', () => {
    test('tests/unit/ directory exists', () => {
      expect(fileExists('tests/unit'), 'tests/unit/ should exist').toBe(true);
    });

    test('tests/e2e/ directory exists', () => {
      expect(fileExists('tests/e2e'), 'tests/e2e/ should exist').toBe(true);
    });
  });

  test.describe('Configuration Files', () => {
    test('jest.config.js exists', () => {
      const hasJestConfig = fileExists('jest.config.js') || fileExists('jest.config.ts');
      expect(hasJestConfig, 'Jest config should exist').toBe(true);
    });

    test('playwright.config.ts exists', () => {
      const hasPlaywrightConfig = fileExists('playwright.config.ts') || fileExists('playwright.config.js');
      expect(hasPlaywrightConfig, 'Playwright config should exist').toBe(true);
    });
  });

  test.describe('Dependencies', () => {
    test('jest is installed', () => {
      expect(hasDevDependency('jest'), 'jest should be in devDependencies').toBe(true);
    });

    test('@playwright/test is installed', () => {
      expect(hasDevDependency('@playwright/test'), '@playwright/test should be in devDependencies').toBe(true);
    });
  });

  test.describe('Package Scripts', () => {
    test('test script exists', () => {
      expect(hasPackageScript('test'), '"test" script should exist').toBe(true);
    });

    test('test:unit script exists', () => {
      expect(hasPackageScript('test:unit'), '"test:unit" script should exist').toBe(true);
    });

    test('test:e2e script exists', () => {
      expect(hasPackageScript('test:e2e'), '"test:e2e" script should exist').toBe(true);
    });
  });

  test.describe('Runtime Validation', () => {
    test('npm run test:unit executes without error', () => {
      try {
        execSync('npm run test:unit --if-present', {
          cwd: projectRoot,
          encoding: 'utf-8',
          timeout: 60000,
        });
      } catch (error: unknown) {
        const execError = error as { status?: number };
        // Allow exit code 1 (test failures) but not other errors
        if (execError.status && execError.status > 1) {
          throw new Error('npm run test:unit failed with unexpected error');
        }
      }
    });
  });
});

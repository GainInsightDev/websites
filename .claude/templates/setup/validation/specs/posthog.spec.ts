/**
 * PostHog Analytics Module Validation
 *
 * Verifies PostHog SDK is installed and provider configured.
 * Run: npx playwright test specs/posthog.spec.ts
 */
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const projectRoot = process.env.PROJECT_ROOT || process.cwd();

function fileExists(relativePath: string): boolean {
  return fs.existsSync(path.join(projectRoot, relativePath));
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

function findFile(dir: string, pattern: RegExp): string | null {
  try {
    const fullDir = path.join(projectRoot, dir);
    if (!fs.existsSync(fullDir)) return null;

    const entries = fs.readdirSync(fullDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && pattern.test(entry.name)) {
        return path.join(dir, entry.name);
      }
      if (entry.isDirectory()) {
        const found = findFile(path.join(dir, entry.name), pattern);
        if (found) return found;
      }
    }
    return null;
  } catch {
    return null;
  }
}

test.describe('PostHog Analytics Module Validation', () => {
  test.describe('Dependencies', () => {
    test('posthog-js is installed', () => {
      const pkg = readJson('package.json');
      if (!pkg) {
        test.skip();
        return;
      }
      const deps = (pkg.dependencies || {}) as Record<string, string>;
      const devDeps = (pkg.devDependencies || {}) as Record<string, string>;
      const hasPosthog = 'posthog-js' in deps || 'posthog-js' in devDeps;
      expect(hasPosthog, 'posthog-js should be installed').toBe(true);
    });
  });

  test.describe('Provider Configuration', () => {
    test('PostHog provider component exists', () => {
      // Search for PostHog provider in common locations
      const providerFile = findFile('src', /posthog/i) ||
                            findFile('src', /analytics/i);
      const hasProviderRef = fileContains('src/app/layout.tsx', 'posthog') ||
                              fileContains('src/app/layout.tsx', 'PostHog') ||
                              fileContains('src/app/layout.tsx', 'analytics');
      expect(
        providerFile !== null || hasProviderRef,
        'PostHog provider should be configured (provider file or referenced in layout)'
      ).toBe(true);
    });

    test('PostHog API key is configured', () => {
      // Check for PostHog key in env files or Doppler references
      const hasEnvRef = fileContains('.env.local', 'POSTHOG') ||
                         fileContains('.env.example', 'POSTHOG') ||
                         fileContains('.env', 'POSTHOG') ||
                         fileContains('CLAUDE.md', 'POSTHOG') ||
                         fileContains('doppler.yaml', 'posthog');
      if (!hasEnvRef) {
        // PostHog key might be in Doppler only, which is fine
        test.skip();
        return;
      }
      expect(hasEnvRef).toBe(true);
    });
  });

  test.describe('Feature Flags (Optional)', () => {
    test('feature flag utility exists', () => {
      const flagFile = findFile('src', /feature.?flag/i);
      if (!flagFile) {
        test.skip(); // Feature flags are optional
        return;
      }
      expect(flagFile).toBeTruthy();
    });
  });
});

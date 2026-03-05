/**
 * Security Component Validation
 *
 * Verifies Dependabot is correctly configured.
 * Run: npx playwright test specs/security.spec.ts
 */
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

const projectRoot = process.env.PROJECT_ROOT || process.cwd();

function fileExists(relativePath: string): boolean {
  return fs.existsSync(path.join(projectRoot, relativePath));
}

function readYaml(relativePath: string): Record<string, unknown> | null {
  try {
    const content = fs.readFileSync(path.join(projectRoot, relativePath), 'utf-8');
    return yaml.load(content) as Record<string, unknown>;
  } catch {
    return null;
  }
}

test.describe('Security Component Validation', () => {
  test.describe('Dependabot Configuration', () => {
    test('.github/dependabot.yml exists', () => {
      expect(fileExists('.github/dependabot.yml'), 'dependabot.yml should exist').toBe(true);
    });

    test('dependabot.yml is valid YAML', () => {
      const config = readYaml('.github/dependabot.yml');
      expect(config, 'dependabot.yml should be valid YAML').not.toBeNull();
    });

    test('dependabot.yml has version 2', () => {
      const config = readYaml('.github/dependabot.yml');
      expect(config).not.toBeNull();
      if (!config) return;

      expect(config.version, 'Dependabot config should be version 2').toBe(2);
    });

    test('dependabot.yml has updates configured', () => {
      const config = readYaml('.github/dependabot.yml');
      expect(config).not.toBeNull();
      if (!config) return;

      const updates = config.updates as Array<Record<string, unknown>>;
      expect(Array.isArray(updates), 'updates should be an array').toBe(true);
      expect(updates.length, 'Should have at least one update config').toBeGreaterThan(0);
    });

    test('dependabot.yml monitors npm packages', () => {
      const config = readYaml('.github/dependabot.yml');
      expect(config).not.toBeNull();
      if (!config) return;

      const updates = config.updates as Array<Record<string, unknown>>;
      const hasNpm = updates.some(u => u['package-ecosystem'] === 'npm');
      expect(hasNpm, 'Should monitor npm packages').toBe(true);
    });
  });

  test.describe('Gitignore Security', () => {
    test('.gitignore exists', () => {
      expect(fileExists('.gitignore'), '.gitignore should exist').toBe(true);
    });

    test('.gitignore excludes .env files', () => {
      if (!fileExists('.gitignore')) {
        test.skip();
        return;
      }

      const content = fs.readFileSync(path.join(projectRoot, '.gitignore'), 'utf-8');
      const excludesEnv = content.includes('.env') || content.includes('*.env');
      expect(excludesEnv, '.gitignore should exclude .env files').toBe(true);
    });

    test('.gitignore excludes node_modules', () => {
      if (!fileExists('.gitignore')) {
        test.skip();
        return;
      }

      const content = fs.readFileSync(path.join(projectRoot, '.gitignore'), 'utf-8');
      expect(content.includes('node_modules'), '.gitignore should exclude node_modules').toBe(true);
    });
  });
});

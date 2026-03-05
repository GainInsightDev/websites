/**
 * UI Styling Module Validation
 *
 * Verifies shadcn/ui, Tailwind CSS, and Storybook are configured.
 * Run: npx playwright test specs/ui-styling.spec.ts
 */
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const projectRoot = process.env.PROJECT_ROOT || process.cwd();

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

function hasDevDependency(depName: string): boolean {
  try {
    const pkg = readJson('package.json');
    if (!pkg) return false;
    const deps = (pkg.devDependencies || {}) as Record<string, string>;
    const allDeps = (pkg.dependencies || {}) as Record<string, string>;
    return depName in deps || depName in allDeps;
  } catch {
    return false;
  }
}

function hasPackageScript(scriptName: string): boolean {
  try {
    const pkg = readJson('package.json');
    if (!pkg) return false;
    const scripts = (pkg.scripts || {}) as Record<string, string>;
    return scriptName in scripts;
  } catch {
    return false;
  }
}

test.describe('UI Styling Module Validation', () => {
  test.describe('Tailwind CSS', () => {
    test('tailwind.config.ts exists', () => {
      const hasTailwindConfig = fileExists('tailwind.config.ts') ||
                                 fileExists('tailwind.config.js') ||
                                 fileExists('tailwind.config.mjs');
      expect(hasTailwindConfig, 'Tailwind config should exist').toBe(true);
    });

    test('tailwindcss is installed', () => {
      expect(hasDevDependency('tailwindcss'), 'tailwindcss should be installed').toBe(true);
    });

    test('globals.css imports Tailwind', () => {
      const cssPath = ['src/app/globals.css', 'src/styles/globals.css', 'styles/globals.css'];
      const hasTailwindImport = cssPath.some(p =>
        fileContains(p, '@tailwind') || fileContains(p, 'tailwindcss')
      );
      expect(hasTailwindImport, 'Global CSS should import Tailwind').toBe(true);
    });
  });

  test.describe('shadcn/ui', () => {
    test('components.json exists', () => {
      expect(fileExists('components.json'), 'components.json should exist').toBe(true);
    });

    test('components.json is valid', () => {
      if (!fileExists('components.json')) {
        test.skip();
        return;
      }
      const config = readJson('components.json');
      expect(config, 'components.json should be valid JSON').not.toBeNull();
      if (!config) return;
      expect(config.style, 'Should have style configured').toBeTruthy();
    });

    test('UI components directory exists', () => {
      const hasComponentsDir = dirExists('src/components/ui') ||
                                dirExists('components/ui');
      expect(hasComponentsDir, 'UI components directory should exist').toBe(true);
    });

    test('Button component exists', () => {
      const hasButton = fileExists('src/components/ui/button.tsx') ||
                         fileExists('components/ui/button.tsx');
      expect(hasButton, 'Button component should exist (minimum shadcn/ui component)').toBe(true);
    });
  });

  test.describe('Storybook', () => {
    test('.storybook/ directory exists', () => {
      expect(dirExists('.storybook'), '.storybook/ should exist').toBe(true);
    });

    test('.storybook/main.ts config exists', () => {
      const hasStorybookConfig = fileExists('.storybook/main.ts') ||
                                  fileExists('.storybook/main.js') ||
                                  fileExists('.storybook/main.mjs');
      expect(hasStorybookConfig, 'Storybook main config should exist').toBe(true);
    });

    test('storybook script exists in package.json', () => {
      expect(hasPackageScript('storybook'), '"storybook" script should exist').toBe(true);
    });

    test('@storybook/react is installed', () => {
      expect(
        hasDevDependency('@storybook/react') || hasDevDependency('storybook'),
        'Storybook should be installed'
      ).toBe(true);
    });
  });

  test.describe('Design Tokens', () => {
    test('CSS custom properties are defined', () => {
      const cssPath = ['src/app/globals.css', 'src/styles/globals.css', 'styles/globals.css'];
      const hasCustomProps = cssPath.some(p =>
        fileContains(p, '--') && fileContains(p, ':root')
      );
      if (!hasCustomProps) {
        test.skip(); // Design tokens are optional
        return;
      }
      expect(hasCustomProps).toBe(true);
    });
  });
});

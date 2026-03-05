/**
 * Flutter Module Validation
 *
 * Verifies Flutter SDK, project structure, and Widgetbook are configured.
 * Run: npx playwright test specs/flutter.spec.ts
 */
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const projectRoot = process.env.PROJECT_ROOT || process.cwd();

function fileExists(relativePath: string): boolean {
  return fs.existsSync(path.join(projectRoot, relativePath));
}

function dirExists(relativePath: string): boolean {
  const fullPath = path.join(projectRoot, relativePath);
  return fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory();
}

function fileContains(relativePath: string, content: string): boolean {
  try {
    const text = fs.readFileSync(path.join(projectRoot, relativePath), 'utf-8');
    return text.includes(content);
  } catch {
    return false;
  }
}

test.describe('Flutter Module Validation', () => {
  test.describe('Flutter SDK', () => {
    test('Flutter CLI is available', () => {
      try {
        const result = execSync('flutter --version', { encoding: 'utf-8', timeout: 30000 });
        expect(result).toMatch(/Flutter/);
      } catch {
        test.skip(); // Flutter may not be installed on this machine
      }
    });
  });

  test.describe('Project Structure', () => {
    test('Flutter app directory exists', () => {
      // In monorepo, Flutter is typically in packages/mobile or mobile/
      const hasFlutterDir = dirExists('mobile') ||
                             dirExists('packages/mobile') ||
                             dirExists('flutter_app') ||
                             fileExists('pubspec.yaml'); // Or Flutter IS the root project
      expect(hasFlutterDir, 'Flutter project directory should exist').toBe(true);
    });

    test('pubspec.yaml exists', () => {
      const hasPubspec = fileExists('pubspec.yaml') ||
                          fileExists('mobile/pubspec.yaml') ||
                          fileExists('packages/mobile/pubspec.yaml');
      expect(hasPubspec, 'pubspec.yaml should exist').toBe(true);
    });

    test('lib/ directory exists', () => {
      const hasLib = dirExists('lib') ||
                      dirExists('mobile/lib') ||
                      dirExists('packages/mobile/lib');
      expect(hasLib, 'Flutter lib/ directory should exist').toBe(true);
    });
  });

  test.describe('Amplify Integration', () => {
    test('amplify_flutter is in pubspec.yaml', () => {
      const pubspecPaths = ['pubspec.yaml', 'mobile/pubspec.yaml', 'packages/mobile/pubspec.yaml'];
      const hasAmplifyFlutter = pubspecPaths.some(p =>
        fileContains(p, 'amplify_flutter') || fileContains(p, 'amplify_core')
      );
      if (!hasAmplifyFlutter) {
        test.skip(); // Amplify integration is optional for Flutter
        return;
      }
      expect(hasAmplifyFlutter).toBe(true);
    });

    test('shared amplify/ backend exists', () => {
      // In monorepo, Flutter shares the Amplify backend
      expect(dirExists('amplify'), 'Shared amplify/ directory should exist for monorepo').toBe(true);
    });
  });

  test.describe('Widgetbook', () => {
    test('Widgetbook directory exists', () => {
      const hasWidgetbook = dirExists('widgetbook') ||
                             dirExists('packages/widgetbook') ||
                             dirExists('mobile/widgetbook');
      if (!hasWidgetbook) {
        test.skip(); // Widgetbook is optional
        return;
      }
      expect(hasWidgetbook).toBe(true);
    });

    test('Widgetbook pubspec.yaml exists', () => {
      const hasPubspec = fileExists('widgetbook/pubspec.yaml') ||
                          fileExists('packages/widgetbook/pubspec.yaml');
      if (!hasPubspec) {
        test.skip();
        return;
      }
      expect(hasPubspec).toBe(true);
    });
  });
});

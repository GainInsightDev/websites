/**
 * Layer 3 - UI & Styling Setup Tests
 *
 * These tests validate that shadcn/ui components and Storybook
 * are correctly configured for a GainInsight Standard project.
 *
 * Run tests via Doppler to inject environment variables:
 *   doppler run --project {project} --config dev -- npx playwright test layer-3.spec.ts
 *
 * Prerequisites:
 *   - Layer 2 complete (testing framework)
 *
 * @documentation .claude/skills/af-gaininsight-standard/SKILL.md
 */
import { test, expect } from '@playwright/test';
import { execSync, spawn, ChildProcess } from 'child_process';
import * as http from 'http';
import {
  fileExists,
  readProjectFile,
  readPackageJson,
  hasDependency,
  hasScript,
  hasValidFrontmatter,
  fileContains,
} from '../helpers/files.js';
import { getProjectRoot } from '../helpers/config.js';
import { checkUrlStatus, TestServer } from '../helpers/http.js';

let storybookServer: TestServer | null = null;

test.afterAll(() => {
  if (storybookServer) {
    storybookServer.stop();
    storybookServer = null;
  }
});

test.describe('Layer 3: UI & Styling Setup', () => {
  test.describe.configure({ mode: 'serial' });

  test.describe('Background Validation', () => {
    test('Layer 2 is complete - Jest config exists', () => {
      const hasConfig = fileExists('jest.config.js') || fileExists('jest.config.ts');
      expect(hasConfig, 'Jest config should exist from Layer 2').toBe(true);
    });

    test('Layer 2 is complete - Playwright config exists', () => {
      expect(fileExists('playwright.config.ts'), 'Playwright config should exist from Layer 2').toBe(true);
    });

    test('shadcn/ui is initialized from Layer 1', () => {
      expect(fileExists('components.json'), 'components.json should exist from Layer 1 shadcn init').toBe(true);
      expect(fileExists('src/lib/utils.ts'), 'utils.ts should exist from Layer 1 shadcn init').toBe(true);
    });
  });

  test.describe('shadcn/ui Components', () => {
    test('Layer 1 components exist (Button, Card)', () => {
      expect(fileExists('src/components/ui/button.tsx'), 'Button component should exist').toBe(true);
      expect(fileExists('src/components/ui/card.tsx'), 'Card component should exist').toBe(true);
    });

    test('additional components are installed', () => {
      const components = [
        { name: 'Badge', path: 'src/components/ui/badge.tsx' },
        { name: 'Input', path: 'src/components/ui/input.tsx' },
        { name: 'Dialog', path: 'src/components/ui/dialog.tsx' },
      ];

      for (const { name, path } of components) {
        expect(fileExists(path), `${name} component should exist at ${path}`).toBe(true);
      }
    });

    test('utils.ts has cn() helper', () => {
      const content = readProjectFile('src/lib/utils.ts');
      expect(content).toContain('export function cn');
      expect(content).toContain('clsx');
      expect(content).toContain('twMerge');
    });

    test('components.json has shadcn configuration', () => {
      const content = readProjectFile('components.json');
      const config = JSON.parse(content);

      expect(config.$schema).toContain('ui.shadcn.com');
      expect(config.aliases).toBeTruthy();
      expect(config.aliases.components).toBeTruthy();
      expect(config.aliases.ui).toBeTruthy();
    });

    test('tailwind.config includes shadcn theme extensions', () => {
      const configPath = fileExists('tailwind.config.ts') ? 'tailwind.config.ts' : 'tailwind.config.js';
      expect(fileExists(configPath), 'Tailwind config should exist').toBe(true);

      const content = readProjectFile(configPath);
      expect(content).toMatch(/hsl\(var\(--/);
    });
  });

  test.describe('Storybook Configuration', () => {
    test('Storybook is installed as dev dependencies', () => {
      expect(hasDependency('@storybook/react'), 'Storybook React should be installed').toBe(true);
      expect(hasDependency('@storybook/nextjs'), 'Storybook Next.js should be installed').toBe(true);
    });

    test('.storybook/main.ts exists with framework config', () => {
      expect(fileExists('.storybook/main.ts'), 'Storybook main.ts should exist').toBe(true);

      const content = readProjectFile('.storybook/main.ts');
      expect(content).toContain('@storybook/nextjs');
      expect(content).toContain('stories/');
    });

    test('.storybook/preview.ts exists with theme config', () => {
      expect(fileExists('.storybook/preview.ts'), 'preview.ts should exist').toBe(true);

      const content = readProjectFile('.storybook/preview.ts');
      expect(content).toContain('globals.css');
    });

    test('component stories exist', () => {
      const stories = [
        { component: 'Button', path: 'stories/Button.stories.tsx' },
        { component: 'Card', path: 'stories/Card.stories.tsx' },
        { component: 'Badge', path: 'stories/Badge.stories.tsx' },
        { component: 'Input', path: 'stories/Input.stories.tsx' },
        { component: 'Dialog', path: 'stories/Dialog.stories.tsx' },
      ];

      for (const { component, path } of stories) {
        expect(fileExists(path), `Story for ${component} should exist at ${path}`).toBe(true);
      }
    });

    test('stories have multiple variants', () => {
      const storyFiles = [
        'stories/Button.stories.tsx',
        'stories/Badge.stories.tsx',
        'stories/Card.stories.tsx',
        'stories/Input.stories.tsx',
        'stories/Dialog.stories.tsx',
      ];

      for (const storyFile of storyFiles) {
        if (fileExists(storyFile)) {
          const content = readProjectFile(storyFile);
          const storyExports = content.match(/export const \w+: Story/g) || [];
          expect(storyExports.length, `${storyFile} should have multiple story variants`).toBeGreaterThan(1);
        }
      }
    });

    test('storybook scripts are configured', () => {
      const pkg = readPackageJson();
      const scripts = (pkg.scripts || {}) as Record<string, string>;

      expect(scripts['storybook'], 'storybook script should exist').toBeTruthy();
      expect(scripts['build-storybook'], 'build-storybook script should exist').toBeTruthy();
      expect(scripts['storybook']).toContain('storybook');
      expect(scripts['build-storybook']).toContain('storybook');
    });
  });

  test.describe('Theming', () => {
    test('globals.css includes CSS variables', () => {
      const content = readProjectFile('src/app/globals.css');

      const requiredVars = [
        '--background',
        '--foreground',
        '--primary',
        '--secondary',
        '--accent',
        '--destructive',
        '--border',
        '--ring',
        '--radius',
      ];

      for (const varName of requiredVars) {
        expect(content, `globals.css should include ${varName}`).toContain(varName);
      }
    });

    test('light and dark mode values are defined', () => {
      const content = readProjectFile('src/app/globals.css');

      expect(content, 'Should have :root for light mode').toContain(':root');
      expect(content, 'Should have .dark for dark mode').toContain('.dark');
    });
  });

  test.describe('Port Configuration', () => {
    test('PORT_INFO.md includes STORYBOOK_PORT', () => {
      expect(fileExists('PORT_INFO.md'), 'PORT_INFO.md should exist').toBe(true);

      const content = readProjectFile('PORT_INFO.md');
      expect(content).toContain('STORYBOOK_PORT');
      expect(content).toContain('6006');
    });
  });

  test.describe('Documentation', () => {
    test('docs/ui-styling.md exists', () => {
      expect(fileExists('docs/ui-styling.md')).toBe(true);
    });

    test('docs/ui-styling.md has valid frontmatter', () => {
      const fm = hasValidFrontmatter('docs/ui-styling.md');
      expect(fm.valid, 'Should have valid frontmatter block').toBe(true);
      expect(fm.hasTitle, 'Should have title').toBe(true);
      expect(fm.hasCreated, 'Should have created').toBe(true);
      expect(fm.hasTags, 'Should have tags').toBe(true);
    });

    test('docs/README.md lists ui-styling.md as a child', () => {
      const content = readProjectFile('docs/README.md');
      expect(content).toContain('ui-styling.md');
    });
  });

  test.describe('Validation', () => {
    test('UI & Styling setup is complete', () => {
      expect(fileExists('src/components/ui/button.tsx'), 'Button should exist').toBe(true);
      expect(fileExists('src/components/ui/badge.tsx'), 'Badge should exist').toBe(true);
      expect(fileExists('.storybook/main.ts'), 'Storybook main.ts should exist').toBe(true);
    });

    test('TypeScript compiles without errors', () => {
      let exitCode = 0;
      try {
        execSync('npx tsc --noEmit', {
          cwd: getProjectRoot(),
          encoding: 'utf-8',
          timeout: 60000,
        });
      } catch (error: unknown) {
        const execError = error as { status?: number };
        exitCode = execError.status || 1;
      }

      expect(exitCode, 'TypeScript should compile without errors').toBe(0);
    });

    test('Storybook builds successfully', () => {
      let exitCode = 0;
      try {
        execSync('npm run build-storybook', {
          cwd: getProjectRoot(),
          encoding: 'utf-8',
          timeout: 120000,
          shell: '/bin/bash',
        });
      } catch (error: unknown) {
        const execError = error as { status?: number };
        exitCode = execError.status || 1;
      }

      expect(exitCode, 'Storybook build should exit with code 0').toBe(0);
      expect(fileExists('reports/storybook/index.html'), 'Storybook output should exist').toBe(true);
    });
  });

  test.describe('@runtime Storybook Server', () => {
    test('Storybook server starts and serves stories', async () => {
      storybookServer = new TestServer(6006);

      // Start Storybook
      const storybookProcess = spawn('npm', ['run', 'storybook', '--', '-p', '6006'], {
        cwd: getProjectRoot(),
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, CI: 'true' },
      });

      // Give it time to start
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Wait for ready (up to 60 seconds for Storybook)
      const ready = await storybookServer.waitUntilReady(60000);
      expect(ready, 'Storybook server should start').toBe(true);

      // Check response
      const response = await new Promise<{ statusCode: number; body: string }>((resolve, reject) => {
        http
          .get('http://localhost:6006', (res) => {
            let body = '';
            res.on('data', (chunk) => (body += chunk));
            res.on('end', () => resolve({ statusCode: res.statusCode || 0, body }));
          })
          .on('error', reject);
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toContain('Storybook');

      // Cleanup
      try {
        process.kill(-storybookProcess.pid!, 'SIGTERM');
      } catch {
        // Process may have already exited
      }
    });

    test('component stories exist and are valid', () => {
      const storyFiles = [
        'stories/Button.stories.tsx',
        'stories/Card.stories.tsx',
        'stories/Badge.stories.tsx',
        'stories/Input.stories.tsx',
        'stories/Dialog.stories.tsx',
      ];

      for (const storyFile of storyFiles) {
        expect(fileExists(storyFile), `${storyFile} should exist`).toBe(true);

        const content = readProjectFile(storyFile);
        expect(content, `${storyFile} should have meta`).toContain('const meta');
        expect(content, `${storyFile} should have exports`).toContain('export const');
      }
    });
  });
});

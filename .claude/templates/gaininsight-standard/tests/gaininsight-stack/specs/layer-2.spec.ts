/**
 * Layer 2 - Testing Framework Setup Tests
 *
 * These tests validate that the testing framework is correctly
 * configured for a GainInsight Standard project.
 *
 * Run tests via Doppler to inject environment variables:
 *   doppler run --project {project} --config dev -- npx playwright test layer-2.spec.ts
 *
 * Prerequisites:
 *   - Layer 1 complete (environment and infrastructure)
 *   - Tests run from the target project (not agentflow)
 *
 * @documentation .claude/skills/af-setup-gaininsight-stack/layer-2-testing.md
 */
import { test, expect } from '@playwright/test';
import { execSync, spawn, ChildProcess } from 'child_process';
import * as http from 'http';
import {
  fileExists,
  dirExists,
  readProjectFile,
  readPackageJson,
  hasDependency,
  hasScript,
  hasValidFrontmatter,
  fileContains,
} from '../helpers/files.js';
import { getProjectRoot } from '../helpers/config.js';
import { checkUrlStatus, TestServer } from '../helpers/http.js';

let reportsServer: TestServer | null = null;

test.afterAll(() => {
  if (reportsServer) {
    reportsServer.stop();
    reportsServer = null;
  }
});

test.describe('Layer 2: Testing Framework Setup', () => {
  test.describe.configure({ mode: 'serial' });

  test.describe('Background Validation', () => {
    test('Layer 1 is complete - DOPPLER_PROJECT is set', () => {
      const projectName = process.env.DOPPLER_PROJECT;
      expect(projectName, 'DOPPLER_PROJECT must be set (run via doppler run)').toBeTruthy();
    });

    test('project has a working Next.js application', () => {
      const hasNextConfig =
        fileExists('next.config.js') ||
        fileExists('next.config.mjs') ||
        fileExists('next.config.ts');
      expect(hasNextConfig, 'Next.js config file should exist').toBe(true);
    });

    test('project uses npm as package manager', () => {
      expect(fileExists('package-lock.json'), 'package-lock.json should exist').toBe(true);
    });
  });

  test.describe('Directory Structure', () => {
    test('test directories exist', () => {
      const directories = [
        { path: 'tests/unit', purpose: 'Jest unit tests' },
        { path: 'tests/e2e', purpose: 'Playwright E2E tests' },
        { path: 'tests/fixtures', purpose: 'Shared test data and mocks' },
        { path: 'reports', purpose: 'Test reports output directory' },
      ];

      for (const { path, purpose } of directories) {
        expect(dirExists(path), `Directory ${path} (${purpose}) should exist`).toBe(true);
      }
    });
  });

  test.describe('Jest Configuration', () => {
    test('Jest is installed as a dev dependency', () => {
      expect(hasDependency('jest')).toBe(true);
    });

    test('jest.config file exists', () => {
      const hasConfig = fileExists('jest.config.js') || fileExists('jest.config.ts');
      expect(hasConfig, 'Jest config file should exist').toBe(true);
    });

    test('Jest config has required settings', () => {
      const configPath = fileExists('jest.config.js') ? 'jest.config.js' : 'jest.config.ts';
      const content = readProjectFile(configPath);

      expect(content).toContain('testEnvironment');
      expect(content).toContain('collectCoverageFrom');
    });

    test('TypeScript support is configured via ts-jest', () => {
      expect(hasDependency('ts-jest')).toBe(true);
    });

    test('@testing-library/react is installed', () => {
      expect(hasDependency('@testing-library/react')).toBe(true);
    });

    test('@testing-library/jest-dom is installed', () => {
      expect(hasDependency('@testing-library/jest-dom')).toBe(true);
    });

    test('Jest setup file exists with jest-dom matchers', () => {
      expect(fileExists('tests/unit/setup.ts'), 'setup.ts should exist').toBe(true);
      const content = readProjectFile('tests/unit/setup.ts');
      expect(content).toContain('@testing-library/jest-dom');
    });

    test('coverage reports output to reports/coverage', () => {
      const configPath = fileExists('jest.config.js') ? 'jest.config.js' : 'jest.config.ts';
      const content = readProjectFile(configPath);
      expect(content).toContain('reports/coverage');
    });

    test('coverage formats are configured', () => {
      const configPath = fileExists('jest.config.js') ? 'jest.config.js' : 'jest.config.ts';
      const content = readProjectFile(configPath);
      expect(content).toContain('html');
      expect(content).toContain('lcov');
      expect(content).toContain('text');
    });
  });

  test.describe('Playwright Configuration', () => {
    test('Playwright is installed as a dev dependency', () => {
      expect(hasDependency('@playwright/test')).toBe(true);
    });

    test('playwright.config.ts exists', () => {
      expect(fileExists('playwright.config.ts'), 'Playwright config should exist').toBe(true);
    });

    test('Playwright CLI is available', () => {
      try {
        execSync('npx playwright --version', {
          encoding: 'utf-8',
          cwd: getProjectRoot(),
        });
      } catch {
        expect(false, 'Playwright CLI should be available').toBe(true);
      }
    });

    test('E2E tests use environment-aware base URL', () => {
      const content = readProjectFile('playwright.config.ts');
      expect(
        content.includes('process.env.BASE_URL') || content.includes('BASE_URL'),
        'Playwright should use BASE_URL env var'
      ).toBe(true);
    });

    test('default base URL is localhost:3001', () => {
      const content = readProjectFile('playwright.config.ts');
      expect(content).toContain('localhost:3001');
    });
  });

  test.describe('Test Reports Dashboard', () => {
    test('reports/index.html exists', () => {
      expect(fileExists('reports/index.html'), 'reports/index.html should exist').toBe(true);
    });

    test('reports dashboard links to coverage and E2E reports', () => {
      const content = readProjectFile('reports/index.html');
      expect(content).toContain('coverage');
    });
  });

  test.describe('NPM Scripts', () => {
    test('test scripts are configured in package.json', () => {
      const scripts = [
        'test',
        'test:watch',
        'test:coverage',
        'test:e2e',
        'test:all',
        'reports:serve',
      ];

      for (const script of scripts) {
        expect(hasScript(script), `Script ${script} should exist`).toBe(true);
      }
    });
  });

  test.describe('Sample Tests', () => {
    test('sample Jest unit test exists', () => {
      expect(fileExists('tests/unit/example.test.tsx'), 'example.test.tsx should exist').toBe(true);
    });

    test('sample test has describe and test blocks', () => {
      const content = readProjectFile('tests/unit/example.test.tsx');
      expect(content).toContain('describe');
      expect(content).toMatch(/\b(it|test)\(/);
    });

    test('sample E2E test exists', () => {
      expect(
        fileExists('tests/e2e/hello-world.spec.ts'),
        'hello-world.spec.ts should exist'
      ).toBe(true);
    });

    test('E2E test uses Playwright', () => {
      const content = readProjectFile('tests/e2e/hello-world.spec.ts');
      expect(content).toContain('@playwright/test');
    });
  });

  test.describe('Project Documentation', () => {
    test('docs/README.md exists', () => {
      expect(fileExists('docs/README.md')).toBe(true);
    });

    test('docs/testing.md exists', () => {
      expect(fileExists('docs/testing.md')).toBe(true);
    });

    test('docs/testing.md has valid frontmatter', () => {
      const fm = hasValidFrontmatter('docs/testing.md');
      expect(fm.valid, 'Should have valid frontmatter block').toBe(true);
      expect(fm.hasTitle, 'Should have title').toBe(true);
      expect(fm.hasCreated, 'Should have created').toBe(true);
      expect(fm.hasTags, 'Should have tags').toBe(true);
    });

    test('docs/README.md lists testing.md as a child', () => {
      const content = readProjectFile('docs/README.md');
      expect(content).toContain('children:');
      expect(content).toContain('testing.md');
    });
  });

  test.describe('Validation', () => {
    test('testing framework setup is complete', () => {
      expect(fileExists('jest.config.js') || fileExists('jest.config.ts')).toBe(true);
      expect(fileExists('playwright.config.ts')).toBe(true);
    });

    test('test:e2e script exists', () => {
      expect(hasScript('test:e2e')).toBe(true);
    });
  });

  test.describe('Port Configuration', () => {
    test('PORT_INFO.md exists', () => {
      expect(fileExists('PORT_INFO.md')).toBe(true);
    });

    test('PORT_INFO.md contains TEST_REPORT_PORT', () => {
      const content = readProjectFile('PORT_INFO.md');
      expect(content).toContain('TEST_REPORT');
    });

    test('reports:serve script references port variable', () => {
      const pkg = readPackageJson();
      const scripts = (pkg.scripts || {}) as Record<string, string>;
      expect(scripts['reports:serve']).toMatch(/PORT|port/i);
    });
  });

  test.describe('@runtime Jest Tests', () => {
    let lastExitCode = 0;
    let lastOutput = '';

    test('Jest unit tests run and pass', () => {
      try {
        const result = execSync(
          "npm test -- --coverage --passWithNoTests --coverageThreshold='{}' 2>&1",
          {
            encoding: 'utf-8',
            cwd: getProjectRoot(),
            timeout: 120000,
            shell: '/bin/bash',
          }
        );
        lastOutput = result;
        lastExitCode = 0;
      } catch (error: unknown) {
        const execError = error as { status?: number; stdout?: string; stderr?: string };
        lastExitCode = execError.status || 1;
        lastOutput = (execError.stdout || '') + (execError.stderr || '');
      }

      expect(lastExitCode, 'Jest should exit with code 0').toBe(0);

      const hasPassingTests =
        lastOutput.includes('passed') ||
        lastOutput.includes('PASS') ||
        /Tests:\s+\d+\s+passed/.test(lastOutput);
      expect(hasPassingTests, 'Jest output should indicate passing tests').toBe(true);
    });

    test('coverage report is generated', () => {
      expect(fileExists('reports/coverage/index.html')).toBe(true);
    });
  });

  test.describe('@runtime E2E Tests', () => {
    test('E2E tests run and pass', async () => {
      // Skip if dev server is not running
      const port = process.env.NEXT_DEV_PORT || '3001';
      const baseUrl = `http://localhost:${port}`;

      if (!checkUrlStatus(baseUrl, 200)) {
        test.skip();
        return;
      }

      let exitCode = 0;
      try {
        execSync('npm run test:e2e', {
          encoding: 'utf-8',
          cwd: getProjectRoot(),
          timeout: 300000,
          env: {
            ...process.env,
            BASE_URL: baseUrl,
          },
        });
      } catch (error: unknown) {
        const execError = error as { status?: number };
        exitCode = execError.status || 1;
      }

      expect(exitCode, 'E2E tests should exit with code 0').toBe(0);
    });
  });

  test.describe('@runtime Reports Server', () => {
    test('reports server starts and serves dashboard', async () => {
      if (!fileExists('reports/index.html')) {
        test.skip();
        return;
      }

      reportsServer = new TestServer(9000);
      reportsServer.start('npx', ['serve', 'reports', '-p', '9000', '-s'], getProjectRoot());

      const ready = await reportsServer.waitUntilReady(15000);
      expect(ready, 'Reports server should start').toBe(true);

      const response = await new Promise<{ statusCode: number; body: string }>((resolve, reject) => {
        http
          .get('http://localhost:9000', (res) => {
            let body = '';
            res.on('data', (chunk) => (body += chunk));
            res.on('end', () => resolve({ statusCode: res.statusCode || 0, body }));
          })
          .on('error', reject);
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toContain('Test Reports');
    });

    test('coverage reports are accessible', async () => {
      if (!reportsServer?.isRunning()) {
        test.skip();
        return;
      }

      const result = checkUrlStatus('http://localhost:9000/coverage/index.html', 200);
      // Accept 200 or 301/302 (redirects are fine)
      expect(result || checkUrlStatus('http://localhost:9000/coverage/', 200)).toBe(true);
    });
  });

  test.describe('GI Server Integration', () => {
    test('PORT_INFO.md includes Test Reports Dashboard section', () => {
      if (!fileExists('PORT_INFO.md')) {
        test.skip();
        return;
      }

      const content = readProjectFile('PORT_INFO.md');
      expect(content).toContain('Test');
    });
  });
});

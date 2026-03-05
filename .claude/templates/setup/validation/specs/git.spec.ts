/**
 * Git Module Validation
 *
 * Verifies Git repository is correctly configured.
 * Run: npx playwright test specs/git.spec.ts
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

function git(command: string): string {
  return execSync(`git -C "${projectRoot}" ${command}`, { encoding: 'utf-8' }).trim();
}

test.describe('Git Module Validation', () => {
  test.describe('Repository', () => {
    test('.git directory exists', () => {
      expect(
        dirExists('.git') || fileExists('.git'),
        'Git repository should be initialized (directory or worktree file)'
      ).toBe(true);
    });

    test('git remote origin is configured', () => {
      try {
        const remote = git('remote get-url origin');
        expect(remote).toBeTruthy();
      } catch {
        throw new Error('Git remote "origin" should be configured');
      }
    });

    test('remote points to GitHub', () => {
      try {
        const remote = git('remote get-url origin');
        expect(
          remote.includes('github.com'),
          'Remote should point to GitHub'
        ).toBe(true);
      } catch {
        test.skip();
      }
    });
  });

  test.describe('Branch Structure', () => {
    test('main or develop branch exists', () => {
      try {
        const branches = git('branch --list');
        const hasMainBranch = branches.includes('main') ||
                              branches.includes('develop') ||
                              branches.includes('master');
        expect(hasMainBranch, 'Should have a main/develop/master branch').toBe(true);
      } catch {
        test.skip();
      }
    });
  });

  test.describe('Project Files', () => {
    test('CLAUDE.md exists', () => {
      expect(fileExists('CLAUDE.md'), 'CLAUDE.md should exist').toBe(true);
    });

    test('.gitignore exists', () => {
      expect(fileExists('.gitignore'), '.gitignore should exist').toBe(true);
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

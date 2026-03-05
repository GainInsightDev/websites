/**
 * AgentFlow Module Validation
 *
 * Verifies the AgentFlow framework is correctly synced.
 * Run: npx playwright test specs/agentflow.spec.ts
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

function fileContains(relativePath: string, content: string): boolean {
  try {
    const text = fs.readFileSync(path.join(projectRoot, relativePath), 'utf-8');
    return text.includes(content);
  } catch {
    return false;
  }
}

test.describe('AgentFlow Module Validation', () => {
  test.describe('Framework Directory', () => {
    test('.claude/ directory exists', () => {
      expect(dirExists('.claude'), '.claude/ should exist').toBe(true);
    });

    test('.claude/CLAUDE-agentflow.md exists', () => {
      expect(fileExists('.claude/CLAUDE-agentflow.md'), 'Framework file should exist').toBe(true);
    });

    test('.claude/agents/ directory exists', () => {
      expect(dirExists('.claude/agents'), 'Agents directory should exist').toBe(true);
    });

    test('.claude/skills/ directory exists', () => {
      expect(dirExists('.claude/skills'), 'Skills directory should exist').toBe(true);
    });

    test('.claude/docs/ directory exists', () => {
      expect(dirExists('.claude/docs'), 'Docs directory should exist').toBe(true);
    });

    test('.claude/templates/ directory exists', () => {
      expect(dirExists('.claude/templates'), 'Templates directory should exist').toBe(true);
    });
  });

  test.describe('CLAUDE.md Integration', () => {
    test('CLAUDE.md exists', () => {
      expect(fileExists('CLAUDE.md'), 'CLAUDE.md should exist').toBe(true);
    });

    test('CLAUDE.md imports AgentFlow framework', () => {
      if (!fileExists('CLAUDE.md')) {
        test.skip();
        return;
      }
      const imports = fileContains('CLAUDE.md', '@.claude/CLAUDE-agentflow.md') ||
                      fileContains('CLAUDE.md', '.claude/CLAUDE-agentflow.md');
      expect(imports, 'CLAUDE.md should reference AgentFlow framework').toBe(true);
    });
  });

  test.describe('Framework Version', () => {
    test('CLAUDE-agentflow.md contains version marker', () => {
      if (!fileExists('.claude/CLAUDE-agentflow.md')) {
        test.skip();
        return;
      }
      expect(
        fileContains('.claude/CLAUDE-agentflow.md', 'AgentFlow'),
        'Framework file should contain AgentFlow marker'
      ).toBe(true);
    });
  });
});

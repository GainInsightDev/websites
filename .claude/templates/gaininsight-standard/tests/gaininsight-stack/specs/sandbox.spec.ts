/**
 * Sandbox Workflow - Developer Experience Validation Tests
 *
 * These tests validate that the full developer workflow works:
 * start-work creates worktree + sandbox, stop-work cleans up.
 *
 * Run tests via Doppler to inject environment variables:
 *   doppler run --project {project} --config dev -- npx playwright test sandbox.spec.ts
 *
 * Prerequisites:
 *   - Layer 1 infrastructure tests must pass first
 *   - Must run on GI server (start-work/stop-work available)
 *   - Test Linear issue must exist
 *
 * @documentation .claude/skills/af-setup-gaininsight-stack/SKILL.md
 */
import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { getProjectName } from '../helpers/config.js';
import { doppler, checkCloudFormationStack } from '../helpers/aws.js';
import { checkUrlStatus } from '../helpers/http.js';

interface SandboxTestContext {
  projectName: string;
  testIssueId: string;
  worktreePath: string;
  sandboxIdentifier: string;
  expectedCaddyUrl: string;
  devServerPort: number;
}

let ctx: SandboxTestContext | null = null;

/**
 * Get sandbox identifier from issue ID (matches Amplify's formula)
 */
function getSandboxIdentifier(issueId: string): string {
  const branchPart = issueId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 9);
  const hashPart = crypto.createHash('md5').update(issueId).digest('hex').substring(0, 4);
  return `${branchPart}${hashPart}`;
}

/**
 * Extract issue number from issue ID (e.g., "AFT-123" -> 123)
 */
function getIssueNumber(issueId: string): number {
  const match = issueId.match(/\d+/);
  if (!match) throw new Error(`Cannot extract number from issue ID: ${issueId}`);
  return parseInt(match[0], 10);
}

/**
 * Get port_base for a project from the project registry
 * Uses project-registry CLI tool (available on gidev server)
 */
function getPortBase(projectName: string): number {
  try {
    const result = execSync(`project-registry "${projectName}" port_base`, {
      encoding: 'utf-8',
      timeout: 5000,
    }).trim();
    const portBase = parseInt(result, 10);
    if (!isNaN(portBase)) return portBase;
  } catch {
    // Fallback if project-registry fails or project not found
  }
  return 3000; // Default fallback
}

/**
 * Run a command with extended timeout for sandbox operations
 */
function run(command: string, options: { cwd?: string } = {}): string {
  try {
    return execSync(command, {
      encoding: 'utf-8',
      cwd: options.cwd,
      timeout: 900000, // 15 minute timeout for sandbox operations
    }).trim();
  } catch (error: unknown) {
    const execError = error as { stderr?: string; stdout?: string; message: string };
    throw new Error(
      `Command failed: ${command}\nstderr: ${execError.stderr || ''}\nstdout: ${execError.stdout || ''}\n${execError.message}`
    );
  }
}

test.describe('Sandbox Workflow: Developer Experience Validation', () => {
  test.describe.configure({ mode: 'serial' });

  test.describe('Background Validation', () => {
    test('Layer 1 infrastructure tests have passed', () => {
      const projectName = getProjectName();

      try {
        const appId = run(`doppler secrets get AMPLIFY_APP_ID --project ${projectName} --config dev --plain`);
        expect(appId, 'AMPLIFY_APP_ID should be configured').toBeTruthy();
      } catch {
        throw new Error('Layer 1 not complete: AMPLIFY_APP_ID not found in Doppler');
      }
    });

    test('GI server has start-work and stop-work configured', () => {
      try {
        run('which start-work');
        run('which stop-work');
      } catch {
        test.skip();
      }
    });

    test('test Linear issue exists for sandbox validation', async () => {
      const projectName = getProjectName();

      let linearApiKey: string;
      let linearTeamId: string;

      try {
        linearApiKey = run('doppler secrets get LINEAR_API_KEY --project gi --config prd --plain');
        linearTeamId = run(`doppler secrets get LINEAR_TEAM_ID --project ${projectName} --config dev --plain`);
      } catch {
        test.skip();
        return;
      }

      // Check if test issue exists
      const query = `
        query {
          issues(filter: { title: { contains: "Sandbox Workflow Test" }, team: { id: { eq: "${linearTeamId}" } } }) {
            nodes { id identifier title }
          }
        }
      `;

      const result = run(`curl -s -X POST https://api.linear.app/graphql \
        -H "Authorization: ${linearApiKey}" \
        -H "Content-Type: application/json" \
        -d '${JSON.stringify({ query })}'`);

      const data = JSON.parse(result) as {
        data?: { issues?: { nodes?: Array<{ identifier: string }> } };
      };

      let testIssueId: string;

      if (data.data?.issues?.nodes && data.data.issues.nodes.length > 0) {
        testIssueId = data.data.issues.nodes[0].identifier;
      } else {
        // Create the test issue
        const createMutation = `
          mutation {
            issueCreate(input: {
              teamId: "${linearTeamId}",
              title: "Sandbox Workflow Test",
              description: "Automated test issue for validating start-work/stop-work sandbox workflow. Do not delete."
            }) {
              success
              issue { id identifier }
            }
          }
        `;

        const createResult = run(`curl -s -X POST https://api.linear.app/graphql \
          -H "Authorization: ${linearApiKey}" \
          -H "Content-Type: application/json" \
          -d '${JSON.stringify({ query: createMutation })}'`);

        const createData = JSON.parse(createResult) as {
          data?: { issueCreate?: { success: boolean; issue?: { identifier: string } } };
        };

        if (createData.data?.issueCreate?.success && createData.data.issueCreate.issue) {
          testIssueId = createData.data.issueCreate.issue.identifier;
        } else {
          throw new Error(`Failed to create test issue: ${JSON.stringify(createData)}`);
          return;
        }
      }

      // Initialize context
      const issueNumber = getIssueNumber(testIssueId);
      const portBase = getPortBase(projectName);
      ctx = {
        projectName,
        testIssueId,
        worktreePath: `/srv/worktrees/${projectName}/${testIssueId}`,
        sandboxIdentifier: getSandboxIdentifier(testIssueId),
        expectedCaddyUrl: `https://${testIssueId.toLowerCase()}.gaininsight.co.uk`,
        devServerPort: portBase + issueNumber,
      };

      expect(ctx.testIssueId).toBeTruthy();
    });
  });

  test.describe('Full Developer Workflow', () => {
    test('start-work creates worktree', async () => {
      if (!ctx) {
        test.skip();
        return;
      }

      let output: string;
      try {
        output = run(`start-work ${ctx.projectName} ${ctx.testIssueId}`, { cwd: '/srv' });
      } catch (error: unknown) {
        const execError = error as { message: string };
        // Check if this is the expected tmux error in non-interactive mode
        if (execError.message.includes('open terminal failed: not a terminal')) {
          const stdoutMatch = execError.message.match(/stdout: ([\s\S]*?)(\n(stderr:|$)|\n$|$)/);
          output = stdoutMatch ? stdoutMatch[1] : '';
        } else {
          throw error;
        }
      }

      expect(fs.existsSync(ctx.worktreePath), `Worktree should exist at ${ctx.worktreePath}`).toBe(true);
      expect(
        fs.existsSync(path.join(ctx.worktreePath, '.git')),
        'Worktree should have .git file'
      ).toBe(true);
    });

    test('sandbox CloudFormation stack exists', () => {
      if (!ctx) {
        test.skip();
        return;
      }

      const exists = checkCloudFormationStack(ctx.projectName, 'dev', 'sandbox');
      expect(exists, 'Sandbox CloudFormation stack should exist').toBe(true);
    });

    test('amplify_outputs.json exists in worktree', () => {
      if (!ctx) {
        test.skip();
        return;
      }

      const filePath = path.join(ctx.worktreePath, 'amplify_outputs.json');
      expect(fs.existsSync(filePath), `amplify_outputs.json should exist at ${filePath}`).toBe(true);
    });

    test('amplify_outputs.json has valid GraphQL configuration', () => {
      if (!ctx) {
        test.skip();
        return;
      }

      const outputsPath = path.join(ctx.worktreePath, 'amplify_outputs.json');
      const content = fs.readFileSync(outputsPath, 'utf-8');
      const outputs = JSON.parse(content);

      expect(
        outputs.data || outputs.api,
        'amplify_outputs.json should have data or api configuration'
      ).toBeTruthy();
    });

    test('frontend dev server is running', () => {
      if (!ctx) {
        test.skip();
        return;
      }

      try {
        const result = run(`lsof -i :${ctx.devServerPort} -t`);
        expect(result, `Process should be running on port ${ctx.devServerPort}`).toBeTruthy();
      } catch {
        throw new Error(`Dev server not running on port ${ctx.devServerPort}`);
      }
    });

    test('Caddy URL returns HTTP 200', () => {
      if (!ctx) {
        test.skip();
        return;
      }

      expect(
        checkUrlStatus(ctx.expectedCaddyUrl, 200),
        `Caddy URL ${ctx.expectedCaddyUrl} should return HTTP 200`
      ).toBe(true);
    });

    test('stop-work cleans up sandbox', () => {
      if (!ctx) {
        test.skip();
        return;
      }

      run(`stop-work ${ctx.testIssueId}`, { cwd: '/srv' });

      // Wait for stack deletion (up to 5 minutes)
      const maxWait = 300000;
      const startTime = Date.now();

      while (Date.now() - startTime < maxWait) {
        if (!checkCloudFormationStack(ctx.projectName, 'dev', ctx.sandboxIdentifier)) {
          break;
        }
        execSync('sleep 10');
      }

      expect(
        checkCloudFormationStack(ctx.projectName, 'dev', ctx.sandboxIdentifier),
        'Sandbox stack should be deleted'
      ).toBe(false);
    });

    test('worktree is removed after stop-work', () => {
      if (!ctx) {
        test.skip();
        return;
      }

      expect(
        fs.existsSync(ctx.worktreePath),
        `Worktree should be removed from ${ctx.worktreePath}`
      ).toBe(false);
    });

    test('no orphaned processes remain', () => {
      if (!ctx) {
        test.skip();
        return;
      }

      try {
        run(`lsof -i :${ctx.devServerPort} -t`);
        throw new Error(`Process still running on port ${ctx.devServerPort}`);
      } catch (error: unknown) {
        const message = (error as Error).message;
        if (message.includes('Process still running')) {
          throw error;
        }
        // lsof returns error when no process found - this is expected
      }
    });
  });
});

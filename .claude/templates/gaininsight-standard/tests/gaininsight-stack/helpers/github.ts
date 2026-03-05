/**
 * GitHub CLI helpers for GainInsight Stack tests
 *
 * Provides wrappers for GitHub CLI (gh) commands.
 */
import { execSync } from 'child_process';
import { getProjectRoot } from './config.js';

/**
 * Check if GitHub repo exists
 */
export function checkGitHubRepo(org: string, repo: string): boolean {
  try {
    const result = execSync(`gh repo view ${org}/${repo} --json name`, {
      encoding: 'utf-8',
    });
    const data = JSON.parse(result) as { name: string };
    return data.name === repo;
  } catch {
    return false;
  }
}

/**
 * Check if GitHub branch exists
 */
export function checkGitHubBranch(org: string, repo: string, branch: string): boolean {
  try {
    const result = execSync(
      `gh api repos/${org}/${repo}/branches/${branch} --jq '.name' 2>/dev/null || echo "NOT_FOUND"`,
      { encoding: 'utf-8' }
    ).trim();
    return result === branch;
  } catch {
    return false;
  }
}

/**
 * Check if branch has protection rules
 */
export function checkBranchProtection(
  org: string,
  repo: string,
  branch: string
): { hasProtection: boolean; requiresPR?: boolean; requiresReview?: boolean } {
  try {
    const result = execSync(
      `gh api repos/${org}/${repo}/branches/${branch}/protection --jq '.required_pull_request_reviews'`,
      { encoding: 'utf-8' }
    ).trim();

    return {
      hasProtection: true,
      requiresPR: result !== 'null',
      requiresReview: result !== 'null',
    };
  } catch {
    return { hasProtection: false };
  }
}

/**
 * Get GitHub repository secrets (names only)
 */
export function getGitHubSecrets(): string[] {
  try {
    const output = execSync('gh secret list', {
      cwd: getProjectRoot(),
      encoding: 'utf-8',
      timeout: 10000,
    });
    return output
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => line.split('\t')[0]);
  } catch {
    return [];
  }
}

/**
 * Check if GitHub workflow exists
 */
export function checkWorkflowExists(workflowPath: string): boolean {
  const fs = require('fs');
  const path = require('path');
  const fullPath = path.join(getProjectRoot(), workflowPath);
  return fs.existsSync(fullPath);
}

/**
 * Trigger a workflow manually
 */
export function triggerWorkflow(workflowName: string): boolean {
  try {
    execSync(`gh workflow run ${workflowName}`, {
      cwd: getProjectRoot(),
      encoding: 'utf-8',
      timeout: 10000,
    });
    return true;
  } catch {
    return false;
  }
}

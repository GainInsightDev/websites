#!/usr/bin/env node
/**
 * Push AgentFlow framework updates to all consumer project worktrees.
 *
 * Discovers projects from the server registry (Turso cloud DB via project-registry CLI),
 * finds all worktrees with AgentFlow installed, syncs each one using the
 * existing sync-from-agentflow.ts script, auto-commits, and reports results.
 *
 * @usage npx ts-node .claude/scripts/sync/push-to-projects.ts
 * @usage npx ts-node .claude/scripts/sync/push-to-projects.ts --dry-run
 * @usage npx ts-node .claude/scripts/sync/push-to-projects.ts --project umii
 * @category Framework Distribution
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface PushResult {
  project: string;
  worktree: string;
  status: 'synced' | 'skipped' | 'failed' | 'up-to-date';
  filesChanged: number;
  reason?: string;
  error?: string;
}

interface ProjectInfo {
  name: string;
  key: string;
  worktreeBase: string;
  slackChannelId: string;   // legacy — registry field name retained for backward compat
  slackChannelName: string; // legacy — registry field name retained for backward compat
}

class AgentFlowPushSync {
  private dryRun = false;
  private verbose = false;
  private force = false;
  private projectFilter: string | null = null;
  private noCommit = false;
  private noNotify = false;
  private templatePath: string;
  private results: PushResult[] = [];

  constructor() {
    this.templatePath = this.findTemplatePath();
    this.parseArgs();
  }

  async run(): Promise<boolean> {
    console.log('\n' + '='.repeat(60));
    console.log('AgentFlow Push Sync');
    console.log('='.repeat(60) + '\n');

    if (this.dryRun) {
      console.log('DRY RUN MODE - No changes will be made\n');
    }

    // Get framework version
    const version = this.getFrameworkVersion();
    const commit = this.getFrameworkCommit();
    console.log(`Framework version: ${version}`);
    console.log(`Framework commit:  ${commit.substring(0, 7)}`);
    console.log(`Template path:     ${this.templatePath}\n`);

    // Discover projects
    const projects = this.discoverProjects();
    if (projects.length === 0) {
      console.log('No projects found to push to.');
      return true;
    }

    console.log(`Found ${projects.length} project(s) to process\n`);

    // Process each project
    for (const project of projects) {
      await this.processProject(project, version);
    }

    // Print summary
    this.printSummary(version);

    return this.results.filter(r => r.status === 'failed').length === 0;
  }

  private findTemplatePath(): string {
    // Check common locations
    const candidates = [
      '/srv/worktrees/agentflow/main',
      '/data/worktrees/agentflow/main',
      process.cwd(),
    ];

    for (const candidate of candidates) {
      if (fs.existsSync(path.join(candidate, 'template-manifest.json'))) {
        return candidate;
      }
    }

    throw new Error('Could not find AgentFlow template path (no template-manifest.json found)');
  }

  private parseArgs(): void {
    const args = process.argv.slice(2);
    for (let i = 0; i < args.length; i++) {
      switch (args[i]) {
        case '--dry-run':
          this.dryRun = true;
          break;
        case '--verbose':
          this.verbose = true;
          break;
        case '--force':
          this.force = true;
          break;
        case '--project':
          this.projectFilter = args[++i];
          break;
        case '--no-commit':
          this.noCommit = true;
          break;
        case '--no-notify':
          this.noNotify = true;
          break;
        case '--help':
          this.showHelp();
          process.exit(0);
      }
    }
  }

  private showHelp(): void {
    console.log(`
Usage: push-to-projects.ts [options]

Push AgentFlow framework updates to all consumer project worktrees.

Options:
  --dry-run          Preview changes without applying them
  --verbose          Show detailed output per worktree
  --force            Sync even if versions match
  --project <name>   Only push to a specific project (by registry key)
  --no-commit        Sync files but don't auto-commit
  --no-notify        Skip notifications (Zulip/legacy Slack)
  --help             Show this help message

Examples:
  # Push to all projects
  npx ts-node .claude/scripts/sync/push-to-projects.ts

  # Preview what would happen
  npx ts-node .claude/scripts/sync/push-to-projects.ts --dry-run

  # Push to only umii
  npx ts-node .claude/scripts/sync/push-to-projects.ts --project umii

  # Force push even if up to date
  npx ts-node .claude/scripts/sync/push-to-projects.ts --force
`);
  }

  /**
   * Discover projects from the server registry that have AgentFlow integrated.
   */
  private discoverProjects(): ProjectInfo[] {
    const projects: ProjectInfo[] = [];

    // Get all project keys from registry
    let projectKeys: string[];
    try {
      const output = execSync('project-registry list', { encoding: 'utf-8' }).trim();
      projectKeys = output.split('\n').filter(k => k.trim());
    } catch {
      console.error('Failed to read project registry. Is project-registry installed?');
      return [];
    }

    for (const key of projectKeys) {
      // Skip agentflow itself
      if (key === 'agentflow') continue;

      // Apply project filter if specified
      if (this.projectFilter && key !== this.projectFilter) continue;

      try {
        const worktreeBase = execSync(`project-registry ${key} worktree_base`, {
          encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'],
        }).trim();

        // Skip projects without worktree base (e.g. gidev)
        if (!worktreeBase || worktreeBase === 'null' || !fs.existsSync(worktreeBase)) {
          if (this.verbose) {
            console.log(`  Skip ${key}: no worktree base`);
          }
          continue;
        }

        // Check if any worktree has AgentFlow
        const hasAgentFlow = this.findAgentFlowWorktrees(worktreeBase).length > 0;
        if (!hasAgentFlow) {
          if (this.verbose) {
            console.log(`  Skip ${key}: no AgentFlow worktrees found`);
          }
          continue;
        }

        let slackChannelId = '';
        let slackChannelName = '';
        try {
          slackChannelId = execSync(`project-registry ${key} slack.channel_id`, {
            encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'],
          }).trim();
          slackChannelName = execSync(`project-registry ${key} slack.channel_name`, {
            encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'],
          }).trim();
        } catch {
          // Some projects may not have notification channels configured (legacy Slack fields)
        }

        let name = key;
        try {
          name = execSync(`project-registry ${key} name`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
        } catch {
          // Use key as fallback
        }

        projects.push({
          name,
          key,
          worktreeBase,
          slackChannelId: slackChannelId === 'null' ? '' : slackChannelId,
          slackChannelName: slackChannelName === 'null' ? '' : slackChannelName,
        });
      } catch {
        if (this.verbose) {
          console.log(`  Skip ${key}: registry query failed`);
        }
      }
    }

    return projects;
  }

  /**
   * Find all worktrees within a project that have AgentFlow installed.
   */
  private findAgentFlowWorktrees(worktreeBase: string): string[] {
    const worktrees: string[] = [];

    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(worktreeBase, { withFileTypes: true });
    } catch {
      return [];
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const worktreePath = path.join(worktreeBase, entry.name);
      const agentflowMarker = path.join(worktreePath, '.claude', 'CLAUDE-agentflow.md');

      if (fs.existsSync(agentflowMarker)) {
        worktrees.push(worktreePath);
      }
    }

    return worktrees;
  }

  /**
   * Process all worktrees for a single project.
   */
  private async processProject(project: ProjectInfo, version: string): Promise<void> {
    const worktrees = this.findAgentFlowWorktrees(project.worktreeBase);

    console.log(`\n${'─'.repeat(50)}`);
    console.log(`${project.name} (${project.key}) - ${worktrees.length} worktree(s)`);
    console.log('─'.repeat(50));

    let projectSyncCount = 0;

    for (const worktreePath of worktrees) {
      const worktreeName = path.basename(worktreePath);
      const result = await this.syncWorktree(project, worktreePath, worktreeName, version);
      this.results.push(result);

      if (result.status === 'synced') {
        projectSyncCount += result.filesChanged;
      }
    }

    // Post notification for this project if any worktrees were synced (legacy Slack, migrating to Zulip)
    const syncedResults = this.results.filter(
      r => r.project === project.key && r.status === 'synced'
    );

    if (syncedResults.length > 0 && !this.noNotify && !this.dryRun && project.slackChannelId) {
      this.notifySlack(project, syncedResults, version);
    }
  }

  /**
   * Sync a single worktree using the existing sync-from-agentflow.ts script.
   */
  private async syncWorktree(
    project: ProjectInfo,
    worktreePath: string,
    worktreeName: string,
    version: string
  ): Promise<PushResult> {
    const label = `  ${worktreeName}`;

    // Verify this is a git repository
    try {
      execSync('git rev-parse --git-dir', {
        cwd: worktreePath, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'],
      });
    } catch {
      console.log(`${label}: SKIPPED (not a git repository)`);
      return {
        project: project.key,
        worktree: worktreeName,
        status: 'skipped',
        filesChanged: 0,
        reason: 'not a git repository',
      };
    }

    // Run sync script
    try {
      const syncArgs = [
        '--target', worktreePath,
        '--template', this.templatePath,
      ];
      if (this.force) syncArgs.push('--force');
      if (this.dryRun) syncArgs.push('--dry-run');

      const syncScript = path.join(this.templatePath, '.claude/scripts/sync/sync-from-agentflow.ts');
      const output = execSync(
        `npx ts-node "${syncScript}" ${syncArgs.join(' ')}`,
        {
          cwd: this.templatePath,
          encoding: 'utf-8',
          timeout: 60000,
          stdio: ['pipe', 'pipe', 'pipe'],
        }
      );

      // Parse output to determine if anything changed
      const alreadyUpToDate = output.includes('Already up to date!');
      const filesMatch = output.match(/Synced (\d+) files/);
      const filesChanged = filesMatch ? parseInt(filesMatch[1], 10) : 0;

      if (alreadyUpToDate && !this.force) {
        console.log(`${label}: up-to-date`);
        return {
          project: project.key,
          worktree: worktreeName,
          status: 'up-to-date',
          filesChanged: 0,
        };
      }

      if (filesChanged === 0) {
        console.log(`${label}: up-to-date (0 files changed)`);
        return {
          project: project.key,
          worktree: worktreeName,
          status: 'up-to-date',
          filesChanged: 0,
        };
      }

      // Auto-commit if not dry run and not --no-commit
      if (!this.dryRun && !this.noCommit) {
        this.commitSync(worktreePath, version, filesChanged);
      }

      console.log(`${label}: SYNCED (${filesChanged} files)`);
      return {
        project: project.key,
        worktree: worktreeName,
        status: 'synced',
        filesChanged,
      };
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      // Check if it's just "already up to date" exit
      if (errMsg.includes('Already up to date')) {
        console.log(`${label}: up-to-date`);
        return {
          project: project.key,
          worktree: worktreeName,
          status: 'up-to-date',
          filesChanged: 0,
        };
      }

      console.log(`${label}: FAILED`);
      if (this.verbose) {
        console.log(`    Error: ${errMsg.substring(0, 200)}`);
      }
      return {
        project: project.key,
        worktree: worktreeName,
        status: 'failed',
        filesChanged: 0,
        error: errMsg.substring(0, 200),
      };
    }
  }

  /**
   * Auto-commit the sync changes in a worktree.
   */
  private commitSync(worktreePath: string, version: string, filesChanged: number): void {
    try {
      const commit = this.getFrameworkCommit().substring(0, 7);
      const message = `chore: sync AgentFlow framework to v${version}\n\nPushed from AgentFlow (${commit})\n${filesChanged} files updated`;

      // Stage framework files
      execSync('git add .claude/ .github/ CLAUDE.md package.json .start-work-hooks 2>/dev/null || true', {
        cwd: worktreePath,
        encoding: 'utf-8',
      });

      // Check if there are actually staged changes
      const staged = execSync('git diff --cached --name-only', {
        cwd: worktreePath,
        encoding: 'utf-8',
      }).trim();

      if (!staged) {
        if (this.verbose) {
          console.log('    No staged changes to commit');
        }
        return;
      }

      execSync(`git commit -m "${message.replace(/"/g, '\\"')}"`, {
        cwd: worktreePath,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      if (this.verbose) {
        console.log('    Committed sync changes');
      }
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      if (this.verbose) {
        console.log(`    Commit failed: ${errMsg.substring(0, 100)}`);
      }
    }
  }

  /**
   * Extract the [Unreleased] section from CHANGELOG.md as a summary.
   * Returns bold-prefixed bullet points (the first line of each entry).
   */
  private getChangelogSummary(): string {
    try {
      const changelog = fs.readFileSync(
        path.join(this.templatePath, 'CHANGELOG.md'), 'utf-8'
      );

      // Extract content between ## [Unreleased] and the next ## heading
      const unreleasedMatch = changelog.match(
        /## \[Unreleased\]\s*\n([\s\S]*?)(?=\n---|\n## \[)/
      );
      if (!unreleasedMatch) return '';

      const section = unreleasedMatch[1].trim();

      // Extract top-level bullet points (lines starting with "- **")
      const bullets = section
        .split('\n')
        .filter(line => line.match(/^- \*\*/))
        .map(line => line.trim());

      return bullets.join('\n');
    } catch {
      return '';
    }
  }

  /**
   * Generate a notification for a project with CHANGELOG summary.
   * Writes one entry per project (not per worktree).
   * Note: Method name retained as notifySlack for backward compatibility.
   */
  private notifySlack(project: ProjectInfo, syncedResults: PushResult[], version: string): void {
    const changelogSummary = this.getChangelogSummary();

    const lines = [
      `:arrows_counterclockwise: *AgentFlow v${version}* pushed to *${project.name}*`,
      ``,
    ];

    if (changelogSummary) {
      lines.push(`*What changed:*`);
      lines.push(changelogSummary);
    }

    lines.push(``);
    lines.push(`Changes auto-committed. Run \`git log -1\` in any worktree to review.`);

    const message = lines.join('\n');

    // Write notification to a file for the caller to process
    // (The /af:push command or caller can post to Zulip)
    const notifDir = path.join(this.templatePath, '.claude/work');
    if (!fs.existsSync(notifDir)) {
      fs.mkdirSync(notifDir, { recursive: true });
    }

    const notifFile = path.join(notifDir, 'push-notifications.jsonl');
    const notifEntry = JSON.stringify({
      timestamp: new Date().toISOString(),
      project: project.key,
      channelId: project.slackChannelId,
      channelName: project.slackChannelName,
      message,
      version,
    });

    fs.appendFileSync(notifFile, notifEntry + '\n');

    if (this.verbose) {
      console.log(`  Notification queued for ${project.slackChannelName}`);
    }
  }

  private getFrameworkVersion(): string {
    try {
      const manifest = JSON.parse(
        fs.readFileSync(path.join(this.templatePath, 'template-manifest.json'), 'utf-8')
      );
      return manifest.version || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  private getFrameworkCommit(): string {
    try {
      return execSync('git rev-parse HEAD', {
        cwd: this.templatePath,
        encoding: 'utf-8',
      }).trim();
    } catch {
      return 'unknown';
    }
  }

  private printSummary(version: string): void {
    console.log('\n' + '='.repeat(60));
    console.log('Push Summary');
    console.log('='.repeat(60) + '\n');

    if (this.dryRun) {
      console.log('DRY RUN - No changes were made\n');
    }

    const synced = this.results.filter(r => r.status === 'synced');
    const skipped = this.results.filter(r => r.status === 'skipped');
    const failed = this.results.filter(r => r.status === 'failed');
    const upToDate = this.results.filter(r => r.status === 'up-to-date');

    console.log(`Version: ${version}`);
    console.log(`Total worktrees: ${this.results.length}`);
    console.log(`  Synced:     ${synced.length}`);
    console.log(`  Up-to-date: ${upToDate.length}`);
    console.log(`  Skipped:    ${skipped.length}`);
    console.log(`  Failed:     ${failed.length}`);

    if (synced.length > 0) {
      const totalFiles = synced.reduce((sum, r) => sum + r.filesChanged, 0);
      console.log(`  Total files: ${totalFiles}`);
    }

    if (skipped.length > 0) {
      console.log('\nSkipped worktrees:');
      for (const r of skipped) {
        console.log(`  ${r.project}/${r.worktree}: ${r.reason}`);
      }
    }

    if (failed.length > 0) {
      console.log('\nFailed worktrees:');
      for (const r of failed) {
        console.log(`  ${r.project}/${r.worktree}: ${r.error}`);
      }
    }

    // Write results to JSON for programmatic consumption
    const resultsFile = path.join(this.templatePath, '.claude/work/push-results.json');
    const resultsDir = path.dirname(resultsFile);
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    fs.writeFileSync(resultsFile, JSON.stringify({
      timestamp: new Date().toISOString(),
      version,
      dryRun: this.dryRun,
      results: this.results,
      summary: {
        total: this.results.length,
        synced: synced.length,
        upToDate: upToDate.length,
        skipped: skipped.length,
        failed: failed.length,
      },
    }, null, 2) + '\n');

    if (synced.length > 0 && !this.dryRun) {
      console.log('\nAll synced worktrees have been auto-committed.');
      console.log('Notification file: .claude/work/push-notifications.jsonl');
    }

    console.log();
  }
}

// Run if executed directly
if (process.argv[1]?.includes('push-to-projects')) {
  const push = new AgentFlowPushSync();
  push.run().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { AgentFlowPushSync };

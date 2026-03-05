#!/usr/bin/env node
/**
 * Sync AgentFlow V2 framework from template repository to target projects.
 * This script copies framework files while preserving project-specific content.
 *
 * @description Syncs AgentFlow V2 framework files to target projects with namespace support
 * @usage From project: npx ts-node .claude/scripts/sync/sync-from-agentflow.ts
 * @usage With options: npx ts-node .claude/scripts/sync/sync-from-agentflow.ts --dry-run --verbose
 * @features Namespace validation, settings.json merge, infrastructure sync, backup creation
 * @category Framework Synchronization
 * @documentation .claude/docs/reference/template-manifest-schema.md
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

/**
 * Simple glob-like file finder using Node's built-in fs module.
 * Supports ** (any depth), * (single segment), and literal paths.
 * No external dependencies required.
 */
function findFiles(pattern: string, options: { nodir?: boolean; dot?: boolean } = {}): string[] {
  const results: string[] = [];

  // Normalize the pattern
  const normalizedPattern = pattern.replace(/\\/g, '/');

  // Find the base directory (everything before the first wildcard)
  const parts = normalizedPattern.split('/');
  let baseIndex = parts.findIndex(p => p.includes('*'));
  if (baseIndex === -1) {
    // No wildcards - check if file/dir exists
    if (fs.existsSync(pattern)) {
      const stat = fs.statSync(pattern);
      if (stat.isDirectory() && options.nodir !== false) {
        return getAllFiles(pattern, options.dot);
      }
      return [pattern];
    }
    return [];
  }

  const basePath = parts.slice(0, baseIndex).join('/') || '.';
  const remainingPattern = parts.slice(baseIndex).join('/');

  if (!fs.existsSync(basePath)) {
    return [];
  }

  // Convert glob pattern to regex
  // Handle **/ specially to make path optional (matches root level files too)
  const regexPattern = remainingPattern
    .replace(/\*\*\//g, '§PATHOPT§')    // 1. **/ → optional path placeholder
    .replace(/\*\*/g, '.*')             // 2. ** alone → any path
    .replace(/\*/g, '[^/]*')            // 3. Single * → any name segment
    .replace(/\./g, '\\.')              // 4. Escape literal dots
    .replace(/\?/g, '.')                // 5. ? → single char
    .replace(/§PATHOPT§/g, '(.*\\/)?'); // 6. Restore **/ as optional path
  const regex = new RegExp(`^${regexPattern}$`);

  // Walk the directory tree
  function walk(dir: string, relativeTo: string): void {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      // Skip hidden files unless dot option is true
      if (!options.dot && entry.name.startsWith('.')) {
        continue;
      }

      const fullPath = path.join(dir, entry.name);
      const relPath = path.relative(relativeTo, fullPath).replace(/\\/g, '/');

      if (entry.isDirectory()) {
        // Check if directory matches
        if (regex.test(relPath) || regex.test(relPath + '/')) {
          results.push(fullPath);
        }
        // Always recurse for ** patterns
        walk(fullPath, relativeTo);
      } else {
        if (regex.test(relPath)) {
          results.push(fullPath);
        }
      }
    }
  }

  walk(basePath, basePath);
  return results;
}

/**
 * Get all files in a directory recursively
 */
function getAllFiles(dir: string, includeDot: boolean = false): string[] {
  const results: string[] = [];

  function walk(currentDir: string): void {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (!includeDot && entry.name.startsWith('.')) {
        continue;
      }

      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else {
        results.push(fullPath);
      }
    }
  }

  walk(dir);
  return results;
}

interface TemplateManifest {
  version: string;
  description: string;
  templateRepo: string;
  distributionModel: string;
  framework: {
    description: string;
    include: string[];
    exclude: string[];
  };
  infrastructure: {
    description: string;
    include: string[];
  };
  projectSpecific: {
    description: string;
    preserve: string[];
    preservePattern: string;
    comment: string;
  };
  namespaces: {
    framework: string;
    instructions: string[];
    validation: {
      enforceFrameworkPrefix: boolean;
      warnOnCollisions: boolean;
      requireProjectPrefix: boolean;
    };
  };
  syncBehavior: {
    description: string;
    mode: string;
    settingsJsonStrategy: string;
    conflictResolution: string;
    backupBeforeSync: boolean;
    validateAfterSync: boolean;
    comment: string;
  };
  packageJsonScripts: {
    description: string;
    scripts: Record<string, string>;
  };
}

interface SyncState {
  version: string;
  syncedAt: string;
  commit: string;
  files: string[];
}

class AgentFlowSyncV2 {
  private manifest!: TemplateManifest;
  private templatePath: string;
  private targetPath: string;
  private dryRun: boolean;
  private verbose: boolean;
  private force: boolean;
  private syncedFiles: string[] = [];
  private warnings: string[] = [];
  private errors: string[] = [];

  constructor() {
    this.dryRun = false;
    this.verbose = false;
    this.force = false;
    this.templatePath = '/srv/worktrees/agentflow/main';
    this.targetPath = process.cwd();
  }

  /**
   * Main sync workflow
   */
  async run(): Promise<boolean> {
    try {
      console.log('\n' + '='.repeat(60));
      console.log('🚀 AgentFlow V2 Framework Sync');
      console.log('='.repeat(60) + '\n');

      // Parse command line arguments
      this.parseArgs();

      // Load manifest
      await this.loadManifest();

      // Validate paths
      await this.validatePaths();

      // Check if already synced to latest version
      const shouldContinue = await this.checkVersion();
      if (!shouldContinue) {
        return true; // Not an error, just nothing to do
      }

      // Check git status
      await this.checkGitStatus();

      // Create backup
      await this.createBackup();

      // Sync framework files
      await this.syncFrameworkFiles();

      // Sync infrastructure files
      await this.syncInfrastructureFiles();

      // Handle settings.json merge
      await this.mergeSettingsJson();

      // Update package.json
      await this.updatePackageJson();

      // Handle CLAUDE.md import
      await this.handleClaudeMd();

      // Update sync state
      await this.updateSyncState();

      // Print results
      this.printResults();

      return this.errors.length === 0;

    } catch (error) {
      console.error('❌ Sync failed:', error);
      return false;
    }
  }

  /**
   * Parse command line arguments
   */
  private parseArgs(): void {
    const args = process.argv.slice(2);
    for (let i = 0; i < args.length; i++) {
      switch (args[i]) {
        case '--target':
          this.targetPath = path.resolve(args[++i]);
          break;
        case '--template':
          this.templatePath = path.resolve(args[++i]);
          break;
        case '--dry-run':
          this.dryRun = true;
          console.log('🔍 DRY RUN MODE - No changes will be made\n');
          break;
        case '--force':
          this.force = true;
          console.log('⚡ FORCE MODE - Skipping version check\n');
          break;
        case '--verbose':
          this.verbose = true;
          break;
        case '--help':
          this.showHelp();
          process.exit(0);
      }
    }
  }

  /**
   * Show help message
   */
  private showHelp(): void {
    console.log(`
Usage: sync-from-agentflow.ts [options]

Options:
  --target <path>    Target project directory (default: current directory)
  --template <path>  Template repository path (default: /srv/worktrees/agentflow/main)
  --dry-run         Preview changes without applying them
  --force           Sync even if already on latest version
  --verbose         Show detailed output
  --help           Show this help message

Examples:
  # Sync to current directory
  npx ts-node .claude/scripts/sync/sync-from-agentflow.ts

  # Sync to specific project
  npx ts-node .claude/scripts/sync/sync-from-agentflow.ts --target /srv/worktrees/umii/main

  # Preview changes
  npx ts-node .claude/scripts/sync/sync-from-agentflow.ts --dry-run

  # Force sync even if versions match
  npx ts-node .claude/scripts/sync/sync-from-agentflow.ts --force

Version: 3.0.0 (V3 with version comparison)
`);
  }

  /**
   * Load and parse manifest file
   */
  private async loadManifest(): Promise<void> {
    const manifestPath = path.join(this.templatePath, 'template-manifest.json');
    if (!fs.existsSync(manifestPath)) {
      throw new Error(`Template manifest not found at ${manifestPath}`);
    }
    this.manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    console.log(`📋 Loaded manifest version ${this.manifest.version}`);
    console.log(`📦 Distribution model: ${this.manifest.distributionModel}`);
    console.log(`🏷️  Framework namespace: ${this.manifest.namespaces.framework}\n`);
  }

  /**
   * Validate paths exist and are different
   */
  private async validatePaths(): Promise<void> {
    // Check template exists
    if (!fs.existsSync(this.templatePath)) {
      throw new Error(`Template repository not found at ${this.templatePath}`);
    }

    // Check target exists
    if (!fs.existsSync(this.targetPath)) {
      throw new Error(`Target directory not found at ${this.targetPath}`);
    }

    // Don't sync template to itself
    if (path.resolve(this.templatePath) === path.resolve(this.targetPath)) {
      throw new Error('Cannot sync template to itself!');
    }

    console.log(`📁 Template: ${this.templatePath}`);
    console.log(`📁 Target:   ${this.targetPath}\n`);
  }

  /**
   * Check if project is already synced to latest version
   * Returns true if sync should continue, false if already up to date
   */
  private async checkVersion(): Promise<boolean> {
    const statePath = path.join(this.targetPath, '.claude/.sync/state.json');

    // If no state file exists, this is first sync - continue
    if (!fs.existsSync(statePath)) {
      console.log('📦 First sync - no previous state found\n');
      return true;
    }

    // Read current state
    let currentState: SyncState;
    try {
      currentState = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
    } catch (error) {
      console.log('⚠️  Could not read sync state - proceeding with sync\n');
      return true;
    }

    const currentVersion = currentState.version;
    const availableVersion = this.manifest.version;

    console.log(`📊 Version Check:`);
    console.log(`   Current:   ${currentVersion}`);
    console.log(`   Available: ${availableVersion}`);

    // Compare versions
    if (currentVersion === availableVersion) {
      if (this.force) {
        console.log(`   ⚡ Force flag set - syncing anyway\n`);
        return true;
      }

      // Check if source commit has changed even if version is same
      const sourceCommit = this.getTemplateCommit();
      if (currentState.commit !== sourceCommit) {
        console.log(`   📝 Same version but different commit - syncing updates\n`);
        return true;
      }

      console.log('\n' + '='.repeat(60));
      console.log('✅ Already up to date!');
      console.log('='.repeat(60) + '\n');
      console.log(`AgentFlow is already synced to the latest version.\n`);
      console.log(`  - Version: ${currentVersion}`);
      console.log(`  - Synced at: ${currentState.syncedAt}`);
      console.log(`  - Commit: ${currentState.commit.substring(0, 7)}`);
      console.log(`\nNo updates needed - this project is current with the AgentFlow framework.`);
      console.log(`\nUse --force to sync anyway if needed.\n`);
      return false;
    }

    // Check if we're ahead (shouldn't normally happen)
    if (this.compareVersions(currentVersion, availableVersion) > 0) {
      console.log(`   ⚠️  Local version is NEWER than source!`);
      this.warnings.push(`Local version ${currentVersion} is newer than source ${availableVersion}`);
      if (!this.force) {
        console.log(`   Use --force to sync anyway\n`);
        return false;
      }
    }

    console.log(`   📥 Update available: ${currentVersion} → ${availableVersion}\n`);
    return true;
  }

  /**
   * Compare semantic versions
   * Returns: -1 if a < b, 0 if a == b, 1 if a > b
   */
  private compareVersions(a: string, b: string): number {
    const partsA = a.split('.').map(Number);
    const partsB = b.split('.').map(Number);

    for (let i = 0; i < 3; i++) {
      const numA = partsA[i] || 0;
      const numB = partsB[i] || 0;
      if (numA < numB) return -1;
      if (numA > numB) return 1;
    }
    return 0;
  }

  /**
   * Check git status and warn if uncommitted changes
   */
  private async checkGitStatus(): Promise<void> {
    try {
      const gitStatus = execSync('git status --porcelain', {
        cwd: this.targetPath,
        encoding: 'utf-8'
      }).trim();

      if (gitStatus && !this.dryRun) {
        this.warnings.push('Target has uncommitted changes');
        console.log('⚠️  Warning: Target has uncommitted changes');
        console.log('   Consider committing or stashing before sync\n');
      }
    } catch (error) {
      this.warnings.push('Target is not a git repository');
      if (this.verbose) {
        console.log('📝 Note: Target is not a git repository\n');
      }
    }
  }

  /**
   * Create backup of existing .claude directory
   */
  private async createBackup(): Promise<void> {
    if (this.dryRun || !this.manifest.syncBehavior.backupBeforeSync) {
      return;
    }

    const claudePath = path.join(this.targetPath, '.claude');
    if (fs.existsSync(claudePath)) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      const backupPath = path.join(this.targetPath, `.claude.backup.${timestamp}`);

      // Don't overwrite existing backup from today
      if (fs.existsSync(backupPath)) {
        if (this.verbose) {
          console.log(`📦 Backup already exists: ${path.basename(backupPath)}\n`);
        }
        return;
      }

      console.log(`📦 Creating backup at ${path.basename(backupPath)}`);
      this.copyDirectory(claudePath, backupPath);
      console.log();
    }
  }

  /**
   * Sync framework files (.claude/ directory)
   */
  private async syncFrameworkFiles(): Promise<void> {
    console.log('📂 Syncing framework files...\n');

    for (const pattern of this.manifest.framework.include) {
      const sourcePath = path.join(this.templatePath, pattern);
      const files = findFiles(sourcePath, {
        nodir: false,
        dot: true
      });

      for (const file of files) {
        const relativePath = path.relative(this.templatePath, file);
        const targetFile = path.join(this.targetPath, relativePath);

        // Skip if in exclude list
        if (this.shouldExclude(relativePath)) {
          if (this.verbose) {
            console.log(`  ⏭️  Skip (excluded): ${relativePath}`);
          }
          continue;
        }

        // Skip if should be preserved and exists
        if (this.shouldPreserve(relativePath) && fs.existsSync(targetFile)) {
          if (this.verbose) {
            console.log(`  🔒 Preserve: ${relativePath}`);
          }
          continue;
        }

        // Validate namespace for framework assets
        if (this.isFrameworkAsset(relativePath)) {
          if (!this.validateFrameworkPrefix(relativePath)) {
            this.errors.push(`Framework asset missing af- prefix: ${relativePath}`);
            continue;
          }
        }

        // Copy file
        if (!this.dryRun) {
          const targetDir = path.dirname(targetFile);
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }

          if (fs.statSync(file).isDirectory()) {
            if (!fs.existsSync(targetFile)) {
              fs.mkdirSync(targetFile, { recursive: true });
            }
          } else {
            this.safeCopyFile(file, targetFile);
            this.syncedFiles.push(relativePath);
          }
        }

        console.log(`  ✅ ${relativePath}`);
      }
    }

    console.log();
  }

  /**
   * Sync infrastructure files (.github, .start-work-hooks, etc.)
   */
  private async syncInfrastructureFiles(): Promise<void> {
    if (!this.manifest.infrastructure || !this.manifest.infrastructure.include.length) {
      return;
    }

    console.log('🏗️  Syncing infrastructure files...\n');

    for (const pattern of this.manifest.infrastructure.include) {
      const sourcePath = path.join(this.templatePath, pattern);
      const files = findFiles(sourcePath, {
        nodir: false,
        dot: true
      });

      for (const file of files) {
        const relativePath = path.relative(this.templatePath, file);
        const targetFile = path.join(this.targetPath, relativePath);

        if (!this.dryRun) {
          const targetDir = path.dirname(targetFile);
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }

          if (fs.statSync(file).isDirectory()) {
            if (!fs.existsSync(targetFile)) {
              fs.mkdirSync(targetFile, { recursive: true });
            }
          } else {
            this.safeCopyFile(file, targetFile);
            this.syncedFiles.push(relativePath);
          }
        }

        console.log(`  ✅ ${relativePath}`);
      }
    }

    console.log();
  }

  /**
   * Merge settings.json (hooks merge strategy)
   */
  private async mergeSettingsJson(): Promise<void> {
    const sourceSettings = path.join(this.templatePath, '.claude/settings.json');
    const targetSettings = path.join(this.targetPath, '.claude/settings.json');

    if (!fs.existsSync(sourceSettings)) {
      return;
    }

    console.log('⚙️  Merging settings.json...\n');

    const strategy = this.manifest.syncBehavior.settingsJsonStrategy;

    if (strategy === 'skip') {
      console.log('  ⏭️  Skipping settings.json (strategy: skip)\n');
      return;
    }

    if (strategy === 'replace') {
      if (!this.dryRun) {
        this.safeCopyFile(sourceSettings, targetSettings);
      }
      console.log('  ✅ Replaced settings.json\n');
      return;
    }

    // merge-hooks strategy
    if (!fs.existsSync(targetSettings)) {
      // No existing settings - just copy
      if (!this.dryRun) {
        this.safeCopyFile(sourceSettings, targetSettings);
      }
      console.log('  ✅ Created settings.json\n');
    } else {
      // Merge hooks
      const sourceData = JSON.parse(fs.readFileSync(sourceSettings, 'utf-8'));
      const targetData = JSON.parse(fs.readFileSync(targetSettings, 'utf-8'));

      if (sourceData.hooks && targetData.hooks) {
        // Merge hook arrays
        for (const [hookName, sourceHooks] of Object.entries(sourceData.hooks)) {
          if (!targetData.hooks[hookName]) {
            targetData.hooks[hookName] = sourceHooks;
          } else {
            // Merge arrays, avoiding duplicates
            const merged = Array.from(new Set([
              ...targetData.hooks[hookName],
              ...(sourceHooks as string[])
            ]));
            targetData.hooks[hookName] = merged;
          }
        }

        if (!this.dryRun) {
          fs.writeFileSync(targetSettings, JSON.stringify(targetData, null, 2) + '\n');
        }
        console.log('  ✅ Merged hooks in settings.json\n');
      } else {
        console.log('  ℹ️  No hooks to merge\n');
      }
    }
  }

  /**
   * Update package.json scripts
   */
  private async updatePackageJson(): Promise<void> {
    const packagePath = path.join(this.targetPath, 'package.json');

    if (!fs.existsSync(packagePath)) {
      this.warnings.push('No package.json found - skipping script updates');
      console.log('⚠️  No package.json found - skipping script updates\n');
      return;
    }

    console.log('📝 Updating package.json scripts...\n');

    if (!this.dryRun) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));

      if (!packageJson.scripts) {
        packageJson.scripts = {};
      }

      let updated = false;
      for (const [name, script] of Object.entries(this.manifest.packageJsonScripts.scripts)) {
        if (!packageJson.scripts[name] || packageJson.scripts[name] !== script) {
          packageJson.scripts[name] = script;
          console.log(`  ✅ Updated script: ${name}`);
          updated = true;
        }
      }

      if (updated) {
        fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
      } else {
        console.log('  ℹ️  All scripts up to date');
      }
    }

    console.log();
  }

  /**
   * Handle CLAUDE.md import line
   */
  private async handleClaudeMd(): Promise<void> {
    const claudeMdPath = path.join(this.targetPath, 'CLAUDE.md');
    const importLine = '@.claude/CLAUDE-agentflow.md';

    if (!fs.existsSync(claudeMdPath)) {
      // Create new CLAUDE.md with import
      console.log('📝 Creating CLAUDE.md with framework import...\n');
      if (!this.dryRun) {
        const content = `# Project Instructions for Claude

${importLine}

## Project Overview
[Describe your project here]

## Project-Specific Instructions
[Add your project-specific instructions here]
`;
        fs.writeFileSync(claudeMdPath, content);
      }
    } else {
      // Check if import exists
      const content = fs.readFileSync(claudeMdPath, 'utf-8');
      if (!content.includes(importLine)) {
        console.log('📝 Adding framework import to CLAUDE.md...\n');
        if (!this.dryRun) {
          const lines = content.split('\n');
          // Add after first heading
          const firstHeadingIndex = lines.findIndex(line => line.startsWith('#'));
          if (firstHeadingIndex !== -1) {
            lines.splice(firstHeadingIndex + 1, 0, '', importLine);
            fs.writeFileSync(claudeMdPath, lines.join('\n'));
          } else {
            // No heading found - add at top
            fs.writeFileSync(claudeMdPath, `${importLine}\n\n${content}`);
          }
        }
      } else {
        if (this.verbose) {
          console.log('  ℹ️  CLAUDE.md already has framework import\n');
        }
      }
    }
  }

  /**
   * Update sync state at .claude/.sync/state.json
   */
  private async updateSyncState(): Promise<void> {
    if (this.dryRun) return;

    const syncDir = path.join(this.targetPath, '.claude/.sync');
    const statePath = path.join(syncDir, 'state.json');

    if (!fs.existsSync(syncDir)) {
      fs.mkdirSync(syncDir, { recursive: true });
    }

    const state: SyncState = {
      version: this.manifest.version,
      syncedAt: new Date().toISOString(),
      commit: this.getTemplateCommit(),
      files: this.syncedFiles
    };

    fs.writeFileSync(statePath, JSON.stringify(state, null, 2) + '\n');

    if (this.verbose) {
      console.log('📊 Updated sync state at .claude/.sync/state.json\n');
    }
  }

  /**
   * Get current commit hash of template repo
   */
  private getTemplateCommit(): string {
    try {
      return execSync('git rev-parse HEAD', {
        cwd: this.templatePath,
        encoding: 'utf-8'
      }).trim();
    } catch {
      return 'unknown';
    }
  }

  /**
   * Check if file should be excluded
   */
  private shouldExclude(file: string): boolean {
    return this.manifest.framework.exclude.some(pattern => {
      return this.matchPattern(file, pattern);
    });
  }

  /**
   * Check if file should be preserved
   */
  private shouldPreserve(file: string): boolean {
    // Check explicit preserve list
    if (this.manifest.projectSpecific.preserve.some(pattern => {
      return this.matchPattern(file, pattern);
    })) {
      return true;
    }

    // Check namespace pattern (preserve non-af- prefixed assets)
    const filename = path.basename(file);
    const dirname = path.basename(path.dirname(file));

    // For skills directories
    if (file.includes('.claude/skills/') && dirname !== 'skills') {
      return !dirname.startsWith(this.manifest.namespaces.framework);
    }

    // For agent files
    if (file.includes('.claude/agents/') && filename.endsWith('.md') && filename !== 'README.md') {
      return !filename.startsWith(this.manifest.namespaces.framework);
    }

    // For command directories
    if (file.includes('.claude/commands/') && !file.includes('.claude/commands/af/')) {
      return true;
    }

    return false;
  }

  /**
   * Check if file is a framework asset that requires namespace
   */
  private isFrameworkAsset(file: string): boolean {
    const filename = path.basename(file);
    const dirname = path.basename(path.dirname(file));

    // Agent files
    if (file.includes('.claude/agents/') && filename.endsWith('.md') && filename !== 'README.md') {
      return true;
    }

    // Skill directories
    if (file.includes('.claude/skills/') && dirname !== 'skills' && !file.endsWith('.md')) {
      return true;
    }

    return false;
  }

  /**
   * Validate framework asset has correct prefix
   */
  private validateFrameworkPrefix(file: string): boolean {
    const filename = path.basename(file);
    const dirname = path.basename(path.dirname(file));
    const prefix = this.manifest.namespaces.framework;

    // Agent files
    if (file.includes('.claude/agents/')) {
      return filename.startsWith(prefix);
    }

    // Skill directories
    if (file.includes('.claude/skills/')) {
      return dirname.startsWith(prefix);
    }

    return true;
  }

  /**
   * Match file against glob pattern
   */
  private matchPattern(file: string, pattern: string): boolean {
    const regex = new RegExp(
      pattern
        .replace(/\*\*/g, '§DOUBLESTAR§')
        .replace(/\*/g, '[^/]*')
        .replace(/§DOUBLESTAR§/g, '.*')
        .replace(/\?/g, '.')
    );
    return regex.test(file);
  }

  /**
   * Copy a file safely, handling cross-user permission issues.
   *
   * Node's fs.copyFileSync and fs.unlinkSync both fail with EPERM when the
   * target file is owned by a different user (e.g. tmux-shared). Using the
   * system `cp` command avoids this because it truncates and overwrites the
   * file contents in-place (which only requires write permission on the file,
   * not ownership).
   */
  private safeCopyFile(source: string, target: string): void {
    execSync(`cp "${source}" "${target}"`);
  }

  /**
   * Copy directory recursively using system cp to handle cross-user permissions.
   */
  private copyDirectory(source: string, target: string): void {
    execSync(`cp -r "${source}" "${target}"`);
  }

  /**
   * Print final results
   */
  private printResults(): void {
    console.log('='.repeat(60));
    console.log('Results');
    console.log('='.repeat(60) + '\n');

    if (this.dryRun) {
      console.log('🔍 DRY RUN - No changes were made\n');
    }

    console.log(`✅ Synced ${this.syncedFiles.length} files`);

    if (this.warnings.length > 0) {
      console.log(`⚠️  ${this.warnings.length} warnings`);
      if (this.verbose) {
        this.warnings.forEach(w => console.log(`   • ${w}`));
      }
    }

    if (this.errors.length > 0) {
      console.log(`❌ ${this.errors.length} errors`);
      this.errors.forEach(e => console.log(`   • ${e}`));
    }

    if (this.errors.length === 0) {
      console.log('\n' + '='.repeat(60));
      console.log('✅ Sync Complete!');
      console.log('='.repeat(60) + '\n');

      console.log('Next steps:');
      console.log('  1. Review changes: git diff');
      console.log('  2. Test validation: npm run agentflow:validate');
      console.log('  3. Commit the framework updates');
      console.log('  4. Restart Claude Code session for agent updates\n');
    } else {
      console.log('\n❌ Sync completed with errors\n');
    }
  }
}

// Run if executed directly
// Simple check that works with ts-node in both CommonJS and ESM contexts
if (process.argv[1]?.includes('sync-from-agentflow')) {
  const sync = new AgentFlowSyncV2();
  sync.run().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { AgentFlowSyncV2 };

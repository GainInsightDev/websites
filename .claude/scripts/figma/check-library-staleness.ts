#!/usr/bin/env node
/**
 * Checks if the Figma component library is stale relative to Storybook components.
 * Compares .figma/last-sync-commit against current HEAD to detect component changes.
 *
 * Usage: npx tsx .claude/scripts/figma/check-library-staleness.ts [--sync-file <path>]
 *
 * Exit codes:
 *   0 = library is fresh (no component changes since last sync)
 *   1 = library is stale (components changed since last sync)
 *   2 = no sync record exists (library has never been synced)
 *
 * Defaults:
 *   --sync-file: ./.figma/last-sync-commit
 *
 * @documentation .claude/skills/af-sync-figma-designs/SKILL.md
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface StalenessReport {
  status: 'fresh' | 'stale' | 'never-synced';
  lastSyncCommit?: string;
  currentCommit: string;
  changedFiles: string[];
  changedComponents: string[];
  message: string;
}

function parseArgs(): { syncFile: string } {
  const args = process.argv.slice(2);
  let syncFile = './.figma/last-sync-commit';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--sync-file' && args[i + 1]) {
      syncFile = args[++i];
    }
  }

  return { syncFile: path.resolve(process.cwd(), syncFile) };
}

function git(command: string): string {
  return execSync(`git ${command}`, { encoding: 'utf-8' }).trim();
}

function getComponentChangedFiles(sinceCommit: string): string[] {
  // Get files changed since the last sync commit
  // Focus on component source files and story files
  const componentPatterns = [
    'src/components/**',
    'src/app/**/*.tsx',
    'src/app/**/*.ts',
    'stories/**',
    '**/*.stories.tsx',
    '**/*.stories.ts',
    '**/*.story.tsx',
    '**/*.story.ts',
  ];

  const allChanged = git(`diff --name-only ${sinceCommit}..HEAD`).split('\n').filter(Boolean);

  return allChanged.filter((file) => {
    return componentPatterns.some((pattern) => {
      // Simple glob matching
      const regex = new RegExp(
        '^' +
          pattern
            .replace(/\*\*/g, '.*')
            .replace(/\*/g, '[^/]*') +
          '$'
      );
      return regex.test(file);
    });
  });
}

function extractComponentNames(files: string[]): string[] {
  const names = new Set<string>();

  for (const file of files) {
    // Extract component name from file path
    const basename = path.basename(file, path.extname(file));

    // Skip story files but note the component they test
    if (basename.endsWith('.stories') || basename.endsWith('.story')) {
      const componentName = basename.replace(/\.(stories|story)$/, '');
      names.add(componentName);
      continue;
    }

    // Skip non-component files
    if (basename === 'index' || basename === 'utils' || basename === 'types') {
      // Use parent directory name instead
      const dirName = path.basename(path.dirname(file));
      if (dirName !== 'src' && dirName !== 'components' && dirName !== 'app') {
        names.add(dirName);
      }
      continue;
    }

    // Use the filename as component name
    names.add(basename);
  }

  return [...names].sort();
}

function checkStaleness(): StalenessReport {
  const { syncFile } = parseArgs();
  const currentCommit = git('rev-parse HEAD');

  // Check if sync file exists
  if (!fs.existsSync(syncFile)) {
    return {
      status: 'never-synced',
      currentCommit,
      changedFiles: [],
      changedComponents: [],
      message:
        'Figma library has never been synced. Run initial library capture.',
    };
  }

  const lastSyncCommit = fs.readFileSync(syncFile, 'utf-8').trim();

  // Validate commit exists
  try {
    git(`cat-file -t ${lastSyncCommit}`);
  } catch {
    return {
      status: 'stale',
      lastSyncCommit,
      currentCommit,
      changedFiles: [],
      changedComponents: [],
      message: `Last sync commit ${lastSyncCommit.slice(0, 8)} no longer exists in git history. Re-sync recommended.`,
    };
  }

  // Check if commits are the same
  if (lastSyncCommit === currentCommit) {
    return {
      status: 'fresh',
      lastSyncCommit,
      currentCommit,
      changedFiles: [],
      changedComponents: [],
      message: 'Figma library is up to date.',
    };
  }

  // Find changed component files
  const changedFiles = getComponentChangedFiles(lastSyncCommit);

  if (changedFiles.length === 0) {
    return {
      status: 'fresh',
      lastSyncCommit,
      currentCommit,
      changedFiles: [],
      changedComponents: [],
      message:
        'No component changes since last sync. Figma library is up to date.',
    };
  }

  const changedComponents = extractComponentNames(changedFiles);

  return {
    status: 'stale',
    lastSyncCommit,
    currentCommit,
    changedFiles,
    changedComponents,
    message: `Figma library is stale. ${changedComponents.length} component(s) changed since last sync.`,
  };
}

function main(): void {
  const report = checkStaleness();

  console.log(`Status: ${report.status.toUpperCase()}`);
  console.log(report.message);

  if (report.lastSyncCommit) {
    console.log(`\nLast sync: ${report.lastSyncCommit.slice(0, 8)}`);
  }
  console.log(`Current HEAD: ${report.currentCommit.slice(0, 8)}`);

  if (report.changedComponents.length > 0) {
    console.log(`\nChanged components (${report.changedComponents.length}):`);
    for (const name of report.changedComponents) {
      console.log(`  - ${name}`);
    }
  }

  if (report.changedFiles.length > 0) {
    console.log(`\nChanged files (${report.changedFiles.length}):`);
    for (const file of report.changedFiles) {
      console.log(`  ${file}`);
    }
  }

  // Output JSON for machine consumption
  if (process.argv.includes('--json')) {
    console.log('\n' + JSON.stringify(report, null, 2));
  }

  // Exit code based on status
  switch (report.status) {
    case 'fresh':
      process.exit(0);
    case 'stale':
      process.exit(1);
    case 'never-synced':
      process.exit(2);
  }
}

main();

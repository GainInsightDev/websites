#!/usr/bin/env node
/**
 * Orchestrates pre-design Figma preparation.
 * Run this before design work begins on an issue with `needs:design`.
 *
 * Steps:
 * 1. Check library staleness (are components out of date in Figma?)
 * 2. Regenerate component-map.json from Storybook
 * 3. Regenerate design-system-rules.md from globals.css
 * 4. Report what needs human action (re-capturing stale components)
 *
 * Usage: npx tsx .claude/scripts/figma/figma-prepare.ts [options]
 *
 * Options:
 *   --storybook-dir <path>   Built Storybook directory (default: ./storybook-static)
 *   --css <path>             CSS variables file (default: ./src/app/globals.css)
 *   --figma-dir <path>       Output directory for generated files (default: ./.figma)
 *   --skip-staleness         Skip staleness check (useful for initial setup)
 *
 * Exit codes:
 *   0 = ready (library fresh, mappings generated)
 *   1 = stale (mappings generated, but Figma library needs re-capturing)
 *   2 = error (something failed)
 *
 * @documentation .claude/skills/af-sync-figma-designs/SKILL.md
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface PrepareOptions {
  storybookDir: string;
  cssPath: string;
  figmaDir: string;
  skipStaleness: boolean;
  scriptDir: string;
}

function parseArgs(): PrepareOptions {
  const args = process.argv.slice(2);
  const projectRoot = process.cwd();
  let storybookDir = './storybook-static';
  let cssPath = './src/app/globals.css';
  let figmaDir = './.figma';
  let skipStaleness = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--storybook-dir' && args[i + 1]) {
      storybookDir = args[++i];
    } else if (args[i] === '--css' && args[i + 1]) {
      cssPath = args[++i];
    } else if (args[i] === '--figma-dir' && args[i + 1]) {
      figmaDir = args[++i];
    } else if (args[i] === '--skip-staleness') {
      skipStaleness = true;
    }
  }

  return {
    storybookDir: path.resolve(projectRoot, storybookDir),
    cssPath: path.resolve(projectRoot, cssPath),
    figmaDir: path.resolve(projectRoot, figmaDir),
    skipStaleness,
    scriptDir: path.dirname(path.resolve(__filename)),
  };
}

function runScript(scriptPath: string, args: string[]): { exitCode: number; output: string } {
  try {
    const output = execSync(`npx tsx ${scriptPath} ${args.join(' ')}`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { exitCode: 0, output };
  } catch (error: any) {
    return {
      exitCode: error.status || 1,
      output: (error.stdout || '') + (error.stderr || ''),
    };
  }
}

function main(): void {
  const opts = parseArgs();

  console.log('=== Figma Design Preparation ===\n');

  // Ensure .figma directory exists
  if (!fs.existsSync(opts.figmaDir)) {
    fs.mkdirSync(opts.figmaDir, { recursive: true });
    console.log(`Created ${opts.figmaDir}/\n`);
  }

  let libraryStale = false;

  // Step 1: Check staleness
  if (opts.skipStaleness) {
    console.log('Step 1: Staleness check SKIPPED (--skip-staleness)\n');
  } else {
    console.log('Step 1: Checking Figma library staleness...');
    const syncFile = path.join(opts.figmaDir, 'last-sync-commit');
    const stalenessScript = path.join(opts.scriptDir, 'check-library-staleness.ts');
    const result = runScript(stalenessScript, ['--sync-file', syncFile]);

    console.log(result.output);

    if (result.exitCode === 0) {
      console.log('  Result: Library is FRESH\n');
    } else if (result.exitCode === 1) {
      console.log('  Result: Library is STALE — re-capture needed\n');
      libraryStale = true;
    } else {
      console.log('  Result: Library has NEVER been synced — initial capture needed\n');
      libraryStale = true;
    }
  }

  // Step 2: Generate component map
  console.log('Step 2: Generating component map...');
  if (!fs.existsSync(opts.storybookDir)) {
    console.log(`  WARNING: Storybook build not found at ${opts.storybookDir}`);
    console.log('  Run `npm run build-storybook` first, then re-run this script.');
    console.log('  Skipping component map generation.\n');
  } else {
    const componentMapScript = path.join(opts.scriptDir, 'generate-component-map.ts');
    const componentMapOutput = path.join(opts.figmaDir, 'component-map.json');
    const result = runScript(componentMapScript, [
      '--storybook-dir', opts.storybookDir,
      '--output', componentMapOutput,
    ]);
    console.log(result.output);

    if (result.exitCode !== 0) {
      console.log('  WARNING: Component map generation failed\n');
    } else {
      console.log('  Component map generated successfully\n');
    }
  }

  // Step 3: Generate design system rules
  console.log('Step 3: Generating design system rules...');
  if (!fs.existsSync(opts.cssPath)) {
    console.log(`  WARNING: CSS file not found at ${opts.cssPath}`);
    console.log('  Specify a different path with --css <path>');
    console.log('  Skipping design rules generation.\n');
  } else {
    const rulesScript = path.join(opts.scriptDir, 'generate-design-rules.ts');
    const rulesOutput = path.join(opts.figmaDir, 'design-system-rules.md');
    const result = runScript(rulesScript, [
      '--css', opts.cssPath,
      '--output', rulesOutput,
    ]);
    console.log(result.output);

    if (result.exitCode !== 0) {
      console.log('  WARNING: Design rules generation failed\n');
    } else {
      console.log('  Design rules generated successfully\n');
    }
  }

  // Summary
  console.log('=== Summary ===\n');

  const componentMapExists = fs.existsSync(path.join(opts.figmaDir, 'component-map.json'));
  const rulesExist = fs.existsSync(path.join(opts.figmaDir, 'design-system-rules.md'));

  console.log(`  Component map: ${componentMapExists ? 'READY' : 'MISSING'}`);
  console.log(`  Design rules:  ${rulesExist ? 'READY' : 'MISSING'}`);
  console.log(`  Library:       ${libraryStale ? 'STALE — needs re-capturing' : 'FRESH'}`);

  if (libraryStale) {
    console.log('\n=== Action Required ===\n');
    console.log('The Figma component library is out of date.');
    console.log('A human with a browser needs to:');
    console.log('  1. Open a Claude Code session with Figma MCP access');
    console.log('  2. Capture updated Storybook components to the Figma Library file');
    console.log('  3. Run: echo $(git rev-parse HEAD) > .figma/last-sync-commit');
    console.log('\nAfter re-capturing, the designer can proceed with their work.');
  } else {
    console.log('\n  Ready for design work.');
  }

  process.exit(libraryStale ? 1 : 0);
}

main();

#!/usr/bin/env node
/**
 * Generates .figma/component-map.json from Storybook stories and component source files.
 * Maps Figma component/frame names to codebase imports for agent-side extraction adaptation.
 *
 * Usage: npx tsx .claude/scripts/figma/generate-component-map.ts [--storybook-dir <path>] [--output <path>]
 *
 * Defaults:
 *   --storybook-dir: ./storybook-static (built Storybook output)
 *   --output: ./.figma/component-map.json
 *
 * @documentation .claude/skills/af-sync-figma-designs/SKILL.md
 */

import * as fs from 'fs';
import * as path from 'path';

interface StoryEntry {
  id: string;
  title: string;
  name: string;
  importPath: string;
  kind?: string;
  tags?: string[];
  type?: string;
}

interface StoriesIndex {
  v: number;
  entries?: Record<string, StoryEntry>;
  stories?: Record<string, StoryEntry>;
}

interface ComponentMapping {
  import: string;
  file: string;
  variants?: Record<string, string>;
  usage?: string;
}

type ComponentMap = Record<string, ComponentMapping>;

function parseArgs(): { storybookDir: string; output: string; projectRoot: string } {
  const args = process.argv.slice(2);
  let storybookDir = './storybook-static';
  let output = './.figma/component-map.json';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--storybook-dir' && args[i + 1]) {
      storybookDir = args[++i];
    } else if (args[i] === '--output' && args[i + 1]) {
      output = args[++i];
    }
  }

  const projectRoot = process.cwd();
  return {
    storybookDir: path.resolve(projectRoot, storybookDir),
    output: path.resolve(projectRoot, output),
    projectRoot,
  };
}

function loadStoriesIndex(storybookDir: string): StoriesIndex | null {
  // Storybook 7+ uses index.json, older versions use stories.json
  const candidates = [
    path.join(storybookDir, 'index.json'),
    path.join(storybookDir, 'stories.json'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      const content = fs.readFileSync(candidate, 'utf-8');
      return JSON.parse(content);
    }
  }

  return null;
}

function extractComponentName(title: string): string {
  // Storybook titles are like "Components/Button" or "Atoms/Card"
  // Extract the last segment as the component name
  const parts = title.split('/');
  return parts[parts.length - 1].trim();
}

function resolveImportPath(importPath: string, projectRoot: string): string | null {
  // importPath from stories.json is like "./src/components/ui/button.tsx"
  // Resolve to absolute path
  const resolved = path.resolve(projectRoot, importPath);

  // Check common extensions
  const extensions = ['', '.tsx', '.ts', '.jsx', '.js'];
  for (const ext of extensions) {
    const withExt = resolved + ext;
    if (fs.existsSync(withExt)) {
      return withExt;
    }
  }

  // Try as directory with index file
  for (const ext of ['.tsx', '.ts', '.jsx', '.js']) {
    const indexFile = path.join(resolved, `index${ext}`);
    if (fs.existsSync(indexFile)) {
      return indexFile;
    }
  }

  return null;
}

function extractExports(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const exports: string[] = [];

  // Match named exports: export const/function/class Name
  const namedExportPattern = /export\s+(?:const|function|class|let|var)\s+(\w+)/g;
  let match;
  while ((match = namedExportPattern.exec(content)) !== null) {
    exports.push(match[1]);
  }

  // Match export { Name } from or export { Name }
  const braceExportPattern = /export\s*\{([^}]+)\}/g;
  while ((match = braceExportPattern.exec(content)) !== null) {
    const names = match[1].split(',').map((n) => {
      const parts = n.trim().split(/\s+as\s+/);
      return parts[parts.length - 1].trim();
    });
    exports.push(...names.filter((n) => n.length > 0));
  }

  // Match default export
  if (/export\s+default\s+/.test(content)) {
    exports.push('default');
  }

  return [...new Set(exports)];
}

function generateImportStatement(
  componentName: string,
  exports: string[],
  filePath: string,
  projectRoot: string
): string {
  // Convert absolute path to project-relative import
  let relativePath = path.relative(path.join(projectRoot, 'src'), filePath);
  // Remove extension
  relativePath = relativePath.replace(/\.(tsx?|jsx?)$/, '');
  // Convert to @/ alias format
  const importPath = `@/${relativePath}`;

  // Filter exports to likely component exports (PascalCase)
  const componentExports = exports.filter(
    (e) => e !== 'default' && /^[A-Z]/.test(e)
  );

  if (componentExports.length > 0) {
    return `import { ${componentExports.join(', ')} } from '${importPath}'`;
  }

  if (exports.includes('default')) {
    return `import ${componentName} from '${importPath}'`;
  }

  return `import { ${componentName} } from '${importPath}'`;
}

function buildComponentMap(storiesIndex: StoriesIndex, projectRoot: string): ComponentMap {
  const entries = storiesIndex.entries || storiesIndex.stories || {};
  const componentMap: ComponentMap = {};

  // Group stories by component title
  const componentStories: Record<string, StoryEntry[]> = {};
  for (const entry of Object.values(entries)) {
    // Skip docs entries
    if (entry.type === 'docs') continue;

    const componentName = extractComponentName(entry.title);
    if (!componentStories[componentName]) {
      componentStories[componentName] = [];
    }
    componentStories[componentName].push(entry);
  }

  for (const [componentName, stories] of Object.entries(componentStories)) {
    // Use the first story's importPath to find the source file
    const firstStory = stories[0];
    if (!firstStory.importPath) continue;

    // The importPath in stories.json points to the story file, not the component
    // Try to find the actual component file nearby
    const storyFilePath = resolveImportPath(firstStory.importPath, projectRoot);
    if (!storyFilePath) continue;

    // Look for the component file based on the story file location
    const storyDir = path.dirname(storyFilePath);
    const componentFileName = componentName.toLowerCase();
    const componentFileCandidates = [
      // Same directory, lowercase name
      path.join(storyDir, `${componentFileName}.tsx`),
      path.join(storyDir, `${componentFileName}.ts`),
      // Parent directory (stories might be in __stories__ or stories/)
      path.join(path.dirname(storyDir), `${componentFileName}.tsx`),
      path.join(path.dirname(storyDir), `${componentFileName}.ts`),
      // Index file in component directory
      path.join(storyDir, 'index.tsx'),
      path.join(storyDir, 'index.ts'),
    ];

    // Also try reading the story file to find the import
    let componentFile: string | null = null;
    if (storyFilePath) {
      const storyContent = fs.readFileSync(storyFilePath, 'utf-8');
      // Look for import { Component } from './component' or '../component'
      const importMatch = storyContent.match(
        new RegExp(
          `import\\s+(?:\\{[^}]*${componentName}[^}]*\\}|${componentName})\\s+from\\s+['"]([^'"]+)['"]`
        )
      );
      if (importMatch) {
        const importTarget = importMatch[1];
        const resolved = resolveImportPath(
          path.resolve(path.dirname(storyFilePath), importTarget),
          projectRoot
        );
        if (resolved) {
          componentFile = resolved;
        }
      }
    }

    // Fall back to candidate search
    if (!componentFile) {
      for (const candidate of componentFileCandidates) {
        if (fs.existsSync(candidate)) {
          componentFile = candidate;
          break;
        }
      }
    }

    if (!componentFile) {
      // Use the story file itself as fallback
      componentFile = storyFilePath;
    }

    const exports = extractExports(componentFile);
    const importStatement = generateImportStatement(
      componentName,
      exports,
      componentFile,
      projectRoot
    );

    // Build variants from story names
    const variants: Record<string, string> = {};
    for (const story of stories) {
      if (story.name && story.name !== 'Default') {
        const variantName = story.name.toLowerCase().replace(/\s+/g, '-');
        variants[variantName] = story.name;
      }
    }

    const mapping: ComponentMapping = {
      import: importStatement,
      file: path.relative(projectRoot, componentFile),
    };

    if (Object.keys(variants).length > 0) {
      mapping.variants = variants;
    }

    componentMap[componentName] = mapping;
  }

  return componentMap;
}

function main(): void {
  const { storybookDir, output, projectRoot } = parseArgs();

  console.log(`Generating component map...`);
  console.log(`  Storybook dir: ${storybookDir}`);
  console.log(`  Output: ${output}`);
  console.log(`  Project root: ${projectRoot}`);

  // Load stories index
  const storiesIndex = loadStoriesIndex(storybookDir);
  if (!storiesIndex) {
    console.error(
      `Error: Could not find stories index in ${storybookDir}`
    );
    console.error(
      '  Run `npm run build-storybook` first to generate the index.'
    );
    process.exit(1);
  }

  const entries = storiesIndex.entries || storiesIndex.stories || {};
  console.log(`  Found ${Object.keys(entries).length} story entries`);

  // Build component map
  const componentMap = buildComponentMap(storiesIndex, projectRoot);
  console.log(`  Mapped ${Object.keys(componentMap).length} components`);

  // Ensure output directory exists
  const outputDir = path.dirname(output);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write output
  fs.writeFileSync(output, JSON.stringify(componentMap, null, 2) + '\n');
  console.log(`  Written to ${output}`);

  // Print summary
  console.log('\nComponent map:');
  for (const [name, mapping] of Object.entries(componentMap)) {
    const variantCount = mapping.variants
      ? Object.keys(mapping.variants).length
      : 0;
    console.log(
      `  ${name}: ${mapping.file}${variantCount > 0 ? ` (${variantCount} variants)` : ''}`
    );
  }
}

main();

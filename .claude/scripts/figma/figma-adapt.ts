#!/usr/bin/env node
/**
 * Adapts raw Figma extraction output to use project components and tokens.
 * This is the "return flow" — Figma → Code adaptation.
 *
 * The agent workflow is:
 * 1. Agent calls get_metadata via Figma MCP → saves component tree
 * 2. Agent calls get_design_context via Figma MCP → saves raw React+Tailwind code
 * 3. Agent runs this script to adapt the raw code
 * 4. Agent uses the adapted output as the basis for implementation
 *
 * Usage: npx tsx .claude/scripts/figma/figma-adapt.ts --input <raw-code-file> [options]
 *
 * Options:
 *   --input <path>         Raw extraction code file (required)
 *   --metadata <path>      Component tree from get_metadata (optional, improves mapping)
 *   --component-map <path> Component map file (default: ./.figma/component-map.json)
 *   --design-rules <path>  Design system rules file (default: ./.figma/design-system-rules.md)
 *   --output <path>        Output file (default: stdout)
 *
 * @documentation .claude/skills/af-sync-figma-designs/SKILL.md
 */

import * as fs from 'fs';
import * as path from 'path';

interface ComponentMapping {
  import: string;
  file: string;
  variants?: Record<string, string>;
  usage?: string;
}

type ComponentMap = Record<string, ComponentMapping>;

interface TokenRule {
  hexValue: string;
  cssVariable: string;
  tailwindClass: string;
}

interface AdaptOptions {
  inputPath: string;
  metadataPath?: string;
  componentMapPath: string;
  designRulesPath: string;
  outputPath?: string;
}

function parseArgs(): AdaptOptions {
  const args = process.argv.slice(2);
  const projectRoot = process.cwd();
  let inputPath = '';
  let metadataPath: string | undefined;
  let componentMapPath = './.figma/component-map.json';
  let designRulesPath = './.figma/design-system-rules.md';
  let outputPath: string | undefined;

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--input':
        inputPath = args[++i];
        break;
      case '--metadata':
        metadataPath = args[++i];
        break;
      case '--component-map':
        componentMapPath = args[++i];
        break;
      case '--design-rules':
        designRulesPath = args[++i];
        break;
      case '--output':
        outputPath = args[++i];
        break;
    }
  }

  if (!inputPath) {
    console.error('Error: --input <path> is required');
    console.error('Usage: npx tsx figma-adapt.ts --input <raw-code-file>');
    process.exit(2);
  }

  return {
    inputPath: path.resolve(projectRoot, inputPath),
    metadataPath: metadataPath ? path.resolve(projectRoot, metadataPath) : undefined,
    componentMapPath: path.resolve(projectRoot, componentMapPath),
    designRulesPath: path.resolve(projectRoot, designRulesPath),
    outputPath: outputPath ? path.resolve(projectRoot, outputPath) : undefined,
  };
}

function loadComponentMap(filePath: string): ComponentMap {
  if (!fs.existsSync(filePath)) {
    console.error(`Warning: Component map not found at ${filePath}`);
    return {};
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function parseDesignRules(filePath: string): TokenRule[] {
  if (!fs.existsSync(filePath)) {
    console.error(`Warning: Design rules not found at ${filePath}`);
    return [];
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const rules: TokenRule[] = [];

  // Parse the markdown table rows
  // Format: | `--variable` | `value (hex)` | `tailwind-class` |
  const tableRowPattern = /\|\s*`(--[^`]+)`\s*\|\s*`([^`]+)`\s*\|\s*`([^`]+)`\s*\|/g;
  let match;

  while ((match = tableRowPattern.exec(content)) !== null) {
    const cssVariable = match[1];
    const rawValue = match[2];
    const tailwindClass = match[3];

    // Extract hex value if present (format: "hsl values (hex)")
    const hexMatch = rawValue.match(/(#[0-9a-fA-F]{6})/);
    if (hexMatch) {
      rules.push({
        hexValue: hexMatch[1].toLowerCase(),
        cssVariable,
        tailwindClass,
      });
    }
  }

  return rules;
}

function extractComponentNamesFromMetadata(metadataContent: string): string[] {
  // Parse XML-like metadata from get_metadata
  // Look for component instance names
  const names: string[] = [];
  const namePattern = /name="([^"]+)"/g;
  let match;

  while ((match = namePattern.exec(metadataContent)) !== null) {
    names.push(match[1]);
  }

  return [...new Set(names)];
}

function adaptCode(
  rawCode: string,
  componentMap: ComponentMap,
  tokenRules: TokenRule[],
  metadataNames: string[]
): { adaptedCode: string; report: string[] } {
  let code = rawCode;
  const report: string[] = [];
  const importsNeeded = new Set<string>();

  // Step 1: Replace hardcoded hex colors with Tailwind token classes
  for (const rule of tokenRules) {
    const hex = rule.hexValue;
    // Match patterns like bg-[#4b7be5], text-[#2c2c2c], border-[#e5e5e5]
    const hexPatterns = [
      { pattern: new RegExp(`bg-\\[${hex}\\]`, 'gi'), replacement: rule.tailwindClass.split(' / ')[0] || `bg-[var(${rule.cssVariable})]` },
      { pattern: new RegExp(`text-\\[${hex}\\]`, 'gi'), replacement: rule.tailwindClass.split(' / ')[1] || `text-[var(${rule.cssVariable})]` },
      { pattern: new RegExp(`border-\\[${hex}\\]`, 'gi'), replacement: `border-[var(${rule.cssVariable})]` },
      { pattern: new RegExp(`fill-\\[${hex}\\]`, 'gi'), replacement: `fill-[var(${rule.cssVariable})]` },
      { pattern: new RegExp(`stroke-\\[${hex}\\]`, 'gi'), replacement: `stroke-[var(${rule.cssVariable})]` },
      // Also match inline style hex values
      { pattern: new RegExp(`"${hex}"`, 'gi'), replacement: `"var(${rule.cssVariable})"` },
      { pattern: new RegExp(`'${hex}'`, 'gi'), replacement: `'var(${rule.cssVariable})'` },
    ];

    for (const { pattern, replacement } of hexPatterns) {
      const before = code;
      code = code.replace(pattern, replacement);
      if (code !== before) {
        report.push(`  Replaced ${hex} → ${rule.cssVariable} (${replacement})`);
      }
    }
  }

  // Step 2: Identify components from metadata names and suggest replacements
  const matchedComponents: string[] = [];
  for (const name of metadataNames) {
    // Check if this name matches a component in our map
    const componentName = Object.keys(componentMap).find(
      (key) => key.toLowerCase() === name.toLowerCase() || name.includes(key)
    );

    if (componentName) {
      matchedComponents.push(componentName);
      importsNeeded.add(componentMap[componentName].import);
    }
  }

  // Step 3: Generate import block
  const importBlock = [...importsNeeded].join('\n');

  // Step 4: Add component mapping comments
  if (matchedComponents.length > 0) {
    const componentNotes = matchedComponents.map((name) => {
      const mapping = componentMap[name];
      const variants = mapping.variants
        ? ` (variants: ${Object.keys(mapping.variants).join(', ')})`
        : '';
      return `// ${name}: ${mapping.file}${variants}`;
    });

    // Prepend imports and component notes
    code = [
      '// === Adapted imports (from component-map.json) ===',
      importBlock,
      '',
      '// === Component mappings ===',
      ...componentNotes,
      '',
      '// === Adapted code ===',
      code,
    ].join('\n');
  }

  return { adaptedCode: code, report };
}

function main(): void {
  const opts = parseArgs();

  // Load inputs
  if (!fs.existsSync(opts.inputPath)) {
    console.error(`Error: Input file not found: ${opts.inputPath}`);
    process.exit(2);
  }

  const rawCode = fs.readFileSync(opts.inputPath, 'utf-8');
  const componentMap = loadComponentMap(opts.componentMapPath);
  const tokenRules = parseDesignRules(opts.designRulesPath);

  // Load metadata if provided
  let metadataNames: string[] = [];
  if (opts.metadataPath && fs.existsSync(opts.metadataPath)) {
    const metadata = fs.readFileSync(opts.metadataPath, 'utf-8');
    metadataNames = extractComponentNamesFromMetadata(metadata);
  }

  console.error('=== Figma Extraction Adaptation ===\n');
  console.error(`  Input: ${opts.inputPath}`);
  console.error(`  Component map: ${Object.keys(componentMap).length} components`);
  console.error(`  Token rules: ${tokenRules.length} mappings`);
  console.error(`  Metadata names: ${metadataNames.length} identified\n`);

  // Run adaptation
  const { adaptedCode, report } = adaptCode(
    rawCode,
    componentMap,
    tokenRules,
    metadataNames
  );

  // Report changes
  if (report.length > 0) {
    console.error('Adaptations made:');
    for (const line of report) {
      console.error(line);
    }
    console.error(`\n  Total: ${report.length} token replacements`);
  } else {
    console.error('  No token replacements made (no hex matches found)');
  }

  if (metadataNames.length > 0) {
    const matched = metadataNames.filter((name) =>
      Object.keys(componentMap).some(
        (key) => key.toLowerCase() === name.toLowerCase() || name.includes(key)
      )
    );
    console.error(`\n  Components identified: ${matched.length}/${metadataNames.length} matched`);
    if (matched.length > 0) {
      console.error(`  Matched: ${matched.join(', ')}`);
    }
  }

  // Output
  if (opts.outputPath) {
    const outputDir = path.dirname(opts.outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(opts.outputPath, adaptedCode);
    console.error(`\n  Written to ${opts.outputPath}`);
  } else {
    // Write adapted code to stdout (reports go to stderr)
    process.stdout.write(adaptedCode);
  }
}

main();

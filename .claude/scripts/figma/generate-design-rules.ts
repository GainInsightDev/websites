#!/usr/bin/env node
/**
 * Generates .figma/design-system-rules.md from project CSS variables.
 * Maps hex color values to CSS variable names so agents can adapt
 * Figma extraction output to use project tokens instead of hardcoded values.
 *
 * Usage: npx tsx .claude/scripts/figma/generate-design-rules.ts [--css <path>] [--output <path>]
 *
 * Defaults:
 *   --css: ./src/app/globals.css
 *   --output: ./.figma/design-system-rules.md
 *
 * @documentation .claude/skills/af-sync-figma-designs/SKILL.md
 */

import * as fs from 'fs';
import * as path from 'path';

interface TokenMapping {
  variable: string;
  value: string;
  tailwindClass?: string;
  category: 'color' | 'spacing' | 'typography' | 'radius' | 'shadow' | 'other';
}

function parseArgs(): { cssPath: string; output: string } {
  const args = process.argv.slice(2);
  let cssPath = './src/app/globals.css';
  let output = './.figma/design-system-rules.md';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--css' && args[i + 1]) {
      cssPath = args[++i];
    } else if (args[i] === '--output' && args[i + 1]) {
      output = args[++i];
    }
  }

  return {
    cssPath: path.resolve(process.cwd(), cssPath),
    output: path.resolve(process.cwd(), output),
  };
}

function categorizeVariable(name: string): TokenMapping['category'] {
  const lower = name.toLowerCase();
  if (
    lower.includes('color') ||
    lower.includes('bg') ||
    lower.includes('foreground') ||
    lower.includes('border') ||
    lower.includes('ring') ||
    lower.includes('accent') ||
    lower.includes('muted') ||
    lower.includes('primary') ||
    lower.includes('secondary') ||
    lower.includes('destructive') ||
    lower.includes('card') ||
    lower.includes('popover') ||
    lower.includes('input') ||
    lower.includes('chart')
  ) {
    return 'color';
  }
  if (lower.includes('spacing') || lower.includes('gap') || lower.includes('padding') || lower.includes('margin')) {
    return 'spacing';
  }
  if (lower.includes('font') || lower.includes('text') || lower.includes('line-height') || lower.includes('letter')) {
    return 'typography';
  }
  if (lower.includes('radius')) {
    return 'radius';
  }
  if (lower.includes('shadow')) {
    return 'shadow';
  }
  return 'other';
}

function variableToTailwindClass(variable: string): string | undefined {
  // Convert CSS variable name to likely Tailwind class
  // --background -> bg-background
  // --primary -> bg-primary / text-primary
  // --border -> border
  // --radius -> rounded-[var(--radius)]
  const name = variable.replace(/^--/, '');

  // Common shadcn/ui token mappings
  const colorTokens = [
    'background', 'foreground', 'card', 'card-foreground',
    'popover', 'popover-foreground', 'primary', 'primary-foreground',
    'secondary', 'secondary-foreground', 'muted', 'muted-foreground',
    'accent', 'accent-foreground', 'destructive', 'destructive-foreground',
    'border', 'input', 'ring',
  ];

  if (colorTokens.includes(name)) {
    return `bg-${name} / text-${name}`;
  }

  if (name.startsWith('chart-')) {
    return `fill-${name} / stroke-${name}`;
  }

  if (name === 'radius') {
    return 'rounded-[var(--radius)]';
  }

  return undefined;
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function parseCSS(cssContent: string): TokenMapping[] {
  const mappings: TokenMapping[] = [];

  // Match CSS custom properties in :root or theme blocks
  // Pattern: --variable-name: value;
  const variablePattern = /--([a-zA-Z0-9-]+)\s*:\s*([^;]+);/g;
  let match;

  while ((match = variablePattern.exec(cssContent)) !== null) {
    const variable = `--${match[1]}`;
    const rawValue = match[2].trim();
    const category = categorizeVariable(match[1]);
    const tailwindClass = variableToTailwindClass(variable);

    // Try to convert HSL values to hex for matching against Figma extraction
    let displayValue = rawValue;
    const hslMatch = rawValue.match(/^(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%?\s+(\d+(?:\.\d+)?)%?$/);
    if (hslMatch) {
      const hex = hslToHex(
        parseFloat(hslMatch[1]),
        parseFloat(hslMatch[2]),
        parseFloat(hslMatch[3])
      );
      displayValue = `${rawValue} (${hex})`;
    }

    const mapping: TokenMapping = {
      variable,
      value: displayValue,
      category,
    };

    if (tailwindClass) {
      mapping.tailwindClass = tailwindClass;
    }

    mappings.push(mapping);
  }

  return mappings;
}

function generateMarkdown(mappings: TokenMapping[], cssPath: string): string {
  const lines: string[] = [];

  lines.push('# Design System Rules');
  lines.push('');
  lines.push(`Generated from: \`${path.basename(cssPath)}\``);
  lines.push(`Generated at: ${new Date().toISOString().split('T')[0]}`);
  lines.push('');
  lines.push('Use these rules when adapting Figma extraction output to use project tokens.');
  lines.push('Replace hardcoded hex/HSL values with the corresponding CSS variable.');
  lines.push('');

  // Group by category
  const categories: Record<string, TokenMapping[]> = {};
  for (const mapping of mappings) {
    if (!categories[mapping.category]) {
      categories[mapping.category] = [];
    }
    categories[mapping.category].push(mapping);
  }

  const categoryOrder: TokenMapping['category'][] = [
    'color',
    'spacing',
    'typography',
    'radius',
    'shadow',
    'other',
  ];

  const categoryLabels: Record<string, string> = {
    color: 'Colors',
    spacing: 'Spacing',
    typography: 'Typography',
    radius: 'Border Radius',
    shadow: 'Shadows',
    other: 'Other',
  };

  for (const category of categoryOrder) {
    const tokens = categories[category];
    if (!tokens || tokens.length === 0) continue;

    lines.push(`## ${categoryLabels[category]}`);
    lines.push('');
    lines.push('| CSS Variable | Value | Tailwind Class |');
    lines.push('|-------------|-------|---------------|');

    for (const token of tokens) {
      const tailwind = token.tailwindClass || '-';
      lines.push(`| \`${token.variable}\` | \`${token.value}\` | \`${tailwind}\` |`);
    }

    lines.push('');
  }

  lines.push('## Usage Instructions');
  lines.push('');
  lines.push('When adapting Figma extraction output:');
  lines.push('');
  lines.push('1. **Replace hardcoded colors** -- Find hex values in the extracted code and replace with the matching CSS variable');
  lines.push('   - `bg-[#4b7be5]` -> `bg-primary` (if #4b7be5 matches --primary)');
  lines.push('   - `text-[#2c2c2c]` -> `text-foreground` (if #2c2c2c matches --foreground)');
  lines.push('');
  lines.push('2. **Replace font strings** -- Replace inline font declarations with CSS variable references');
  lines.push("   - `font-['Inter']` -> `font-sans` (using var(--font-inter))");
  lines.push('');
  lines.push('3. **Replace spacing values** -- Use Tailwind spacing scale or CSS variables');
  lines.push('   - `p-[24px]` -> `p-6` (Tailwind scale)');
  lines.push('');
  lines.push('4. **Replace border radius** -- Use the project radius token');
  lines.push('   - `rounded-[8px]` -> `rounded-[var(--radius)]`');
  lines.push('');

  return lines.join('\n');
}

function main(): void {
  const { cssPath, output } = parseArgs();

  console.log('Generating design system rules...');
  console.log(`  CSS source: ${cssPath}`);
  console.log(`  Output: ${output}`);

  if (!fs.existsSync(cssPath)) {
    console.error(`Error: CSS file not found: ${cssPath}`);
    console.error('  Specify a different path with --css <path>');
    process.exit(1);
  }

  const cssContent = fs.readFileSync(cssPath, 'utf-8');
  const mappings = parseCSS(cssContent);

  console.log(`  Found ${mappings.length} CSS variables`);

  const markdown = generateMarkdown(mappings, cssPath);

  // Ensure output directory exists
  const outputDir = path.dirname(output);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(output, markdown);
  console.log(`  Written to ${output}`);

  // Print summary by category
  const categoryCounts: Record<string, number> = {};
  for (const m of mappings) {
    categoryCounts[m.category] = (categoryCounts[m.category] || 0) + 1;
  }
  console.log('\nToken summary:');
  for (const [cat, count] of Object.entries(categoryCounts)) {
    console.log(`  ${cat}: ${count}`);
  }
}

main();

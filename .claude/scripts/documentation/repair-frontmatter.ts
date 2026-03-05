#!/usr/bin/env node
/**
 * Repairs missing front matter in documentation files.
 * Adds required fields with sensible defaults.
 * @documentation .claude/docs/standards/documentation-standards.md
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface RepairReport {
  repairs_completed: Array<{
    file: string;
    action: string;
    title: string;
  }>;
  summary: {
    files_repaired: number;
  };
}

function hasFrontMatter(filepath: string): boolean {
  const content = fs.readFileSync(filepath, 'utf-8');
  return content.startsWith('---\n');
}

function extractTitle(content: string, filepath: string): string {
  // Try to extract title from first # heading
  const titleMatch = content.match(/^# (.+)$/m);
  if (titleMatch) {
    return titleMatch[1];
  }
  
  // Use filename without extension
  return path.basename(filepath, '.md')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

function determineParent(filepath: string): string | null {
  const normalizedPath = filepath.replace(/\\/g, '/');
  
  if (normalizedPath.includes('/.claude/docs/')) {
    if (normalizedPath.includes('/standards/')) {
      return '.claude/docs/README.md';
    }
    if (normalizedPath.includes('/reference/')) {
      return '.claude/docs/README.md';
    }
  } else if (normalizedPath.includes('/docs/')) {
    if (normalizedPath.includes('/adr/')) {
      return 'docs/architecture/README.md';
    }
    if (normalizedPath.includes('/architecture/')) {
      return 'docs/README.md';
    }
    if (normalizedPath.includes('/bdd/')) {
      return 'docs/README.md';
    }
  }
  
  return null;
}

function addFrontMatter(filepath: string): { file: string; action: string; title: string } {
  const content = fs.readFileSync(filepath, 'utf-8');
  const title = extractTitle(content, filepath);
  const parent = determineParent(filepath);
  const today = new Date().toISOString().split('T')[0];
  
  let frontMatter = `---
title: ${title}
created: ${today}
updated: ${today}
last_checked: ${today}
tags: [documentation]`;
  
  if (parent) {
    frontMatter += `\nparent: ${parent}`;
  }
  
  frontMatter += '\n---\n\n';
  
  // Add front matter to content
  const newContent = frontMatter + content;
  
  // Write back to file
  fs.writeFileSync(filepath, newContent, 'utf-8');
  
  return {
    file: filepath,
    action: 'added_frontmatter',
    title
  };
}

async function repairAll(): Promise<RepairReport> {
  const repairs = [];
  
  // Find all markdown files without front matter
  const docPatterns = [
    '.claude/docs/**/*.md',
    'docs/**/*.md'
  ];
  
  for (const pattern of docPatterns) {
    const files = await glob(pattern, { 
      posix: true 
    });
    
    for (const file of files) {
      if (!hasFrontMatter(file)) {
        const repair = addFrontMatter(file);
        repairs.push(repair);
      }
    }
  }
  
  return {
    repairs_completed: repairs,
    summary: {
      files_repaired: repairs.length
    }
  };
}

async function main() {
  try {
    const report = await repairAll();
    
    // Output quiet report - focus on what was done
    const quietReport = {
      repairs: report.repairs_completed,  // Show what was fixed
      summary: {
        ...report.summary,
        status: report.summary.files_repaired === 0 
          ? '✅ No repairs needed' 
          : `🔧 Repaired ${report.summary.files_repaired} files`
      }
    };
    
    console.log(JSON.stringify(quietReport, null, 2));
  } catch (error) {
    console.error('Repair error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}
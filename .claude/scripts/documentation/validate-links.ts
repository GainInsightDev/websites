#!/usr/bin/env node
/**
 * Validates bidirectional linking in documentation files.
 * Ensures parent-child relationships are reciprocal and all links are valid.
 * @documentation .claude/scripts/README.md
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface FrontMatter {
  title?: string;
  parent?: string;
  children?: string[];
  code_files?: string[];
  related?: string[];
}

interface LinkIssue {
  file: string;
  issues: string[];
}

interface LinkValidationReport {
  valid: string[];
  invalid: LinkIssue[];
  orphans: string[];  // Files with no parent (except allowed roots)
  summary: {
    total: number;
    valid: number;
    invalid: number;
    orphans: number;
  };
}

/**
 * Extract front matter from a markdown file
 */
function extractFrontMatter(filepath: string): FrontMatter | null {
  try {
    const content = fs.readFileSync(filepath, 'utf-8');
    const match = content.match(/^---\n(.*?)\n---/s);
    
    if (!match) {
      return null;
    }
    
    const frontMatter: FrontMatter = {};
    const lines = match[1].split('\n');
    
    let currentKey = '';
    let inArray = false;
    let arrayItems: string[] = [];
    
    for (const line of lines) {
      // Skip YAML comments
      if (line.trim().startsWith('#')) {
        continue;
      }

      // Handle array items
      if (inArray) {
        if (line.match(/^\s*-\s+(.+)/)) {
          const item = line.match(/^\s*-\s+(.+)/);
          if (item) {
            arrayItems.push(item[1].replace(/['"]/g, '').trim());
          }
        } else if (line.match(/^\w+:/)) {
          // New key, save previous array (only if it has items or is an array field)
          if (arrayItems.length > 0) {
            (frontMatter as any)[currentKey] = arrayItems;
          } else if (currentKey === 'children' || currentKey === 'related' || currentKey === 'code_files' || currentKey === 'tags') {
            // Empty array for array fields
            (frontMatter as any)[currentKey] = [];
          }
          // else: scalar field with no value, leave undefined
          inArray = false;
          arrayItems = [];
        } else if (line.trim() === '') {
          // Empty line might end array
          if (arrayItems.length > 0) {
            (frontMatter as any)[currentKey] = arrayItems;
            inArray = false;
            arrayItems = [];
          }
        }
      }
      
      // Handle new keys
      if (line.includes(':') && !inArray) {
        const [key, ...valueParts] = line.split(':');
        const value = valueParts.join(':').trim();
        currentKey = key.trim();

        if (value === '' || value === null) {
          // Might be array on next lines - but need to check next line
          inArray = true;
          arrayItems = [];
        } else if (value === 'null') {
          (frontMatter as any)[currentKey] = null;
        } else if (value.trim() === '[]') {
          // Empty array
          (frontMatter as any)[currentKey] = [];
        } else {
          (frontMatter as any)[currentKey] = value.replace(/['"]/g, '');
        }
      }
    }

    // Handle case where last key had empty value but no array items followed
    // (e.g., "parent:" with no value at end of frontmatter)
    if (inArray && arrayItems.length === 0 && currentKey) {
      // Don't set an empty array for scalar fields like parent
      // Only set if it's actually meant to be an array (has items or is explicitly [])
      if (currentKey === 'children' || currentKey === 'related' || currentKey === 'code_files' || currentKey === 'tags') {
        (frontMatter as any)[currentKey] = [];
      }
      // else leave it undefined (not set)
    }

    // Save last array if needed
    if (inArray && arrayItems.length > 0) {
      (frontMatter as any)[currentKey] = arrayItems;
    }
    
    return frontMatter;
  } catch (error) {
    return null;
  }
}

/**
 * Resolve a file path relative to the source file
 */
function resolveFilePath(fromFile: string, toFile: string): string {
  // Ensure toFile is a string (safety check)
  if (typeof toFile !== 'string') {
    throw new TypeError(`Expected toFile to be a string, got ${typeof toFile}: ${JSON.stringify(toFile)}`);
  }

  // Handle absolute paths
  if (toFile.startsWith('/')) {
    return path.join(process.cwd(), toFile);
  }

  // Handle relative paths
  if (toFile.startsWith('./') || toFile.startsWith('../')) {
    return path.resolve(path.dirname(fromFile), toFile);
  }

  // Handle paths from project root
  return path.join(process.cwd(), toFile);
}

/**
 * Normalize file path for comparison
 */
function normalizePath(filepath: string): string {
  return path.relative(process.cwd(), filepath).replace(/\\/g, '/');
}

/**
 * Check if a file is an allowed root (no parent required)
 */
function isAllowedRoot(filepath: string): boolean {
  const normalized = normalizePath(filepath);
  const allowedRoots = [
    '.claude/README.md',
    '.claude/docs/README.md',
    'docs/README.md',
    'README.md'
  ];
  
  return allowedRoots.includes(normalized);
}

/**
 * Validate all links in documentation
 */
async function validateLinks(): Promise<LinkValidationReport> {
  const report: LinkValidationReport = {
    valid: [],
    invalid: [],
    orphans: [],
    summary: {
      total: 0,
      valid: 0,
      invalid: 0,
      orphans: 0
    }
  };
  
  // First pass: collect all files and their frontmatter
  const fileMap = new Map<string, FrontMatter>();
  const docPatterns = [
    '.claude/**/*.md',
    '.claude/**/*.yml',
    '.claude/**/*.yaml', 
    'docs/**/*.md',
    'docs/**/*.yml',
    'docs/**/*.yaml'
  ];
  
  const allFiles: string[] = [];
  for (const pattern of docPatterns) {
    const files = await glob(pattern, { posix: true });
    allFiles.push(...files);
  }
  
  // Build map of all files and their frontmatter
  const allFilesList: string[] = [];
  for (const file of allFiles) {
    const normalized = normalizePath(file);
    allFilesList.push(normalized);
    
    // Extract frontmatter from Markdown and YAML files
    if (file.endsWith('.md') || file.endsWith('.yml') || file.endsWith('.yaml')) {
      const frontMatter = extractFrontMatter(file);
      if (frontMatter) {
        fileMap.set(normalized, frontMatter);
      }
    }
  }
  
  // Second pass: validate links
  for (const [filepath, frontMatter] of fileMap.entries()) {
    const issues: string[] = [];
    report.summary.total++;
    
    // Check parent relationship
    if (frontMatter.parent) {
      const parentPath = normalizePath(resolveFilePath(filepath, frontMatter.parent));
      const parentFM = fileMap.get(parentPath);
      
      if (!parentFM) {
        issues.push(`Parent file not found: ${frontMatter.parent}`);
      } else {
        // Check if parent lists this file as child
        if (parentFM.children) {
          const normalizedChildren = parentFM.children.map((child, idx) => {
            if (typeof child !== 'string') {
              console.error(`ERROR in ${parentPath}: children[${idx}] is not a string:`, child, typeof child);
              throw new TypeError(`Expected child to be a string in ${parentPath}, got ${typeof child}: ${JSON.stringify(child)}`);
            }
            return normalizePath(resolveFilePath(parentPath, child));
          });
          
          if (!normalizedChildren.includes(normalizePath(filepath))) {
            issues.push(`Parent (${frontMatter.parent}) doesn't list this file in its children`);
          }
        } else {
          issues.push(`Parent (${frontMatter.parent}) has no children array`);
        }
      }
    } else if (!isAllowedRoot(filepath)) {
      // File has no parent and is not an allowed root
      report.orphans.push(filepath);
      report.summary.orphans++;
    }
    
    // Check children relationships
    if (frontMatter.children) {
      for (const child of frontMatter.children) {
        const childPath = normalizePath(resolveFilePath(filepath, child));
        const childFM = fileMap.get(childPath);
        
        if (!childFM) {
          issues.push(`Child file not found: ${child}`);
        } else {
          // Check if child points back to this file as parent
          if (childFM.parent) {
            const childParentPath = normalizePath(resolveFilePath(childPath, childFM.parent));
            if (childParentPath !== normalizePath(filepath)) {
              issues.push(`Child (${child}) doesn't point back to this file as parent`);
            }
          } else {
            issues.push(`Child (${child}) has no parent field`);
          }
        }
      }
    }
    
    // Check if README.md files have children (unless explicitly empty)
    if (filepath.endsWith('README.md') && !frontMatter.children && !isAllowedRoot(filepath)) {
      // Check if directory has other .md files that should be children
      const dir = path.dirname(filepath);
      const siblingFiles = allFiles.filter(f => {
        const fDir = path.dirname(f);
        return fDir === dir && f !== filepath && f.endsWith('.md');
      });
      
      if (siblingFiles.length > 0) {
        issues.push(`README.md should list children files in this directory`);
      }
    }
    
    // Check code_files references
    if (frontMatter.code_files) {
      for (const codeFile of frontMatter.code_files) {
        const codePath = resolveFilePath(filepath, codeFile);
        if (!fs.existsSync(codePath)) {
          issues.push(`Referenced code file not found: ${codeFile}`);
        }
      }
    }
    
    // Check related links
    if (frontMatter.related) {
      for (const related of frontMatter.related) {
        const relatedPath = normalizePath(resolveFilePath(filepath, related));
        if (!fileMap.has(relatedPath)) {
          issues.push(`Related document not found: ${related}`);
        }
      }
    }
    
    // Add to report
    if (issues.length > 0) {
      report.invalid.push({ file: filepath, issues });
      report.summary.invalid++;
    } else {
      report.valid.push(filepath);
      report.summary.valid++;
    }
  }
  
  return report;
}

async function main() {
  try {
    const report = await validateLinks();
    
    // Output quiet report - only show problems
    const quietReport = {
      invalid: report.invalid,  // Only show files with link issues
      orphans: report.orphans,  // Only show orphaned files
      summary: report.summary,
      status: report.summary.invalid === 0 && report.summary.orphans === 0 
        ? '✅ All links valid' 
        : `❌ ${report.summary.invalid} files with link issues, ${report.summary.orphans} orphaned files`
    };
    
    console.log(JSON.stringify(quietReport, null, 2));
    
    // Exit with error code if invalid links found
    process.exit(report.summary.invalid > 0 || report.summary.orphans > 0 ? 1 : 0);
  } catch (error) {
    console.error('Link validation error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}
#!/usr/bin/env node
/**
 * Validates module-registry.yml structure, references, and dependency graph
 *
 * @description Ensures module registry has valid schema, all references resolve
 *   to real files, no circular dependencies exist, and dependency resolution
 *   produces a valid topological order.
 * @usage npx ts-node .claude/scripts/validation/validate-module-registry.ts
 * @features Schema validation, reference checking, cycle detection, topological sort
 * @category Framework Validation
 * @documentation .claude/docs/reference/module-registry.yml
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ModuleEntry {
  name: string;
  description: string;
  skill: string;
  guide?: string;
  validation_spec?: string;
  depends_on: string[];
  integrations?: Array<{
    when: string[];
    guide: string;
  }>;
}

interface Combination {
  description: string;
  modules: string[];
  notes?: string;
}

interface ModuleRegistry {
  core_modules: ModuleEntry[];
  infrastructure_modules: ModuleEntry[];
  auth_email_modules: ModuleEntry[];
  testing_modules: ModuleEntry[];
  ui_modules: ModuleEntry[];
  cicd_modules: ModuleEntry[];
  analytics_modules: ModuleEntry[];
  mobile_modules: ModuleEntry[];
  security_modules: ModuleEntry[];
  combinations: Record<string, Combination>;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const FRAMEWORK_ROOT = path.resolve(__dirname, '../..');
const DOCS_ROOT = path.join(FRAMEWORK_ROOT, 'docs');

function resolveGuide(guidePath: string): string {
  return path.join(DOCS_ROOT, guidePath);
}

function resolveSkill(skillName: string): string {
  return path.join(FRAMEWORK_ROOT, 'skills', skillName, 'SKILL.md');
}

function parseYaml(content: string): unknown {
  // Use Python's yaml module to parse YAML and output JSON
  const result = execSync(
    `python3 -c "import sys, yaml, json; print(json.dumps(yaml.safe_load(sys.stdin.read())))"`,
    { input: content, encoding: 'utf-8', timeout: 10000 }
  );
  return JSON.parse(result.trim());
}

function getAllModules(registry: ModuleRegistry): ModuleEntry[] {
  const categoryKeys = Object.keys(registry).filter(k => k.endsWith('_modules'));
  const modules: ModuleEntry[] = [];
  for (const key of categoryKeys) {
    const arr = registry[key];
    if (Array.isArray(arr)) {
      modules.push(...(arr as ModuleEntry[]));
    }
  }
  return modules;
}

// ---------------------------------------------------------------------------
// Validation functions
// ---------------------------------------------------------------------------
interface ValidationResult {
  test: string;
  passed: boolean;
  message?: string;
}

const results: ValidationResult[] = [];

function pass(test: string) {
  results.push({ test, passed: true });
}

function fail(test: string, message: string) {
  results.push({ test, passed: false, message });
}

function validateYamlParsing(content: string): ModuleRegistry | null {
  try {
    const parsed = parseYaml(content) as ModuleRegistry;
    pass('YAML parses without errors');
    return parsed;
  } catch (e) {
    fail('YAML parses without errors', `Parse error: ${(e as Error).message}`);
    return null;
  }
}

function validateRequiredCategories(registry: ModuleRegistry) {
  const required = [
    'core_modules',
    'infrastructure_modules',
    'auth_email_modules',
    'testing_modules',
    'ui_modules',
    'cicd_modules',
    'analytics_modules',
    'mobile_modules',
    'security_modules',
    'combinations',
  ];

  for (const key of required) {
    if (registry[key] !== undefined) {
      pass(`Category '${key}' exists`);
    } else {
      fail(`Category '${key}' exists`, `Missing category: ${key}`);
    }
  }
}

function validateModuleFields(modules: ModuleEntry[]) {
  for (const mod of modules) {
    const prefix = `Module '${mod.name}'`;

    if (mod.name && typeof mod.name === 'string') {
      pass(`${prefix}: has name`);
    } else {
      fail(`${prefix}: has name`, 'Missing or invalid name');
    }

    if (mod.description && typeof mod.description === 'string') {
      pass(`${prefix}: has description`);
    } else {
      fail(`${prefix}: has description`, 'Missing or invalid description');
    }

    if (mod.skill && typeof mod.skill === 'string') {
      pass(`${prefix}: has skill`);
    } else {
      fail(`${prefix}: has skill`, 'Missing or invalid skill');
    }

    if (!Array.isArray(mod.depends_on)) {
      fail(`${prefix}: has depends_on array`, 'depends_on must be an array');
    } else {
      pass(`${prefix}: has depends_on array`);
    }
  }
}

function validateSkillReferences(modules: ModuleEntry[]) {
  for (const mod of modules) {
    const skillPath = resolveSkill(mod.skill);
    if (fs.existsSync(skillPath)) {
      pass(`Skill '${mod.skill}' exists (${mod.name})`);
    } else {
      fail(`Skill '${mod.skill}' exists (${mod.name})`, `Not found: ${skillPath}`);
    }
  }
}

function validateGuideReferences(modules: ModuleEntry[]) {
  for (const mod of modules) {
    if (!mod.guide) continue;
    const guidePath = resolveGuide(mod.guide);
    if (fs.existsSync(guidePath)) {
      pass(`Guide '${mod.guide}' exists (${mod.name})`);
    } else {
      fail(`Guide '${mod.guide}' exists (${mod.name})`, `Not found: ${guidePath}`);
    }
  }
}

function validateIntegrationGuides(modules: ModuleEntry[]) {
  const allNames = new Set(modules.map(m => m.name));

  for (const mod of modules) {
    if (!mod.integrations) continue;
    for (const integration of mod.integrations) {
      // Validate 'when' references existing modules
      for (const dep of integration.when) {
        if (allNames.has(dep)) {
          pass(`Integration 'when' module '${dep}' exists (${mod.name})`);
        } else {
          fail(`Integration 'when' module '${dep}' exists (${mod.name})`, `Unknown module: ${dep}`);
        }
      }

      // Validate guide file exists
      const guidePath = resolveGuide(integration.guide);
      if (fs.existsSync(guidePath)) {
        pass(`Integration guide '${integration.guide}' exists (${mod.name})`);
      } else {
        fail(`Integration guide '${integration.guide}' exists (${mod.name})`, `Not found: ${guidePath}`);
      }
    }
  }
}

function validateValidationSpecs(modules: ModuleEntry[]) {
  const specsDir = path.join(FRAMEWORK_ROOT, 'templates', 'setup', 'validation', 'specs');

  for (const mod of modules) {
    if (!mod.validation_spec) {
      fail(`Validation spec defined (${mod.name})`, 'Missing validation_spec field');
      continue;
    }

    pass(`Validation spec defined (${mod.name})`);

    const specPath = path.join(specsDir, mod.validation_spec);
    if (fs.existsSync(specPath)) {
      pass(`Validation spec '${mod.validation_spec}' exists (${mod.name})`);
    } else {
      fail(`Validation spec '${mod.validation_spec}' exists (${mod.name})`, `Not found: ${specPath}`);
    }
  }
}

function validateDependencyReferences(modules: ModuleEntry[]) {
  const allNames = new Set(modules.map(m => m.name));

  for (const mod of modules) {
    for (const dep of mod.depends_on) {
      if (allNames.has(dep)) {
        pass(`Dependency '${dep}' exists (${mod.name})`);
      } else {
        fail(`Dependency '${dep}' exists (${mod.name})`, `Unknown module: ${dep}`);
      }
    }
  }
}

function validateNoCyclicDependencies(modules: ModuleEntry[]) {
  const graph = new Map<string, string[]>();
  for (const mod of modules) {
    graph.set(mod.name, mod.depends_on || []);
  }

  // Kahn's algorithm for cycle detection
  const inDegree = new Map<string, number>();
  for (const name of graph.keys()) {
    inDegree.set(name, 0);
  }
  for (const [, deps] of graph) {
    for (const dep of deps) {
      inDegree.set(dep, (inDegree.get(dep) || 0) + 1);
    }
  }

  const queue: string[] = [];
  for (const [name, degree] of inDegree) {
    if (degree === 0) queue.push(name);
  }

  let processed = 0;
  while (queue.length > 0) {
    const current = queue.shift()!;
    processed++;
    for (const dep of graph.get(current) || []) {
      const newDegree = (inDegree.get(dep) || 1) - 1;
      inDegree.set(dep, newDegree);
      if (newDegree === 0) queue.push(dep);
    }
  }

  if (processed === graph.size) {
    pass('No circular dependencies detected');
  } else {
    const cycleModules = [...inDegree.entries()]
      .filter(([, d]) => d > 0)
      .map(([name]) => name);
    fail('No circular dependencies detected', `Cycle involves: ${cycleModules.join(', ')}`);
  }
}

function validateTopologicalOrder(modules: ModuleEntry[]) {
  // Build adjacency (module → what it depends on)
  const graph = new Map<string, string[]>();
  for (const mod of modules) {
    graph.set(mod.name, mod.depends_on || []);
  }

  // Topological sort (DFS-based)
  const visited = new Set<string>();
  const order: string[] = [];

  function visit(name: string, path: Set<string>) {
    if (path.has(name)) return; // cycle — already caught above
    if (visited.has(name)) return;
    path.add(name);

    for (const dep of graph.get(name) || []) {
      visit(dep, path);
    }

    path.delete(name);
    visited.add(name);
    order.push(name);
  }

  for (const name of graph.keys()) {
    visit(name, new Set());
  }

  // Verify: every module appears after all its dependencies
  const position = new Map<string, number>();
  order.forEach((name, i) => position.set(name, i));

  let orderValid = true;
  for (const mod of modules) {
    for (const dep of mod.depends_on) {
      const modPos = position.get(mod.name);
      const depPos = position.get(dep);
      if (modPos !== undefined && depPos !== undefined && modPos < depPos) {
        fail(
          `Topological order: '${mod.name}' after '${dep}'`,
          `${mod.name} at position ${modPos}, ${dep} at position ${depPos}`
        );
        orderValid = false;
      }
    }
  }

  if (orderValid) {
    pass(`Topological sort valid: ${order.join(' → ')}`);
  }
}

function validateCombinations(registry: ModuleRegistry, allModules: ModuleEntry[]) {
  const allNames = new Set(allModules.map(m => m.name));

  for (const [comboName, combo] of Object.entries(registry.combinations)) {
    const prefix = `Combination '${comboName}'`;

    if (combo.description) {
      pass(`${prefix}: has description`);
    } else {
      fail(`${prefix}: has description`, 'Missing description');
    }

    if (Array.isArray(combo.modules) && combo.modules.length > 0) {
      pass(`${prefix}: has modules list`);
    } else {
      fail(`${prefix}: has modules list`, 'Missing or empty modules list');
      continue;
    }

    for (const modName of combo.modules) {
      if (allNames.has(modName)) {
        pass(`${prefix}: module '${modName}' exists`);
      } else {
        fail(`${prefix}: module '${modName}' exists`, `Unknown module: ${modName}`);
      }
    }

    // Verify combination includes all transitive dependencies
    const selected = new Set(combo.modules);
    for (const modName of combo.modules) {
      const mod = allModules.find(m => m.name === modName);
      if (!mod) continue;
      for (const dep of mod.depends_on) {
        // Core modules are always present, skip dependency check for them
        const coreNames = new Set((registry.core_modules || []).map(m => m.name));
        if (!selected.has(dep) && !coreNames.has(dep)) {
          fail(
            `${prefix}: dependency '${dep}' included for '${modName}'`,
            `Module '${modName}' depends on '${dep}' but it's not in the combination`
          );
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
  const registryPath = path.join(DOCS_ROOT, 'reference', 'module-registry.yml');

  console.log('=== Module Registry Validation ===\n');
  console.log(`Registry: ${registryPath}\n`);

  if (!fs.existsSync(registryPath)) {
    fail('Registry file exists', `Not found: ${registryPath}`);
    printResults();
    process.exit(1);
  }
  pass('Registry file exists');

  // Strip YAML frontmatter if present
  let content = fs.readFileSync(registryPath, 'utf-8');
  if (content.startsWith('---')) {
    const endIdx = content.indexOf('---', 3);
    if (endIdx > 0) {
      content = content.slice(endIdx + 3).trim();
    }
  }

  const registry = validateYamlParsing(content);
  if (!registry) {
    printResults();
    process.exit(1);
  }

  console.log('--- Schema Validation ---');
  validateRequiredCategories(registry);

  const allModules = getAllModules(registry);
  console.log(`\nFound ${allModules.length} modules across ${Object.keys(registry).filter(k => k.endsWith('_modules')).length} categories\n`);

  console.log('--- Field Validation ---');
  validateModuleFields(allModules);

  console.log('\n--- Skill References ---');
  validateSkillReferences(allModules);

  console.log('\n--- Guide References ---');
  validateGuideReferences(allModules);

  console.log('\n--- Validation Spec References ---');
  validateValidationSpecs(allModules);

  console.log('\n--- Integration Guide References ---');
  validateIntegrationGuides(allModules);

  console.log('\n--- Dependency References ---');
  validateDependencyReferences(allModules);

  console.log('\n--- Cycle Detection ---');
  validateNoCyclicDependencies(allModules);

  console.log('\n--- Topological Order ---');
  validateTopologicalOrder(allModules);

  console.log('\n--- Combination Validation ---');
  validateCombinations(registry, allModules);

  printResults();

  const failures = results.filter(r => !r.passed);
  process.exit(failures.length > 0 ? 1 : 0);
}

function printResults() {
  console.log('\n=== Results ===\n');

  const passed = results.filter(r => r.passed);
  const failed = results.filter(r => !r.passed);

  for (const r of results) {
    if (r.passed) {
      console.log(`  ✅ ${r.test}`);
    } else {
      console.log(`  ❌ ${r.test}`);
      console.log(`     → ${r.message}`);
    }
  }

  console.log(`\n${passed.length} passed, ${failed.length} failed, ${results.length} total`);
}

main();

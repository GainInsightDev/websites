#!/usr/bin/env node
/**
 * Validates template-manifest.json schema and structure
 *
 * @description Ensures manifest follows V2 schema requirements
 * @usage npx ts-node .claude/scripts/validation/validate-manifest.ts
 * @features Schema validation, namespace checking, pattern validation
 * @category Framework Validation
 * @documentation .claude/docs/reference/template-manifest-schema.md
 */

import * as fs from 'fs';
import * as path from 'path';

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
  gitSetup: {
    description: string;
    initIfMissing: boolean;
    hooks: string;
    gitignorePatterns: string[];
  };
  packageJsonScripts: {
    description: string;
    scripts: Record<string, string>;
  };
  changelog: {
    description: string;
    location: string;
    notificationChannels: string[];
    slackWebhook?: string;  // legacy — use Zulip integration instead
    slackChannel: string;   // legacy — use zulipStream instead
  };
  compatibility: {
    minNodeVersion: string;
    minClaudeCodeVersion: string;
    targetProjects: string[];
  };
  metadata: {
    created: string;
    updated: string;
    author: string;
    schemaVersion: string;
  };
}

class ManifestValidator {
  private manifest!: TemplateManifest;
  private errors: string[] = [];
  private warnings: string[] = [];
  private manifestPath: string;
  private repoRoot: string;

  constructor() {
    this.repoRoot = path.resolve(__dirname, '../../..');
    this.manifestPath = path.join(this.repoRoot, 'template-manifest.json');
  }

  /**
   * Run all validation checks
   */
  async validate(): Promise<boolean> {
    console.log('\n' + '='.repeat(60));
    console.log('📋 Template Manifest Validation');
    console.log('='.repeat(60) + '\n');

    // Load manifest
    if (!this.loadManifest()) {
      return false;
    }

    // Run validations
    this.validateSchema();
    this.validateVersion();
    this.validateNamespaces();
    this.validatePatterns();
    this.validateFrameworkAssets();
    this.validateCompatibility();

    // Report results
    this.printResults();

    return this.errors.length === 0;
  }

  /**
   * Load and parse manifest file
   */
  private loadManifest(): boolean {
    try {
      if (!fs.existsSync(this.manifestPath)) {
        this.errors.push(`Manifest not found: ${this.manifestPath}`);
        return false;
      }

      const content = fs.readFileSync(this.manifestPath, 'utf-8');
      this.manifest = JSON.parse(content);
      console.log(`✅ Loaded manifest: ${this.manifestPath}\n`);
      return true;
    } catch (error) {
      this.errors.push(`Failed to parse manifest: ${error}`);
      return false;
    }
  }

  /**
   * Validate required schema fields exist
   */
  private validateSchema(): void {
    const requiredFields = [
      'version',
      'framework',
      'namespaces',
      'syncBehavior',
      'metadata'
    ];

    for (const field of requiredFields) {
      if (!(field in this.manifest)) {
        this.errors.push(`Missing required field: ${field}`);
      }
    }

    if (this.errors.length === 0) {
      console.log('✅ Schema structure valid\n');
    }
  }

  /**
   * Validate version follows semver
   */
  private validateVersion(): void {
    const semverPattern = /^\d+\.\d+\.\d+$/;

    if (!semverPattern.test(this.manifest.version)) {
      this.errors.push(`Invalid version format: ${this.manifest.version} (expected semver)`);
    } else {
      console.log(`✅ Version: ${this.manifest.version}\n`);
    }

    // Check metadata matches
    if (this.manifest.metadata.schemaVersion !== this.manifest.version.split('.')[0] + '.0') {
      this.warnings.push(`Metadata schemaVersion (${this.manifest.metadata.schemaVersion}) doesn't match major version`);
    }
  }

  /**
   * Validate namespace configuration
   */
  private validateNamespaces(): void {
    const { framework, validation } = this.manifest.namespaces;

    // Check framework prefix
    if (!framework || framework.length === 0) {
      this.errors.push('Missing framework namespace prefix');
      return;
    }

    if (!framework.endsWith('-')) {
      this.warnings.push(`Framework prefix "${framework}" should end with hyphen for consistency`);
    }

    // Check validation flags
    if (!validation.enforceFrameworkPrefix) {
      this.warnings.push('enforceFrameworkPrefix is disabled - framework assets may lack namespace');
    }

    console.log(`✅ Namespace: "${framework}" prefix for framework assets\n`);
  }

  /**
   * Validate glob patterns are valid
   */
  private validatePatterns(): void {
    const allPatterns = [
      ...this.manifest.framework.include,
      ...this.manifest.framework.exclude,
      ...this.manifest.infrastructure.include,
      ...this.manifest.projectSpecific.preserve
    ];

    let invalidPatterns = 0;
    for (const pattern of allPatterns) {
      try {
        // Test pattern compilation
        new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'));
      } catch (error) {
        this.errors.push(`Invalid pattern: ${pattern}`);
        invalidPatterns++;
      }
    }

    if (invalidPatterns === 0) {
      console.log(`✅ All ${allPatterns.length} glob patterns valid\n`);
    }
  }

  /**
   * Validate framework assets follow namespace rules
   */
  private validateFrameworkAssets(): void {
    const prefix = this.manifest.namespaces.framework;
    const claudeDir = path.join(this.repoRoot, '.claude');

    if (!fs.existsSync(claudeDir)) {
      this.warnings.push('.claude directory not found - skipping asset validation');
      return;
    }

    let totalChecked = 0;
    let violations = 0;

    // Check agents
    const agentsDir = path.join(claudeDir, 'agents');
    if (fs.existsSync(agentsDir)) {
      const agents = fs.readdirSync(agentsDir)
        .filter(f => f.endsWith('.md') && !f.startsWith('README'));

      for (const agent of agents) {
        totalChecked++;
        if (!agent.startsWith(prefix)) {
          this.errors.push(`Agent missing af- prefix: ${agent}`);
          violations++;
        }
      }
    }

    // Check skills
    const skillsDir = path.join(claudeDir, 'skills');
    if (fs.existsSync(skillsDir)) {
      const skills = fs.readdirSync(skillsDir)
        .filter(f => fs.statSync(path.join(skillsDir, f)).isDirectory());

      for (const skill of skills) {
        totalChecked++;
        if (!skill.startsWith(prefix)) {
          this.errors.push(`Skill missing af- prefix: ${skill}/`);
          violations++;
        }
      }
    }

    if (violations === 0) {
      console.log(`✅ All ${totalChecked} framework assets have "${prefix}" prefix\n`);
    } else {
      console.log(`❌ ${violations}/${totalChecked} assets violate namespace rules\n`);
    }
  }

  /**
   * Validate compatibility requirements
   */
  private validateCompatibility(): void {
    const { minNodeVersion, minClaudeCodeVersion } = this.manifest.compatibility;

    // Check node version format
    const semverPattern = /^\d+\.\d+\.\d+$/;
    if (!semverPattern.test(minNodeVersion)) {
      this.errors.push(`Invalid minNodeVersion: ${minNodeVersion}`);
    }
    if (!semverPattern.test(minClaudeCodeVersion)) {
      this.errors.push(`Invalid minClaudeCodeVersion: ${minClaudeCodeVersion}`);
    }

    // Check current node version
    const currentNodeVersion = process.version.slice(1); // Remove 'v' prefix
    if (this.compareVersions(currentNodeVersion, minNodeVersion) < 0) {
      this.warnings.push(`Current Node ${currentNodeVersion} below minimum ${minNodeVersion}`);
    }

    console.log(`✅ Compatibility: Node >= ${minNodeVersion}, Claude Code >= ${minClaudeCodeVersion}\n`);
  }

  /**
   * Compare semantic versions
   */
  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < 3; i++) {
      if (parts1[i] > parts2[i]) return 1;
      if (parts1[i] < parts2[i]) return -1;
    }
    return 0;
  }

  /**
   * Print validation results
   */
  private printResults(): void {
    console.log('='.repeat(60));
    console.log('Validation Results');
    console.log('='.repeat(60) + '\n');

    if (this.errors.length > 0) {
      console.log('❌ ERRORS:\n');
      this.errors.forEach(error => console.log(`  • ${error}`));
      console.log();
    }

    if (this.warnings.length > 0) {
      console.log('⚠️  WARNINGS:\n');
      this.warnings.forEach(warning => console.log(`  • ${warning}`));
      console.log();
    }

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ All validations passed!\n');
    }

    console.log(`Summary: ${this.errors.length} errors, ${this.warnings.length} warnings\n`);
  }
}

// Run validation
const validator = new ManifestValidator();
validator.validate().then(success => {
  process.exit(success ? 0 : 1);
});

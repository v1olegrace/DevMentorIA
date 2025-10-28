#!/usr/bin/env node

/* eslint-disable no-console */

/**
 * DevMentor AI - Extension Validation Script
 * Performs lightweight validation checks before packaging the Chrome extension.
 */

const fs = require('fs/promises');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

/**
 * Resolve a path inside the project root and reject attempts to traverse upwards.
 * @param {string} relativePath - Path relative to the project root.
 * @returns {string} Absolute path inside the project.
 */
function resolveProjectPath (relativePath) {
  const resolvedPath = path.resolve(projectRoot, relativePath);
  if (!resolvedPath.startsWith(projectRoot)) {
    throw new Error(`Blocked access outside project root: ${relativePath}`);
  }
  return resolvedPath;
}

/**
 * Check whether a given project-relative path exists.
 * @param {string} relativePath - Path relative to the project root.
 * @returns {Promise<boolean>} Resolves true when the path exists.
 */
async function pathExists (relativePath) {
  try {
    await fs.access(resolveProjectPath(relativePath));
    return true;
  } catch {
    return false;
  }
}

/**
 * Read a text file from the project root with path validation.
 * @param {string} relativePath - Relative path from project root.
 * @param {BufferEncoding} [encoding='utf8'] - Encoding to use.
 * @returns {Promise<string>} File contents.
 */
async function readProjectFile (relativePath, encoding = 'utf8') {
  const absolutePath = resolveProjectPath(relativePath);
  // The path is validated above; suppress security rule for dynamic filename usage.
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  return fs.readFile(absolutePath, encoding);
}

/**
 * Retrieve file metadata from the project root with path validation.
 * @param {string} relativePath - Relative path from project root.
 * @returns {Promise<import('fs').Stats>} File statistics.
 */
async function statProjectFile (relativePath) {
  const absolutePath = resolveProjectPath(relativePath);
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  return fs.stat(absolutePath);
}

class ExtensionValidator {
  constructor () {
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Run all validation steps.
   * @returns {Promise<boolean>} True when validation succeeds.
   */
  async validate () {
    console.log('Validating DevMentor AI Chrome Extension...\n');

    await this.validateManifest();
    await this.validateFileStructure();
    await this.validateSecurity();
    await this.validatePerformance();

    this.printResults();
    return this.errors.length === 0;
  }

  /**
   * Load and parse manifest.json safely.
   * @returns {Promise<Object>} Parsed manifest.
   */
  async loadManifest () {
    const raw = await readProjectFile('manifest.json');
    return JSON.parse(raw);
  }

  /**
   * Validate required fields and CSP in manifest.json.
   */
  async validateManifest () {
    console.log('Validating manifest.json...');

    try {
      const manifest = await this.loadManifest();

      if (manifest.manifest_version !== 3) {
        this.errors.push('Manifest version must be 3.');
      }

      const requiredFields = ['name', 'version', 'description', 'permissions'];
      for (const field of requiredFields) {
        if (!Object.prototype.hasOwnProperty.call(manifest, field)) {
          this.errors.push(`Missing required field: ${field}`);
        }
      }

      if (Array.isArray(manifest.permissions)) {
        const requiredPermissions = [
          'activeTab',
          'contextMenus',
          'storage',
          'scripting'
        ];

        for (const permission of requiredPermissions) {
          if (!manifest.permissions.includes(permission)) {
            this.errors.push(`Missing required permission: ${permission}`);
          }
        }
      } else {
        this.errors.push('Manifest permissions must be an array.');
      }

      const csp =
        manifest.content_security_policy?.extension_pages ??
        manifest.content_security_policy ??
        '';

      if (!csp) {
        this.errors.push('Missing Content Security Policy for extension pages.');
      } else {
        if (csp.includes('\'unsafe-inline\'')) {
          this.errors.push(
            'SECURITY RISK: CSP contains unsafe-inline; remove to harden the extension.'
          );
        }

        if (csp.includes('\'unsafe-eval\'')) {
          this.errors.push(
            'SECURITY RISK: CSP contains unsafe-eval; remove to harden the extension.'
          );
        }

        if (csp.includes('\'wasm-unsafe-eval\'')) {
          this.warnings.push(
            'SECURITY WARNING: wasm-unsafe-eval is unnecessary for Chrome Built-in AI; consider removing.'
          );
        }

        if (csp.includes('data:')) {
          this.warnings.push(
            'SECURITY WARNING: data: protocol detected in CSP; review whether this is required.'
          );
        }
      }

      console.log('Manifest validation completed.');
    } catch (error) {
      this.errors.push(`Manifest validation failed: ${error.message}`);
    }
  }

  /**
   * Ensure required files exist.
   */
  async validateFileStructure () {
    console.log('Validating file structure...');

    const requiredFiles = [
      'manifest.json',
      'background/service-worker.js',
      'content/content-script.js',
      'popup.html',
      'popup.js'
    ];

    for (const file of requiredFiles) {
      if (!(await pathExists(file))) {
        this.errors.push(`Missing required file: ${file}`);
      }
    }

    console.log('File structure validation completed.');
  }

  /**
   * Look for unsafe patterns in critical files.
   */
  async validateSecurity () {
    console.log('Running security checks...');

    const filesToInspect = [
      'background/service-worker.js',
      'content/content-script.js',
      'popup.js',
      'utils/secure-eval-manager.js',
      'utils/secure-html-sanitizer.js'
    ];

    const dangerousPatterns = [
      { pattern: /eval\s*\(/, message: 'eval() usage detected' },
      { pattern: /new\s+Function\s*\(/, message: 'new Function() usage detected' },
      { pattern: /innerHTML\s*=/, message: 'Direct innerHTML assignment detected' },
      { pattern: /document\.write/, message: 'document.write() usage detected' }
    ];

    for (const relativePath of filesToInspect) {
      if (!(await pathExists(relativePath))) continue;

      const content = await readProjectFile(relativePath, 'utf8');

      for (const { pattern, message } of dangerousPatterns) {
        if (pattern.test(content)) {
          this.warnings.push(`${relativePath}: ${message}`);
        }
      }
    }

    console.log('Security validation completed.');
  }

  /**
   * Warn when large bundles could slow the popup or background scripts.
   */
  async validatePerformance () {
    console.log('Checking performance budget...');

    const maxFileSizeBytes = 1024 * 1024; // 1 MB
    const filesToCheck = [
      'background/service-worker.js',
      'content/content-script.js',
      'popup.js'
    ];

    for (const relativePath of filesToCheck) {
      if (!(await pathExists(relativePath))) continue;

      const stats = await statProjectFile(relativePath);
      if (stats.size > maxFileSizeBytes) {
        const sizeKb = (stats.size / 1024).toFixed(1);
        this.warnings.push(
          `${relativePath}: File size ${sizeKb}KB exceeds the recommended 1MB budget`
        );
      }
    }

    console.log('Performance validation completed.');
  }

  /**
   * Print a summary of validation results.
   */
  printResults () {
    console.log('\nValidation Results');
    console.log('='.repeat(50));

    if (this.errors.length === 0) {
      console.log('All validations passed!');
    } else {
      console.log('Validation errors:');
      for (const errorMessage of this.errors) {
        console.log(`  - ${errorMessage}`);
      }
    }

    if (this.warnings.length > 0) {
      console.log('\nWarnings:');
      for (const warningMessage of this.warnings) {
        console.log(`  - ${warningMessage}`);
      }
    }

    console.log('\nSummary');
    console.log(`  Errors: ${this.errors.length}`);
    console.log(`  Warnings: ${this.warnings.length}`);
    console.log(`  Status: ${this.errors.length === 0 ? 'PASS' : 'FAIL'}`);
  }
}

async function runValidator () {
  const validator = new ExtensionValidator();
  const success = await validator.validate();
  process.exitCode = success ? 0 : 1;
}

if (require.main === module) {
  runValidator().catch(error => {
    console.error(`Unexpected validation failure: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = ExtensionValidator;

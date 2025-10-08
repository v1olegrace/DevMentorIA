#!/usr/bin/env node

/**
 * DevMentor AI - Extension Validation Script
 * Validates Chrome extension before packaging
 */

const fs = require('fs');
const path = require('path');

class ExtensionValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.manifestPath = path.join(__dirname, 'manifest.json');
  }

  /**
   * Validate extension
   */
  async validate() {
    console.log('🔍 Validating DevMentor AI Chrome Extension...\n');

    // Validate manifest
    await this.validateManifest();

    // Validate file structure
    await this.validateFileStructure();

    // Validate security
    await this.validateSecurity();

    // Validate performance
    await this.validatePerformance();

    // Print results
    this.printResults();

    return this.errors.length === 0;
  }

  /**
   * Validate manifest.json
   */
  async validateManifest() {
    console.log('📋 Validating manifest.json...');

    try {
      const manifest = JSON.parse(fs.readFileSync(this.manifestPath, 'utf8'));

      // Check manifest version
      if (manifest.manifest_version !== 3) {
        this.errors.push('Manifest version must be 3');
      }

      // Check required fields
      const requiredFields = ['name', 'version', 'description', 'permissions'];
      requiredFields.forEach(field => {
        if (!manifest[field]) {
          this.errors.push(`Missing required field: ${field}`);
        }
      });

      // Check permissions
      const requiredPermissions = ['activeTab', 'contextMenus', 'storage', 'scripting'];
      requiredPermissions.forEach(permission => {
        if (!manifest.permissions.includes(permission)) {
          this.errors.push(`Missing required permission: ${permission}`);
        }
      });

      // Check CSP
      if (!manifest.content_security_policy) {
        this.errors.push('Missing Content Security Policy');
      } else {
        const csp = manifest.content_security_policy.extension_pages;
        if (!csp.includes("'wasm-unsafe-eval'")) {
          this.errors.push('CSP must include wasm-unsafe-eval for Chrome Built-in AI');
        }
      }

      console.log('✅ Manifest validation completed');
    } catch (error) {
      this.errors.push(`Manifest validation failed: ${error.message}`);
    }
  }

  /**
   * Validate file structure
   */
  async validateFileStructure() {
    console.log('📁 Validating file structure...');

    const requiredFiles = [
      'manifest.json',
      'background/service-worker.js',
      'content/content-script.js',
      'popup/popup.html',
      'popup/popup.js',
      'popup/popup.css',
      'assets/icons/icon16.svg',
      'assets/icons/icon32.svg',
      'assets/icons/icon48.svg',
      'assets/icons/icon128.svg'
    ];

    const requiredUtils = [
      'utils/secure-html-sanitizer.js',
      'utils/secure-eval-manager.js',
      'utils/chrome-builtin-ai.js',
      'utils/shadow-dom-overlay.js',
      'utils/secure-storage-manager.js'
    ];

    [...requiredFiles, ...requiredUtils].forEach(file => {
      const filePath = path.join(__dirname, file);
      if (!fs.existsSync(filePath)) {
        this.errors.push(`Missing required file: ${file}`);
      }
    });

    console.log('✅ File structure validation completed');
  }

  /**
   * Validate security
   */
  async validateSecurity() {
    console.log('🔒 Validating security...');

    // Check for eval usage
    const filesToCheck = [
      'background/service-worker.js',
      'content/content-script.js',
      'popup/popup.js',
      'utils/secure-eval-manager.js',
      'utils/secure-html-sanitizer.js'
    ];

    filesToCheck.forEach(file => {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for dangerous patterns
        const dangerousPatterns = [
          { pattern: /eval\s*\(/, message: 'eval() usage detected' },
          { pattern: /new\s+Function\s*\(/, message: 'new Function() usage detected' },
          { pattern: /innerHTML\s*=/, message: 'Direct innerHTML assignment detected' },
          { pattern: /document\.write/, message: 'document.write() usage detected' }
        ];

        dangerousPatterns.forEach(({ pattern, message }) => {
          if (pattern.test(content)) {
            this.warnings.push(`${file}: ${message}`);
          }
        });
      }
    });

    console.log('✅ Security validation completed');
  }

  /**
   * Validate performance
   */
  async validatePerformance() {
    console.log('⚡ Validating performance...');

    // Check file sizes
    const maxFileSize = 1024 * 1024; // 1MB
    const filesToCheck = [
      'background/service-worker.js',
      'content/content-script.js',
      'popup/popup.js'
    ];

    filesToCheck.forEach(file => {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        if (stats.size > maxFileSize) {
          this.warnings.push(`${file}: File size ${(stats.size / 1024).toFixed(1)}KB exceeds recommended 1MB`);
        }
      }
    });

    console.log('✅ Performance validation completed');
  }

  /**
   * Print validation results
   */
  printResults() {
    console.log('\n📊 Validation Results:');
    console.log('='.repeat(50));

    if (this.errors.length === 0) {
      console.log('✅ All validations passed!');
    } else {
      console.log('❌ Validation errors:');
      this.errors.forEach(error => {
        console.log(`  • ${error}`);
      });
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.warnings.forEach(warning => {
        console.log(`  • ${warning}`);
      });
    }

    console.log('\n📈 Summary:');
    console.log(`  Errors: ${this.errors.length}`);
    console.log(`  Warnings: ${this.warnings.length}`);
    console.log(`  Status: ${this.errors.length === 0 ? 'PASS' : 'FAIL'}`);
  }
}

// Run validation
if (require.main === module) {
  const validator = new ExtensionValidator();
  validator.validate().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = ExtensionValidator;








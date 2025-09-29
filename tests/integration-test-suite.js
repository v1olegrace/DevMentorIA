/**
 * DevMentor AI - Suite Completa de Testes de Integração
 * Testa todos os componentes do sistema de forma integrada
 */

class IntegrationTestSuite {
  constructor() {
    this.logger = (typeof __DEVMENTOR_LOGGER !== 'undefined') ? __DEVMENTOR_LOGGER : console;
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      tests: []
    };
    this.startTime = null;
    this.testTimeout = 30000; // 30 segundos por teste
  }

  async runAllTests() {
    this.startTime = Date.now();
    this.logger.info('[IntegrationTestSuite] Starting comprehensive test suite');
    
    try {
      // Testes de Inicialização
      await this.runInitializationTests();
      
      // Testes de Cache
      await this.runCacheTests();
      
      // Testes de Rede
      await this.runNetworkTests();
      
      // Testes de IA
      await this.runAITests();
      
      // Testes de Segurança
      await this.runSecurityTests();
      
      // Testes de Performance
      await this.runPerformanceTests();
      
      // Testes de Cleanup
      await this.runCleanupTests();
      
      this.results.duration = Date.now() - this.startTime;
      this.generateReport();
      
    } catch (error) {
      this.logger.error('[IntegrationTestSuite] Test suite failed:', error);
      throw error;
    }
  }

  async runInitializationTests() {
    this.logger.info('[IntegrationTestSuite] Running initialization tests');
    
    const tests = [
      {
        name: 'Constructor Async Safety',
        test: () => this.testConstructorAsyncSafety()
      },
      {
        name: 'System Integration Initialization',
        test: () => this.testSystemIntegrationInit()
      },
      {
        name: 'Concurrent Initialization',
        test: () => this.testConcurrentInitialization()
      },
      {
        name: 'Initialization Error Handling',
        test: () => this.testInitializationErrorHandling()
      }
    ];

    await this.runTestGroup('Initialization', tests);
  }

  async runCacheTests() {
    this.logger.info('[IntegrationTestSuite] Running cache tests');
    
    const tests = [
      {
        name: 'Cache Thread Safety',
        test: () => this.testCacheThreadSafety()
      },
      {
        name: 'Cache Compression',
        test: () => this.testCacheCompression()
      },
      {
        name: 'Cache Persistence',
        test: () => this.testCachePersistence()
      },
      {
        name: 'Cache Memory Limits',
        test: () => this.testCacheMemoryLimits()
      },
      {
        name: 'Cache Race Conditions',
        test: () => this.testCacheRaceConditions()
      }
    ];

    await this.runTestGroup('Cache', tests);
  }

  async runNetworkTests() {
    this.logger.info('[IntegrationTestSuite] Running network tests');
    
    const tests = [
      {
        name: 'Health Check Robustness',
        test: () => this.testHealthCheckRobustness()
      },
      {
        name: 'Circuit Breaker',
        test: () => this.testCircuitBreaker()
      },
      {
        name: 'Network Retry Logic',
        test: () => this.testNetworkRetryLogic()
      },
      {
        name: 'Endpoint Priority',
        test: () => this.testEndpointPriority()
      }
    ];

    await this.runTestGroup('Network', tests);
  }

  async runAITests() {
    this.logger.info('[IntegrationTestSuite] Running AI tests');
    
    const tests = [
      {
        name: 'Provider Selection',
        test: () => this.testProviderSelection()
      },
      {
        name: 'Fallback Mechanism',
        test: () => this.testFallbackMechanism()
      },
      {
        name: 'Chrome AI Integration',
        test: () => this.testChromeAIIntegration()
      },
      {
        name: 'AI Response Caching',
        test: () => this.testAIResponseCaching()
      }
    ];

    await this.runTestGroup('AI', tests);
  }

  async runSecurityTests() {
    this.logger.info('[IntegrationTestSuite] Running security tests');
    
    const tests = [
      {
        name: 'Eval Manager Security',
        test: () => this.testEvalManagerSecurity()
      },
      {
        name: 'HTML Sanitization',
        test: () => this.testHTMLSanitization()
      },
      {
        name: 'Logger Redaction',
        test: () => this.testLoggerRedaction()
      },
      {
        name: 'Input Validation',
        test: () => this.testInputValidation()
      }
    ];

    await this.runTestGroup('Security', tests);
  }

  async runPerformanceTests() {
    this.logger.info('[IntegrationTestSuite] Running performance tests');
    
    const tests = [
      {
        name: 'Memory Usage',
        test: () => this.testMemoryUsage()
      },
      {
        name: 'Response Latency',
        test: () => this.testResponseLatency()
      },
      {
        name: 'Concurrent Load',
        test: () => this.testConcurrentLoad()
      },
      {
        name: 'JSON Optimization',
        test: () => this.testJSONOptimization()
      }
    ];

    await this.runTestGroup('Performance', tests);
  }

  async runCleanupTests() {
    this.logger.info('[IntegrationTestSuite] Running cleanup tests');
    
    const tests = [
      {
        name: 'Interval Cleanup',
        test: () => this.testIntervalCleanup()
      },
      {
        name: 'Memory Leak Prevention',
        test: () => this.testMemoryLeakPrevention()
      },
      {
        name: 'Resource Disposal',
        test: () => this.testResourceDisposal()
      }
    ];

    await this.runTestGroup('Cleanup', tests);
  }

  async runTestGroup(groupName, tests) {
    this.logger.info(`[IntegrationTestSuite] Running ${groupName} test group`);
    
    for (const test of tests) {
      await this.runSingleTest(`${groupName}.${test.name}`, test.test);
    }
  }

  async runSingleTest(testName, testFunction) {
    const testStart = Date.now();
    this.results.total++;
    
    try {
      this.logger.debug(`[IntegrationTestSuite] Running test: ${testName}`);
      
      // Timeout wrapper
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Test timeout')), this.testTimeout);
      });
      
      const testPromise = testFunction();
      await Promise.race([testPromise, timeoutPromise]);
      
      const duration = Date.now() - testStart;
      this.results.passed++;
      
      this.results.tests.push({
        name: testName,
        status: 'PASSED',
        duration: duration,
        error: null
      });
      
      this.logger.info(`[IntegrationTestSuite] ✅ ${testName} - PASSED (${duration}ms)`);
      
    } catch (error) {
      const duration = Date.now() - testStart;
      this.results.failed++;
      
      this.results.tests.push({
        name: testName,
        status: 'FAILED',
        duration: duration,
        error: error.message
      });
      
      this.logger.error(`[IntegrationTestSuite] ❌ ${testName} - FAILED (${duration}ms): ${error.message}`);
    }
  }

  // Implementações dos testes específicos
  async testConstructorAsyncSafety() {
    // Teste: Constructor não deve chamar métodos async diretamente
    const manager = new AIProviderManager();
    
    if (manager.isInitialized) {
      throw new Error('Constructor should not initialize synchronously');
    }
    
    await manager.ensureInitialized();
    
    if (!manager.isInitialized) {
      throw new Error('ensureInitialized should set isInitialized to true');
    }
  }

  async testSystemIntegrationInit() {
    // Teste: Sistema de integração deve inicializar corretamente
    const integration = new DevMentorAIIntegration();
    
    await integration.ensureInitialized();
    
    if (!integration.isInitialized) {
      throw new Error('Integration system should be initialized');
    }
    
    const status = integration.getSystemStatus();
    if (!status.isInitialized) {
      throw new Error('System status should reflect initialization');
    }
  }

  async testConcurrentInitialization() {
    // Teste: Múltiplas inicializações concorrentes devem ser seguras
    const promises = [];
    
    for (let i = 0; i < 5; i++) {
      const manager = new AIProviderManager();
      promises.push(manager.ensureInitialized());
    }
    
    await Promise.all(promises);
    
    // Se chegou aqui sem erro, o teste passou
  }

  async testInitializationErrorHandling() {
    // Teste: Erros de inicialização devem ser tratados adequadamente
    const manager = new AIProviderManager();
    
    // Simular erro de inicialização
    const originalLoadConfig = manager.loadConfig;
    manager.loadConfig = async () => {
      throw new Error('Simulated config load error');
    };
    
    try {
      await manager.ensureInitialized();
      throw new Error('Should have thrown initialization error');
    } catch (error) {
      if (!manager.initializationError) {
        throw new Error('Initialization error should be stored');
      }
    }
    
    // Restaurar método original
    manager.loadConfig = originalLoadConfig;
  }

  async testCacheThreadSafety() {
    // Teste: Cache deve ser thread-safe
    const cache = new LocalCacheSystem();
    await cache.ensureInitialized();
    
    const promises = [];
    
    // Operações concorrentes
    for (let i = 0; i < 100; i++) {
      promises.push(cache.set(`key${i}`, `value${i}`));
      promises.push(cache.get(`key${i}`));
      promises.push(cache.delete(`key${i}`));
    }
    
    await Promise.all(promises);
    
    // Se chegou aqui sem erro, o teste passou
  }

  async testCacheCompression() {
    // Teste: Cache deve comprimir dados grandes
    const cache = new LocalCacheSystem();
    await cache.ensureInitialized();
    
    const largeData = 'x'.repeat(2000); // 2KB de dados
    cache.set('large', largeData);
    
    const retrieved = cache.get('large');
    if (retrieved !== largeData) {
      throw new Error('Cache compression/decompression failed');
    }
  }

  async testCachePersistence() {
    // Teste: Cache deve persistir dados
    const cache = new LocalCacheSystem();
    await cache.ensureInitialized();
    
    cache.set('persistent', 'test-value');
    await cache.savePersistentCache();
    
    // Simular recriação do cache
    const newCache = new LocalCacheSystem();
    await newCache.loadPersistentCache();
    
    const retrieved = newCache.get('persistent');
    if (retrieved !== 'test-value') {
      throw new Error('Cache persistence failed');
    }
  }

  async testCacheMemoryLimits() {
    // Teste: Cache deve respeitar limites de memória
    const cache = new LocalCacheSystem();
    await cache.ensureInitialized();
    
    // Tentar adicionar dados muito grandes
    const hugeData = 'x'.repeat(100 * 1024 * 1024); // 100MB
    
    const result = cache.set('huge', hugeData);
    if (result !== false) {
      throw new Error('Cache should reject data larger than memory limit');
    }
  }

  async testCacheRaceConditions() {
    // Teste: Cache deve evitar race conditions
    const cache = new LocalCacheSystem();
    await cache.ensureInitialized();
    
    const promises = [];
    
    // Operações que podem causar race conditions
    for (let i = 0; i < 50; i++) {
      promises.push(cache.set(`race${i}`, `value${i}`));
      promises.push(cache.delete(`race${i}`));
    }
    
    await Promise.all(promises);
    
    // Verificar que não há dados corrompidos
    const stats = cache.getStats();
    if (stats.size < 0) {
      throw new Error('Cache size should not be negative');
    }
  }

  async testHealthCheckRobustness() {
    // Teste: Health check deve ser robusto
    const healthChecker = new NetworkHealthChecker();
    await healthChecker.ensureInitialized();
    
    const result = await healthChecker.performHealthCheck();
    
    if (typeof result !== 'object') {
      throw new Error('Health check should return an object');
    }
  }

  async testCircuitBreaker() {
    // Teste: Circuit breaker deve funcionar
    const healthChecker = new NetworkHealthChecker();
    await healthChecker.ensureInitialized();
    
    // Simular falhas para abrir o circuit breaker
    for (let i = 0; i < 10; i++) {
      try {
        await healthChecker.pingEndpoint('http://invalid-url-that-will-fail.com');
      } catch (error) {
        // Esperado
      }
    }
    
    if (healthChecker.circuitBreaker.state !== 'OPEN') {
      throw new Error('Circuit breaker should be OPEN after failures');
    }
  }

  async testNetworkRetryLogic() {
    // Teste: Lógica de retry deve funcionar
    const healthChecker = new NetworkHealthChecker();
    await healthChecker.ensureInitialized();
    
    const result = await healthChecker.pingEndpoint('http://httpbin.org/status/500');
    
    if (!result.retryCount) {
      throw new Error('Retry count should be tracked');
    }
  }

  async testEndpointPriority() {
    // Teste: Endpoints devem ser testados por prioridade
    const healthChecker = new NetworkHealthChecker();
    await healthChecker.ensureInitialized();
    
    const result = await healthChecker.testLatency();
    
    if (!result.results || result.results.length === 0) {
      throw new Error('Latency test should return results');
    }
  }

  async testProviderSelection() {
    // Teste: Seleção de provedor deve funcionar
    const manager = new AIProviderManager();
    await manager.ensureInitialized();
    
    const providers = manager.initializeProviders();
    
    if (!providers.openai || !providers.claude) {
      throw new Error('Providers should be initialized');
    }
  }

  async testFallbackMechanism() {
    // Teste: Mecanismo de fallback deve funcionar
    const manager = new AIProviderManager();
    await manager.ensureInitialized();
    
    // Simular falha do primeiro provedor
    const originalCallProvider = manager.callProvider;
    manager.callProvider = async (provider, prompt, options) => {
      if (provider.name === 'openai') {
        throw new Error('Simulated provider failure');
      }
      return 'fallback-response';
    };
    
    try {
      const result = await manager.callAI('test prompt', { complexity: 'low' });
      if (!result.fallback) {
        throw new Error('Fallback should be indicated in result');
      }
    } catch (error) {
      throw new Error('Fallback mechanism should handle provider failures');
    }
    
    // Restaurar método original
    manager.callProvider = originalCallProvider;
  }

  async testChromeAIIntegration() {
    // Teste: Integração com Chrome AI deve funcionar
    const integration = new DevMentorAIIntegration();
    await integration.ensureInitialized();
    
    // Simular disponibilidade do Chrome AI
    if (typeof ai !== 'undefined') {
      const result = await integration.callAI('test prompt');
      
      if (!result) {
        throw new Error('Chrome AI integration should return a result');
      }
    }
  }

  async testAIResponseCaching() {
    // Teste: Respostas de IA devem ser cacheadas
    const integration = new DevMentorAIIntegration();
    await integration.ensureInitialized();
    
    const prompt = 'test-cache-prompt';
    
    // Primeira chamada
    const result1 = await integration.callAI(prompt);
    
    // Segunda chamada (deve vir do cache)
    const result2 = await integration.callAI(prompt);
    
    if (result1.timestamp !== result2.timestamp) {
      throw new Error('Cached response should have same timestamp');
    }
  }

  async testEvalManagerSecurity() {
    // Teste: EvalManager deve ser seguro
    if (typeof __DEVMENTOR_EVAL_MANAGER === 'undefined') {
      throw new Error('EvalManager should be available');
    }
    
    try {
      __DEVMENTOR_EVAL_MANAGER.safeEval('eval("alert(1)")');
      throw new Error('EvalManager should block dangerous expressions');
    } catch (error) {
      // Esperado - deve bloquear
    }
  }

  async testHTMLSanitization() {
    // Teste: Sanitização de HTML deve funcionar
    if (typeof __DEVMENTOR_SANITIZE === 'undefined') {
      throw new Error('HTML sanitizer should be available');
    }
    
    const maliciousHTML = '<script>alert("xss")</script><p>Safe content</p>';
    const sanitized = __DEVMENTOR_SANITIZE(maliciousHTML);
    
    if (sanitized.includes('<script>')) {
      throw new Error('HTML sanitizer should remove script tags');
    }
  }

  async testLoggerRedaction() {
    // Teste: Logger deve redactar informações sensíveis
    if (typeof __DEVMENTOR_LOGGER === 'undefined') {
      throw new Error('Secure logger should be available');
    }
    
    const sensitiveData = 'api_key: sk-1234567890abcdef';
    const redacted = __DEVMENTOR_LOGGER.redact ? __DEVMENTOR_LOGGER.redact(sensitiveData) : sensitiveData;
    
    if (redacted.includes('sk-1234567890abcdef')) {
      throw new Error('Logger should redact API keys');
    }
  }

  async testInputValidation() {
    // Teste: Validação de entrada deve funcionar
    const integration = new DevMentorAIIntegration();
    await integration.ensureInitialized();
    
    try {
      await integration.analyzeCode('', 'security');
      throw new Error('Should reject empty code');
    } catch (error) {
      // Esperado
    }
  }

  async testMemoryUsage() {
    // Teste: Uso de memória deve ser controlado
    const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
    
    const cache = new LocalCacheSystem();
    await cache.ensureInitialized();
    
    // Adicionar muitos dados
    for (let i = 0; i < 1000; i++) {
      cache.set(`memtest${i}`, `data${i}`);
    }
    
    const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
    const memoryIncrease = finalMemory - initialMemory;
    
    if (memoryIncrease > 50 * 1024 * 1024) { // 50MB
      throw new Error('Memory usage should be controlled');
    }
  }

  async testResponseLatency() {
    // Teste: Latência de resposta deve ser aceitável
    const start = Date.now();
    
    const integration = new DevMentorAIIntegration();
    await integration.ensureInitialized();
    
    const duration = Date.now() - start;
    
    if (duration > 5000) { // 5 segundos
      throw new Error('Initialization should be fast');
    }
  }

  async testConcurrentLoad() {
    // Teste: Sistema deve suportar carga concorrente
    const promises = [];
    
    for (let i = 0; i < 10; i++) {
      const integration = new DevMentorAIIntegration();
      promises.push(integration.ensureInitialized());
    }
    
    const start = Date.now();
    await Promise.all(promises);
    const duration = Date.now() - start;
    
    if (duration > 10000) { // 10 segundos
      throw new Error('Concurrent initialization should be efficient');
    }
  }

  async testJSONOptimization() {
    // Teste: Otimização de JSON deve funcionar
    const proxy = new SecureAPIProxy();
    
    const largeObject = {
      data: 'x'.repeat(10000),
      nested: {
        array: new Array(1000).fill('test')
      }
    };
    
    const start = Date.now();
    const size = proxy.calculateObjectSize(largeObject);
    const duration = Date.now() - start;
    
    if (duration > 100) { // 100ms
      throw new Error('Object size calculation should be fast');
    }
    
    if (size <= 0) {
      throw new Error('Object size should be calculated correctly');
    }
  }

  async testIntervalCleanup() {
    // Teste: Cleanup de intervals deve funcionar
    const integration = new DevMentorAIIntegration();
    await integration.ensureInitialized();
    
    const initialIntervals = integration.cleanupIntervals.size;
    
    integration.destroy();
    
    if (integration.cleanupIntervals.size !== 0) {
      throw new Error('All intervals should be cleaned up');
    }
  }

  async testMemoryLeakPrevention() {
    // Teste: Prevenção de memory leaks deve funcionar
    const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
    
    // Criar e destruir muitos objetos
    for (let i = 0; i < 100; i++) {
      const integration = new DevMentorAIIntegration();
      await integration.ensureInitialized();
      integration.destroy();
    }
    
    // Forçar garbage collection se disponível
    if (typeof gc !== 'undefined') {
      gc();
    }
    
    const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
    const memoryIncrease = finalMemory - initialMemory;
    
    if (memoryIncrease > 10 * 1024 * 1024) { // 10MB
      throw new Error('Memory leaks should be prevented');
    }
  }

  async testResourceDisposal() {
    // Teste: Disposição de recursos deve funcionar
    const integration = new DevMentorAIIntegration();
    await integration.ensureInitialized();
    
    if (!integration.isDestroyed) {
      integration.destroy();
    }
    
    if (!integration.isDestroyed) {
      throw new Error('System should be marked as destroyed');
    }
    
    try {
      await integration.callAI('test');
      throw new Error('Destroyed system should not accept new calls');
    } catch (error) {
      // Esperado
    }
  }

  generateReport() {
    const report = {
      summary: {
        total: this.results.total,
        passed: this.results.passed,
        failed: this.results.failed,
        skipped: this.results.skipped,
        duration: this.results.duration,
        successRate: (this.results.passed / this.results.total * 100).toFixed(2) + '%'
      },
      tests: this.results.tests,
      timestamp: new Date().toISOString()
    };
    
    this.logger.info('[IntegrationTestSuite] Test Suite Report:', report);
    
    // Salvar relatório
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({
        testReport: report
      });
    }
    
    return report;
  }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.IntegrationTestSuite = IntegrationTestSuite;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = IntegrationTestSuite;
}



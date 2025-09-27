/**
 * DevMentor AI - Sistema de Health Check de Rede
 * Monitora conectividade e qualidade da conexão
 */

class NetworkHealthChecker {
  constructor() {
    this.logger = (typeof __DEVMENTOR_LOGGER !== 'undefined') ? __DEVMENTOR_LOGGER : console;
    this.status = {
      isOnline: navigator.onLine,
      quality: 'unknown',
      latency: null,
      bandwidth: null,
      lastCheck: null,
      consecutiveFailures: 0,
      consecutiveSuccesses: 0
    };
    this.config = {
      checkInterval: 30000, // 30 segundos
      timeout: 10000, // 10 segundos
      endpoints: [
        {
          url: 'https://www.google.com',
          type: 'dns',
          priority: 1,
          expectedStatus: [200, 301, 302]
        },
        {
          url: 'https://www.cloudflare.com',
          type: 'cdn',
          priority: 2,
          expectedStatus: [200]
        },
        {
          url: 'https://www.github.com',
          type: 'api',
          priority: 3,
          expectedStatus: [200]
        },
        {
          url: 'https://httpbin.org/status/200',
          type: 'test',
          priority: 4,
          expectedStatus: [200]
        },
        {
          url: 'https://api.github.com/zen',
          type: 'api',
          priority: 5,
          expectedStatus: [200]
        }
      ],
      qualityThresholds: {
        excellent: 100, // ms
        good: 300,
        fair: 1000,
        poor: 3000
      },
      retryConfig: {
        maxRetries: 3,
        retryDelay: 1000,
        exponentialBackoff: true
      },
      circuitBreaker: {
        failureThreshold: 5,
        recoveryTimeout: 30000,
        halfOpenMaxCalls: 3
      }
    };
    this.listeners = [];
    this.isMonitoring = false;
    this.monitoringInterval = null;
    this.circuitBreaker = {
      state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
      failureCount: 0,
      lastFailureTime: null,
      nextAttempt: null
    };
    this.endpointStats = new Map();
    this.isDestroyed = false;
    
    this.initialize();
  }

  async initialize() {
    this.logger.info('[NetworkHealthChecker] Initializing network health checker');
    
    // Configurar listeners de rede
    this.setupNetworkListeners();
    
    // Iniciar monitoramento
    this.startMonitoring();
    
    this.logger.info('[NetworkHealthChecker] Network health checker initialized');
  }

  setupNetworkListeners() {
    // Listener para mudanças de conectividade
    window.addEventListener('online', () => {
      this.logger.info('[NetworkHealthChecker] Network came online');
      this.status.isOnline = true;
      this.notifyListeners('online');
      this.performHealthCheck();
    });
    
    window.addEventListener('offline', () => {
      this.logger.info('[NetworkHealthChecker] Network went offline');
      this.status.isOnline = false;
      this.status.quality = 'offline';
      this.notifyListeners('offline');
    });
    
    // Listener para mudanças de visibilidade da página
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.logger.debug('[NetworkHealthChecker] Page became visible, checking network');
        this.performHealthCheck();
      }
    });
  }

  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    
    // Verificação inicial
    this.performHealthCheck();
    
    // Verificações periódicas
    this.monitoringInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.config.checkInterval);
    
    this.logger.info('[NetworkHealthChecker] Network monitoring started');
  }

  stopMonitoring() {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    this.logger.info('[NetworkHealthChecker] Network monitoring stopped');
  }

  async performHealthCheck() {
    if (!this.status.isOnline) {
      this.logger.debug('[NetworkHealthChecker] Skipping health check - offline');
      return;
    }
    
    const startTime = Date.now();
    
    try {
      // Testar conectividade básica
      const connectivityResult = await this.testConnectivity();
      
      if (connectivityResult.success) {
        // Testar latência
        const latencyResult = await this.testLatency();
        
        // Testar largura de banda (opcional)
        const bandwidthResult = await this.testBandwidth();
        
        // Atualizar status
        this.status.latency = latencyResult.latency;
        this.status.bandwidth = bandwidthResult.bandwidth;
        this.status.quality = this.calculateQuality(latencyResult.latency);
        this.status.lastCheck = Date.now();
        this.status.consecutiveSuccesses++;
        this.status.consecutiveFailures = 0;
        
        this.logger.debug(`[NetworkHealthChecker] Health check successful - latency: ${latencyResult.latency}ms, quality: ${this.status.quality}`);
        
        this.notifyListeners('healthCheck', {
          success: true,
          latency: latencyResult.latency,
          bandwidth: bandwidthResult.bandwidth,
          quality: this.status.quality
        });
        
      } else {
        throw new Error('Connectivity test failed');
      }
      
    } catch (error) {
      this.logger.warn('[NetworkHealthChecker] Health check failed:', error.message);
      
      this.status.consecutiveFailures++;
      this.status.consecutiveSuccesses = 0;
      this.status.quality = 'poor';
      this.status.lastCheck = Date.now();
      
      this.notifyListeners('healthCheck', {
        success: false,
        error: error.message
      });
    }
  }

  async testConnectivity() {
    const promises = this.config.endpoints.map(endpoint => 
      this.pingEndpoint(endpoint)
    );
    
    const results = await Promise.allSettled(promises);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    
    return {
      success: successful > 0,
      successfulEndpoints: successful,
      totalEndpoints: this.config.endpoints.length
    };
  }

  async pingEndpoint(endpoint, retryCount = 0) {
    const startTime = Date.now();
    const url = typeof endpoint === 'string' ? endpoint : endpoint.url;
    const expectedStatus = typeof endpoint === 'object' ? endpoint.expectedStatus : [200];
    
    try {
      // Verificar circuit breaker
      if (this.circuitBreaker.state === 'OPEN') {
        if (Date.now() < this.circuitBreaker.nextAttempt) {
          throw new Error('Circuit breaker is OPEN');
        } else {
          this.circuitBreaker.state = 'HALF_OPEN';
        }
      }
      
      // Usar AbortController para timeout adequado
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
      
      const response = await fetch(url, {
        method: 'HEAD',
        mode: 'cors',
        cache: 'no-cache',
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'User-Agent': 'DevMentorAI/1.0.0'
        }
      });
      
      clearTimeout(timeoutId);
      
      const latency = Date.now() - startTime;
      const success = expectedStatus.includes(response.status);
      
      // Atualizar estatísticas do endpoint
      this.updateEndpointStats(url, {
        success,
        latency,
        status: response.status,
        timestamp: Date.now()
      });
      
      // Atualizar circuit breaker
      if (success) {
        this.resetCircuitBreaker();
      } else {
        this.recordCircuitBreakerFailure();
      }
      
      return {
        url,
        latency,
        success,
        status: response.status,
        headers: {
          'content-type': response.headers.get('content-type'),
          'server': response.headers.get('server'),
          'cache-control': response.headers.get('cache-control')
        },
        retryCount
      };
      
    } catch (error) {
      const latency = Date.now() - startTime;
      
      // Retry com backoff exponencial
      if (retryCount < this.config.retryConfig.maxRetries) {
        const delay = this.config.retryConfig.exponentialBackoff 
          ? Math.min(this.config.retryConfig.retryDelay * Math.pow(2, retryCount), 10000)
          : this.config.retryConfig.retryDelay;
        
        this.logger.debug(`[NetworkHealthChecker] Retrying ${url} in ${delay}ms (attempt ${retryCount + 1})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.pingEndpoint(endpoint, retryCount + 1);
      }
      
      // Atualizar estatísticas do endpoint
      this.updateEndpointStats(url, {
        success: false,
        latency,
        error: error.name === 'AbortError' ? 'timeout' : error.message,
        timestamp: Date.now()
      });
      
      // Atualizar circuit breaker
      this.recordCircuitBreakerFailure();
      
      return {
        url,
        latency,
        success: false,
        error: error.name === 'AbortError' ? 'timeout' : error.message,
        retryCount
      };
    }
  }

  // Métodos auxiliares para circuit breaker
  resetCircuitBreaker() {
    this.circuitBreaker.state = 'CLOSED';
    this.circuitBreaker.failureCount = 0;
    this.circuitBreaker.lastFailureTime = null;
    this.circuitBreaker.nextAttempt = null;
  }

  recordCircuitBreakerFailure() {
    this.circuitBreaker.failureCount++;
    this.circuitBreaker.lastFailureTime = Date.now();
    
    if (this.circuitBreaker.failureCount >= this.config.circuitBreaker.failureThreshold) {
      this.circuitBreaker.state = 'OPEN';
      this.circuitBreaker.nextAttempt = Date.now() + this.config.circuitBreaker.recoveryTimeout;
      this.logger.warn('[NetworkHealthChecker] Circuit breaker opened due to failures');
    }
  }

  updateEndpointStats(url, stats) {
    if (!this.endpointStats.has(url)) {
      this.endpointStats.set(url, {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        avgLatency: 0,
        lastSuccess: null,
        lastFailure: null,
        consecutiveFailures: 0,
        consecutiveSuccesses: 0
      });
    }
    
    const endpointStats = this.endpointStats.get(url);
    endpointStats.totalRequests++;
    
    if (stats.success) {
      endpointStats.successfulRequests++;
      endpointStats.lastSuccess = stats.timestamp;
      endpointStats.consecutiveSuccesses++;
      endpointStats.consecutiveFailures = 0;
      
      // Calcular latência média
      endpointStats.avgLatency = (endpointStats.avgLatency * (endpointStats.successfulRequests - 1) + stats.latency) / endpointStats.successfulRequests;
    } else {
      endpointStats.failedRequests++;
      endpointStats.lastFailure = stats.timestamp;
      endpointStats.consecutiveFailures++;
      endpointStats.consecutiveSuccesses = 0;
    }
  }

  async testLatency() {
    const results = [];
    
    // Ordenar endpoints por prioridade
    const sortedEndpoints = [...this.config.endpoints].sort((a, b) => a.priority - b.priority);
    
    for (const endpoint of sortedEndpoints) {
      try {
        const result = await this.pingEndpoint(endpoint);
        if (result.success) {
          results.push(result.latency);
        }
        
        // Se temos sucesso suficiente, podemos parar
        if (results.length >= 2) {
          break;
        }
      } catch (error) {
        this.logger.debug(`[NetworkHealthChecker] Latency test failed for ${endpoint.url || endpoint}:`, error);
      }
    }
    
    if (results.length === 0) {
      throw new Error('All latency tests failed');
    }
    
    // Calcular latência média
    const averageLatency = results.reduce((sum, latency) => sum + latency, 0) / results.length;
    
    return {
      latency: Math.round(averageLatency),
      samples: results.length
    };
  }

  async testBandwidth() {
    // Teste simplificado de largura de banda
    const testData = '0'.repeat(1024); // 1KB de dados de teste
    const startTime = Date.now();
    
    try {
      // Simular teste de largura de banda
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const duration = Date.now() - startTime;
      const bandwidth = (testData.length * 8) / (duration / 1000); // bits por segundo
      
      return {
        bandwidth: Math.round(bandwidth),
        duration: duration
      };
      
    } catch (error) {
      this.logger.debug('[NetworkHealthChecker] Bandwidth test failed:', error);
      return {
        bandwidth: null,
        duration: null
      };
    }
  }

  calculateQuality(latency) {
    if (latency === null) return 'unknown';
    
    const thresholds = this.config.qualityThresholds;
    
    if (latency <= thresholds.excellent) return 'excellent';
    if (latency <= thresholds.good) return 'good';
    if (latency <= thresholds.fair) return 'fair';
    if (latency <= thresholds.poor) return 'poor';
    
    return 'very-poor';
  }

  // Métodos de listener
  addListener(callback) {
    this.listeners.push(callback);
  }

  removeListener(callback) {
    const index = this.listeners.indexOf(callback);
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }

  notifyListeners(event, data = null) {
    this.listeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        this.logger.error('[NetworkHealthChecker] Listener error:', error);
      }
    });
  }

  // Métodos de status
  getStatus() {
    return {
      ...this.status,
      isMonitoring: this.isMonitoring,
      uptime: this.status.lastCheck ? Date.now() - this.status.lastCheck : null
    };
  }

  isHealthy() {
    return this.status.isOnline && 
           this.status.quality !== 'poor' && 
           this.status.quality !== 'very-poor' &&
           this.status.consecutiveFailures < 3;
  }

  canUseOnlineServices() {
    return this.status.isOnline && this.status.quality !== 'very-poor';
  }

  shouldUseOfflineMode() {
    return !this.status.isOnline || 
           this.status.consecutiveFailures >= 3 ||
           this.status.quality === 'very-poor';
  }

  // Métodos de configuração
  setConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    
    // Reiniciar monitoramento se necessário
    if (this.isMonitoring) {
      this.stopMonitoring();
      this.startMonitoring();
    }
  }

  // Métodos de teste específicos
  async testAPIEndpoint(url, timeout = 10000) {
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-cache'
      });
      
      clearTimeout(timeoutId);
      
      const latency = Date.now() - startTime;
      
      return {
        success: response.ok,
        status: response.status,
        latency: latency,
        headers: Object.fromEntries(response.headers.entries())
      };
      
    } catch (error) {
      const latency = Date.now() - startTime;
      
      return {
        success: false,
        error: error.message,
        latency: latency
      };
    }
  }

  async testMultipleEndpoints(urls, timeout = 10000) {
    const promises = urls.map(url => this.testAPIEndpoint(url, timeout));
    const results = await Promise.allSettled(promises);
    
    return results.map((result, index) => ({
      url: urls[index],
      result: result.status === 'fulfilled' ? result.value : { success: false, error: result.reason }
    }));
  }

  // Métodos de diagnóstico
  async diagnoseConnection() {
    const diagnosis = {
      timestamp: Date.now(),
      basicConnectivity: await this.testConnectivity(),
      latency: await this.testLatency(),
      bandwidth: await this.testBandwidth(),
      dnsResolution: await this.testDNSResolution(),
      recommendations: []
    };
    
    // Gerar recomendações
    if (diagnosis.latency.latency > 1000) {
      diagnosis.recommendations.push('High latency detected. Consider using offline mode for better performance.');
    }
    
    if (diagnosis.basicConnectivity.successfulEndpoints < this.config.endpoints.length) {
      diagnosis.recommendations.push('Some endpoints are unreachable. Check your network configuration.');
    }
    
    if (this.status.consecutiveFailures > 0) {
      diagnosis.recommendations.push('Recent connection failures detected. Network may be unstable.');
    }
    
    return diagnosis;
  }

  async testDNSResolution() {
    const testDomains = ['google.com', 'cloudflare.com', 'github.com'];
    const results = [];
    
    for (const domain of testDomains) {
      try {
        const startTime = Date.now();
        // Simular resolução DNS (não podemos fazer DNS real no browser)
        await fetch(`https://${domain}`, { method: 'HEAD', mode: 'no-cors' });
        const duration = Date.now() - startTime;
        
        results.push({
          domain,
          success: true,
          duration: duration
        });
      } catch (error) {
        results.push({
          domain,
          success: false,
          error: error.message
        });
      }
    }
    
    return {
      results: results,
      successRate: results.filter(r => r.success).length / results.length
    };
  }

  // Métodos de relatório
  generateReport() {
    return {
      timestamp: Date.now(),
      status: this.getStatus(),
      config: this.config,
      isHealthy: this.isHealthy(),
      canUseOnlineServices: this.canUseOnlineServices(),
      shouldUseOfflineMode: this.shouldUseOfflineMode(),
      recommendations: this.generateRecommendations()
    };
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (!this.status.isOnline) {
      recommendations.push({
        type: 'critical',
        message: 'No internet connection. Use offline mode.',
        action: 'Enable offline mode'
      });
    }
    
    if (this.status.quality === 'poor' || this.status.quality === 'very-poor') {
      recommendations.push({
        type: 'warning',
        message: 'Poor network quality detected.',
        action: 'Consider using offline mode for better performance'
      });
    }
    
    if (this.status.consecutiveFailures >= 3) {
      recommendations.push({
        type: 'warning',
        message: 'Multiple connection failures detected.',
        action: 'Check network stability'
      });
    }
    
    if (this.status.latency && this.status.latency > 2000) {
      recommendations.push({
        type: 'info',
        message: 'High latency detected.',
        action: 'Consider using cached responses'
      });
    }
    
    return recommendations;
  }

  destroy() {
    if (this.isDestroyed) return;
    
    this.logger.info('[NetworkHealthChecker] Destroying network health checker');
    
    // Parar monitoramento
    this.stopMonitoring();
    
    // Limpar listeners
    this.listeners = [];
    
    // Limpar estatísticas
    this.endpointStats.clear();
    
    // Reset circuit breaker
    this.circuitBreaker = {
      state: 'CLOSED',
      failureCount: 0,
      lastFailureTime: null,
      nextAttempt: null
    };
    
    this.isDestroyed = true;
    this.logger.info('[NetworkHealthChecker] Network health checker destroyed');
  }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.NetworkHealthChecker = NetworkHealthChecker;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = NetworkHealthChecker;
}

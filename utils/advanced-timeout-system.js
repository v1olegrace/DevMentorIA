/**
 * DevMentor AI - Advanced Timeout System
 * PRODUCTION-GRADE ERROR HANDLING & TIMEOUT STRATEGY
 * 
 * Sistema de timeout multi-camada baseado em princípios de engenharia de sistemas críticos
 */

/**
 * Custom Error Classes para timeout handling específico
 * Verifica se já existem globalmente para evitar redefinição
 */
if (typeof window.TimeoutError === 'undefined') {
  window.TimeoutError = class TimeoutError extends Error {
  constructor(message, metadata = {}) {
    super(message);
    this.name = 'TimeoutError';
    this.metadata = metadata;
    this.userFriendlyMessage = this._generateUserFriendlyMessage(metadata);
    this.retryable = this._isRetryable(metadata);
  }

  _generateUserFriendlyMessage(metadata) {
    const operation = metadata.operation || 'operation';
    const timeout = metadata.timeout || 0;
    
    if (timeout < 10000) {
      return `A análise está levando mais tempo que o esperado. Tentando novamente...`;
    } else if (timeout < 30000) {
      return `Este código é complexo e precisa de mais tempo para análise.`;
    } else {
      return `A análise está muito demorada. Isso pode indicar código muito complexo ou problemas temporários.`;
    }
  }

  _isRetryable(metadata) {
    // Timeouts menores são mais prováveis de serem retryable
    return (metadata.timeout || 0) < 45000 && (metadata.retryCount || 0) < 3;
  }
  };
}

if (typeof window.CircuitBreakerOpenError === 'undefined') {
  window.CircuitBreakerOpenError = class CircuitBreakerOpenError extends Error {
  constructor(message, metadata = {}) {
    super(message);
    this.name = 'CircuitBreakerOpenError';
    this.metadata = metadata;
    this.nextAttemptTime = metadata.nextAttemptTime;
    this.userFriendlyMessage = 'O sistema está temporariamente instável. Tente novamente em alguns momentos.';
  }
  };
}

if (typeof window.PoolTimeoutError === 'undefined') {
  window.PoolTimeoutError = class PoolTimeoutError extends Error {
  constructor(message, metadata = {}) {
    super(message);
    this.name = 'PoolTimeoutError';
    this.metadata = metadata;
    this.userFriendlyMessage = 'Muitas análises em andamento. Aguarde um momento e tente novamente.';
  }
  };
}

/**
 * CAMADA 1: REQUEST-LEVEL TIMEOUT SYSTEM
 * Timeout granular por tipo de operação com retry inteligente
 */
class AdvancedTimeoutManager {
  constructor() {
    this.config = {
      // Timeouts otimizados para Chrome Extension + AI APIs
      timeouts: {
        initialization: 10000,        // 10s - Setup crítico
        promptSimple: 15000,          // 15s - Código simples (< 100 linhas)
        promptMedium: 25000,          // 25s - Código médio (100-500 linhas)
        promptComplex: 35000,         // 35s - Código complexo (500+ linhas)
        multimodal: 45000,            // 45s - Screenshot + código
        videoGeneration: 60000,       // 60s - Geração de vídeo
        diagramGeneration: 30000,     // 30s - Diagramas interativos
        citationSearch: 20000,        // 20s - Busca de citações
        collaboration: 5000,          // 5s - Operações colaborativas
        circuitBreakerTimeout: 60000  // 1min - Recovery period
      },
      
      // Retry policy adaptativo
      retryPolicy: {
        maxRetries: 3,
        baseDelay: 1000,              // 1s inicial
        maxDelay: 10000,              // 10s máximo
        timeoutMultiplier: 1.5,       // +50% timeout a cada retry
        jitterFactor: 0.1             // ±10% jitter para evitar thundering herd
      },
      
      // Thresholds para classificação de complexidade
      complexityThresholds: {
        simple: 100,                  // < 100 linhas
        medium: 500,                  // 100-500 linhas
        complex: Infinity             // 500+ linhas
      }
    };

    // Métricas para otimização adaptativa
    this.metrics = new TimeoutMetrics();
    this.activeOperations = new Map();
  }

  /**
   * MAIN TIMEOUT ENFORCEMENT METHOD
   * Promise.race com cleanup e retry inteligente
   */
  async executeWithTimeout(operation, context = {}) {
    const startTime = performance.now();
    const requestId = context.requestId || this._generateRequestId();
    const timeout = this._calculateOptimalTimeout(context);
    
    // Registra operação ativa
    this.activeOperations.set(requestId, {
      startTime,
      context,
      timeout,
      cancelled: false
    });

    try {
      const result = await this._executeWithTimeoutAndRetry(
        operation, 
        timeout, 
        { ...context, requestId, startTime }
      );
      
      // Log de sucesso
      this._recordSuccess(requestId, performance.now() - startTime, context);
      
      return result;
      
    } catch (error) {
      // Log de falha
      this._recordFailure(requestId, performance.now() - startTime, context, error);
      
      throw error;
      
    } finally {
      // Cleanup
      this.activeOperations.delete(requestId);
    }
  }

  async _executeWithTimeoutAndRetry(operation, baseTimeout, context) {
    const maxRetries = this.config.retryPolicy.maxRetries;
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const isRetry = attempt > 0;
      const currentTimeout = this._calculateRetryTimeout(baseTimeout, attempt);
      
      if (isRetry) {
        // Delay com jitter antes do retry
        const delay = this._calculateRetryDelay(attempt);
        await this._sleep(delay);
        
        console.warn(
          `[TimeoutManager] Retry ${attempt}/${maxRetries} for ${context.operation}`,
          `timeout: ${currentTimeout}ms, delay: ${delay}ms`
        );
      }

      try {
        return await this._executeSingleAttempt(operation, currentTimeout, {
          ...context,
          attempt,
          isRetry
        });
        
      } catch (error) {
        lastError = error;
        
        // Decide se deve tentar novamente
        if (!this._shouldRetry(error, attempt, maxRetries, context)) {
          throw error;
        }
      }
    }

    throw lastError;
  }

  async _executeSingleAttempt(operation, timeout, context) {
    const { requestId } = context;
    
    // Promise da operação principal
    const operationPromise = Promise.resolve(operation());
    
    // Promise de timeout
    const timeoutPromise = new Promise((_, reject) => {
      const timeoutId = setTimeout(() => {
        // Tenta cancelar operação se possível
        this._attemptOperationCancellation(requestId);
        
        reject(new TimeoutError(
          `Operation ${context.operation} timed out after ${timeout}ms`,
          {
            operation: context.operation,
            timeout,
            attempt: context.attempt,
            requestId,
            codeLength: context.codeLength || 0,
            complexity: context.complexity || 'unknown'
          }
        ));
      }, timeout);
      
      // Armazena timeout ID para cancelamento
      if (this.activeOperations.has(requestId)) {
        this.activeOperations.get(requestId).timeoutId = timeoutId;
      }
    });

    try {
      // Race entre operação e timeout
      const result = await Promise.race([operationPromise, timeoutPromise]);
      
      // Limpa timeout se operação completou
      this._clearOperationTimeout(requestId);
      
      return result;
      
    } catch (error) {
      // Limpa timeout em caso de erro
      this._clearOperationTimeout(requestId);
      throw error;
    }
  }

  /**
   * TIMEOUT CALCULATION BASEADO EM MÚLTIPLOS FATORES
   * Considera histórico, complexidade, e contexto atual
   */
  _calculateOptimalTimeout(context) {
    const operation = context.operation || 'unknown';
    const codeLength = context.codeLength || 0;
    
    // Timeout base por tipo de operação
    let baseTimeout = this.config.timeouts[operation] || 30000;
    
    // Ajuste por complexidade de código
    const complexity = this._assessCodeComplexity(codeLength);
    const complexityMultiplier = this._getComplexityMultiplier(complexity);
    baseTimeout *= complexityMultiplier;
    
    // Ajuste baseado em histórico (se disponível)
    const historicalTimeout = this.metrics.getOptimalTimeout(operation, codeLength);
    if (historicalTimeout > 0) {
      baseTimeout = Math.max(baseTimeout, historicalTimeout);
    }
    
    // Ajuste por carga atual do sistema
    const loadMultiplier = this._getSystemLoadMultiplier();
    baseTimeout *= loadMultiplier;
    
    // Limites de sanidade
    const minTimeout = 5000;   // 5s mínimo
    const maxTimeout = 120000; // 2min máximo
    
    return Math.max(minTimeout, Math.min(maxTimeout, baseTimeout));
  }

  _assessCodeComplexity(codeLength) {
    if (codeLength < this.config.complexityThresholds.simple) {
      return 'simple';
    } else if (codeLength < this.config.complexityThresholds.medium) {
      return 'medium';
    } else {
      return 'complex';
    }
  }

  _getComplexityMultiplier(complexity) {
    const multipliers = {
      simple: 1.0,    // Base timeout
      medium: 1.3,    // +30%
      complex: 1.7    // +70%
    };
    return multipliers[complexity] || 1.0;
  }

  _getSystemLoadMultiplier() {
    const activeOps = this.activeOperations.size;
    
    if (activeOps < 3) return 1.0;      // Normal
    if (activeOps < 6) return 1.2;      // +20% sob carga
    if (activeOps < 10) return 1.5;     // +50% sob alta carga
    return 2.0;                         // +100% sistema sobrecarregado
  }

  _calculateRetryTimeout(baseTimeout, attempt) {
    const multiplier = Math.pow(this.config.retryPolicy.timeoutMultiplier, attempt);
    return Math.min(baseTimeout * multiplier, this.config.timeouts.circuitBreakerTimeout);
  }

  _calculateRetryDelay(attempt) {
    const { baseDelay, maxDelay, jitterFactor } = this.config.retryPolicy;
    
    // Exponential backoff
    const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
    
    // Jitter para evitar thundering herd
    const jitter = (Math.random() - 0.5) * 2 * jitterFactor;
    const jitteredDelay = exponentialDelay * (1 + jitter);
    
    return Math.min(jitteredDelay, maxDelay);
  }

  _shouldRetry(error, attempt, maxRetries, context) {
    // Não retry se já tentou o máximo
    if (attempt >= maxRetries) return false;
    
    // Não retry para erros não-retryable
    if (error.retryable === false) return false;
    
    // Retry para timeouts (com limites)
    if (error instanceof TimeoutError) {
      return error.retryable;
    }
    
    // Não retry para circuit breaker aberto
    if (error instanceof CircuitBreakerOpenError) {
      return false;
    }
    
    // Retry para erros de rede/temporários
    if (this._isTemporaryError(error)) {
      return true;
    }
    
    return false;
  }

  _isTemporaryError(error) {
    const temporaryIndicators = [
      'network', 'connection', 'timeout', 'temporary', 
      'rate limit', 'quota', 'throttle', 'busy'
    ];
    
    const errorMessage = error.message.toLowerCase();
    return temporaryIndicators.some(indicator => 
      errorMessage.includes(indicator)
    );
  }

  /**
   * OPERATION CANCELLATION SUPPORT
   * Tenta cancelar operações em andamento quando timeout
   */
  _attemptOperationCancellation(requestId) {
    const operation = this.activeOperations.get(requestId);
    if (!operation || operation.cancelled) return;
    
    operation.cancelled = true;
    
    // Implementar cancelamento específico por tipo de operação
    if (operation.context.operation === 'multimodal' && operation.context.abortController) {
      operation.context.abortController.abort();
    }
    
    // Log cancelamento
    console.warn(`[TimeoutManager] Cancelled operation ${requestId} due to timeout`);
  }

  _clearOperationTimeout(requestId) {
    const operation = this.activeOperations.get(requestId);
    if (operation && operation.timeoutId) {
      clearTimeout(operation.timeoutId);
      delete operation.timeoutId;
    }
  }

  /**
   * METRICS AND MONITORING
   */
  _recordSuccess(requestId, duration, context) {
    this.metrics.recordOperation({
      requestId,
      operation: context.operation,
      duration,
      codeLength: context.codeLength || 0,
      complexity: context.complexity,
      success: true,
      attempt: context.attempt || 0,
      timestamp: Date.now()
    });
  }

  _recordFailure(requestId, duration, context, error) {
    this.metrics.recordOperation({
      requestId,
      operation: context.operation,
      duration,
      codeLength: context.codeLength || 0,
      complexity: context.complexity,
      success: false,
      error: error.name,
      errorMessage: error.message,
      attempt: context.attempt || 0,
      timestamp: Date.now()
    });
  }

  _generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * PUBLIC API METHODS
   */
  getActiveOperationsCount() {
    return this.activeOperations.size;
  }

  getMetrics() {
    return this.metrics.getSnapshot();
  }

  cancelOperation(requestId) {
    this._attemptOperationCancellation(requestId);
  }

  cancelAllOperations() {
    for (const requestId of this.activeOperations.keys()) {
      this._attemptOperationCancellation(requestId);
    }
  }
}

/**
 * CAMADA 2: METRICS AND ADAPTIVE OPTIMIZATION
 * Coleta dados reais para otimização contínua de timeouts
 */
class TimeoutMetrics {
  constructor() {
    this.operations = [];
    this.maxHistorySize = 1000; // Manter últimas 1000 operações
    this.percentileCache = new Map();
    this.cacheExpiry = 60000; // Cache válido por 1 minuto
  }

  recordOperation(data) {
    this.operations.push(data);
    
    // Limita tamanho do histórico
    if (this.operations.length > this.maxHistorySize) {
      this.operations.splice(0, this.operations.length - this.maxHistorySize);
    }
    
    // Invalida cache de percentis
    this.percentileCache.clear();
  }

  getOptimalTimeout(operation, codeLength) {
    const key = `${operation}_${Math.floor(codeLength / 100) * 100}`;
    const cached = this.percentileCache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.timeout;
    }

    // Filtra operações similares
    const similarOps = this.operations.filter(op => 
      op.operation === operation &&
      op.success &&
      Math.abs(op.codeLength - codeLength) < codeLength * 0.3 // ±30%
    );

    if (similarOps.length < 5) {
      return 0; // Dados insuficientes
    }

    // Calcula P95 + margem de segurança
    const durations = similarOps.map(op => op.duration);
    const p95 = this._calculatePercentile(durations, 95);
    const optimalTimeout = p95 * 1.4; // 40% margem de segurança

    // Cache resultado
    this.percentileCache.set(key, {
      timeout: optimalTimeout,
      timestamp: Date.now()
    });

    return optimalTimeout;
  }

  _calculatePercentile(values, percentile) {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  getSnapshot() {
    const recent = this.operations.filter(op => 
      Date.now() - op.timestamp < 300000 // Últimos 5 minutos
    );

    const successful = recent.filter(op => op.success);
    const failed = recent.filter(op => !op.success);

    return {
      total: recent.length,
      successful: successful.length,
      failed: failed.length,
      successRate: recent.length > 0 ? successful.length / recent.length : 0,
      averageDuration: successful.length > 0 
        ? successful.reduce((sum, op) => sum + op.duration, 0) / successful.length 
        : 0,
      timeoutsByOperation: this._getTimeoutsByOperation(failed),
      complexityBreakdown: this._getComplexityBreakdown(recent)
    };
  }

  _getTimeoutsByOperation(failed) {
    const timeouts = failed.filter(op => op.error === 'TimeoutError');
    const byOperation = {};
    
    timeouts.forEach(op => {
      byOperation[op.operation] = (byOperation[op.operation] || 0) + 1;
    });
    
    return byOperation;
  }

  _getComplexityBreakdown(operations) {
    const breakdown = { simple: 0, medium: 0, complex: 0 };
    
    operations.forEach(op => {
      if (op.codeLength < 100) breakdown.simple++;
      else if (op.codeLength < 500) breakdown.medium++;
      else breakdown.complex++;
    });
    
    return breakdown;
  }
}

/**
 * CAMADA 3: UX-LEVEL TIMEOUT PROTECTION
 * Garante que usuário nunca fica "pendurado"
 */
class UXTimeoutManager {
  constructor(uiManager) {
    this.uiManager = uiManager;
    this.MAX_USER_WAIT = 45000; // 45s máximo que usuário deve esperar
    this.PROGRESS_UPDATE_INTERVAL = 5000; // Update a cada 5s
  }

  async executeWithUXProtection(operation, context = {}) {
    const startTime = Date.now();
    let progressInterval;
    let uxTimeoutId;

    try {
      // Mostra loading state inicial
      this.uiManager.showLoadingState(context);
      
      // Setup progress updates
      progressInterval = this._startProgressUpdates(startTime, context);
      
      // Setup UX timeout warning
      uxTimeoutId = setTimeout(() => {
        this._showTimeoutWarning(context, startTime);
      }, this.MAX_USER_WAIT);

      // Execute operation
      const result = await operation();
      
      // Sucesso
      this.uiManager.hideLoadingState();
      return result;
      
    } catch (error) {
      this.uiManager.hideLoadingState();
      
      if (error instanceof TimeoutError) {
        this._handleUXTimeout(error, context, startTime);
      } else {
        this._handleUXError(error, context);
      }
      
      throw error;
      
    } finally {
      // Cleanup
      if (progressInterval) clearInterval(progressInterval);
      if (uxTimeoutId) clearTimeout(uxTimeoutId);
    }
  }

  _startProgressUpdates(startTime, context) {
    return setInterval(() => {
      const elapsed = Date.now() - startTime;
      const estimatedTotal = this._estimateOperationDuration(context);
      const progress = Math.min((elapsed / estimatedTotal) * 100, 95);
      
      this.uiManager.updateProgress(progress, this._getProgressMessage(elapsed, context));
    }, this.PROGRESS_UPDATE_INTERVAL);
  }

  _estimateOperationDuration(context) {
    const baseDurations = {
      promptSimple: 10000,
      promptMedium: 20000,
      promptComplex: 35000,
      multimodal: 40000,
      videoGeneration: 55000
    };
    
    return baseDurations[context.operation] || 25000;
  }

  _getProgressMessage(elapsed, context) {
    if (elapsed < 10000) {
      return 'Analisando estrutura do código...';
    } else if (elapsed < 25000) {
      return 'Gerando explicação detalhada...';
    } else if (elapsed < 40000) {
      return 'Finalizando análise...';
    } else {
      return 'Processando elementos complexos...';
    }
  }

  _showTimeoutWarning(context, startTime) {
    const elapsed = Date.now() - startTime;
    
    this.uiManager.showTimeoutWarning({
      title: 'Análise Mais Demorada que o Esperado',
      message: `A análise está levando ${Math.round(elapsed / 1000)}s. Este código pode ser mais complexo que o usual.`,
      options: [
        {
          label: 'Continuar Aguardando',
          action: () => this._extendTimeout(context)
        },
        {
          label: 'Tentar Seleção Menor',
          action: () => this.uiManager.showSelectionTips()
        },
        {
          label: 'Cancelar',
          action: () => this._cancelOperation(context)
        }
      ]
    });
  }

  _handleUXTimeout(error, context, startTime) {
    const elapsed = Date.now() - startTime;
    
    this.uiManager.showTimeoutError({
      title: 'Tempo Limite Excedido',
      message: error.userFriendlyMessage,
      elapsed: elapsed,
      canRetry: error.retryable,
      suggestions: this._getTimeoutSuggestions(context, elapsed)
    });
  }

  _getTimeoutSuggestions(context, elapsed) {
    const suggestions = [];
    
    if (context.codeLength > 1000) {
      suggestions.push('Tente selecionar uma porção menor do código');
    }
    
    if (elapsed > 60000) {
      suggestions.push('O sistema pode estar sobrecarregado, tente novamente em alguns minutos');
    }
    
    if (context.operation === 'multimodal') {
      suggestions.push('Screenshots muito grandes podem demorar mais para processar');
    }
    
    return suggestions;
  }
}

// Export classes
window.AdvancedTimeoutManager = AdvancedTimeoutManager;
window.TimeoutMetrics = TimeoutMetrics;
window.UXTimeoutManager = UXTimeoutManager;
window.TimeoutError = TimeoutError;
window.CircuitBreakerOpenError = CircuitBreakerOpenError;
window.PoolTimeoutError = PoolTimeoutError;

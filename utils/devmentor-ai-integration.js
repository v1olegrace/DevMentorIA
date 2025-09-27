/**
 * DevMentor AI - Sistema de Integração Principal
 * Conecta todos os sistemas de segurança, IA e cache
 */

class DevMentorAIIntegration {
  constructor() {
    this.logger = (typeof __DEVMENTOR_LOGGER !== 'undefined') ? __DEVMENTOR_LOGGER : console;
    this.systems = {};
    this.isInitialized = false;
    
    this.initialize();
  }

  async initialize() {
    this.logger.info('[DevMentorAIIntegration] Initializing main integration system');
    
    try {
      // Inicializar sistemas de segurança
      await this.initializeSecuritySystems();
      
      // Inicializar sistemas de IA
      await this.initializeAISystems();
      
      // Inicializar sistemas de cache e rede
      await this.initializeInfrastructureSystems();
      
      // Configurar integrações entre sistemas
      this.setupSystemIntegrations();
      
      this.isInitialized = true;
      this.logger.info('[DevMentorAIIntegration] Main integration system initialized successfully');
      
    } catch (error) {
      this.logger.error('[DevMentorAIIntegration] Initialization failed:', error);
      throw error;
    }
  }

  async initializeSecuritySystems() {
    this.logger.info('[DevMentorAIIntegration] Initializing security systems');
    
    // Sistema de monitoramento de segurança
    if (typeof SecurityMonitoringSystem !== 'undefined') {
      this.systems.securityMonitoring = new SecurityMonitoringSystem();
    }
    
    // Sistema de detecção de anomalias
    if (typeof AnomalyDetectionSystem !== 'undefined') {
      this.systems.anomalyDetection = new AnomalyDetectionSystem();
    }
    
    // Validador de entrada robusto
    if (typeof RobustInputValidator !== 'undefined') {
      this.systems.inputValidator = new RobustInputValidator();
    }
    
    this.logger.info('[DevMentorAIIntegration] Security systems initialized');
  }

  async initializeAISystems() {
    this.logger.info('[DevMentorAIIntegration] Initializing AI systems');
    
    // Gerenciador de provedores de IA
    if (typeof AIProviderManager !== 'undefined') {
      this.systems.aiProvider = new AIProviderManager();
    }
    
    this.logger.info('[DevMentorAIIntegration] AI systems initialized');
  }

  async initializeInfrastructureSystems() {
    this.logger.info('[DevMentorAIIntegration] Initializing infrastructure systems');
    
    // Sistema de cache local
    if (typeof LocalCacheSystem !== 'undefined') {
      this.systems.cache = new LocalCacheSystem();
    }
    
    // Verificador de saúde da rede
    if (typeof NetworkHealthChecker !== 'undefined') {
      this.systems.networkHealth = new NetworkHealthChecker();
    }
    
    this.logger.info('[DevMentorAIIntegration] Infrastructure systems initialized');
  }

  setupSystemIntegrations() {
    this.logger.info('[DevMentorAIIntegration] Setting up system integrations');
    
    // Integrar monitoramento de segurança com detecção de anomalias
    if (this.systems.securityMonitoring && this.systems.anomalyDetection) {
      this.systems.securityMonitoring.addListener((event, data) => {
        if (event === 'anomaly') {
          this.systems.anomalyDetection.processAnomaly(data);
        }
      });
    }
    
    // Integrar verificação de rede com gerenciador de IA
    if (this.systems.networkHealth && this.systems.aiProvider) {
      this.systems.networkHealth.addListener((event, data) => {
        if (event === 'healthCheck') {
          this.handleNetworkHealthChange(data);
        }
      });
    }
    
    // Integrar validador de entrada com todos os sistemas
    if (this.systems.inputValidator) {
      this.setupInputValidationIntegration();
    }
    
    this.logger.info('[DevMentorAIIntegration] System integrations configured');
  }

  setupInputValidationIntegration() {
    // Interceptar todas as entradas do usuário
    const originalMethods = ['analyzeCode', 'analyzeScreenshot', 'callAI'];
    
    originalMethods.forEach(methodName => {
      if (this[methodName]) {
        const originalMethod = this[methodName].bind(this);
        this[methodName] = async (...args) => {
          // Validar entrada antes de processar
          const validation = await this.systems.inputValidator.validateInput(
            args[0], 
            this.getInputType(methodName)
          );
          
          if (!validation.valid) {
            throw new Error(`Input validation failed: ${validation.error}`);
          }
          
          // Usar entrada sanitizada
          args[0] = validation.sanitized;
          
          return originalMethod(...args);
        };
      }
    });
  }

  getInputType(methodName) {
    const typeMap = {
      'analyzeCode': 'code',
      'analyzeScreenshot': 'image',
      'callAI': 'prompt'
    };
    
    return typeMap[methodName] || 'generic';
  }

  handleNetworkHealthChange(data) {
    if (data.success) {
      this.logger.debug('[DevMentorAIIntegration] Network health improved');
    } else {
      this.logger.warn('[DevMentorAIIntegration] Network health degraded');
      
      // Notificar sistemas dependentes de rede
      if (this.systems.aiProvider) {
        this.systems.aiProvider.handleNetworkIssue();
      }
    }
  }

  // Métodos principais de análise
  async analyzeCode(code, analysisType = 'explain', options = {}) {
    if (!this.isInitialized) {
      throw new Error('System not initialized');
    }
    
    this.logger.info(`[DevMentorAIIntegration] Analyzing code (${analysisType})`);
    
    try {
      // Verificar cache primeiro
      if (this.systems.cache) {
        const cached = this.systems.cache.getCodeAnalysis(code, analysisType);
        if (cached) {
          this.logger.debug('[DevMentorAIIntegration] Returning cached analysis');
          return cached;
        }
      }
      
      // Determinar estratégia de análise
      const strategy = await this.determineAnalysisStrategy(options);
      
      let result;
      if (strategy === 'offline') {
        result = await this.performOfflineAnalysis(code, analysisType, options);
      } else {
        result = await this.performOnlineAnalysis(code, analysisType, options);
      }
      
      // Cachear resultado
      if (this.systems.cache && result.success) {
        this.systems.cache.setCodeAnalysis(code, analysisType, result);
      }
      
      return result;
      
    } catch (error) {
      this.logger.error('[DevMentorAIIntegration] Code analysis failed:', error);
      
      // Fallback para análise offline
      try {
        return await this.performOfflineAnalysis(code, analysisType, options);
      } catch (fallbackError) {
        throw new Error(`Analysis failed: ${error.message}`);
      }
    }
  }

  async analyzeScreenshot(imageData, analysisType = 'explain', options = {}) {
    if (!this.isInitialized) {
      throw new Error('System not initialized');
    }
    
    this.logger.info(`[DevMentorAIIntegration] Analyzing screenshot (${analysisType})`);
    
    try {
      // Verificar cache primeiro
      if (this.systems.cache) {
        const cached = this.systems.cache.getScreenshotAnalysis(imageData);
        if (cached) {
          this.logger.debug('[DevMentorAIIntegration] Returning cached screenshot analysis');
          return cached;
        }
      }
      
      // Determinar estratégia de análise
      const strategy = await this.determineAnalysisStrategy(options);
      
      let result;
      if (strategy === 'offline') {
        result = await this.performOfflineScreenshotAnalysis(imageData, analysisType, options);
      } else {
        result = await this.performOnlineScreenshotAnalysis(imageData, analysisType, options);
      }
      
      // Cachear resultado
      if (this.systems.cache && result.success) {
        this.systems.cache.setScreenshotAnalysis(imageData, result);
      }
      
      return result;
      
    } catch (error) {
      this.logger.error('[DevMentorAIIntegration] Screenshot analysis failed:', error);
      throw new Error(`Screenshot analysis failed: ${error.message}`);
    }
  }

  async callAI(prompt, options = {}) {
    if (!this.isInitialized) {
      throw new Error('System not initialized');
    }
    
    this.logger.info('[DevMentorAIIntegration] Calling AI');
    
    try {
      // Verificar cache primeiro
      if (this.systems.cache) {
        const cached = this.systems.cache.getAIResponse(prompt, options.provider || 'auto');
        if (cached) {
          this.logger.debug('[DevMentorAIIntegration] Returning cached AI response');
          return cached;
        }
      }
      
      // Usar gerenciador de provedores de IA
      if (this.systems.aiProvider) {
        const result = await this.systems.aiProvider.callAI(prompt, options);
        
        // Cachear resultado
        if (this.systems.cache && result.success) {
          this.systems.cache.setAIResponse(prompt, result.result, result.provider);
        }
        
        return result;
      } else {
        throw new Error('AI provider system not available');
      }
      
    } catch (error) {
      this.logger.error('[DevMentorAIIntegration] AI call failed:', error);
      throw new Error(`AI call failed: ${error.message}`);
    }
  }

  async determineAnalysisStrategy(options) {
    // Verificar se modo offline foi forçado
    if (options.forceOffline === true) {
      return 'offline';
    }
    
    // Verificar se modo online foi forçado
    if (options.forceOnline === true) {
      return 'online';
    }
    
    // Verificar saúde da rede
    if (this.systems.networkHealth) {
      const networkStatus = this.systems.networkHealth.getStatus();
      
      if (this.systems.networkHealth.shouldUseOfflineMode()) {
        this.logger.info('[DevMentorAIIntegration] Using offline mode due to network issues');
        return 'offline';
      }
    }
    
    // Verificar disponibilidade de provedores de IA
    if (this.systems.aiProvider) {
      const availableProviders = this.systems.aiProvider.getAvailableProviders();
      
      if (availableProviders.length === 0) {
        this.logger.info('[DevMentorAIIntegration] Using offline mode - no AI providers available');
        return 'offline';
      }
    }
    
    // Padrão: tentar online primeiro
    return 'online';
  }

  async performOfflineAnalysis(code, analysisType, options) {
    this.logger.info('[DevMentorAIIntegration] Performing offline code analysis');
    
    // Usar Chrome AI se disponível
    if (typeof ai !== 'undefined') {
      try {
        const session = await ai.createTextSession({
          systemPrompt: this.getSystemPrompt(analysisType)
        });
        
        const prompt = this.generateAnalysisPrompt(code, analysisType, options);
        const result = await session.prompt(prompt);
        
        return {
          success: true,
          result: result,
          type: analysisType,
          mode: 'offline',
          provider: 'chrome-ai',
          timestamp: Date.now()
        };
      } catch (error) {
        this.logger.warn('[DevMentorAIIntegration] Chrome AI failed:', error);
      }
    }
    
    // Fallback para análise básica
    return this.performBasicAnalysis(code, analysisType, options);
  }

  async performOnlineAnalysis(code, analysisType, options) {
    this.logger.info('[DevMentorAIIntegration] Performing online code analysis');
    
    if (!this.systems.aiProvider) {
      throw new Error('AI provider system not available');
    }
    
    const prompt = this.generateAnalysisPrompt(code, analysisType, options);
    const result = await this.systems.aiProvider.callAI(prompt, {
      complexity: this.getComplexityLevel(analysisType),
      ...options
    });
    
    return {
      success: true,
      result: result.result,
      type: analysisType,
      mode: result.mode,
      provider: result.provider,
      timestamp: Date.now()
    };
  }

  async performOfflineScreenshotAnalysis(imageData, analysisType, options) {
    this.logger.info('[DevMentorAIIntegration] Performing offline screenshot analysis');
    
    // Chrome AI não suporta análise de imagens diretamente
    // Fallback para análise básica
    return this.performBasicScreenshotAnalysis(imageData, analysisType, options);
  }

  async performOnlineScreenshotAnalysis(imageData, analysisType, options) {
    this.logger.info('[DevMentorAIIntegration] Performing online screenshot analysis');
    
    if (!this.systems.aiProvider) {
      throw new Error('AI provider system not available');
    }
    
    const prompt = this.generateScreenshotAnalysisPrompt(imageData, analysisType, options);
    const result = await this.systems.aiProvider.callAI(prompt, {
      complexity: 'high', // Análise de imagem é sempre complexa
      ...options
    });
    
    return {
      success: true,
      result: result.result,
      type: analysisType,
      mode: result.mode,
      provider: result.provider,
      timestamp: Date.now()
    };
  }

  performBasicAnalysis(code, analysisType, options) {
    // Análise básica sem IA
    const analysis = {
      explain: 'Análise básica: Este código parece ser uma função JavaScript.',
      debug: 'Análise básica: Verifique sintaxe e lógica básica.',
      optimize: 'Análise básica: Considere usar métodos mais eficientes.',
      document: 'Análise básica: Adicione comentários explicativos.'
    };
    
    return {
      success: true,
      result: analysis[analysisType] || analysis.explain,
      type: analysisType,
      mode: 'basic',
      provider: 'basic',
      timestamp: Date.now()
    };
  }

  performBasicScreenshotAnalysis(imageData, analysisType, options) {
    return {
      success: true,
      result: 'Análise básica: Imagem detectada. Use modo online para análise detalhada.',
      type: analysisType,
      mode: 'basic',
      provider: 'basic',
      timestamp: Date.now()
    };
  }

  getSystemPrompt(analysisType) {
    const prompts = {
      explain: 'You are DevMentor AI, an expert coding assistant. Explain this code in detail.',
      debug: 'You are DevMentor AI, an expert debugging assistant. Find bugs and issues in this code.',
      optimize: 'You are DevMentor AI, an expert optimization assistant. Optimize this code for performance.',
      document: 'You are DevMentor AI, an expert documentation assistant. Generate documentation for this code.'
    };
    
    return prompts[analysisType] || prompts.explain;
  }

  generateAnalysisPrompt(code, analysisType, options) {
    const systemPrompt = this.getSystemPrompt(analysisType);
    const language = options.language || 'javascript';
    
    return `${systemPrompt}

Code (${language}):
\`\`\`${language}
${code}
\`\`\`

Please provide a detailed analysis.`;
  }

  generateScreenshotAnalysisPrompt(imageData, analysisType, options) {
    const prompts = {
      explain: 'Analyze this screenshot and explain what you see.',
      debug: 'Analyze this screenshot for potential issues or problems.',
      optimize: 'Analyze this screenshot and suggest improvements.',
      document: 'Analyze this screenshot and create documentation.'
    };
    
    return `${prompts[analysisType] || prompts.explain}

Screenshot data: ${imageData.substring(0, 100)}...`;
  }

  getComplexityLevel(analysisType) {
    const complexityMap = {
      explain: 'low',
      debug: 'high',
      optimize: 'high',
      document: 'medium'
    };
    
    return complexityMap[analysisType] || 'medium';
  }

  // Métodos de status e diagnóstico
  getSystemStatus() {
    return {
      initialized: this.isInitialized,
      systems: Object.keys(this.systems),
      security: this.systems.securityMonitoring?.getStatus(),
      network: this.systems.networkHealth?.getStatus(),
      cache: this.systems.cache?.getStats(),
      ai: this.systems.aiProvider?.getStats()
    };
  }

  async generateDiagnosticReport() {
    const report = {
      timestamp: Date.now(),
      systemStatus: this.getSystemStatus(),
      securityReport: this.systems.securityMonitoring?.generateSecurityReport(),
      networkReport: this.systems.networkHealth?.generateReport(),
      cacheReport: this.systems.cache?.getCacheInfo(),
      aiReport: this.systems.aiProvider?.getStats()
    };
    
    return report;
  }

  // Métodos de configuração
  async updateConfiguration(config) {
    this.logger.info('[DevMentorAIIntegration] Updating configuration');
    
    // Atualizar configurações de cada sistema
    if (config.security && this.systems.securityMonitoring) {
      this.systems.securityMonitoring.setConfig(config.security);
    }
    
    if (config.network && this.systems.networkHealth) {
      this.systems.networkHealth.setConfig(config.network);
    }
    
    if (config.cache && this.systems.cache) {
      this.systems.cache.setConfig(config.cache);
    }
    
    if (config.ai && this.systems.aiProvider) {
      this.systems.aiProvider.setConfig(config.ai);
    }
    
    this.logger.info('[DevMentorAIIntegration] Configuration updated');
  }

  // Métodos de limpeza
  async cleanup() {
    this.logger.info('[DevMentorAIIntegration] Cleaning up systems');
    
    // Parar monitoramento
    if (this.systems.securityMonitoring) {
      this.systems.securityMonitoring.stop();
    }
    
    if (this.systems.anomalyDetection) {
      this.systems.anomalyDetection.stop();
    }
    
    if (this.systems.networkHealth) {
      this.systems.networkHealth.stopMonitoring();
    }
    
    // Limpar cache
    if (this.systems.cache) {
      this.systems.cache.clear();
    }
    
    this.logger.info('[DevMentorAIIntegration] Cleanup completed');
  }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.DevMentorAIIntegration = DevMentorAIIntegration;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DevMentorAIIntegration;
}

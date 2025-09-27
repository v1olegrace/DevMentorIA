/**
 * DevMentor AI - Gerenciador de Provedores de IA
 * Gerencia múltiplos provedores com fallback inteligente e modo offline
 */

class AIProviderManager {
  constructor() {
    this.logger = (typeof __DEVMENTOR_LOGGER !== 'undefined') ? __DEVMENTOR_LOGGER : console;
    this.providers = this.initializeProviders();
    this.cache = new Map();
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      cacheHits: 0,
      offlineRequests: 0,
      providerUsage: {}
    };
    this.config = {
      enableCache: true,
      cacheSize: 100,
      maxRetries: 3,
      timeout: 30000,
      fallbackStrategy: 'balanced'
    };
    
    // Inicialização assíncrona segura
    this.isInitialized = false;
    this.initPromise = null;
    this.initializationError = null;
  }

  initializeProviders() {
    return {
      openai: {
        name: 'OpenAI',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
        defaultModel: 'gpt-4',
        cost: 2,
        speed: 2,
        quality: 3,
        maxTokens: 4000,
        temperature: 0.7
      },
      claude: {
        name: 'Claude',
        endpoint: 'https://api.anthropic.com/v1/messages',
        models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
        defaultModel: 'claude-3-sonnet-20240229',
        cost: 3,
        speed: 1,
        quality: 3,
        maxTokens: 4000,
        temperature: 0.7
      },
      gemini: {
        name: 'Gemini',
        endpoint: 'https://generativelanguage.googleapis.com/v1/models',
        models: ['gemini-pro', 'gemini-pro-vision'],
        defaultModel: 'gemini-pro',
        cost: 1,
        speed: 1,
        quality: 2,
        maxTokens: 4000,
        temperature: 0.7
      },
      deepseek: {
        name: 'DeepSeek',
        endpoint: 'https://api.deepseek.com/v1/chat/completions',
        models: ['deepseek-chat', 'deepseek-coder'],
        defaultModel: 'deepseek-chat',
        cost: 1,
        speed: 2,
        quality: 2,
        maxTokens: 4000,
        temperature: 0.7
      }
    };
  }

  async ensureInitialized() {
    if (this.isInitialized) return;
    if (this.initializationError) throw this.initializationError;
    if (this.initPromise) return this.initPromise;
    
    this.initPromise = this.initialize();
    
    try {
      await this.initPromise;
      this.isInitialized = true;
      this.logger.info('[AIProviderManager] AI provider manager initialized successfully');
    } catch (error) {
      this.initializationError = error;
      this.logger.error('[AIProviderManager] Initialization failed:', error);
      throw error;
    }
  }

  async initialize() {
    this.logger.info('[AIProviderManager] Initializing AI provider manager');
    
    try {
      // Carregar configurações
      await this.loadConfig();
      
      // Verificar disponibilidade do modelo local
      await this.checkLocalModelAvailability();
      
      // Iniciar limpeza de cache
      this.startCacheCleanup();
      
      this.logger.info('[AIProviderManager] AI provider manager initialized');
    } catch (error) {
      this.logger.error('[AIProviderManager] Initialization error:', error);
      throw error;
    }
  }

  async loadConfig() {
    try {
      const result = await chrome.storage.local.get([
        'openaiKey', 'claudeKey', 'geminiKey', 'deepseekKey',
        'fallbackStrategy', 'enableCache', 'cacheSize', 'maxTokens', 'temperature',
        'aiProviderStats'
      ]);
      
      // Carregar chaves
      this.providers.openai.key = result.openaiKey || '';
      this.providers.claude.key = result.claudeKey || '';
      this.providers.gemini.key = result.geminiKey || '';
      this.providers.deepseek.key = result.deepseekKey || '';
      
      // Carregar configurações
      if (result.fallbackStrategy) {
        this.config.fallbackStrategy = result.fallbackStrategy;
      }
      if (result.enableCache !== undefined) {
        this.config.enableCache = result.enableCache;
      }
      if (result.cacheSize) {
        this.config.cacheSize = result.cacheSize;
      }
      
      // Carregar estatísticas
      if (result.aiProviderStats) {
        this.stats = { ...this.stats, ...result.aiProviderStats };
      }
      
      this.logger.info('[AIProviderManager] Configuration loaded');
    } catch (error) {
      this.logger.error('[AIProviderManager] Failed to load configuration:', error);
    }
  }

  async saveStats() {
    try {
      await chrome.storage.local.set({
        aiProviderStats: this.stats
      });
    } catch (error) {
      this.logger.error('[AIProviderManager] Failed to save stats:', error);
    }
  }

  async checkLocalModelAvailability() {
    try {
      if (typeof ai !== 'undefined') {
        this.logger.info('[AIProviderManager] Chrome AI available');
        return true;
      } else {
        this.logger.warn('[AIProviderManager] Chrome AI not available');
        return false;
      }
    } catch (error) {
      this.logger.error('[AIProviderManager] Local model check failed:', error);
      return false;
    }
  }

  startCacheCleanup() {
    setInterval(() => {
      this.cleanupCache();
    }, 300000); // Limpar cache a cada 5 minutos
  }

  cleanupCache() {
    if (this.cache.size > this.config.cacheSize) {
      const entries = Array.from(this.cache.entries());
      const toDelete = entries.slice(0, entries.length - this.config.cacheSize);
      
      for (const [key] of toDelete) {
        this.cache.delete(key);
      }
      
      this.logger.debug('[AIProviderManager] Cache cleaned up');
    }
  }

  /**
   * Chamada principal para IA
   */
  async callAI(prompt, options = {}) {
    // Garantir que o sistema está inicializado
    await this.ensureInitialized();
    
    const complexity = options.complexity || 'medium';
    const useCache = options.useCache !== false;
    
    this.stats.totalRequests++;
    
    try {
      // Verificar cache primeiro
      if (useCache && this.config.enableCache) {
        const cachedResult = this.getCachedResult(prompt, complexity);
        if (cachedResult) {
          this.stats.cacheHits++;
          this.logger.debug('[AIProviderManager] Cache hit');
          return cachedResult;
        }
      }
      
      // Tentar provedores online
      const result = await this.callOnlineProviders(prompt, complexity, options);
      
      if (result.success) {
        this.stats.successfulRequests++;
        
        // Cachear resultado
        if (useCache && this.config.enableCache) {
          this.cacheResult(prompt, complexity, result);
        }
        
        await this.saveStats();
        return result;
      }
      
      // Fallback para modo offline
      this.logger.warn('[AIProviderManager] All online providers failed, trying offline mode');
      return await this.callOfflineAI(prompt, options);
      
    } catch (error) {
      this.stats.failedRequests++;
      this.logger.error('[AIProviderManager] AI call failed:', error);
      
      // Fallback para modo offline
      try {
        return await this.callOfflineAI(prompt, options);
      } catch (offlineError) {
        await this.saveStats();
        throw new Error(`AI call failed: ${error.message}`);
      }
    }
  }

  async callOnlineProviders(prompt, complexity, options) {
    const availableProviders = this.getAvailableProviders();
    
    if (availableProviders.length === 0) {
      throw new Error('No API keys configured');
    }
    
    // Escolher melhor provedor
    const provider = this.chooseProvider(availableProviders, complexity);
    
    if (!provider) {
      throw new Error('No suitable provider found');
    }
    
    // Tentar chamar o provedor escolhido
    try {
      const result = await this.callProvider(provider, prompt, options);
      
      // Atualizar estatísticas de uso
      this.stats.providerUsage[provider.name] = (this.stats.providerUsage[provider.name] || 0) + 1;
      
      return {
        success: true,
        result: result,
        provider: provider.name,
        mode: 'online',
        timestamp: Date.now()
      };
      
    } catch (error) {
      this.logger.warn(`[AIProviderManager] ${provider.name} failed:`, error.message);
      
      // Tentar outros provedores se disponíveis (com limite de tentativas)
      const otherProviders = availableProviders.filter(p => p.name !== provider.name);
      const maxRetries = this.config.maxRetries || 3;
      let attempts = 0;
      
      for (const fallbackProvider of otherProviders) {
        if (attempts >= maxRetries) {
          this.logger.warn(`[AIProviderManager] Max retries (${maxRetries}) reached, stopping fallback attempts`);
          break;
        }
        
        try {
          const result = await this.callProvider(fallbackProvider, prompt, options);
          
          this.stats.providerUsage[fallbackProvider.name] = (this.stats.providerUsage[fallbackProvider.name] || 0) + 1;
          
          return {
            success: true,
            result: result,
            provider: fallbackProvider.name,
            mode: 'online',
            fallback: true,
            attempts: attempts + 1,
            timestamp: Date.now()
          };
          
        } catch (fallbackError) {
          attempts++;
          this.logger.warn(`[AIProviderManager] ${fallbackProvider.name} fallback attempt ${attempts} failed:`, fallbackError.message);
          
          // Delay exponencial entre tentativas (exceto na última)
          if (attempts < maxRetries) {
            const delay = Math.min(Math.pow(2, attempts) * 1000, 10000); // Max 10 segundos
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      
      throw error;
    }
  }

  getAvailableProviders() {
    return Object.values(this.providers).filter(provider => provider.key && provider.key.length > 10);
  }

  chooseProvider(providers, complexity) {
    if (providers.length === 0) return null;
    if (providers.length === 1) return providers[0];
    
    let sortedProviders;
    
    switch (this.config.fallbackStrategy) {
      case 'cost':
        sortedProviders = [...providers].sort((a, b) => a.cost - b.cost);
        break;
      case 'speed':
        sortedProviders = [...providers].sort((a, b) => a.speed - b.speed);
        break;
      case 'quality':
        sortedProviders = [...providers].sort((a, b) => b.quality - a.quality);
        break;
      case 'balanced':
      default:
        // Estratégia equilibrada baseada na complexidade
        if (complexity === 'high') {
          // Para problemas complexos, priorizar qualidade
          sortedProviders = [...providers].sort((a, b) => 
            (b.quality - a.quality) || (a.cost - b.cost)
          );
        } else if (complexity === 'low') {
          // Para problemas simples, priorizar velocidade e custo
          sortedProviders = [...providers].sort((a, b) => 
            (a.cost - b.cost) || (b.speed - a.speed)
          );
        } else {
          // Para problemas médios, equilibrar todos os fatores
          sortedProviders = [...providers].sort((a, b) => {
            const scoreA = (a.quality * 0.4) + (a.speed * 0.3) + ((4 - a.cost) * 0.3);
            const scoreB = (b.quality * 0.4) + (b.speed * 0.3) + ((4 - b.cost) * 0.3);
            return scoreB - scoreA;
          });
        }
        break;
    }
    
    return sortedProviders[0];
  }

  async callProvider(provider, prompt, options) {
    const startTime = Date.now();
    
    try {
      let result;
      
      switch (provider.name) {
        case 'OpenAI':
          result = await this.callOpenAI(provider, prompt, options);
          break;
        case 'Claude':
          result = await this.callClaude(provider, prompt, options);
          break;
        case 'Gemini':
          result = await this.callGemini(provider, prompt, options);
          break;
        case 'DeepSeek':
          result = await this.callDeepSeek(provider, prompt, options);
          break;
        default:
          throw new Error(`Unknown provider: ${provider.name}`);
      }
      
      const duration = Date.now() - startTime;
      this.logger.debug(`[AIProviderManager] ${provider.name} call completed in ${duration}ms`);
      
      return result;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`[AIProviderManager] ${provider.name} call failed after ${duration}ms:`, error);
      throw error;
    }
  }

  async callOpenAI(provider, prompt, options) {
    const model = options.model || provider.defaultModel;
    const maxTokens = options.maxTokens || provider.maxTokens;
    const temperature = options.temperature || provider.temperature;
    
    const response = await fetch(provider.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: 'You are DevMentor AI, an expert coding assistant.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: maxTokens,
        temperature: temperature
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  }

  async callClaude(provider, prompt, options) {
    const model = options.model || provider.defaultModel;
    const maxTokens = options.maxTokens || provider.maxTokens;
    const temperature = options.temperature || provider.temperature;
    
    const response = await fetch(provider.endpoint, {
      method: 'POST',
      headers: {
        'x-api-key': provider.key,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model,
        max_tokens: maxTokens,
        temperature: temperature,
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Claude API error: ${error.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    return data.content[0].text;
  }

  async callGemini(provider, prompt, options) {
    const model = options.model || provider.defaultModel;
    const maxTokens = options.maxTokens || provider.maxTokens;
    const temperature = options.temperature || provider.temperature;
    
    const response = await fetch(`${provider.endpoint}/${model}:generateContent?key=${provider.key}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: temperature
        }
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API error: ${error.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  async callDeepSeek(provider, prompt, options) {
    const model = options.model || provider.defaultModel;
    const maxTokens = options.maxTokens || provider.maxTokens;
    const temperature = options.temperature || provider.temperature;
    
    const response = await fetch(provider.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: 'You are DevMentor AI, an expert coding assistant.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: maxTokens,
        temperature: temperature
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`DeepSeek API error: ${error.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  }

  async callOfflineAI(prompt, options) {
    this.stats.offlineRequests++;
    
    try {
      if (typeof ai !== 'undefined') {
        const session = await ai.createTextSession({
          systemPrompt: 'You are DevMentor AI, an expert coding assistant.'
        });
        
        const result = await session.prompt(prompt);
        
        this.logger.info('[AIProviderManager] Offline AI call successful');
        
        return {
          success: true,
          result: result,
          provider: 'local',
          mode: 'offline',
          timestamp: Date.now()
        };
      } else {
        throw new Error('Chrome AI not available');
      }
    } catch (error) {
      this.logger.error('[AIProviderManager] Offline AI call failed:', error);
      throw new Error('Modo offline não disponível');
    }
  }

  // Métodos de cache
  getCachedResult(prompt, complexity) {
    const cacheKey = this.generateCacheKey(prompt, complexity);
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < 3600000) { // 1 hora
      return cached.result;
    }
    
    return null;
  }

  cacheResult(prompt, complexity, result) {
    const cacheKey = this.generateCacheKey(prompt, complexity);
    this.cache.set(cacheKey, {
      result: result,
      timestamp: Date.now()
    });
  }

  generateCacheKey(prompt, complexity) {
    const hash = this.simpleHash(prompt + complexity);
    return `ai_${hash}`;
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  // Métodos de estatísticas
  getStats() {
    return {
      ...this.stats,
      successRate: this.stats.totalRequests > 0 
        ? this.stats.successfulRequests / this.stats.totalRequests 
        : 0,
      cacheHitRate: this.stats.totalRequests > 0 
        ? this.stats.cacheHits / this.stats.totalRequests 
        : 0,
      offlineRate: this.stats.totalRequests > 0 
        ? this.stats.offlineRequests / this.stats.totalRequests 
        : 0
    };
  }

  // Métodos de teste
  async testProvider(providerName) {
    const provider = this.providers[providerName];
    
    if (!provider || !provider.key) {
      throw new Error(`Provider ${providerName} not configured`);
    }
    
    const testPrompt = 'Teste de conexão - responda apenas "OK"';
    
    try {
      const result = await this.callProvider(provider, testPrompt);
      return {
        success: true,
        provider: providerName,
        result: result
      };
    } catch (error) {
      return {
        success: false,
        provider: providerName,
        error: error.message
      };
    }
  }

  async testAllProviders() {
    const results = [];
    const providers = Object.keys(this.providers);
    
    for (const providerName of providers) {
      try {
        const result = await this.testProvider(providerName);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          provider: providerName,
          error: error.message
        });
      }
    }
    
    return results;
  }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.AIProviderManager = AIProviderManager;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIProviderManager;
}

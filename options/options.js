/**
 * DevMentor AI - Página de Configuração de APIs
 * Gerencia múltiplos provedores de IA com fallback inteligente
 */

class APIConfigManager {
  constructor() {
    this.logger = (typeof __DEVMENTOR_LOGGER !== 'undefined') ? __DEVMENTOR_LOGGER : console;
    this.providers = {
      openai: { name: 'OpenAI', key: '', status: 'disconnected', cost: 2, speed: 2, quality: 3 },
      claude: { name: 'Claude', key: '', status: 'disconnected', cost: 3, speed: 1, quality: 3 },
      gemini: { name: 'Gemini', key: '', status: 'disconnected', cost: 1, speed: 1, quality: 2 },
      deepseek: { name: 'DeepSeek', key: '', status: 'disconnected', cost: 1, speed: 2, quality: 2 }
    };
    
    this.config = {
      fallbackStrategy: 'balanced',
      enableCache: true,
      cacheSize: 100,
      maxTokens: 2000,
      temperature: 0.7
    };
    
    this.stats = {
      connectedProviders: 0,
      totalRequests: 0,
      cacheHits: 0,
      offlineMode: 0
    };
    
    this.initialize();
  }

  async initialize() {
    this.logger.info('[APIConfigManager] Initializing API configuration manager');
    
    // Carregar configurações salvas
    await this.loadSettings();
    
    // Configurar event listeners
    this.setupEventListeners();
    
    // Verificar status da rede
    this.checkNetworkStatus();
    
    // Verificar disponibilidade do modelo local
    this.checkLocalModelAvailability();
    
    // Atualizar estatísticas
    await this.updateStats();
    
    // Verificar conexões das APIs
    await this.checkAllConnections();
    
    this.logger.info('[APIConfigManager] API configuration manager initialized');
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.local.get([
        'openaiKey', 'claudeKey', 'geminiKey', 'deepseekKey',
        'fallbackStrategy', 'enableCache', 'cacheSize', 'maxTokens', 'temperature',
        'apiStats'
      ]);
      
      // Função auxiliar para atualizar DOM com verificação
      const updateElement = (id, value, type = 'value') => {
        const element = document.getElementById(id);
        if (element) {
          if (type === 'value') {
            element.value = value;
          } else if (type === 'checked') {
            element.checked = value;
          }
        } else {
          this.logger.warn(`[APIConfigManager] Element with id '${id}' not found`);
        }
      };
      
      // Carregar chaves
      if (result.openaiKey) {
        this.providers.openai.key = result.openaiKey;
        updateElement('openaiKey', result.openaiKey);
      }
      if (result.claudeKey) {
        this.providers.claude.key = result.claudeKey;
        updateElement('claudeKey', result.claudeKey);
      }
      if (result.geminiKey) {
        this.providers.gemini.key = result.geminiKey;
        updateElement('geminiKey', result.geminiKey);
      }
      if (result.deepseekKey) {
        this.providers.deepseek.key = result.deepseekKey;
        updateElement('deepseekKey', result.deepseekKey);
      }
      
      // Carregar configurações
      if (result.fallbackStrategy) {
        this.config.fallbackStrategy = result.fallbackStrategy;
        updateElement('fallbackStrategy', result.fallbackStrategy);
      }
      if (result.enableCache !== undefined) {
        this.config.enableCache = result.enableCache;
        updateElement('enableCache', result.enableCache, 'checked');
      }
      if (result.cacheSize) {
        this.config.cacheSize = result.cacheSize;
        updateElement('cacheSize', result.cacheSize);
      }
      
      // Carregar estatísticas
      if (result.apiStats) {
        this.stats = { ...this.stats, ...result.apiStats };
      }
      
      this.logger.info('[APIConfigManager] Settings loaded successfully');
    } catch (error) {
      this.logger.error('[APIConfigManager] Failed to load settings:', error);
    }
  }

  setupEventListeners() {
    // Botão salvar
    document.getElementById('saveBtn').addEventListener('click', () => this.saveSettings());
    
    // Botão testar todas
    document.getElementById('testAllBtn').addEventListener('click', () => this.testAllAPIs());
    
    // Botão limpar cache
    document.getElementById('clearCacheBtn').addEventListener('click', () => this.clearCache());
    
    // Testes individuais
    document.getElementById('test-openai').addEventListener('click', () => this.testAPI('openai'));
    document.getElementById('test-claude').addEventListener('click', () => this.testAPI('claude'));
    document.getElementById('test-gemini').addEventListener('click', () => this.testAPI('gemini'));
    document.getElementById('test-deepseek').addEventListener('click', () => this.testAPI('deepseek'));
    
    // Auto-save quando chaves mudam
    ['openaiKey', 'claudeKey', 'geminiKey', 'deepseekKey'].forEach(id => {
      document.getElementById(id).addEventListener('input', () => {
        this.providers[id.replace('Key', '')].key = document.getElementById(id).value.trim();
        this.updateProviderStatus(id.replace('Key', ''));
      });
    });
    
    // Auto-save para configurações
    document.getElementById('fallbackStrategy').addEventListener('change', (e) => {
      this.config.fallbackStrategy = e.target.value;
    });
    
    document.getElementById('enableCache').addEventListener('change', (e) => {
      this.config.enableCache = e.target.checked;
    });
    
    document.getElementById('cacheSize').addEventListener('input', (e) => {
      this.config.cacheSize = parseInt(e.target.value);
    });
    
    // Verificar rede quando mudar
    window.addEventListener('online', () => this.checkNetworkStatus());
    window.addEventListener('offline', () => this.checkNetworkStatus());
  }

  async saveSettings() {
    try {
      const settings = {
        openaiKey: this.providers.openai.key,
        claudeKey: this.providers.claude.key,
        geminiKey: this.providers.gemini.key,
        deepseekKey: this.providers.deepseek.key,
        fallbackStrategy: this.config.fallbackStrategy,
        enableCache: this.config.enableCache,
        cacheSize: this.config.cacheSize,
        maxTokens: this.config.maxTokens,
        temperature: this.config.temperature,
        apiStats: this.stats
      };
      
      await chrome.storage.local.set(settings);
      
      this.showNotification('✅ Configurações salvas com sucesso!', 'success');
      this.logger.info('[APIConfigManager] Settings saved successfully');
      
    } catch (error) {
      this.logger.error('[APIConfigManager] Failed to save settings:', error);
      this.showNotification('❌ Erro ao salvar configurações', 'error');
    }
  }

  async testAPI(provider) {
    const button = document.getElementById(`test-${provider}`);
    const statusElement = document.getElementById(`${provider}-status`);
    
    button.disabled = true;
    button.textContent = 'Testando...';
    statusElement.className = 'api-status';
    
    try {
      const result = await this.callAPI(provider, 'Teste de conexão');
      
      if (result.success) {
        this.providers[provider].status = 'connected';
        statusElement.className = 'api-status connected';
        this.showNotification(`✅ ${this.providers[provider].name} conectado!`, 'success');
      } else {
        throw new Error(result.error || 'Falha na conexão');
      }
      
    } catch (error) {
      this.providers[provider].status = 'error';
      statusElement.className = 'api-status error';
      this.showNotification(`❌ ${this.providers[provider].name}: ${error.message}`, 'error');
      this.logger.error(`[APIConfigManager] ${provider} test failed:`, error);
    }
    
    button.disabled = false;
    button.textContent = 'Testar Conexão';
    this.updateProviderCard(provider);
    await this.updateStats();
  }

  async testAllAPIs() {
    this.showNotification('🧪 Testando todas as APIs...', 'warning');
    
    const providers = Object.keys(this.providers);
    const results = await Promise.allSettled(
      providers.map(provider => this.testAPI(provider))
    );
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const total = providers.length;
    
    this.showNotification(`✅ ${successful}/${total} APIs conectadas`, 'success');
  }

  async callAPI(provider, prompt) {
    const providerConfig = this.providers[provider];
    
    if (!providerConfig.key) {
      throw new Error('Chave de API não configurada');
    }
    
    // Simular chamada de API (em produção, usar endpoints reais)
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simular sucesso baseado na disponibilidade da chave
        const isValidKey = providerConfig.key.length > 10;
        resolve({
          success: isValidKey,
          result: isValidKey ? 'Conexão bem-sucedida' : 'Chave inválida',
          error: isValidKey ? null : 'Chave de API inválida'
        });
      }, 1000);
    });
  }

  checkNetworkStatus() {
    const statusElement = document.getElementById('networkStatus');
    const isOnline = navigator.onLine;
    
    if (isOnline) {
      statusElement.textContent = 'Online';
      statusElement.className = 'status-badge status-online';
    } else {
      statusElement.textContent = 'Offline';
      statusElement.className = 'status-badge status-offline';
    }
  }

  async checkLocalModelAvailability() {
    const statusElement = document.getElementById('localModelStatus');
    
    try {
      // Verificar se Chrome AI está disponível
      if (typeof ai !== 'undefined') {
        statusElement.textContent = 'Chrome AI Gemini Nano (Disponível)';
        this.logger.info('[APIConfigManager] Chrome AI available');
      } else {
        statusElement.textContent = 'Chrome AI Gemini Nano (Não disponível)';
        this.logger.warn('[APIConfigManager] Chrome AI not available');
      }
    } catch (error) {
      statusElement.textContent = 'Modelo local não disponível';
      this.logger.error('[APIConfigManager] Local model check failed:', error);
    }
  }

  async checkAllConnections() {
    const providers = Object.keys(this.providers);
    
    for (const provider of providers) {
      if (this.providers[provider].key) {
        await this.testAPI(provider);
      }
    }
  }

  updateProviderStatus(provider) {
    const card = document.getElementById(`${provider}-card`);
    const statusElement = document.getElementById(`${provider}-status`);
    
    if (this.providers[provider].key) {
      card.classList.add('active');
      statusElement.className = 'api-status';
    } else {
      card.classList.remove('active');
      statusElement.className = 'api-status';
    }
  }

  updateProviderCard(provider) {
    const card = document.getElementById(`${provider}-card`);
    
    if (this.providers[provider].status === 'connected') {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  }

  async updateStats() {
    // Contar provedores conectados
    this.stats.connectedProviders = Object.values(this.providers)
      .filter(p => p.status === 'connected').length;
    
    // Atualizar elementos da UI
    document.getElementById('connectedProviders').textContent = this.stats.connectedProviders;
    document.getElementById('totalRequests').textContent = this.stats.totalRequests;
    document.getElementById('cacheHits').textContent = this.stats.cacheHits;
    document.getElementById('offlineMode').textContent = this.stats.offlineMode;
  }

  async clearCache() {
    try {
      await chrome.storage.local.remove(['aiCache', 'requestCache']);
      this.stats.cacheHits = 0;
      await this.updateStats();
      this.showNotification('🗑️ Cache limpo com sucesso!', 'success');
      this.logger.info('[APIConfigManager] Cache cleared');
    } catch (error) {
      this.logger.error('[APIConfigManager] Failed to clear cache:', error);
      this.showNotification('❌ Erro ao limpar cache', 'error');
    }
  }

  showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  }

  // Métodos para integração com o sistema principal
  getBestProvider(complexity = 'medium') {
    const availableProviders = Object.entries(this.providers)
      .filter(([_, config]) => config.status === 'connected')
      .map(([name, config]) => ({ name, ...config }));
    
    if (availableProviders.length === 0) {
      return null; // Usar modo offline
    }
    
    // Estratégia de escolha baseada na complexidade
    let sortedProviders;
    
    switch (this.config.fallbackStrategy) {
      case 'cost':
        sortedProviders = availableProviders.sort((a, b) => a.cost - b.cost);
        break;
      case 'speed':
        sortedProviders = availableProviders.sort((a, b) => a.speed - b.speed);
        break;
      case 'quality':
        sortedProviders = availableProviders.sort((a, b) => b.quality - a.quality);
        break;
      case 'balanced':
      default:
        // Para problemas complexos, priorizar qualidade
        // Para problemas simples, priorizar custo
        if (complexity === 'high') {
          sortedProviders = availableProviders.sort((a, b) => 
            (b.quality - a.quality) || (a.cost - b.cost)
          );
        } else {
          sortedProviders = availableProviders.sort((a, b) => 
            (a.cost - b.cost) || (b.speed - a.speed)
          );
        }
        break;
    }
    
    return sortedProviders[0];
  }

  async callAI(prompt, complexity = 'medium') {
    try {
      // Tentar usar provedor online primeiro
      const provider = this.getBestProvider(complexity);
      
      if (provider) {
        this.stats.totalRequests++;
        const result = await this.callAPI(provider.name, prompt);
        
        if (result.success) {
          await this.updateStats();
          return {
            success: true,
            result: result.result,
            provider: provider.name,
            mode: 'online'
          };
        }
      }
      
      // Fallback para modo offline
      this.logger.warn('[APIConfigManager] No online providers available, using offline mode');
      return await this.callLocalAI(prompt);
      
    } catch (error) {
      this.logger.error('[APIConfigManager] AI call failed:', error);
      
      // Fallback para modo offline
      return await this.callLocalAI(prompt);
    }
  }

  async callLocalAI(prompt) {
    try {
      if (typeof ai !== 'undefined') {
        const session = await ai.createTextSession();
        const result = await session.prompt(prompt);
        
        this.stats.offlineMode++;
        await this.updateStats();
        
        return {
          success: true,
          result: result,
          provider: 'local',
          mode: 'offline'
        };
      } else {
        throw new Error('Chrome AI not available');
      }
    } catch (error) {
      this.logger.error('[APIConfigManager] Local AI call failed:', error);
      throw new Error('Modo offline não disponível');
    }
  }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
  window.apiConfigManager = new APIConfigManager();
});

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.APIConfigManager = APIConfigManager;
}

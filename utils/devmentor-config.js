/**
 * DevMentor AI - Configuration & Setup
 * Arquivo de configuração e setup para o sistema completo
 */

class DevMentorConfig {
  constructor() {
    this.config = {
      // Configurações gerais
      debug: false,
      autoInitialize: true,
      showNotifications: true,
      
      // Configurações de API
      geminiApiKey: null,
      geminiConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048
      },
      
      // Configurações de UI
      theme: 'light',
      language: 'pt-BR',
      animations: true,
      
      // Configurações de funcionalidades
      features: {
        citations: true,
        playground: true,
        metaphors: true,
        diagrams: true,
        videos: true,
        quizzes: true,
        geminiIntegration: true
      },
      
      // Configurações de performance
      performance: {
        lazyLoading: true,
        cacheEnabled: true,
        maxCacheSize: 50,
        timeout: 30000
      }
    };
    
    console.log('[DevMentorConfig] Configuração inicializada');
  }

  /**
   * CONFIGURAR SISTEMA
   */
  configure(options = {}) {
    this.config = { ...this.config, ...options };
    
    // Aplicar configurações específicas
    if (this.config.geminiApiKey) {
      this._configureGeminiPro();
    }
    
    if (this.config.autoInitialize) {
      this._autoInitialize();
    }
    
    console.log('[DevMentorConfig] Sistema configurado:', this.config);
  }

  /**
   * CONFIGURAR GEMINI PRO
   */
  _configureGeminiPro() {
    if (window.geminiProIntegration) {
      try {
        window.geminiProIntegration.configure(this.config.geminiApiKey);
        console.log('[DevMentorConfig] Gemini Pro configurado');
      } catch (error) {
        console.warn('[DevMentorConfig] Erro ao configurar Gemini Pro:', error);
      }
    }
  }

  /**
   * AUTO-INICIALIZAR SISTEMA
   */
  async _autoInitialize() {
    try {
      if (window.DevMentorHelpers) {
        await window.DevMentorHelpers.initializeMediaRichSystem();
        console.log('[DevMentorConfig] Sistema auto-inicializado');
      }
    } catch (error) {
      console.warn('[DevMentorConfig] Erro na auto-inicialização:', error);
    }
  }

  /**
   * OBTER CONFIGURAÇÃO
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * ATUALIZAR CONFIGURAÇÃO
   */
  updateConfig(updates) {
    this.config = { ...this.config, ...updates };
    console.log('[DevMentorConfig] Configuração atualizada');
  }

  /**
   * RESETAR CONFIGURAÇÃO
   */
  resetConfig() {
    this.config = new DevMentorConfig().config;
    console.log('[DevMentorConfig] Configuração resetada');
  }
}

// Instância global
window.devMentorConfig = new DevMentorConfig();

// Auto-configuração baseada em variáveis de ambiente
if (typeof process !== 'undefined' && process.env) {
  const envConfig = {
    geminiApiKey: process.env.GEMINI_API_KEY,
    debug: process.env.NODE_ENV === 'development',
    autoInitialize: process.env.AUTO_INIT !== 'false'
  };
  
  window.devMentorConfig.configure(envConfig);
} else {
  // No navegador, usar configuração padrão
  console.log('[DevMentorConfig] Usando configuração padrão para navegador');
}

// Configurações padrão para diferentes ambientes
const environmentConfigs = {
  development: {
    debug: true,
    showNotifications: true,
    animations: true,
    performance: {
      lazyLoading: false,
      cacheEnabled: false
    }
  },
  
  production: {
    debug: false,
    showNotifications: false,
    animations: true,
    performance: {
      lazyLoading: true,
      cacheEnabled: true,
      maxCacheSize: 100
    }
  },
  
  demo: {
    debug: false,
    showNotifications: true,
    animations: true,
    features: {
      citations: true,
      playground: true,
      metaphors: true,
      diagrams: true,
      videos: true,
      quizzes: true,
      geminiIntegration: false // Para demo sem API key
    }
  }
};

// Aplicar configuração baseada no ambiente
const currentEnv = (typeof process !== 'undefined' && process.env && process.env.NODE_ENV) || 'demo';
if (environmentConfigs[currentEnv]) {
  window.devMentorConfig.configure(environmentConfigs[currentEnv]);
}

console.log('⚙️ DevMentor Config carregado!');

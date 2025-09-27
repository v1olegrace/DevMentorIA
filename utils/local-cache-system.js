/**
 * DevMentor AI - Sistema de Cache Local
 * Cache inteligente com LRU, TTL e compressão
 */

class LocalCacheSystem {
  constructor() {
    this.logger = (typeof __DEVMENTOR_LOGGER !== 'undefined') ? __DEVMENTOR_LOGGER : console;
    this.cache = new Map();
    this.accessOrder = [];
    this.locks = new Map(); // Para evitar race conditions
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      size: 0,
      maxSize: 1000
    };
    this.config = {
      maxSize: 1000,
      defaultTTL: 3600000, // 1 hora
      compressionEnabled: true,
      persistenceEnabled: true,
      cleanupInterval: 300000 // 5 minutos
    };
    
    this.initialize();
  }

  async initialize() {
    this.logger.info('[LocalCacheSystem] Initializing local cache system');
    
    // Carregar configurações
    await this.loadConfig();
    
    // Carregar cache persistente
    if (this.config.persistenceEnabled) {
      await this.loadPersistentCache();
    }
    
    // Iniciar limpeza automática
    this.startCleanup();
    
    this.logger.info('[LocalCacheSystem] Local cache system initialized');
  }

  async loadConfig() {
    try {
      const result = await chrome.storage.local.get(['cacheConfig']);
      if (result.cacheConfig) {
        this.config = { ...this.config, ...result.cacheConfig };
        this.stats.maxSize = this.config.maxSize;
      }
    } catch (error) {
      this.logger.error('[LocalCacheSystem] Failed to load config:', error);
    }
  }

  async saveConfig() {
    try {
      await chrome.storage.local.set({
        cacheConfig: this.config
      });
    } catch (error) {
      this.logger.error('[LocalCacheSystem] Failed to save config:', error);
    }
  }

  async loadPersistentCache() {
    try {
      const result = await chrome.storage.local.get(['persistentCache']);
      if (result.persistentCache) {
        const cacheData = JSON.parse(result.persistentCache);
        
        for (const [key, value] of Object.entries(cacheData)) {
          if (value.expiresAt > Date.now()) {
            this.cache.set(key, {
              value: value.value,
              expiresAt: value.expiresAt,
              createdAt: value.createdAt,
              accessCount: value.accessCount || 0
            });
            this.accessOrder.push(key);
          }
        }
        
        this.logger.info(`[LocalCacheSystem] Loaded ${this.cache.size} items from persistent cache`);
      }
    } catch (error) {
      this.logger.error('[LocalCacheSystem] Failed to load persistent cache:', error);
    }
  }

  async savePersistentCache() {
    if (!this.config.persistenceEnabled) return;
    
    try {
      const cacheData = {};
      
      for (const [key, item] of this.cache) {
        cacheData[key] = {
          value: item.value,
          expiresAt: item.expiresAt,
          createdAt: item.createdAt,
          accessCount: item.accessCount
        };
      }
      
      await chrome.storage.local.set({
        persistentCache: JSON.stringify(cacheData)
      });
      
      this.logger.debug('[LocalCacheSystem] Persistent cache saved');
    } catch (error) {
      this.logger.error('[LocalCacheSystem] Failed to save persistent cache:', error);
    }
  }

  startCleanup() {
    setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    // Remover itens expirados
    for (const [key, item] of this.cache) {
      if (item.expiresAt <= now) {
        this.cache.delete(key);
        this.removeFromAccessOrder(key);
        cleaned++;
      }
    }
    
    // Evict se necessário
    while (this.cache.size > this.config.maxSize) {
      this.evictLRU();
    }
    
    if (cleaned > 0) {
      this.logger.debug(`[LocalCacheSystem] Cleaned up ${cleaned} expired items`);
    }
    
    // Salvar cache persistente
    this.savePersistentCache();
  }

  set(key, value, ttl = null) {
    const expiresAt = Date.now() + (ttl || this.config.defaultTTL);
    
    // Comprimir valor se habilitado
    const processedValue = this.config.compressionEnabled 
      ? this.compress(value) 
      : value;
    
    // Remover item existente se houver
    if (this.cache.has(key)) {
      this.removeFromAccessOrder(key);
    }
    
    // Adicionar novo item
    this.cache.set(key, {
      value: processedValue,
      expiresAt: expiresAt,
      createdAt: Date.now(),
      accessCount: 0
    });
    
    this.accessOrder.push(key);
    this.stats.sets++;
    this.stats.size = this.cache.size;
    
    // Evict se necessário
    if (this.cache.size > this.config.maxSize) {
      this.evictLRU();
    }
    
    this.logger.debug(`[LocalCacheSystem] Set ${key}`);
  }

  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      return null;
    }
    
    // Verificar se expirou
    if (item.expiresAt <= Date.now()) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      this.stats.misses++;
      return null;
    }
    
    // Atualizar ordem de acesso
    this.removeFromAccessOrder(key);
    this.accessOrder.push(key);
    
    // Incrementar contador de acesso
    item.accessCount++;
    
    this.stats.hits++;
    
    // Descomprimir valor se necessário
    const value = this.config.compressionEnabled 
      ? this.decompress(item.value) 
      : item.value;
    
    this.logger.debug(`[LocalCacheSystem] Hit ${key}`);
    return value;
  }

  has(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }
    
    // Verificar se expirou
    if (item.expiresAt <= Date.now()) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      return false;
    }
    
    return true;
  }

  delete(key) {
    const lockKey = `lock_${key}`;
    
    // Verificar se já está sendo processado
    if (this.locks.has(lockKey)) {
      this.logger.debug(`[LocalCacheSystem] Key ${key} is locked, skipping delete`);
      return false;
    }
    
    this.locks.set(lockKey, true);
    
    try {
      const existed = this.cache.has(key);
      
      if (existed) {
        this.cache.delete(key);
        this.removeFromAccessOrder(key);
        this.stats.deletes++;
        this.stats.size = this.cache.size;
        this.logger.debug(`[LocalCacheSystem] Deleted ${key}`);
      }
      
      return existed;
    } finally {
      this.locks.delete(lockKey);
    }
  }

  clear() {
    this.cache.clear();
    this.accessOrder = [];
    this.stats.size = 0;
    this.logger.info('[LocalCacheSystem] Cache cleared');
  }

  evictLRU() {
    if (this.accessOrder.length === 0) return;
    
    const key = this.accessOrder[0];
    this.cache.delete(key);
    this.removeFromAccessOrder(key);
    this.stats.evictions++;
    this.stats.size = this.cache.size;
    
    this.logger.debug(`[LocalCacheSystem] Evicted LRU item: ${key}`);
  }

  removeFromAccessOrder(key) {
    const index = this.accessOrder.indexOf(key);
    if (index !== -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  // Métodos de compressão
  compress(data) {
    try {
      const jsonString = JSON.stringify(data);
      // Compressão simples usando LZ-string se disponível
      if (typeof LZString !== 'undefined') {
        return LZString.compress(jsonString);
      }
      return jsonString;
    } catch (error) {
      this.logger.warn('[LocalCacheSystem] Compression failed, storing uncompressed:', error);
      return data;
    }
  }

  decompress(compressedData) {
    try {
      // Descompressão simples usando LZ-string se disponível
      if (typeof LZString !== 'undefined') {
        const jsonString = LZString.decompress(compressedData);
        return JSON.parse(jsonString);
      }
      return JSON.parse(compressedData);
    } catch (error) {
      this.logger.warn('[LocalCacheSystem] Decompression failed, returning raw data:', error);
      return compressedData;
    }
  }

  // Métodos de estatísticas
  getStats() {
    return {
      ...this.stats,
      hitRate: this.stats.hits + this.stats.misses > 0 
        ? this.stats.hits / (this.stats.hits + this.stats.misses) 
        : 0,
      utilization: this.stats.size / this.stats.maxSize
    };
  }

  getCacheInfo() {
    const items = Array.from(this.cache.entries()).map(([key, item]) => ({
      key,
      size: JSON.stringify(item.value).length,
      age: Date.now() - item.createdAt,
      accessCount: item.accessCount,
      expiresAt: item.expiresAt
    }));
    
    return {
      totalItems: this.cache.size,
      totalSize: items.reduce((sum, item) => sum + item.size, 0),
      averageAge: items.reduce((sum, item) => sum + item.age, 0) / items.length,
      mostAccessed: items.sort((a, b) => b.accessCount - a.accessCount).slice(0, 5),
      oldestItems: items.sort((a, b) => a.age - b.age).slice(0, 5)
    };
  }

  // Métodos de configuração
  setConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.stats.maxSize = this.config.maxSize;
    this.saveConfig();
  }

  // Métodos de cache específicos para IA
  setAIResponse(prompt, response, provider, ttl = null) {
    const key = this.generateAIKey(prompt, provider);
    const value = {
      response,
      provider,
      timestamp: Date.now(),
      prompt: prompt.substring(0, 100) // Armazenar apenas início do prompt
    };
    
    this.set(key, value, ttl);
  }

  getAIResponse(prompt, provider) {
    const key = this.generateAIKey(prompt, provider);
    const cached = this.get(key);
    
    if (cached) {
      this.logger.debug(`[LocalCacheSystem] AI cache hit for ${provider}`);
      return cached.response;
    }
    
    return null;
  }

  generateAIKey(prompt, provider) {
    const hash = this.simpleHash(prompt + provider);
    return `ai_${provider}_${hash}`;
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

  // Métodos de cache para análise de código
  setCodeAnalysis(code, analysisType, result, ttl = null) {
    const key = this.generateCodeKey(code, analysisType);
    const value = {
      result,
      analysisType,
      codeLength: code.length,
      timestamp: Date.now()
    };
    
    this.set(key, value, ttl);
  }

  getCodeAnalysis(code, analysisType) {
    const key = this.generateCodeKey(code, analysisType);
    const cached = this.get(key);
    
    if (cached) {
      this.logger.debug(`[LocalCacheSystem] Code analysis cache hit for ${analysisType}`);
      return cached.result;
    }
    
    return null;
  }

  generateCodeKey(code, analysisType) {
    const hash = this.simpleHash(code + analysisType);
    return `code_${analysisType}_${hash}`;
  }

  // Métodos de cache para screenshots
  setScreenshotAnalysis(imageData, result, ttl = null) {
    const key = this.generateScreenshotKey(imageData);
    const value = {
      result,
      imageSize: imageData.length,
      timestamp: Date.now()
    };
    
    this.set(key, value, ttl);
  }

  getScreenshotAnalysis(imageData) {
    const key = this.generateScreenshotKey(imageData);
    const cached = this.get(key);
    
    if (cached) {
      this.logger.debug('[LocalCacheSystem] Screenshot analysis cache hit');
      return cached.result;
    }
    
    return null;
  }

  generateScreenshotKey(imageData) {
    const hash = this.simpleHash(imageData.substring(0, 1000)); // Usar apenas início da imagem
    return `screenshot_${hash}`;
  }

  // Métodos de limpeza específicos
  clearAIResponses() {
    let cleared = 0;
    
    for (const [key] of this.cache) {
      if (key.startsWith('ai_')) {
        this.cache.delete(key);
        this.removeFromAccessOrder(key);
        cleared++;
      }
    }
    
    this.logger.info(`[LocalCacheSystem] Cleared ${cleared} AI responses`);
  }

  clearCodeAnalyses() {
    let cleared = 0;
    
    for (const [key] of this.cache) {
      if (key.startsWith('code_')) {
        this.cache.delete(key);
        this.removeFromAccessOrder(key);
        cleared++;
      }
    }
    
    this.logger.info(`[LocalCacheSystem] Cleared ${cleared} code analyses`);
  }

  clearScreenshotAnalyses() {
    let cleared = 0;
    
    for (const [key] of this.cache) {
      if (key.startsWith('screenshot_')) {
        this.cache.delete(key);
        this.removeFromAccessOrder(key);
        cleared++;
      }
    }
    
    this.logger.info(`[LocalCacheSystem] Cleared ${cleared} screenshot analyses`);
  }

  // Método de exportação/importação
  exportCache() {
    const exportData = {
      cache: Array.from(this.cache.entries()),
      accessOrder: this.accessOrder,
      stats: this.stats,
      config: this.config,
      timestamp: Date.now()
    };
    
    return JSON.stringify(exportData);
  }

  importCache(exportData) {
    try {
      const data = JSON.parse(exportData);
      
      this.cache.clear();
      this.accessOrder = [];
      
      for (const [key, value] of data.cache) {
        this.cache.set(key, value);
      }
      
      this.accessOrder = data.accessOrder;
      this.stats = { ...this.stats, ...data.stats };
      this.config = { ...this.config, ...data.config };
      
      this.logger.info('[LocalCacheSystem] Cache imported successfully');
      return true;
    } catch (error) {
      this.logger.error('[LocalCacheSystem] Failed to import cache:', error);
      return false;
    }
  }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.LocalCacheSystem = LocalCacheSystem;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = LocalCacheSystem;
}

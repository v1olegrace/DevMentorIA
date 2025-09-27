/**
 * DevMentor AI - Sistema de Sincronização com Versionamento
 * Implementa versionamento e política de merge para evitar perda de dados
 */

class VersionedSyncSystem {
  constructor() {
    this.logger = (typeof window !== 'undefined' && window.__DEVMENTOR_LOGGER) || {
      debug: (...args) => console.debug(...args),
      info: (...args) => console.info(...args),
      warn: (...args) => console.warn(...args),
      error: (...args) => console.error(...args)
    };
    
    this.clientId = this.generateClientId();
    this.syncQueue = [];
    this.conflictQueue = [];
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;
    
    this.initialize();
  }

  generateClientId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2);
    return `client_${timestamp}_${random}`;
  }

  initialize() {
    this.logger.info('[VersionedSyncSystem] Initialized', { clientId: this.clientId });
  }

  /**
   * Cria registro com metadata de versão
   * @param {object} data - Dados do registro
   * @param {number} version - Versão inicial (opcional)
   * @returns {object} Registro versionado
   */
  createVersionedRecord(data, version = 1) {
    const now = Date.now();
    
    return {
      ...data,
      _meta: {
        version: version,
        lastModifiedTs: now,
        clientId: this.clientId,
        createdAt: data._meta?.createdAt || now,
        updatedAt: now,
        checksum: this.calculateChecksum(data)
      }
    };
  }

  calculateChecksum(data) {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Aplica dados recebidos com resolução de conflitos baseada em versão
   * @param {object} remote - Dados remotos
   * @param {string} key - Chave do registro
   * @returns {object} Resultado da aplicação
   */
  async applyIncoming(remote, key) {
    try {
      if (!remote._meta) {
        this.logger.warn('[VersionedSyncSystem] Remote data missing metadata:', key);
        return { success: false, error: 'Missing metadata' };
      }

      const local = await this.getLocalRecord(key);
      
      // Se não existe localmente, aceitar remoto
      if (!local) {
        await this.saveLocalRecord(key, remote);
        this.logger.debug('[VersionedSyncSystem] Applied new remote record:', key);
        return { success: true, action: 'created' };
      }

      // Verificar se local tem metadata
      if (!local._meta) {
        this.logger.warn('[VersionedSyncSystem] Local data missing metadata:', key);
        local._meta = this.createVersionedRecord({})._meta;
      }

      // Resolver conflito baseado em versão
      if (remote._meta.version > local._meta.version) {
        // Remoto é mais novo, aceitar
        await this.saveLocalRecord(key, remote);
        this.logger.debug('[VersionedSyncSystem] Applied newer remote version:', key);
        return { success: true, action: 'updated', reason: 'newer_version' };
        
      } else if (remote._meta.version === local._meta.version) {
        // Versões iguais, tentar merge
        const mergeResult = await this.mergeRecords(local, remote, key);
        if (mergeResult.success) {
          await this.saveLocalRecord(key, mergeResult.merged);
          this.logger.debug('[VersionedSyncSystem] Merged equal versions:', key);
          return { success: true, action: 'merged', conflicts: mergeResult.conflicts };
        } else {
          // Merge falhou, adicionar à fila de conflitos
          await this.addToConflictQueue(key, local, remote);
          this.logger.warn('[VersionedSyncSystem] Merge failed, added to conflict queue:', key);
          return { success: false, action: 'conflict', error: mergeResult.error };
        }
        
      } else {
        // Remoto é mais antigo, ignorar ou enviar local
        this.logger.debug('[VersionedSyncSystem] Remote version older, ignoring:', key);
        return { success: true, action: 'ignored', reason: 'older_version' };
      }
      
    } catch (error) {
      this.logger.error('[VersionedSyncSystem] Failed to apply incoming data:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Faz merge de dois registros com versões iguais
   * @param {object} local - Registro local
   * @param {object} remote - Registro remoto
   * @param {string} key - Chave do registro
   * @returns {object} Resultado do merge
   */
  async mergeRecords(local, remote, key) {
    try {
      const conflicts = [];
      const merged = { ...local };
      
      // Remover metadata para merge
      delete merged._meta;
      delete remote._meta;
      
      // Merge campo a campo
      for (const [field, remoteValue] of Object.entries(remote)) {
        const localValue = merged[field];
        
        if (localValue === undefined) {
          // Campo não existe localmente, adicionar
          merged[field] = remoteValue;
          
        } else if (localValue === remoteValue) {
          // Valores iguais, manter
          continue;
          
        } else if (this.isSimpleValue(localValue) && this.isSimpleValue(remoteValue)) {
          // Valores simples diferentes, usar estratégia de merge
          const mergeResult = this.mergeSimpleValues(field, localValue, remoteValue);
          if (mergeResult.conflict) {
            conflicts.push({
              field: field,
              local: localValue,
              remote: remoteValue,
              resolution: mergeResult.resolution
            });
          }
          merged[field] = mergeResult.value;
          
        } else if (Array.isArray(localValue) && Array.isArray(remoteValue)) {
          // Arrays, fazer merge inteligente
          merged[field] = this.mergeArrays(localValue, remoteValue);
          
        } else if (typeof localValue === 'object' && typeof remoteValue === 'object') {
          // Objetos, merge recursivo
          merged[field] = this.mergeObjects(localValue, remoteValue);
          
        } else {
          // Tipos incompatíveis, conflito
          conflicts.push({
            field: field,
            local: localValue,
            remote: remoteValue,
            resolution: 'conflict'
          });
        }
      }
      
      // Recriar metadata com versão incrementada
      const versionedMerged = this.createVersionedRecord(merged, local._meta.version + 1);
      
      return {
        success: conflicts.length === 0,
        merged: versionedMerged,
        conflicts: conflicts
      };
      
    } catch (error) {
      this.logger.error('[VersionedSyncSystem] Merge failed:', error);
      return { success: false, error: error.message };
    }
  }

  isSimpleValue(value) {
    return typeof value === 'string' || 
           typeof value === 'number' || 
           typeof value === 'boolean' || 
           value === null || 
           value === undefined;
  }

  mergeSimpleValues(field, localValue, remoteValue) {
    // Estratégias de merge para valores simples
    const strategies = {
      'lastModified': 'newer',
      'updatedAt': 'newer',
      'timestamp': 'newer',
      'count': 'max',
      'total': 'max',
      'version': 'max',
      'description': 'longer',
      'notes': 'longer',
      'status': 'specific',
      'state': 'specific'
    };
    
    const strategy = strategies[field] || 'conflict';
    
    switch (strategy) {
      case 'newer':
        return { value: Math.max(localValue, remoteValue), conflict: false };
      case 'max':
        return { value: Math.max(localValue, remoteValue), conflict: false };
      case 'longer':
        return { 
          value: localValue.length > remoteValue.length ? localValue : remoteValue, 
          conflict: false 
        };
      case 'specific':
        const statusPriority = { 'active': 3, 'pending': 2, 'inactive': 1 };
        const localPriority = statusPriority[localValue] || 0;
        const remotePriority = statusPriority[remoteValue] || 0;
        return { 
          value: localPriority > remotePriority ? localValue : remoteValue, 
          conflict: false 
        };
      default:
        return { 
          value: localValue, 
          conflict: true, 
          resolution: 'manual' 
        };
    }
  }

  mergeArrays(localArray, remoteArray) {
    const merged = [...localArray];
    
    for (const remoteItem of remoteArray) {
      const exists = merged.some(localItem => 
        this.isEqual(localItem, remoteItem)
      );
      
      if (!exists) {
        merged.push(remoteItem);
      }
    }
    
    return merged;
  }

  mergeObjects(localObj, remoteObj) {
    const merged = { ...localObj };
    
    for (const [key, remoteValue] of Object.entries(remoteObj)) {
      const localValue = merged[key];
      
      if (localValue === undefined) {
        merged[key] = remoteValue;
      } else if (typeof localValue === 'object' && typeof remoteValue === 'object') {
        merged[key] = this.mergeObjects(localValue, remoteValue);
      } else if (localValue !== remoteValue) {
        this.logger.warn('[VersionedSyncSystem] Object merge conflict:', key);
      }
    }
    
    return merged;
  }

  isEqual(a, b) {
    if (a === b) return true;
    if (typeof a !== typeof b) return false;
    if (typeof a === 'object' && a !== null && b !== null) {
      return JSON.stringify(a) === JSON.stringify(b);
    }
    return false;
  }

  /**
   * Adiciona registro à fila de conflitos
   * @param {string} key - Chave do registro
   * @param {object} local - Versão local
   * @param {object} remote - Versão remota
   */
  async addToConflictQueue(key, local, remote) {
    const conflict = {
      key: key,
      local: local,
      remote: remote,
      timestamp: Date.now(),
      clientId: this.clientId
    };
    
    this.conflictQueue.push(conflict);
    this.logger.warn('[VersionedSyncSystem] Added to conflict queue:', key);
    
    // Notificar sobre conflito
    this.notifyConflict(conflict);
  }

  /**
   * Notifica sobre conflito detectado
   * @param {object} conflict - Dados do conflito
   */
  notifyConflict(conflict) {
    // Emitir evento customizado
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('syncConflict', {
        detail: conflict
      });
      window.dispatchEvent(event);
    }
    
    this.logger.warn('[VersionedSyncSystem] Conflict notification sent:', conflict.key);
  }

  // Métodos de armazenamento (implementar conforme necessário)
  async getLocalRecord(key) {
    // Implementar recuperação de registro local
    return null;
  }

  async saveLocalRecord(key, record) {
    // Implementar salvamento de registro local
    this.logger.debug('[VersionedSyncSystem] Saved local record:', key);
  }

  /**
   * Obtém estatísticas do sistema
   * @returns {object} Estatísticas
   */
  getStats() {
    return {
      clientId: this.clientId,
      syncQueueLength: this.syncQueue.length,
      conflictQueueLength: this.conflictQueue.length,
      isOnline: this.isOnline,
      syncInProgress: this.syncInProgress
    };
  }
}

// Inicializar sistema global
const versionedSyncSystem = new VersionedSyncSystem();

// Exportar para diferentes contextos
if (typeof window !== 'undefined') {
  window.VersionedSyncSystem = versionedSyncSystem;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = versionedSyncSystem;
}

// Exportar para uso global
window.versionedSyncSystem = versionedSyncSystem;

/**
 * DevMentor AI - Sistema de Sincronização Híbrida Seguro
 * Implementação corrigida com versionamento adequado e resolução de conflitos
 * Baseado nas recomendações de auditoria de segurança
 */

class SecureHybridSyncSystem {
  constructor() {
    this.logger = (typeof __DEVMENTOR_LOGGER !== 'undefined') ? __DEVMENTOR_LOGGER : console;
    this.clientId = this.generateClientId();
    this.syncQueue = [];
    this.conflictQueue = [];
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;
    this.localRecords = new Map();
    this.remoteEndpoint = '/api/sync';
    
    this.initialize();
  }

  generateClientId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2);
    return `client-${timestamp}-${random}`;
  }

  initialize() {
    this.logger.info('[SecureHybridSyncSystem] Initializing secure sync system');
    
    // Detectar mudanças de conectividade
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.logger.info('[SecureHybridSyncSystem] Connection restored, starting sync');
      this.startSync();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.logger.warn('[SecureHybridSyncSystem] Connection lost, switching to offline mode');
    });

    // Iniciar sincronização periódica
    setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.startSync();
      }
    }, 30000); // 30 segundos
  }

  /**
   * Criar registro versionado
   */
  createVersionedRecord(data) {
    return {
      ...data,
      _meta: {
        version: 1,
        clientId: this.clientId,
        createdAt: Date.now(),
        modifiedAt: Date.now(),
        checksum: this.calculateChecksum(data)
      }
    };
  }

  /**
   * Calcular checksum para integridade
   */
  calculateChecksum(data) {
    const str = JSON.stringify(data, Object.keys(data).sort());
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  /**
   * Salvar registro local
   */
  async saveLocalRecord(key, record) {
    try {
      // Validar integridade
      if (record._meta && record._meta.checksum) {
        const expectedChecksum = this.calculateChecksum(record);
        if (expectedChecksum !== record._meta.checksum) {
          throw new Error('Record integrity check failed');
        }
      }

      this.localRecords.set(key, record);
      
      // Salvar no storage
      await chrome.storage.local.set({
        [`sync_record_${key}`]: record
      });

      this.logger.debug('[SecureHybridSyncSystem] Local record saved:', key);
      return true;
    } catch (error) {
      this.logger.error('[SecureHybridSyncSystem] Failed to save local record:', error);
      return false;
    }
  }

  /**
   * Obter registro local
   */
  async getLocalRecord(key) {
    try {
      if (this.localRecords.has(key)) {
        return this.localRecords.get(key);
      }

      const result = await chrome.storage.local.get([`sync_record_${key}`]);
      const record = result[`sync_record_${key}`];
      
      if (record) {
        this.localRecords.set(key, record);
        return record;
      }

      return null;
    } catch (error) {
      this.logger.error('[SecureHybridSyncSystem] Failed to get local record:', error);
      return null;
    }
  }

  /**
   * Aplicar dados remotos com resolução de conflitos
   */
  async applyIncoming(remote, key) {
    try {
      const local = await this.getLocalRecord(key);
      
      if (!local) {
        // Primeira vez, aceitar remoto
        await this.saveLocalRecord(key, remote);
        return { success: true, action: 'created' };
      }

      // Resolver conflito baseado em versão
      if (remote._meta.version > local._meta.version) {
        // Remoto é mais novo, aceitar
        await this.saveLocalRecord(key, remote);
        this.logger.debug('[SecureHybridSyncSystem] Applied newer remote version:', key);
        return { success: true, action: 'updated', reason: 'newer_version' };
        
      } else if (remote._meta.version === local._meta.version) {
        // Versões iguais, tentar merge
        const mergeResult = await this.mergeRecords(local, remote, key);
        if (mergeResult.success) {
          await this.saveLocalRecord(key, mergeResult.merged);
          this.logger.debug('[SecureHybridSyncSystem] Merged equal versions:', key);
          return { success: true, action: 'merged', conflicts: mergeResult.conflicts };
        } else {
          // Merge falhou, adicionar à fila de conflitos
          await this.addToConflictQueue(key, local, remote);
          this.logger.warn('[SecureHybridSyncSystem] Merge failed, added to conflict queue:', key);
          return { success: false, action: 'conflict', error: mergeResult.error };
        }
        
      } else {
        // Remoto é mais antigo, ignorar ou enviar local
        this.logger.debug('[SecureHybridSyncSystem] Remote version older, ignoring:', key);
        return { success: true, action: 'ignored', reason: 'older_version' };
      }
      
    } catch (error) {
      this.logger.error('[SecureHybridSyncSystem] Failed to apply incoming data:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Merge inteligente de registros
   */
  async mergeRecords(local, remote, key) {
    try {
      const conflicts = [];
      const merged = { ...local };
      
      // Merge por campo
      for (const [field, remoteValue] of Object.entries(remote)) {
        if (field === '_meta') continue;
        
        const localValue = local[field];
        
        if (this._isSimpleValue(remoteValue) && this._isSimpleValue(localValue)) {
          // Valores simples, usar estratégia de merge
          if (this._shouldPreferRemote(localValue, remoteValue, field)) {
            merged[field] = remoteValue;
          }
        } else if (typeof remoteValue === 'object' && typeof localValue === 'object') {
          // Objetos, merge recursivo
          const subMerge = await this.mergeRecords(localValue, remoteValue, `${key}.${field}`);
          if (subMerge.success) {
            merged[field] = subMerge.merged;
            conflicts.push(...subMerge.conflicts);
          } else {
            conflicts.push({
              field: `${key}.${field}`,
              local: localValue,
              remote: remoteValue,
              reason: subMerge.error
            });
          }
        } else {
          // Tipos diferentes, conflito
          conflicts.push({
            field: `${key}.${field}`,
            local: localValue,
            remote: remoteValue,
            reason: 'type_mismatch'
          });
        }
      }
      
      // Atualizar metadados
      merged._meta = this.createVersionedRecord(merged)._meta;
      merged._meta.version = Math.max(local._meta.version, remote._meta.version) + 1;
      merged._meta.lastModified = Date.now();
      merged._meta.mergedFrom = [local._meta.clientId, remote._meta.clientId];
      
      return {
        success: conflicts.length === 0,
        merged,
        conflicts
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verificar se é valor simples
   */
  _isSimpleValue(value) {
    return typeof value === 'string' || typeof value === 'number' || 
           typeof value === 'boolean' || value === null || value === undefined;
  }

  /**
   * Decidir se deve preferir valor remoto
   */
  _shouldPreferRemote(localValue, remoteValue, field) {
    // Estratégias específicas por campo
    const strategies = {
      'lastModified': (local, remote) => remote > local,
      'priority': (local, remote) => remote > local,
      'status': (local, remote) => remote === 'active' && local !== 'active'
    };
    
    if (strategies[field]) {
      return strategies[field](localValue, remoteValue);
    }
    
    // Padrão: preferir não-nulo
    return remoteValue !== null && localValue === null;
  }

  /**
   * Adicionar à fila de conflitos
   */
  async addToConflictQueue(key, local, remote) {
    const conflict = {
      key,
      local,
      remote,
      timestamp: Date.now(),
      severity: this._calculateConflictSeverity(local, remote)
    };
    
    this.conflictQueue.push(conflict);
    
    // Salvar fila de conflitos
    await chrome.storage.local.set({
      sync_conflicts: this.conflictQueue
    });
  }

  /**
   * Calcular severidade do conflito
   */
  _calculateConflictSeverity(local, remote) {
    const localFields = Object.keys(local).length;
    const remoteFields = Object.keys(remote).length;
    const fieldDiff = Math.abs(localFields - remoteFields);
    
    if (fieldDiff > 5) return 'high';
    if (fieldDiff > 2) return 'medium';
    return 'low';
  }

  /**
   * Iniciar sincronização
   */
  async startSync() {
    if (this.syncInProgress || !this.isOnline) {
      return;
    }

    this.syncInProgress = true;
    this.logger.info('[SecureHybridSyncSystem] Starting sync process');

    try {
      // Enviar dados locais
      await this.pushLocalChanges();
      
      // Receber dados remotos
      await this.pullRemoteChanges();
      
      // Processar conflitos
      await this.processConflicts();
      
      this.logger.info('[SecureHybridSyncSystem] Sync completed successfully');
      
    } catch (error) {
      this.logger.error('[SecureHybridSyncSystem] Sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Enviar mudanças locais
   */
  async pushLocalChanges() {
    const changes = [];
    
    for (const [key, record] of this.localRecords) {
      if (record._meta.clientId === this.clientId) {
        changes.push({ key, record });
      }
    }
    
    if (changes.length === 0) return;
    
    try {
      const response = await fetch(this.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'push',
          clientId: this.clientId,
          changes
        })
      });
      
      if (!response.ok) {
        throw new Error(`Push failed: ${response.status}`);
      }
      
      this.logger.debug('[SecureHybridSyncSystem] Pushed changes:', changes.length);
      
    } catch (error) {
      this.logger.error('[SecureHybridSyncSystem] Push failed:', error);
      throw error;
    }
  }

  /**
   * Receber mudanças remotas
   */
  async pullRemoteChanges() {
    try {
      const response = await fetch(this.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'pull',
          clientId: this.clientId,
          lastSync: this.getLastSyncTime()
        })
      });
      
      if (!response.ok) {
        throw new Error(`Pull failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      for (const change of data.changes || []) {
        await this.applyIncoming(change.record, change.key);
      }
      
      this.logger.debug('[SecureHybridSyncSystem] Pulled changes:', data.changes?.length || 0);
      
    } catch (error) {
      this.logger.error('[SecureHybridSyncSystem] Pull failed:', error);
      throw error;
    }
  }

  /**
   * Processar conflitos pendentes
   */
  async processConflicts() {
    if (this.conflictQueue.length === 0) return;
    
    this.logger.info('[SecureHybridSyncSystem] Processing conflicts:', this.conflictQueue.length);
    
    // Implementar resolução automática ou notificar usuário
    for (const conflict of this.conflictQueue) {
      await this.resolveConflict(conflict);
    }
    
    this.conflictQueue = [];
    await chrome.storage.local.remove(['sync_conflicts']);
  }

  /**
   * Resolver conflito individual
   */
  async resolveConflict(conflict) {
    // Implementar estratégia de resolução
    // Por enquanto, usar versão mais recente
    const localTime = conflict.local._meta?.modifiedAt || 0;
    const remoteTime = conflict.remote._meta?.modifiedAt || 0;
    
    const winner = remoteTime > localTime ? conflict.remote : conflict.local;
    await this.saveLocalRecord(conflict.key, winner);
    
    this.logger.info('[SecureHybridSyncSystem] Conflict resolved:', conflict.key);
  }

  /**
   * Obter último tempo de sincronização
   */
  getLastSyncTime() {
    return localStorage.getItem('lastSyncTime') || 0;
  }

  /**
   * Definir último tempo de sincronização
   */
  setLastSyncTime(timestamp) {
    localStorage.setItem('lastSyncTime', timestamp.toString());
  }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.SecureHybridSyncSystem = SecureHybridSyncSystem;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SecureHybridSyncSystem;
}



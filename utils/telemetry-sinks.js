/**
 * DEVMENTOR AI - TELEMETRY SINKS
 * Multi-sink architecture for flexible data storage and transmission
 */

/**
 * CIRCULAR BUFFER - MEMORY EFFICIENT
 * Fixed-size buffer with automatic overflow handling
 */
class CircularBuffer {
  constructor(size) {
    this.size = size;
    this.buffer = new Array(size);
    this.head = 0;
    this.tail = 0;
    this.count = 0;
  }

  push(item) {
    this.buffer[this.tail] = item;
    this.tail = (this.tail + 1) % this.size;
    
    if (this.count < this.size) {
      this.count++;
    } else {
      this.head = (this.head + 1) % this.size;
    }
  }

  getAll() {
    const result = [];
    let index = this.head;
    for (let i = 0; i < this.count; i++) {
      result.push(this.buffer[index]);
      index = (index + 1) % this.size;
    }
    return result;
  }

  clear() {
    this.head = 0;
    this.tail = 0;
    this.count = 0;
  }
}

/**
 * CONSOLE SINK - DEVELOPMENT DEBUGGING
 * Pretty-printed console output for development
 */
class ConsoleSink {
  write(data, type = 'log') {
    const colors = {
      DEBUG: 'color: #888',
      INFO: 'color: #2196F3',
      WARN: 'color: #FF9800',
      ERROR: 'color: #F44336',
      CRITICAL: 'color: #9C27B0; font-weight: bold'
    };

    const style = colors[data.level] || colors.INFO;
    
    if (type === 'error') {
      console.error(
        `%c[${data.timestamp}] ${data.error.name}:`,
        style,
        data.error.message,
        data
      );
    } else {
      console.log(
        `%c[${data.timestamp}] ${data.level}:`,
        style,
        data.message,
        data
      );
    }
  }
}

/**
 * LOCAL STORAGE SINK - SIMPLE PERSISTENCE
 * Fallback for environments without IndexedDB
 */
class LocalStorageSink {
  constructor() {
    this.maxEntries = 100;
    this.storageKey = 'devmentor_telemetry';
  }

  write(data, type = 'log') {
    try {
      const stored = this._getStoredData();
      stored.push({
        type,
        timestamp: Date.now(),
        data
      });

      // Maintain size limit
      if (stored.length > this.maxEntries) {
        stored.splice(0, stored.length - this.maxEntries);
      }

      localStorage.setItem(this.storageKey, JSON.stringify(stored));
    } catch (error) {
      console.warn('[LocalStorageSink] Failed to write:', error);
    }
  }

  read() {
    return this._getStoredData();
  }

  clear() {
    localStorage.removeItem(this.storageKey);
  }

  _getStoredData() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.warn('[LocalStorageSink] Failed to read:', error);
      return [];
    }
  }
}

/**
 * INDEXED DB SINK - PRIMARY LOCAL STORAGE
 * Structured, queryable, efficient
 */
class IndexedDBSink {
  constructor() {
    this.dbName = 'DevMentorTelemetry';
    this.version = 1;
    this.db = null;
  }

  async initialize() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Logs store
        if (!db.objectStoreNames.contains('logs')) {
          const logsStore = db.createObjectStore('logs', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          logsStore.createIndex('timestamp', 'timestamp');
          logsStore.createIndex('level', 'level');
          logsStore.createIndex('component', 'context.component');
          logsStore.createIndex('sessionId', 'sessionId');
        }
        
        // Errors store
        if (!db.objectStoreNames.contains('errors')) {
          const errorsStore = db.createObjectStore('errors', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          errorsStore.createIndex('timestamp', 'timestamp');
          errorsStore.createIndex('severity', 'severity');
          errorsStore.createIndex('errorType', 'error.name');
        }
        
        // Metrics store
        if (!db.objectStoreNames.contains('metrics')) {
          const metricsStore = db.createObjectStore('metrics', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          metricsStore.createIndex('timestamp', 'timestamp');
          metricsStore.createIndex('name', 'name');
          metricsStore.createIndex('operation', 'tags.operation');
        }
        
        // Sessions store
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionsStore = db.createObjectStore('sessions', { 
            keyPath: 'sessionId' 
          });
          sessionsStore.createIndex('timestamp', 'timestamp');
        }
      };
    });
  }

  async write(storeName, data) {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async query(storeName, options = {}) {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      
      let request;
      if (options.index && options.value) {
        const index = store.index(options.index);
        request = index.getAll(options.value);
      } else {
        request = store.getAll();
      }
      
      request.onsuccess = () => {
        let results = request.result;
        
        // Apply filters
        if (options.filter) {
          results = results.filter(options.filter);
        }
        
        // Sort by timestamp (newest first)
        results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Apply limit
        if (options.limit) {
          results = results.slice(0, options.limit);
        }
        
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async count(storeName, filter = null) {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      
      if (filter) {
        // For filtered counts, we need to get all and count
        const request = store.getAll();
        request.onsuccess = () => {
          const filtered = request.result.filter(filter);
          resolve(filtered.length);
        };
        request.onerror = () => reject(request.error);
      } else {
        const request = store.count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }
    });
  }

  async delete(storeName, key) {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName) {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * EXPORT FOR DEBUGGING
   * User can download all telemetry data
   */
  async exportAll() {
    const [logs, errors, metrics] = await Promise.all([
      this.query('logs'),
      this.query('errors'),
      this.query('metrics')
    ]);
    
    return {
      exportedAt: new Date().toISOString(),
      version: chrome.runtime.getManifest().version,
      data: {
        logs,
        errors,
        metrics
      },
      summary: {
        totalLogs: logs.length,
        totalErrors: errors.length,
        totalMetrics: metrics.length,
        timeRange: {
          start: logs[0]?.timestamp,
          end: logs[logs.length - 1]?.timestamp
        }
      }
    };
  }

  /**
   * CLEANUP OLD DATA
   * Maintain database size
   */
  async cleanup(retentionMs = 7 * 24 * 60 * 60 * 1000) {
    const cutoff = Date.now() - retentionMs;
    const stores = ['logs', 'errors', 'metrics'];
    
    for (const storeName of stores) {
      try {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const index = store.index('timestamp');
        
        const range = IDBKeyRange.upperBound(new Date(cutoff).toISOString());
        const request = index.openCursor(range);
        
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          }
        };
      } catch (error) {
        console.warn(`[IndexedDBSink] Cleanup failed for ${storeName}:`, error);
      }
    }
  }
}

/**
 * REMOTE TELEMETRY SINK - OPTIONAL
 * User must explicitly opt-in
 */
class RemoteSink {
  constructor(config) {
    this.config = config;
    this.enabled = false; // Disabled by default
    this.batchBuffer = [];
    this.flushTimer = null;
    this.retryQueue = [];
  }

  async enable() {
    // Check user consent
    const consent = await this._getUserConsent();
    if (!consent) {
      console.log('[RemoteSink] User declined telemetry');
      return false;
    }
    
    this.enabled = true;
    this._startBatchFlush();
    
    console.log('[RemoteSink] Remote telemetry enabled with user consent');
    return true;
  }

  disable() {
    this.enabled = false;
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.batchBuffer = [];
    this.retryQueue = [];
    
    console.log('[RemoteSink] Remote telemetry disabled');
  }

  async write(data) {
    if (!this.enabled) return;
    
    // Add to batch
    this.batchBuffer.push({
      ...data,
      uploadedAt: Date.now()
    });
    
    // Flush if batch is full
    if (this.batchBuffer.length >= this.config.batchSize) {
      await this.flush();
    }
  }

  async flush() {
    if (this.batchBuffer.length === 0 && this.retryQueue.length === 0) return;
    
    // Combine batch and retry queue
    const batch = [...this.retryQueue, ...this.batchBuffer];
    this.batchBuffer = [];
    this.retryQueue = [];
    
    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-DevMentor-Version': chrome.runtime.getManifest().version,
          'X-Session-Id': batch[0]?.sessionId, // For server-side deduplication
          'X-Client-Time': Date.now().toString()
        },
        body: JSON.stringify({
          batch,
          metadata: {
            batchSize: batch.length,
            clientTime: Date.now(),
            retryAttempt: batch.some(item => item._retryCount > 0)
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log(`[RemoteSink] Uploaded ${batch.length} events. Server response:`, result);
      
    } catch (error) {
      console.error('[RemoteSink] Upload failed:', error);
      
      // Implement retry logic with exponential backoff
      this._handleRetry(batch, error);
    }
  }

  _handleRetry(batch, error) {
    const retryableBatch = batch
      .map(item => ({
        ...item,
        _retryCount: (item._retryCount || 0) + 1,
        _lastError: error.message,
        _nextRetry: Date.now() + this._calculateBackoffDelay(item._retryCount || 0)
      }))
      .filter(item => item._retryCount <= this.config.retryPolicy.maxRetries);
    
    // Add to retry queue
    this.retryQueue.push(...retryableBatch);
    
    // Limit retry queue size to prevent memory issues
    if (this.retryQueue.length > 500) {
      this.retryQueue = this.retryQueue
        .sort((a, b) => a._nextRetry - b._nextRetry)
        .slice(0, 500);
    }
    
    console.warn(`[RemoteSink] ${retryableBatch.length} items queued for retry`);
  }

  _calculateBackoffDelay(retryCount) {
    const baseDelay = 1000; // 1 second
    const maxDelay = 60000; // 1 minute
    const delay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);
    // Add jitter to prevent thundering herd
    return delay + Math.random() * 1000;
  }

  _startBatchFlush() {
    this.flushTimer = setInterval(async () => {
      // Process retry queue first
      const now = Date.now();
      const readyToRetry = this.retryQueue.filter(item => item._nextRetry <= now);
      
      if (readyToRetry.length > 0) {
        this.retryQueue = this.retryQueue.filter(item => item._nextRetry > now);
        this.batchBuffer.unshift(...readyToRetry);
      }
      
      // Regular flush
      await this.flush();
    }, this.config.flushInterval);
  }

  async _getUserConsent() {
    // Check if consent already given
    const storedConsent = localStorage.getItem('devmentor_telemetry_consent');
    if (storedConsent !== null) {
      return storedConsent === 'true';
    }
    
    // Show consent dialog
    return new Promise((resolve) => {
      const consentDialog = document.createElement('div');
      consentDialog.innerHTML = `
        <div style="
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          max-width: 500px;
          z-index: 10000;
          font-family: system-ui, -apple-system, sans-serif;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        ">
          <h3 style="margin-top: 0;">📊 Ajudar a melhorar o DevMentor AI?</h3>
          <p>O DevMentor AI pode enviar dados anônimos de uso para nos ajudar a melhorar a extensão.</p>
          <p><strong>O que coletamos:</strong></p>
          <ul>
            <li>📈 Métricas de performance (tempos de resposta, uso de memória)</li>
            <li>🐛 Relatórios de erro (tipos de erro, sem código)</li>
            <li>📊 Estatísticas de uso (linguagens usadas, tipos de análise)</li>
          </ul>
          <p><strong>O que NÃO coletamos:</strong></p>
          <ul>
            <li>❌ Seu código ou conteúdo</li>
            <li>❌ Informações pessoais</li>
            <li>❌ URLs completas ou nomes de arquivo</li>
          </ul>
          <p>Você pode alterar essa configuração a qualquer momento nas opções da extensão.</p>
          <div style="text-align: right; margin-top: 20px;">
            <button id="declineTelemetry" style="margin-right: 10px; padding: 8px 16px; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer;">
              Não, obrigado
            </button>
            <button id="acceptTelemetry" style="padding: 8px 16px; border: none; background: #007cba; color: white; border-radius: 4px; cursor: pointer;">
              Sim, ajudar
            </button>
          </div>
        </div>
        <div style="
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          z-index: 9999;
        "></div>
      `;
      
      document.body.appendChild(consentDialog);
      
      const handleResponse = (accepted) => {
        localStorage.setItem('devmentor_telemetry_consent', accepted.toString());
        document.body.removeChild(consentDialog);
        resolve(accepted);
      };
      
      consentDialog.querySelector('#acceptTelemetry').onclick = () => handleResponse(true);
      consentDialog.querySelector('#declineTelemetry').onclick = () => handleResponse(false);
    });
  }

  getStatus() {
    return {
      enabled: this.enabled,
      batchSize: this.batchBuffer.length,
      retryQueueSize: this.retryQueue.length,
      endpoint: this.config.endpoint
    };
  }
}

// Export classes for use by ObservabilityManager
if (typeof window !== 'undefined') {
  window.CircularBuffer = CircularBuffer;
  window.ConsoleSink = ConsoleSink;
  window.LocalStorageSink = LocalStorageSink;
  window.IndexedDBSink = IndexedDBSink;
  window.RemoteSink = RemoteSink;
}








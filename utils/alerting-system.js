/**
 * DEVMENTOR AI - INTELLIGENT ALERTING SYSTEM
 * Proactive problem detection with anomaly detection and smart notifications
 */

class AlertingSystem {
  constructor() {
    this.rules = new Map();
    this.alertHistory = new Map();
    this.notificationChannel = null;
    this.anomalyDetectors = new Map();
    this.metricBaselines = new Map();
    this.isMonitoring = false;
    
    this._initializeDefaultRules();
    this._initializeAnomalyDetectors();
  }

  _initializeDefaultRules() {
    // High error rate alert
    this.addRule('high_error_rate', {
      condition: async (metrics, errors) => {
        const errorRate = this._calculateErrorRate(errors, 300000); // 5min window
        return {
          triggered: errorRate > 0.1, // 10% error rate
          context: { 
            errorRate,
            recentErrors: errors.slice(0, 5).map(e => ({
              type: e.error.name,
              message: e.error.message,
              component: e.context.component
            }))
          }
        };
      },
      severity: 'high',
      cooldown: 600000, // 10 minutes
      action: async (context) => {
        await this.notify({
          title: '⚠️ Taxa de Erro Elevada Detectada',
          message: `Taxa de erro: ${(context.errorRate * 100).toFixed(1)}%`,
          details: context.recentErrors,
          recommendation: 'Verifique o console do navegador e erros recentes no dashboard',
          severity: 'high'
        });
      }
    });

    // Memory leak detection
    this.addRule('memory_leak', {
      condition: async (metrics, errors) => {
        const memoryTrend = this._analyzeMemoryTrend(metrics);
        return {
          triggered: memoryTrend.isIncreasing && memoryTrend.rate > 1024 * 1024, // 1MB/min
          context: { 
            rate: memoryTrend.rate,
            memorySnapshots: memoryTrend.snapshots.slice(-5)
          }
        };
      },
      severity: 'critical',
      cooldown: 1800000, // 30 minutes
      action: async (context) => {
        await this.notify({
          title: '🔴 Possível Vazamento de Memória',
          message: `Memória aumentando em ${this._formatBytes(context.rate)}/min`,
          details: context.memorySnapshots,
          recommendation: 'Considere atualizar a página ou reiniciar o navegador',
          severity: 'critical'
        });
      }
    });

    // Slow response time alert
    this.addRule('slow_response', {
      condition: async (metrics, errors) => {
        const responseTimes = metrics
          .filter(m => m.name === 'response_time' || m.name.includes('duration'))
          .map(m => m.value);
        
        if (responseTimes.length === 0) return { triggered: false };
        
        const p95ResponseTime = this._calculatePercentile(responseTimes, 95);
        const p99ResponseTime = this._calculatePercentile(responseTimes, 99);
        
        return {
          triggered: p95ResponseTime > 5000, // 5 seconds
          context: { 
            p95: p95ResponseTime,
            p99: p99ResponseTime,
            slowRequests: responseTimes.filter(t => t > 3000).length
          }
        };
      },
      severity: 'medium',
      cooldown: 300000, // 5 minutes
      action: async (context) => {
        await this.notify({
          title: '⏱️ Performance Lenta Detectada',
          message: `P95 tempo de resposta: ${context.p95}ms`,
          details: { 
            p99: context.p99,
            slowRequestCount: context.slowRequests
          },
          recommendation: 'Os modelos de IA podem estar sobrecarregados. Tente consultas mais simples.',
          severity: 'medium'
        });
      }
    });

    // API unavailability
    this.addRule('api_unavailable', {
      condition: async (metrics, errors) => {
        const recentApiErrors = errors
          .filter(e => e.error.name === 'AIUnavailableError')
          .filter(e => Date.now() - new Date(e.timestamp).getTime() < 60000);
        
        return {
          triggered: recentApiErrors.length >= 3,
          context: { 
            errors: recentApiErrors.map(e => ({
              timestamp: e.timestamp,
              message: e.error.message,
              component: e.context.component
            }))
          }
        };
      },
      severity: 'critical',
      cooldown: 900000, // 15 minutes
      action: async (context) => {
        await this.notify({
          title: '🚨 APIs de IA do Chrome Indisponíveis',
          message: 'Múltiplas falhas consecutivas ao acessar a IA integrada do Chrome',
          details: context.errors,
          recommendation: 'Verifique as flags do Chrome e reinicie o navegador',
          severity: 'critical'
        });
      }
    });

    // Anomaly detection alert
    this.addRule('metric_anomaly', {
      condition: async (metrics, errors) => {
        const anomalies = [];
        
        for (const [metricName, detector] of this.anomalyDetectors.entries()) {
          const recentValues = metrics
            .filter(m => m.name === metricName)
            .map(m => m.value)
            .slice(-20); // Last 20 values
          
          if (recentValues.length >= 10) {
            const anomaly = detector.detect(recentValues);
            if (anomaly.isAnomaly) {
              anomalies.push({
                metric: metricName,
                ...anomaly
              });
            }
          }
        }
        
        return {
          triggered: anomalies.length > 0,
          context: { anomalies }
        };
      },
      severity: 'medium',
      cooldown: 600000, // 10 minutes
      action: async (context) => {
        const anomalyList = context.anomalies.map(a => 
          `${a.metric}: ${a.description}`
        ).join(', ');
        
        await this.notify({
          title: '📊 Anomalia em Métricas Detectada',
          message: `Padrões incomuns detectados: ${anomalyList}`,
          details: context.anomalies,
          recommendation: 'Monitore o comportamento da extensão por alguns minutos',
          severity: 'medium'
        });
      }
    });

    // Cache efficiency alert
    this.addRule('cache_efficiency', {
      condition: async (metrics, errors) => {
        const cacheMetrics = metrics.filter(m => m.name.includes('cache'));
        const hits = cacheMetrics.filter(m => m.name.includes('hit')).length;
        const total = cacheMetrics.length;
        const hitRate = total > 0 ? hits / total : 1;
        
        return {
          triggered: total > 50 && hitRate < 0.3, // Less than 30% hit rate
          context: { 
            hitRate,
            total,
            hits,
            efficiency: hitRate * 100
          }
        };
      },
      severity: 'low',
      cooldown: 3600000, // 1 hour
      action: async (context) => {
        await this.notify({
          title: '💾 Baixa Eficiência de Cache',
          message: `Taxa de acerto: ${context.efficiency.toFixed(1)}%`,
          details: { totalRequests: context.total, cacheHits: context.hits },
          recommendation: 'O cache pode precisar de otimização ou limpeza',
          severity: 'low'
        });
      }
    });
  }

  _initializeAnomalyDetectors() {
    // Initialize anomaly detectors for key metrics
    const metricsToMonitor = [
      'performance.memory_usage',
      'response_time',
      'performance.long_task',
      'errors.count'
    ];

    metricsToMonitor.forEach(metric => {
      this.anomalyDetectors.set(metric, new AnomalyDetector({
        windowSize: 20,
        sensitivity: 0.8,
        algorithm: 'zscore'
      }));
    });
  }

  /**
   * ADD CUSTOM ALERT RULE
   */
  addRule(ruleId, rule) {
    // Validate rule structure
    if (!rule.condition || typeof rule.condition !== 'function') {
      throw new Error('Rule must have a condition function');
    }
    
    if (!rule.action || typeof rule.action !== 'function') {
      throw new Error('Rule must have an action function');
    }
    
    // Set defaults
    const fullRule = {
      severity: 'medium',
      cooldown: 300000, // 5 minutes default
      enabled: true,
      ...rule
    };
    
    this.rules.set(ruleId, fullRule);
    console.log(`[Alerting] Rule added: ${ruleId}`);
  }

  /**
   * REMOVE ALERT RULE
   */
  removeRule(ruleId) {
    this.rules.delete(ruleId);
    this.alertHistory.delete(ruleId);
    console.log(`[Alerting] Rule removed: ${ruleId}`);
  }

  /**
   * ENABLE/DISABLE RULE
   */
  setRuleEnabled(ruleId, enabled) {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = enabled;
      console.log(`[Alerting] Rule ${ruleId} ${enabled ? 'enabled' : 'disabled'}`);
    }
  }

  /**
   * CONTINUOUS MONITORING
   * Check rules every minute
   */
  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.monitoringInterval = setInterval(async () => {
      await this._checkAllRules();
    }, 60000); // Check every minute
    
    console.log('[Alerting] Monitoring started');
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log('[Alerting] Monitoring stopped');
  }

  async _checkAllRules() {
    if (!window.observabilityManager) return;
    
    try {
      const telemetryDB = new IndexedDBSink();
      await telemetryDB.initialize();
      
      const [metrics, errors] = await Promise.all([
        telemetryDB.query('metrics', { limit: 1000 }),
        telemetryDB.query('errors', { limit: 100 })
      ]);
      
      for (const [ruleId, rule] of this.rules.entries()) {
        if (!rule.enabled) continue;
        
        // Check cooldown
        const lastAlert = this.alertHistory.get(ruleId);
        if (lastAlert && Date.now() - lastAlert.timestamp < rule.cooldown) {
          continue;
        }
        
        // Evaluate condition
        try {
          const result = await rule.condition(metrics, errors);
          
          if (result.triggered) {
            // Execute action
            await rule.action(result.context);
            
            // Record alert
            this.alertHistory.set(ruleId, {
              timestamp: Date.now(),
              context: result.context,
              severity: rule.severity
            });
            
            // Log alert
            if (window.observabilityManager) {
              window.observabilityManager.log(
                window.observabilityManager.config.levels.WARN,
                `Alert triggered: ${ruleId}`,
                { 
                  component: 'alerting', 
                  ruleId, 
                  severity: rule.severity 
                },
                { context: result.context }
              );
            }
          }
        } catch (error) {
          console.error(`[Alerting] Rule ${ruleId} evaluation failed:`, error);
        }
      }
    } catch (error) {
      console.error('[Alerting] Monitoring check failed:', error);
    }
  }

  /**
   * NOTIFICATION SYSTEM
   */
  async notify(alert) {
    console.log(`[Alerting] Sending notification: ${alert.title}`);
    
    // Show browser notification (if permitted)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(alert.title, {
        body: alert.message,
        icon: chrome.runtime.getURL('assets/icons/icon128.svg'),
        tag: 'devmentor-alert',
        requireInteraction: alert.severity === 'critical'
      });
    } else if (Notification.permission === 'default') {
      // Request permission
      await Notification.requestPermission();
    }
    
    // Show in-page notification
    if (window.DevMentorHelpers) {
      const notificationType = this._mapSeverityToNotificationType(alert.severity);
      const duration = alert.severity === 'critical' ? 15000 : 8000;
      
      window.DevMentorHelpers.showNotification(
        `${alert.title}\n${alert.message}`,
        notificationType,
        duration
      );
    }
    
    // Show detailed alert modal for critical alerts
    if (alert.severity === 'critical') {
      this._showAlertModal(alert);
    }
    
    // Log to telemetry
    if (window.observabilityManager) {
      window.observabilityManager.logEvent('alert_sent', {
        title: alert.title,
        severity: alert.severity,
        hasRecommendation: !!alert.recommendation
      });
    }
  }

  _mapSeverityToNotificationType(severity) {
    const mapping = {
      low: 'info',
      medium: 'warning',
      high: 'warning',
      critical: 'error'
    };
    return mapping[severity] || 'info';
  }

  _showAlertModal(alert) {
    const modal = document.createElement('div');
    modal.className = 'devmentor-alert-modal';
    modal.innerHTML = `
      <div class="alert-modal-overlay">
        <div class="alert-modal-content">
          <div class="alert-header ${alert.severity}">
            <h3>${alert.title}</h3>
            <button class="alert-close">×</button>
          </div>
          <div class="alert-body">
            <p class="alert-message">${alert.message}</p>
            ${alert.recommendation ? `
              <div class="alert-recommendation">
                <strong>💡 Recomendação:</strong>
                <p>${alert.recommendation}</p>
              </div>
            ` : ''}
            ${alert.details ? `
              <details class="alert-details">
                <summary>Detalhes Técnicos</summary>
                <pre>${JSON.stringify(alert.details, null, 2)}</pre>
              </details>
            ` : ''}
          </div>
          <div class="alert-actions">
            <button class="alert-action-primary">OK</button>
            <button class="alert-action-secondary">Ver Dashboard</button>
          </div>
        </div>
      </div>
    `;

    // Add styles
    const styles = `
      .devmentor-alert-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 100000;
        font-family: system-ui, -apple-system, sans-serif;
      }
      .alert-modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .alert-modal-content {
        background: white;
        border-radius: 8px;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
      }
      @keyframes slideIn {
        from { transform: scale(0.9); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      .alert-header {
        padding: 20px;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .alert-header.critical {
        background: #ffebee;
        color: #c62828;
      }
      .alert-header.high {
        background: #fff3e0;
        color: #ef6c00;
      }
      .alert-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
      }
      .alert-body {
        padding: 20px;
      }
      .alert-recommendation {
        margin-top: 15px;
        padding: 15px;
        background: #e8f5e8;
        border-radius: 4px;
        border-left: 4px solid #4caf50;
      }
      .alert-details {
        margin-top: 15px;
      }
      .alert-details pre {
        background: #f5f5f5;
        padding: 10px;
        border-radius: 4px;
        font-size: 12px;
        overflow-x: auto;
      }
      .alert-actions {
        padding: 20px;
        border-top: 1px solid #eee;
        display: flex;
        gap: 10px;
        justify-content: flex-end;
      }
      .alert-action-primary, .alert-action-secondary {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      }
      .alert-action-primary {
        background: #007cba;
        color: white;
      }
      .alert-action-secondary {
        background: #f5f5f5;
        color: #333;
      }
    `;

    // Inject styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Add modal to page
    document.body.appendChild(modal);

    // Event handlers
    const closeModal = () => {
      document.body.removeChild(modal);
      document.head.removeChild(styleSheet);
    };

    modal.querySelector('.alert-close').onclick = closeModal;
    modal.querySelector('.alert-action-primary').onclick = closeModal;
    modal.querySelector('.alert-modal-overlay').onclick = (e) => {
      if (e.target === e.currentTarget) closeModal();
    };
    modal.querySelector('.alert-action-secondary').onclick = () => {
      // Open telemetry dashboard
      if (window.TelemetryDashboard) {
        const dashboard = new TelemetryDashboard();
        dashboard.show();
      }
      closeModal();
    };
  }

  /**
   * ANALYTICS METHODS
   */
  _calculateErrorRate(errors, windowMs) {
    const cutoff = Date.now() - windowMs;
    const recentErrors = errors.filter(e => 
      new Date(e.timestamp).getTime() > cutoff
    );
    
    // Estimate total requests (errors + successes)
    // This is a simplified calculation
    const estimatedRequests = Math.max(recentErrors.length * 10, 1);
    return recentErrors.length / estimatedRequests;
  }

  _analyzeMemoryTrend(metrics) {
    const memoryMetrics = metrics
      .filter(m => m.name === 'performance.memory_usage')
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-10); // Last 10 measurements

    if (memoryMetrics.length < 3) {
      return { isIncreasing: false, rate: 0, snapshots: [] };
    }

    // Simple linear regression
    const n = memoryMetrics.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = memoryMetrics.map(m => m.value);
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    
    // Convert slope to bytes per minute
    const timeSpan = memoryMetrics[n-1].timestamp - memoryMetrics[0].timestamp;
    const avgInterval = timeSpan / (n - 1);
    const rate = slope * (60000 / avgInterval); // bytes per minute
    
    return {
      isIncreasing: slope > 0,
      rate: Math.abs(rate),
      snapshots: memoryMetrics.map(m => ({
        timestamp: m.timestamp,
        value: m.value,
        formatted: this._formatBytes(m.value)
      }))
    };
  }

  _calculatePercentile(values, percentile) {
    if (values.length === 0) return 0;
    
    const sorted = values.sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  _formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * ALERT MANAGEMENT
   */
  getAlertHistory(limit = 50) {
    const history = [];
    for (const [ruleId, alert] of this.alertHistory.entries()) {
      history.push({
        ruleId,
        ...alert
      });
    }
    return history
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  clearAlertHistory() {
    this.alertHistory.clear();
    console.log('[Alerting] Alert history cleared');
  }

  getActiveRules() {
    const rules = [];
    for (const [ruleId, rule] of this.rules.entries()) {
      rules.push({
        id: ruleId,
        severity: rule.severity,
        enabled: rule.enabled,
        cooldown: rule.cooldown
      });
    }
    return rules;
  }
}

/**
 * ANOMALY DETECTOR
 * Statistical anomaly detection for time series data
 */
class AnomalyDetector {
  constructor(options = {}) {
    this.windowSize = options.windowSize || 20;
    this.sensitivity = options.sensitivity || 0.8;
    this.algorithm = options.algorithm || 'zscore';
    this.baseline = null;
    this.history = [];
  }

  detect(values) {
    if (values.length < this.windowSize) {
      return { isAnomaly: false, confidence: 0 };
    }

    // Update history
    this.history.push(...values);
    if (this.history.length > this.windowSize * 2) {
      this.history = this.history.slice(-this.windowSize * 2);
    }

    // Calculate baseline if needed
    if (!this.baseline || this.history.length % 10 === 0) {
      this._updateBaseline();
    }

    // Detect anomaly in recent values
    const recentValue = values[values.length - 1];
    
    switch (this.algorithm) {
      case 'zscore':
        return this._zScoreDetection(recentValue);
      case 'iqr':
        return this._iqrDetection(recentValue);
      default:
        return this._zScoreDetection(recentValue);
    }
  }

  _updateBaseline() {
    if (this.history.length < 10) return;

    const baselineData = this.history.slice(0, -5); // Exclude recent values
    this.baseline = {
      mean: this._mean(baselineData),
      std: this._standardDeviation(baselineData),
      median: this._median(baselineData),
      q1: this._percentile(baselineData, 25),
      q3: this._percentile(baselineData, 75)
    };
  }

  _zScoreDetection(value) {
    if (!this.baseline) return { isAnomaly: false, confidence: 0 };

    const zScore = Math.abs((value - this.baseline.mean) / this.baseline.std);
    const threshold = 2 * this.sensitivity; // 2 standard deviations
    
    const isAnomaly = zScore > threshold;
    const confidence = Math.min(zScore / threshold, 1);
    
    return {
      isAnomaly,
      confidence,
      zScore,
      description: `Z-score: ${zScore.toFixed(2)} (threshold: ${threshold.toFixed(2)})`
    };
  }

  _iqrDetection(value) {
    if (!this.baseline) return { isAnomaly: false, confidence: 0 };

    const iqr = this.baseline.q3 - this.baseline.q1;
    const lowerBound = this.baseline.q1 - 1.5 * iqr * this.sensitivity;
    const upperBound = this.baseline.q3 + 1.5 * iqr * this.sensitivity;
    
    const isAnomaly = value < lowerBound || value > upperBound;
    const distance = Math.min(
      Math.abs(value - lowerBound),
      Math.abs(value - upperBound)
    );
    const confidence = Math.min(distance / (iqr * 0.5), 1);
    
    return {
      isAnomaly,
      confidence,
      bounds: { lower: lowerBound, upper: upperBound },
      description: `IQR outlier: ${isAnomaly ? 'outside' : 'inside'} bounds`
    };
  }

  _mean(values) {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  _standardDeviation(values) {
    const mean = this._mean(values);
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  _median(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  _percentile(values, percentile) {
    const sorted = [...values].sort((a, b) => a - b);
    const index = (percentile / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }
}

// Export for use by other modules
if (typeof window !== 'undefined') {
  window.AlertingSystem = AlertingSystem;
  window.AnomalyDetector = AnomalyDetector;
}








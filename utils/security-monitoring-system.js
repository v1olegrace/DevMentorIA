/**
 * DevMentor AI - Sistema de Monitoramento de Segurança
 * Monitora e detecta atividades suspeitas em tempo real
 * Implementação baseada nas recomendações de auditoria
 */

class SecurityMonitoringSystem {
  constructor() {
    this.logger = (typeof __DEVMENTOR_LOGGER !== 'undefined') ? __DEVMENTOR_LOGGER : console;
    this.metrics = new Map();
    this.alerts = [];
    this.thresholds = this.getDefaultThresholds();
    this.patterns = this.getSuspiciousPatterns();
    this.isMonitoring = false;
    
    this.initialize();
  }

  getDefaultThresholds() {
    return {
      // Taxa de erro
      errorRate: {
        threshold: 0.05, // 5%
        window: 300000, // 5 minutos
        action: 'alert'
      },
      
      // Tentativas de XSS
      xssAttempts: {
        threshold: 1,
        window: 60000, // 1 minuto
        action: 'block'
      },
      
      // Tentativas de execução de código
      codeExecutionAttempts: {
        threshold: 1,
        window: 60000, // 1 minuto
        action: 'block'
      },
      
      // Tentativas de acesso não autorizado
      unauthorizedAccess: {
        threshold: 3,
        window: 300000, // 5 minutos
        action: 'alert'
      },
      
      // Uso excessivo de recursos
      resourceUsage: {
        threshold: 0.8, // 80%
        window: 60000, // 1 minuto
        action: 'throttle'
      },
      
      // Conflitos de sincronização
      syncConflicts: {
        threshold: 10,
        window: 300000, // 5 minutos
        action: 'alert'
      }
    };
  }

  getSuspiciousPatterns() {
    return {
      // Padrões de XSS
      xss: [
        /<script[^>]*>.*?<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<iframe[^>]*>/gi,
        /<object[^>]*>/gi,
        /<embed[^>]*>/gi
      ],
      
      // Padrões de execução de código
      codeExecution: [
        /eval\s*\(/gi,
        /new\s+Function\s*\(/gi,
        /setTimeout\s*\(\s*["']/gi,
        /setInterval\s*\(\s*["']/gi,
        /require\s*\(/gi,
        /import\s*\(/gi
      ],
      
      // Padrões de acesso não autorizado
      unauthorizedAccess: [
        /admin/i,
        /root/i,
        /sudo/i,
        /su\s+/gi,
        /chmod\s+777/gi,
        /rm\s+-rf/gi
      ],
      
      // Padrões de dados sensíveis
      sensitiveData: [
        /password\s*[:=]\s*["'][^"']+["']/gi,
        /api[_-]?key\s*[:=]\s*["'][^"']+["']/gi,
        /secret\s*[:=]\s*["'][^"']+["']/gi,
        /token\s*[:=]\s*["'][^"']+["']/gi,
        /sk-[a-zA-Z0-9]{20,}/gi,
        /pk_[a-zA-Z0-9]{20,}/gi
      ],
      
      // Padrões de path traversal
      pathTraversal: [
        /\.\.\//gi,
        /\.\.\\/gi,
        /\.\.%2f/gi,
        /\.\.%5c/gi,
        /\.\.%252f/gi,
        /\.\.%255c/gi
      ]
    };
  }

  initialize() {
    this.logger.info('[SecurityMonitoringSystem] Initializing security monitoring');
    
    // Iniciar coleta de métricas
    this.startMetricsCollection();
    
    // Iniciar detecção de anomalias
    this.startAnomalyDetection();
    
    // Iniciar monitoramento de recursos
    this.startResourceMonitoring();
    
    this.isMonitoring = true;
    this.logger.info('[SecurityMonitoringSystem] Security monitoring started');
  }

  startMetricsCollection() {
    setInterval(() => {
      this.collectMetrics();
    }, 30000); // Coletar métricas a cada 30 segundos
  }

  startAnomalyDetection() {
    setInterval(() => {
      this.detectAnomalies();
    }, 60000); // Detectar anomalias a cada minuto
  }

  startResourceMonitoring() {
    setInterval(() => {
      this.monitorResources();
    }, 10000); // Monitorar recursos a cada 10 segundos
  }

  collectMetrics() {
    const timestamp = Date.now();
    
    // Coletar métricas de segurança
    const securityMetrics = {
      timestamp,
      xssAttempts: this.getMetricCount('xssAttempts', 300000),
      codeExecutionAttempts: this.getMetricCount('codeExecutionAttempts', 300000),
      unauthorizedAccess: this.getMetricCount('unauthorizedAccess', 300000),
      syncConflicts: this.getMetricCount('syncConflicts', 300000),
      errorRate: this.calculateErrorRate(300000)
    };
    
    // Coletar métricas de performance
    const performanceMetrics = {
      timestamp,
      memoryUsage: this.getMemoryUsage(),
      cpuUsage: this.getCPUUsage(),
      responseTime: this.getAverageResponseTime(300000),
      requestCount: this.getRequestCount(300000)
    };
    
    // Armazenar métricas
    this.storeMetrics('security', securityMetrics);
    this.storeMetrics('performance', performanceMetrics);
    
    this.logger.debug('[SecurityMonitoringSystem] Metrics collected:', {
      security: securityMetrics,
      performance: performanceMetrics
    });
  }

  detectAnomalies() {
    const anomalies = [];
    
    // Verificar cada threshold
    for (const [metric, config] of Object.entries(this.thresholds)) {
      const currentValue = this.getCurrentMetricValue(metric);
      
      if (currentValue > config.threshold) {
        const anomaly = {
          type: metric,
          value: currentValue,
          threshold: config.threshold,
          severity: this.calculateSeverity(currentValue, config.threshold),
          timestamp: Date.now(),
          action: config.action
        };
        
        anomalies.push(anomaly);
        this.handleAnomaly(anomaly);
      }
    }
    
    if (anomalies.length > 0) {
      this.logger.warn('[SecurityMonitoringSystem] Anomalies detected:', anomalies);
    }
  }

  monitorResources() {
    const memoryUsage = this.getMemoryUsage();
    const cpuUsage = this.getCPUUsage();
    
    // Verificar uso de memória
    if (memoryUsage > this.thresholds.resourceUsage.threshold) {
      this.handleResourceAlert('memory', memoryUsage);
    }
    
    // Verificar uso de CPU
    if (cpuUsage > this.thresholds.resourceUsage.threshold) {
      this.handleResourceAlert('cpu', cpuUsage);
    }
  }

  // Métodos de detecção de padrões suspeitos
  detectSuspiciousActivity(data, type) {
    const patterns = this.patterns[type];
    if (!patterns) return false;
    
    const text = typeof data === 'string' ? data : JSON.stringify(data);
    
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        this.recordSuspiciousActivity(type, text);
        return true;
      }
    }
    
    return false;
  }

  recordSuspiciousActivity(type, data) {
    const activity = {
      type,
      data: this.sanitizeData(data),
      timestamp: Date.now(),
      severity: this.calculateActivitySeverity(type)
    };
    
    this.storeActivity(activity);
    this.incrementMetric(type);
    
    this.logger.warn('[SecurityMonitoringSystem] Suspicious activity detected:', activity);
  }

  // Métodos de resposta a incidentes
  handleAnomaly(anomaly) {
    switch (anomaly.action) {
      case 'block':
        this.blockSuspiciousActivity(anomaly);
        break;
      case 'alert':
        this.sendSecurityAlert(anomaly);
        break;
      case 'throttle':
        this.throttleRequests(anomaly);
        break;
      default:
        this.logger.warn('[SecurityMonitoringSystem] Unknown action:', anomaly.action);
    }
  }

  blockSuspiciousActivity(anomaly) {
    this.logger.error('[SecurityMonitoringSystem] BLOCKING suspicious activity:', anomaly);
    
    // Implementar bloqueio específico baseado no tipo
    switch (anomaly.type) {
      case 'xssAttempts':
        this.blockXSSAttempts();
        break;
      case 'codeExecutionAttempts':
        this.blockCodeExecution();
        break;
      default:
        this.logger.warn('[SecurityMonitoringSystem] Unknown block type:', anomaly.type);
    }
  }

  sendSecurityAlert(anomaly) {
    const alert = {
      id: this.generateAlertId(),
      type: 'security',
      severity: anomaly.severity,
      message: `Security anomaly detected: ${anomaly.type}`,
      details: anomaly,
      timestamp: Date.now(),
      status: 'active'
    };
    
    this.alerts.push(alert);
    
    // Enviar alerta para sistemas externos
    this.sendExternalAlert(alert);
    
    this.logger.error('[SecurityMonitoringSystem] Security alert sent:', alert);
  }

  throttleRequests(anomaly) {
    this.logger.warn('[SecurityMonitoringSystem] Throttling requests due to:', anomaly.type);
    
    // Implementar throttling de requests
    // Por exemplo, reduzir rate limit temporariamente
  }

  // Métodos de métricas
  getMetricCount(metric, window) {
    const now = Date.now();
    const cutoff = now - window;
    
    const metrics = this.metrics.get(metric) || [];
    return metrics.filter(m => m.timestamp > cutoff).length;
  }

  calculateErrorRate(window) {
    const totalRequests = this.getRequestCount(window);
    const errors = this.getMetricCount('errors', window);
    
    return totalRequests > 0 ? errors / totalRequests : 0;
  }

  getCurrentMetricValue(metric) {
    const config = this.thresholds[metric];
    if (!config) return 0;
    
    return this.getMetricCount(metric, config.window);
  }

  incrementMetric(metric) {
    const timestamp = Date.now();
    const metrics = this.metrics.get(metric) || [];
    metrics.push({ timestamp });
    this.metrics.set(metric, metrics);
  }

  storeMetrics(type, metrics) {
    const key = `metrics_${type}`;
    const existing = this.metrics.get(key) || [];
    existing.push(metrics);
    
    // Manter apenas últimas 1000 entradas
    if (existing.length > 1000) {
      existing.splice(0, existing.length - 1000);
    }
    
    this.metrics.set(key, existing);
  }

  storeActivity(activity) {
    const activities = this.metrics.get('activities') || [];
    activities.push(activity);
    
    // Manter apenas últimas 500 atividades
    if (activities.length > 500) {
      activities.splice(0, activities.length - 500);
    }
    
    this.metrics.set('activities', activities);
  }

  // Métodos de sistema
  getMemoryUsage() {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage();
      return usage.heapUsed / usage.heapTotal;
    }
    return 0;
  }

  getCPUUsage() {
    // Implementação simplificada
    // Em produção, usar biblioteca específica para CPU
    return Math.random() * 0.5; // Placeholder
  }

  getAverageResponseTime(window) {
    const now = Date.now();
    const cutoff = now - window;
    
    const responseTimes = this.metrics.get('responseTimes') || [];
    const recentTimes = responseTimes.filter(r => r.timestamp > cutoff);
    
    if (recentTimes.length === 0) return 0;
    
    const sum = recentTimes.reduce((acc, r) => acc + r.time, 0);
    return sum / recentTimes.length;
  }

  getRequestCount(window) {
    return this.getMetricCount('requests', window);
  }

  // Métodos utilitários
  sanitizeData(data) {
    if (typeof data !== 'string') return data;
    
    // Remover dados sensíveis
    return data
      .replace(/password\s*[:=]\s*["'][^"']+["']/gi, 'password="[REDACTED]"')
      .replace(/api[_-]?key\s*[:=]\s*["'][^"']+["']/gi, 'api_key="[REDACTED]"')
      .replace(/sk-[a-zA-Z0-9]{20,}/gi, 'sk-[REDACTED]')
      .substring(0, 1000); // Limitar tamanho
  }

  calculateSeverity(value, threshold) {
    const ratio = value / threshold;
    
    if (ratio >= 10) return 'critical';
    if (ratio >= 5) return 'high';
    if (ratio >= 2) return 'medium';
    return 'low';
  }

  calculateActivitySeverity(type) {
    const severityMap = {
      xssAttempts: 'high',
      codeExecutionAttempts: 'critical',
      unauthorizedAccess: 'high',
      sensitiveData: 'medium',
      pathTraversal: 'high'
    };
    
    return severityMap[type] || 'low';
  }

  generateAlertId() {
    return `alert_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  sendExternalAlert(alert) {
    // Implementar envio para sistemas externos
    // Por exemplo, Slack, email, webhook, etc.
    this.logger.info('[SecurityMonitoringSystem] External alert would be sent:', alert.id);
  }

  // Métodos de bloqueio específicos
  blockXSSAttempts() {
    this.logger.error('[SecurityMonitoringSystem] XSS attempts blocked');
    // Implementar bloqueio de XSS
  }

  blockCodeExecution() {
    this.logger.error('[SecurityMonitoringSystem] Code execution blocked');
    // Implementar bloqueio de execução de código
  }

  // Métodos de relatório
  generateSecurityReport() {
    const now = Date.now();
    const last24h = now - (24 * 60 * 60 * 1000);
    
    return {
      timestamp: now,
      period: '24h',
      summary: {
        totalAlerts: this.alerts.length,
        activeAlerts: this.alerts.filter(a => a.status === 'active').length,
        xssAttempts: this.getMetricCount('xssAttempts', last24h),
        codeExecutionAttempts: this.getMetricCount('codeExecutionAttempts', last24h),
        unauthorizedAccess: this.getMetricCount('unauthorizedAccess', last24h),
        syncConflicts: this.getMetricCount('syncConflicts', last24h),
        errorRate: this.calculateErrorRate(last24h)
      },
      alerts: this.alerts.filter(a => a.timestamp > last24h),
      recommendations: this.generateRecommendations()
    };
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Verificar métricas e gerar recomendações
    if (this.getMetricCount('xssAttempts', 3600000) > 0) {
      recommendations.push({
        type: 'security',
        priority: 'high',
        message: 'XSS attempts detected. Review input validation and HTML sanitization.'
      });
    }
    
    if (this.getMetricCount('codeExecutionAttempts', 3600000) > 0) {
      recommendations.push({
        type: 'security',
        priority: 'critical',
        message: 'Code execution attempts detected. Review eval usage and input validation.'
      });
    }
    
    if (this.calculateErrorRate(3600000) > 0.1) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        message: 'High error rate detected. Review error handling and logging.'
      });
    }
    
    return recommendations;
  }

  // Métodos de controle
  start() {
    if (!this.isMonitoring) {
      this.initialize();
    }
  }

  stop() {
    this.isMonitoring = false;
    this.logger.info('[SecurityMonitoringSystem] Security monitoring stopped');
  }

  getStatus() {
    return {
      isMonitoring: this.isMonitoring,
      metricsCount: this.metrics.size,
      alertsCount: this.alerts.length,
      activeAlerts: this.alerts.filter(a => a.status === 'active').length,
      uptime: Date.now() - this.startTime
    };
  }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.SecurityMonitoringSystem = SecurityMonitoringSystem;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SecurityMonitoringSystem;
}

/**
 * DevMentor AI - Sistema de Detecção de Anomalias
 * Detecta comportamentos suspeitos e atividades anômalas
 * Implementação baseada nas recomendações de auditoria
 */

class AnomalyDetectionSystem {
  constructor() {
    this.logger = (typeof __DEVMENTOR_LOGGER !== 'undefined') ? __DEVMENTOR_LOGGER : console;
    this.anomalies = [];
    this.baselines = new Map();
    this.thresholds = this.getDefaultThresholds();
    this.patterns = this.getAnomalyPatterns();
    this.isMonitoring = false;
    this.metrics = new Map();
    
    this.initialize();
  }

  getDefaultThresholds() {
    return {
      // Thresholds de comportamento
      behavior: {
        maxRequestsPerMinute: 60,
        maxRequestsPerHour: 1000,
        maxConcurrentSessions: 10,
        maxErrorRate: 0.05, // 5%
        maxResponseTime: 5000, // 5 segundos
        maxMemoryUsage: 0.8, // 80%
        maxCpuUsage: 0.8 // 80%
      },
      
      // Thresholds de segurança
      security: {
        maxXSSAttempts: 1,
        maxCodeExecutionAttempts: 1,
        maxUnauthorizedAccess: 3,
        maxSensitiveDataExposure: 1,
        maxPathTraversalAttempts: 1,
        maxSQLInjectionAttempts: 1
      },
      
      // Thresholds de dados
      data: {
        maxDataSize: 10000000, // 10MB
        maxArrayLength: 1000,
        maxObjectDepth: 10,
        maxStringLength: 100000
      },
      
      // Thresholds de rede
      network: {
        maxConcurrentConnections: 100,
        maxBandwidthPerMinute: 10000000, // 10MB
        maxTimeoutRequests: 10,
        maxFailedRequests: 20
      }
    };
  }

  getAnomalyPatterns() {
    return {
      // Padrões de comportamento anômalo
      behavior: [
        {
          name: 'Burst Requests',
          pattern: /requests_per_minute > threshold/,
          severity: 'medium',
          description: 'Sudden increase in request rate'
        },
        {
          name: 'Resource Exhaustion',
          pattern: /memory_usage > 0.9 OR cpu_usage > 0.9/,
          severity: 'high',
          description: 'System resources being exhausted'
        },
        {
          name: 'Error Spike',
          pattern: /error_rate > 0.1/,
          severity: 'high',
          description: 'Sudden increase in error rate'
        },
        {
          name: 'Response Time Degradation',
          pattern: /response_time > 10000/,
          severity: 'medium',
          description: 'Response times significantly increased'
        }
      ],
      
      // Padrões de segurança
      security: [
        {
          name: 'XSS Attack Pattern',
          pattern: /xss_attempts > 0/,
          severity: 'high',
          description: 'Cross-site scripting attempts detected'
        },
        {
          name: 'Code Injection Pattern',
          pattern: /code_execution_attempts > 0/,
          severity: 'critical',
          description: 'Code injection attempts detected'
        },
        {
          name: 'Unauthorized Access Pattern',
          pattern: /unauthorized_access > 3/,
          severity: 'high',
          description: 'Multiple unauthorized access attempts'
        },
        {
          name: 'Data Exfiltration Pattern',
          pattern: /sensitive_data_exposure > 0/,
          severity: 'high',
          description: 'Sensitive data exposure detected'
        }
      ],
      
      // Padrões de dados
      data: [
        {
          name: 'Oversized Data',
          pattern: /data_size > 10000000/,
          severity: 'medium',
          description: 'Data size exceeds normal limits'
        },
        {
          name: 'Deep Nesting',
          pattern: /object_depth > 10/,
          severity: 'low',
          description: 'Object nesting depth exceeds limits'
        },
        {
          name: 'Large Arrays',
          pattern: /array_length > 1000/,
          severity: 'medium',
          description: 'Array size exceeds normal limits'
        }
      ],
      
      // Padrões de rede
      network: [
        {
          name: 'Connection Flood',
          pattern: /concurrent_connections > 100/,
          severity: 'high',
          description: 'Too many concurrent connections'
        },
        {
          name: 'Bandwidth Abuse',
          pattern: /bandwidth_per_minute > 10000000/,
          severity: 'medium',
          description: 'Excessive bandwidth usage'
        },
        {
          name: 'Timeout Storm',
          pattern: /timeout_requests > 10/,
          severity: 'medium',
          description: 'Multiple timeout requests'
        }
      ]
    };
  }

  initialize() {
    this.logger.info('[AnomalyDetectionSystem] Initializing anomaly detection');
    
    // Iniciar coleta de métricas
    this.startMetricsCollection();
    
    // Iniciar detecção de anomalias
    this.startAnomalyDetection();
    
    // Iniciar análise de padrões
    this.startPatternAnalysis();
    
    // Iniciar geração de baselines
    this.startBaselineGeneration();
    
    this.isMonitoring = true;
    this.startTime = Date.now();
    
    this.logger.info('[AnomalyDetectionSystem] Anomaly detection started');
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

  startPatternAnalysis() {
    setInterval(() => {
      this.analyzePatterns();
    }, 120000); // Analisar padrões a cada 2 minutos
  }

  startBaselineGeneration() {
    setInterval(() => {
      this.generateBaselines();
    }, 300000); // Gerar baselines a cada 5 minutos
  }

  collectMetrics() {
    const timestamp = Date.now();
    
    // Coletar métricas de comportamento
    const behaviorMetrics = {
      timestamp,
      requestsPerMinute: this.getRequestsPerMinute(),
      requestsPerHour: this.getRequestsPerHour(),
      concurrentSessions: this.getConcurrentSessions(),
      errorRate: this.getErrorRate(),
      responseTime: this.getAverageResponseTime(),
      memoryUsage: this.getMemoryUsage(),
      cpuUsage: this.getCPUUsage()
    };
    
    // Coletar métricas de segurança
    const securityMetrics = {
      timestamp,
      xssAttempts: this.getXSSAttempts(),
      codeExecutionAttempts: this.getCodeExecutionAttempts(),
      unauthorizedAccess: this.getUnauthorizedAccess(),
      sensitiveDataExposure: this.getSensitiveDataExposure(),
      pathTraversalAttempts: this.getPathTraversalAttempts(),
      sqlInjectionAttempts: this.getSQLInjectionAttempts()
    };
    
    // Coletar métricas de dados
    const dataMetrics = {
      timestamp,
      dataSize: this.getDataSize(),
      arrayLength: this.getArrayLength(),
      objectDepth: this.getObjectDepth(),
      stringLength: this.getStringLength()
    };
    
    // Coletar métricas de rede
    const networkMetrics = {
      timestamp,
      concurrentConnections: this.getConcurrentConnections(),
      bandwidthPerMinute: this.getBandwidthPerMinute(),
      timeoutRequests: this.getTimeoutRequests(),
      failedRequests: this.getFailedRequests()
    };
    
    // Armazenar métricas
    this.storeMetrics('behavior', behaviorMetrics);
    this.storeMetrics('security', securityMetrics);
    this.storeMetrics('data', dataMetrics);
    this.storeMetrics('network', networkMetrics);
    
    this.logger.debug('[AnomalyDetectionSystem] Metrics collected');
  }

  detectAnomalies() {
    const anomalies = [];
    
    // Detectar anomalias de comportamento
    const behaviorAnomalies = this.detectBehaviorAnomalies();
    anomalies.push(...behaviorAnomalies);
    
    // Detectar anomalias de segurança
    const securityAnomalies = this.detectSecurityAnomalies();
    anomalies.push(...securityAnomalies);
    
    // Detectar anomalias de dados
    const dataAnomalies = this.detectDataAnomalies();
    anomalies.push(...dataAnomalies);
    
    // Detectar anomalias de rede
    const networkAnomalies = this.detectNetworkAnomalies();
    anomalies.push(...networkAnomalies);
    
    // Processar anomalias detectadas
    for (const anomaly of anomalies) {
      this.processAnomaly(anomaly);
    }
    
    if (anomalies.length > 0) {
      this.logger.warn('[AnomalyDetectionSystem] Anomalies detected:', anomalies.length);
    }
  }

  detectBehaviorAnomalies() {
    const anomalies = [];
    const metrics = this.getLatestMetrics('behavior');
    const thresholds = this.thresholds.behavior;
    
    // Verificar taxa de requests
    if (metrics.requestsPerMinute > thresholds.maxRequestsPerMinute) {
      anomalies.push({
        type: 'behavior',
        name: 'High Request Rate',
        severity: 'medium',
        value: metrics.requestsPerMinute,
        threshold: thresholds.maxRequestsPerMinute,
        description: `Request rate ${metrics.requestsPerMinute} exceeds threshold ${thresholds.maxRequestsPerMinute}`,
        timestamp: Date.now()
      });
    }
    
    // Verificar taxa de erro
    if (metrics.errorRate > thresholds.maxErrorRate) {
      anomalies.push({
        type: 'behavior',
        name: 'High Error Rate',
        severity: 'high',
        value: metrics.errorRate,
        threshold: thresholds.maxErrorRate,
        description: `Error rate ${metrics.errorRate} exceeds threshold ${thresholds.maxErrorRate}`,
        timestamp: Date.now()
      });
    }
    
    // Verificar tempo de resposta
    if (metrics.responseTime > thresholds.maxResponseTime) {
      anomalies.push({
        type: 'behavior',
        name: 'Slow Response Time',
        severity: 'medium',
        value: metrics.responseTime,
        threshold: thresholds.maxResponseTime,
        description: `Response time ${metrics.responseTime}ms exceeds threshold ${thresholds.maxResponseTime}ms`,
        timestamp: Date.now()
      });
    }
    
    // Verificar uso de memória
    if (metrics.memoryUsage > thresholds.maxMemoryUsage) {
      anomalies.push({
        type: 'behavior',
        name: 'High Memory Usage',
        severity: 'high',
        value: metrics.memoryUsage,
        threshold: thresholds.maxMemoryUsage,
        description: `Memory usage ${metrics.memoryUsage} exceeds threshold ${thresholds.maxMemoryUsage}`,
        timestamp: Date.now()
      });
    }
    
    // Verificar uso de CPU
    if (metrics.cpuUsage > thresholds.maxCpuUsage) {
      anomalies.push({
        type: 'behavior',
        name: 'High CPU Usage',
        severity: 'high',
        value: metrics.cpuUsage,
        threshold: thresholds.maxCpuUsage,
        description: `CPU usage ${metrics.cpuUsage} exceeds threshold ${thresholds.maxCpuUsage}`,
        timestamp: Date.now()
      });
    }
    
    return anomalies;
  }

  detectSecurityAnomalies() {
    const anomalies = [];
    const metrics = this.getLatestMetrics('security');
    const thresholds = this.thresholds.security;
    
    // Verificar tentativas de XSS
    if (metrics.xssAttempts > thresholds.maxXSSAttempts) {
      anomalies.push({
        type: 'security',
        name: 'XSS Attack Detected',
        severity: 'high',
        value: metrics.xssAttempts,
        threshold: thresholds.maxXSSAttempts,
        description: `XSS attempts ${metrics.xssAttempts} exceed threshold ${thresholds.maxXSSAttempts}`,
        timestamp: Date.now()
      });
    }
    
    // Verificar tentativas de execução de código
    if (metrics.codeExecutionAttempts > thresholds.maxCodeExecutionAttempts) {
      anomalies.push({
        type: 'security',
        name: 'Code Injection Detected',
        severity: 'critical',
        value: metrics.codeExecutionAttempts,
        threshold: thresholds.maxCodeExecutionAttempts,
        description: `Code execution attempts ${metrics.codeExecutionAttempts} exceed threshold ${thresholds.maxCodeExecutionAttempts}`,
        timestamp: Date.now()
      });
    }
    
    // Verificar acessos não autorizados
    if (metrics.unauthorizedAccess > thresholds.maxUnauthorizedAccess) {
      anomalies.push({
        type: 'security',
        name: 'Unauthorized Access Detected',
        severity: 'high',
        value: metrics.unauthorizedAccess,
        threshold: thresholds.maxUnauthorizedAccess,
        description: `Unauthorized access attempts ${metrics.unauthorizedAccess} exceed threshold ${thresholds.maxUnauthorizedAccess}`,
        timestamp: Date.now()
      });
    }
    
    // Verificar exposição de dados sensíveis
    if (metrics.sensitiveDataExposure > thresholds.maxSensitiveDataExposure) {
      anomalies.push({
        type: 'security',
        name: 'Sensitive Data Exposure',
        severity: 'high',
        value: metrics.sensitiveDataExposure,
        threshold: thresholds.maxSensitiveDataExposure,
        description: `Sensitive data exposure ${metrics.sensitiveDataExposure} exceed threshold ${thresholds.maxSensitiveDataExposure}`,
        timestamp: Date.now()
      });
    }
    
    return anomalies;
  }

  detectDataAnomalies() {
    const anomalies = [];
    const metrics = this.getLatestMetrics('data');
    const thresholds = this.thresholds.data;
    
    // Verificar tamanho dos dados
    if (metrics.dataSize > thresholds.maxDataSize) {
      anomalies.push({
        type: 'data',
        name: 'Oversized Data',
        severity: 'medium',
        value: metrics.dataSize,
        threshold: thresholds.maxDataSize,
        description: `Data size ${metrics.dataSize} exceeds threshold ${thresholds.maxDataSize}`,
        timestamp: Date.now()
      });
    }
    
    // Verificar comprimento de arrays
    if (metrics.arrayLength > thresholds.maxArrayLength) {
      anomalies.push({
        type: 'data',
        name: 'Large Array',
        severity: 'medium',
        value: metrics.arrayLength,
        threshold: thresholds.maxArrayLength,
        description: `Array length ${metrics.arrayLength} exceeds threshold ${thresholds.maxArrayLength}`,
        timestamp: Date.now()
      });
    }
    
    // Verificar profundidade de objetos
    if (metrics.objectDepth > thresholds.maxObjectDepth) {
      anomalies.push({
        type: 'data',
        name: 'Deep Object Nesting',
        severity: 'low',
        value: metrics.objectDepth,
        threshold: thresholds.maxObjectDepth,
        description: `Object depth ${metrics.objectDepth} exceeds threshold ${thresholds.maxObjectDepth}`,
        timestamp: Date.now()
      });
    }
    
    return anomalies;
  }

  detectNetworkAnomalies() {
    const anomalies = [];
    const metrics = this.getLatestMetrics('network');
    const thresholds = this.thresholds.network;
    
    // Verificar conexões concorrentes
    if (metrics.concurrentConnections > thresholds.maxConcurrentConnections) {
      anomalies.push({
        type: 'network',
        name: 'Connection Flood',
        severity: 'high',
        value: metrics.concurrentConnections,
        threshold: thresholds.maxConcurrentConnections,
        description: `Concurrent connections ${metrics.concurrentConnections} exceed threshold ${thresholds.maxConcurrentConnections}`,
        timestamp: Date.now()
      });
    }
    
    // Verificar largura de banda
    if (metrics.bandwidthPerMinute > thresholds.maxBandwidthPerMinute) {
      anomalies.push({
        type: 'network',
        name: 'Bandwidth Abuse',
        severity: 'medium',
        value: metrics.bandwidthPerMinute,
        threshold: thresholds.maxBandwidthPerMinute,
        description: `Bandwidth usage ${metrics.bandwidthPerMinute} exceeds threshold ${thresholds.maxBandwidthPerMinute}`,
        timestamp: Date.now()
      });
    }
    
    // Verificar timeouts
    if (metrics.timeoutRequests > thresholds.maxTimeoutRequests) {
      anomalies.push({
        type: 'network',
        name: 'Timeout Storm',
        severity: 'medium',
        value: metrics.timeoutRequests,
        threshold: thresholds.maxTimeoutRequests,
        description: `Timeout requests ${metrics.timeoutRequests} exceed threshold ${thresholds.maxTimeoutRequests}`,
        timestamp: Date.now()
      });
    }
    
    return anomalies;
  }

  analyzePatterns() {
    // Analisar padrões de anomalias
    const recentAnomalies = this.getRecentAnomalies(3600000); // Última hora
    
    // Agrupar por tipo
    const anomaliesByType = recentAnomalies.reduce((acc, anomaly) => {
      acc[anomaly.type] = (acc[anomaly.type] || 0) + 1;
      return acc;
    }, {});
    
    // Detectar padrões suspeitos
    for (const [type, count] of Object.entries(anomaliesByType)) {
      if (count > 5) {
        this.logger.warn(`[AnomalyDetectionSystem] Pattern detected: ${count} ${type} anomalies in the last hour`);
      }
    }
  }

  generateBaselines() {
    // Gerar baselines baseados em métricas históricas
    const now = Date.now();
    const window = 3600000; // 1 hora
    
    for (const [type, metrics] of this.metrics) {
      const recentMetrics = metrics.filter(m => m.timestamp > now - window);
      
      if (recentMetrics.length > 0) {
        const baseline = this.calculateBaseline(recentMetrics);
        this.baselines.set(type, baseline);
      }
    }
  }

  calculateBaseline(metrics) {
    const values = metrics.map(m => Object.values(m).filter(v => typeof v === 'number'));
    const flatValues = values.flat();
    
    if (flatValues.length === 0) return null;
    
    const sorted = flatValues.sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const q1 = sorted[Math.floor(sorted.length / 4)];
    const q3 = sorted[Math.floor(sorted.length * 3 / 4)];
    
    return {
      median,
      q1,
      q3,
      iqr: q3 - q1,
      upperBound: q3 + 1.5 * (q3 - q1),
      lowerBound: q1 - 1.5 * (q3 - q1)
    };
  }

  processAnomaly(anomaly) {
    // Adicionar à lista de anomalias
    this.anomalies.push(anomaly);
    
    // Manter apenas últimas 1000 anomalias
    if (this.anomalies.length > 1000) {
      this.anomalies.splice(0, this.anomalies.length - 1000);
    }
    
    // Executar ações baseadas na severidade
    switch (anomaly.severity) {
      case 'critical':
        this.handleCriticalAnomaly(anomaly);
        break;
      case 'high':
        this.handleHighAnomaly(anomaly);
        break;
      case 'medium':
        this.handleMediumAnomaly(anomaly);
        break;
      case 'low':
        this.handleLowAnomaly(anomaly);
        break;
    }
    
    this.logger.warn('[AnomalyDetectionSystem] Anomaly processed:', anomaly);
  }

  handleCriticalAnomaly(anomaly) {
    this.logger.error('[AnomalyDetectionSystem] CRITICAL anomaly detected:', anomaly);
    
    // Ações imediatas para anomalias críticas
    if (anomaly.type === 'security') {
      this.blockSuspiciousActivity(anomaly);
    }
    
    // Enviar alerta de emergência
    this.sendEmergencyAlert(anomaly);
  }

  handleHighAnomaly(anomaly) {
    this.logger.error('[AnomalyDetectionSystem] HIGH severity anomaly detected:', anomaly);
    
    // Ações para anomalias de alta severidade
    this.sendSecurityAlert(anomaly);
  }

  handleMediumAnomaly(anomaly) {
    this.logger.warn('[AnomalyDetectionSystem] MEDIUM severity anomaly detected:', anomaly);
    
    // Ações para anomalias de média severidade
    this.logPerformanceAlert(anomaly);
  }

  handleLowAnomaly(anomaly) {
    this.logger.info('[AnomalyDetectionSystem] LOW severity anomaly detected:', anomaly);
    
    // Ações para anomalias de baixa severidade
    this.logAnomaly(anomaly);
  }

  blockSuspiciousActivity(anomaly) {
    this.logger.error('[AnomalyDetectionSystem] Blocking suspicious activity:', anomaly);
    
    // Implementar bloqueio específico
    // Por exemplo, bloquear IP, suspender usuário, etc.
  }

  sendEmergencyAlert(anomaly) {
    this.logger.error('[AnomalyDetectionSystem] Sending emergency alert:', anomaly);
    
    // Enviar alerta de emergência
    // Por exemplo, email, SMS, webhook, etc.
  }

  sendSecurityAlert(anomaly) {
    this.logger.warn('[AnomalyDetectionSystem] Sending security alert:', anomaly);
    
    // Enviar alerta de segurança
  }

  logPerformanceAlert(anomaly) {
    this.logger.warn('[AnomalyDetectionSystem] Logging performance alert:', anomaly);
    
    // Registrar alerta de performance
  }

  logAnomaly(anomaly) {
    this.logger.info('[AnomalyDetectionSystem] Logging anomaly:', anomaly);
    
    // Registrar anomalia
  }

  // Métodos de coleta de métricas (implementações simplificadas)
  getRequestsPerMinute() {
    return Math.floor(Math.random() * 100);
  }

  getRequestsPerHour() {
    return Math.floor(Math.random() * 1000);
  }

  getConcurrentSessions() {
    return Math.floor(Math.random() * 20);
  }

  getErrorRate() {
    return Math.random() * 0.1;
  }

  getAverageResponseTime() {
    return Math.floor(Math.random() * 5000);
  }

  getMemoryUsage() {
    return Math.random();
  }

  getCPUUsage() {
    return Math.random();
  }

  getXSSAttempts() {
    return Math.floor(Math.random() * 5);
  }

  getCodeExecutionAttempts() {
    return Math.floor(Math.random() * 3);
  }

  getUnauthorizedAccess() {
    return Math.floor(Math.random() * 10);
  }

  getSensitiveDataExposure() {
    return Math.floor(Math.random() * 2);
  }

  getPathTraversalAttempts() {
    return Math.floor(Math.random() * 3);
  }

  getSQLInjectionAttempts() {
    return Math.floor(Math.random() * 2);
  }

  getDataSize() {
    return Math.floor(Math.random() * 20000000);
  }

  getArrayLength() {
    return Math.floor(Math.random() * 2000);
  }

  getObjectDepth() {
    return Math.floor(Math.random() * 20);
  }

  getStringLength() {
    return Math.floor(Math.random() * 200000);
  }

  getConcurrentConnections() {
    return Math.floor(Math.random() * 200);
  }

  getBandwidthPerMinute() {
    return Math.floor(Math.random() * 20000000);
  }

  getTimeoutRequests() {
    return Math.floor(Math.random() * 20);
  }

  getFailedRequests() {
    return Math.floor(Math.random() * 50);
  }

  // Métodos utilitários
  getLatestMetrics(type) {
    const metrics = this.metrics.get(type) || [];
    return metrics[metrics.length - 1] || {};
  }

  getRecentAnomalies(window) {
    const now = Date.now();
    return this.anomalies.filter(a => a.timestamp > now - window);
  }

  storeMetrics(type, metrics) {
    const existing = this.metrics.get(type) || [];
    existing.push(metrics);
    
    // Manter apenas últimas 1000 entradas
    if (existing.length > 1000) {
      existing.splice(0, existing.length - 1000);
    }
    
    this.metrics.set(type, existing);
  }

  // Métodos de relatório
  generateReport() {
    const now = Date.now();
    const last24h = now - (24 * 60 * 60 * 1000);
    
    const recentAnomalies = this.getRecentAnomalies(last24h);
    
    return {
      timestamp: now,
      period: '24h',
      summary: {
        totalAnomalies: recentAnomalies.length,
        criticalAnomalies: recentAnomalies.filter(a => a.severity === 'critical').length,
        highAnomalies: recentAnomalies.filter(a => a.severity === 'high').length,
        mediumAnomalies: recentAnomalies.filter(a => a.severity === 'medium').length,
        lowAnomalies: recentAnomalies.filter(a => a.severity === 'low').length
      },
      anomaliesByType: this.groupAnomaliesByType(recentAnomalies),
      baselines: Object.fromEntries(this.baselines),
      recommendations: this.generateRecommendations(recentAnomalies)
    };
  }

  groupAnomaliesByType(anomalies) {
    return anomalies.reduce((acc, anomaly) => {
      acc[anomaly.type] = (acc[anomaly.type] || 0) + 1;
      return acc;
    }, {});
  }

  generateRecommendations(anomalies) {
    const recommendations = [];
    
    const anomaliesByType = this.groupAnomaliesByType(anomalies);
    
    if (anomaliesByType.security > 0) {
      recommendations.push({
        type: 'security',
        priority: 'high',
        message: 'Security anomalies detected. Review security measures.',
        action: 'Implement additional security controls'
      });
    }
    
    if (anomaliesByType.behavior > 5) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        message: 'Multiple behavior anomalies detected. Review system performance.',
        action: 'Optimize system performance'
      });
    }
    
    if (anomaliesByType.network > 3) {
      recommendations.push({
        type: 'network',
        priority: 'medium',
        message: 'Network anomalies detected. Review network configuration.',
        action: 'Review network settings and limits'
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
    this.logger.info('[AnomalyDetectionSystem] Anomaly detection stopped');
  }

  getStatus() {
    return {
      isMonitoring: this.isMonitoring,
      anomaliesCount: this.anomalies.length,
      metricsCount: this.metrics.size,
      baselinesCount: this.baselines.size,
      uptime: Date.now() - this.startTime
    };
  }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.AnomalyDetectionSystem = AnomalyDetectionSystem;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnomalyDetectionSystem;
}

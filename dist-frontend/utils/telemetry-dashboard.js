/**
 * DEVMENTOR AI - TELEMETRY DASHBOARD
 * Real-time observability dashboard with charts, metrics, and debugging tools
 */

class TelemetryDashboard {
  constructor() {
    this.charts = new Map();
    this.updateInterval = null;
    this.isOpen = false;
    this.refreshRate = 5000; // 5 seconds
    this.chartData = {
      performance: [],
      errors: [],
      metrics: [],
      memory: []
    };
  }

  /**
   * SHOW DASHBOARD
   * Create and display the real-time dashboard
   */
  async show() {
    if (this.isOpen) return;
    
    this.isOpen = true;
    const dashboard = this._createDashboardElement();
    document.body.appendChild(dashboard);
    
    // Initialize charts
    await this._initializeCharts();
    
    // Load initial data
    await this._loadDashboardData();
    
    // Start real-time updates
    this._startRealTimeUpdates();
    
    // Setup event handlers
    this._setupDashboardEvents(dashboard);
    
    console.log('[TelemetryDashboard] Dashboard opened');
  }

  /**
   * HIDE DASHBOARD
   */
  hide() {
    const dashboard = document.getElementById('devmentor-telemetry-dashboard');
    if (dashboard) {
      document.body.removeChild(dashboard);
    }
    
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    this.isOpen = false;
    console.log('[TelemetryDashboard] Dashboard closed');
  }

  /**
   * CREATE DASHBOARD HTML STRUCTURE
   */
  _createDashboardElement() {
    const dashboard = document.createElement('div');
    dashboard.id = 'devmentor-telemetry-dashboard';
    dashboard.innerHTML = `
      <div class="dashboard-overlay">
        <div class="dashboard-container">
          <header class="dashboard-header">
            <div class="dashboard-title">
              <h1>🔍 DevMentor AI - Observabilidade</h1>
              <div class="dashboard-status">
                <span class="status-indicator active"></span>
                <span>Monitoramento Ativo</span>
              </div>
            </div>
            <div class="dashboard-actions">
              <button id="refreshDashboard" title="Atualizar">🔄</button>
              <button id="exportTelemetry" title="Exportar Dados">📥</button>
              <button id="clearTelemetry" title="Limpar Dados">🗑️</button>
              <button id="siemExport" title="Exportar SIEM">📊</button>
              <button id="closeDashboard" title="Fechar">✕</button>
            </div>
          </header>

          <div class="dashboard-stats">
            <div class="stat-card">
              <div class="stat-icon">📊</div>
              <div class="stat-content">
                <div class="stat-value" id="totalEvents">0</div>
                <div class="stat-label">Total de Eventos</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🐛</div>
              <div class="stat-content">
                <div class="stat-value" id="errorCount">0</div>
                <div class="stat-label">Erros</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">⚡</div>
              <div class="stat-content">
                <div class="stat-value" id="avgResponseTime">0ms</div>
                <div class="stat-label">Tempo Médio</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">💾</div>
              <div class="stat-content">
                <div class="stat-value" id="cacheHitRate">0%</div>
                <div class="stat-label">Taxa de Cache</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🧠</div>
              <div class="stat-content">
                <div class="stat-value" id="memoryUsage">0MB</div>
                <div class="stat-label">Uso de Memória</div>
              </div>
            </div>
          </div>

          <div class="dashboard-tabs">
            <button class="tab-button active" data-tab="overview">Visão Geral</button>
            <button class="tab-button" data-tab="performance">Performance</button>
            <button class="tab-button" data-tab="errors">Erros</button>
            <button class="tab-button" data-tab="logs">Logs</button>
            <button class="tab-button" data-tab="alerts">Alertas</button>
            <button class="tab-button" data-tab="settings">Configurações</button>
          </div>

          <div class="dashboard-content">
            <div class="tab-panel active" id="overview-panel">
              <div class="charts-grid">
                <div class="chart-container">
                  <h3>Performance ao Longo do Tempo</h3>
                  <canvas id="performanceChart" width="400" height="200"></canvas>
                </div>
                <div class="chart-container">
                  <h3>Distribuição de Erros</h3>
                  <canvas id="errorChart" width="400" height="200"></canvas>
                </div>
                <div class="chart-container">
                  <h3>Uso de Memória</h3>
                  <canvas id="memoryChart" width="400" height="200"></canvas>
                </div>
                <div class="chart-container">
                  <h3>Métricas de Sistema</h3>
                  <canvas id="systemChart" width="400" height="200"></canvas>
                </div>
              </div>
            </div>

            <div class="tab-panel" id="performance-panel">
              <div class="performance-metrics">
                <div class="metric-group">
                  <h3>Tempos de Resposta</h3>
                  <div class="metric-row">
                    <span class="metric-label">P50:</span>
                    <span class="metric-value" id="p50ResponseTime">-</span>
                  </div>
                  <div class="metric-row">
                    <span class="metric-label">P95:</span>
                    <span class="metric-value" id="p95ResponseTime">-</span>
                  </div>
                  <div class="metric-row">
                    <span class="metric-label">P99:</span>
                    <span class="metric-value" id="p99ResponseTime">-</span>
                  </div>
                </div>
                <div class="metric-group">
                  <h3>Memória</h3>
                  <div class="metric-row">
                    <span class="metric-label">Heap Usado:</span>
                    <span class="metric-value" id="heapUsed">-</span>
                  </div>
                  <div class="metric-row">
                    <span class="metric-label">Heap Total:</span>
                    <span class="metric-value" id="heapTotal">-</span>
                  </div>
                  <div class="metric-row">
                    <span class="metric-label">Limite:</span>
                    <span class="metric-value" id="heapLimit">-</span>
                  </div>
                </div>
              </div>
              <div class="performance-chart">
                <canvas id="detailedPerformanceChart" width="800" height="300"></canvas>
              </div>
            </div>

            <div class="tab-panel" id="errors-panel">
              <div class="error-summary">
                <div class="error-stats">
                  <div class="error-stat">
                    <span class="error-count" id="criticalErrors">0</span>
                    <span class="error-label">Críticos</span>
                  </div>
                  <div class="error-stat">
                    <span class="error-count" id="highErrors">0</span>
                    <span class="error-label">Altos</span>
                  </div>
                  <div class="error-stat">
                    <span class="error-count" id="mediumErrors">0</span>
                    <span class="error-label">Médios</span>
                  </div>
                </div>
              </div>
              <div class="error-list" id="errorList">
                <!-- Populated dynamically -->
              </div>
            </div>

            <div class="tab-panel" id="logs-panel">
              <div class="log-controls">
                <div class="log-filters">
                  <select id="logLevelFilter">
                    <option value="all">Todos os Níveis</option>
                    <option value="CRITICAL">Crítico</option>
                    <option value="ERROR">Erro</option>
                    <option value="WARN">Aviso</option>
                    <option value="INFO">Info</option>
                    <option value="DEBUG">Debug</option>
                  </select>
                  <input type="search" id="logSearch" placeholder="Buscar logs..." />
                  <button id="clearLogFilter">Limpar</button>
                </div>
                <div class="log-actions">
                  <button id="pauseLogs">⏸️ Pausar</button>
                  <button id="exportLogs">📄 Exportar</button>
                </div>
              </div>
              <div class="log-list" id="logList">
                <!-- Populated dynamically -->
              </div>
            </div>

            <div class="tab-panel" id="alerts-panel">
              <div class="alert-controls">
                <div class="alert-summary">
                  <span id="activeAlerts">0</span> alertas ativos
                </div>
                <button id="clearAlerts">Limpar Histórico</button>
              </div>
              <div class="alert-list" id="alertList">
                <!-- Populated dynamically -->
              </div>
            </div>

            <div class="tab-panel" id="settings-panel">
              <div class="settings-grid">
                <div class="setting-group">
                  <h3>Telemetria Remota</h3>
                  <label class="toggle-switch">
                    <input type="checkbox" id="remoteTelemetryToggle">
                    <span class="slider"></span>
                    Enviar dados anônimos
                  </label>
                  <p class="setting-description">
                    Ajuda a melhorar o DevMentor AI enviando métricas anônimas de uso.
                    Nenhum código ou dados pessoais são enviados.
                  </p>
                </div>
                <div class="setting-group">
                  <h3>Taxa de Atualização</h3>
                  <select id="refreshRateSelect">
                    <option value="1000">1 segundo</option>
                    <option value="5000" selected>5 segundos</option>
                    <option value="10000">10 segundos</option>
                    <option value="30000">30 segundos</option>
                  </select>
                </div>
                <div class="setting-group">
                  <h3>Retenção de Dados</h3>
                  <select id="retentionSelect">
                    <option value="86400000">1 dia</option>
                    <option value="604800000" selected>7 dias</option>
                    <option value="2592000000">30 dias</option>
                  </select>
                </div>
                <div class="setting-group">
                  <h3>Exportação</h3>
                  <div class="export-buttons">
                    <button id="exportJSON">Exportar JSON</button>
                    <button id="exportCSV">Exportar CSV</button>
                    <button id="exportSiem">Exportar SIEM</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Inject styles
    this._injectDashboardStyles();
    
    return dashboard;
  }

  /**
   * INJECT DASHBOARD STYLES
   */
  _injectDashboardStyles() {
    const styles = `
      #devmentor-telemetry-dashboard {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 999999;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
      }

      .dashboard-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }

      .dashboard-container {
        background: white;
        border-radius: 12px;
        width: 95vw;
        height: 90vh;
        max-width: 1400px;
        display: flex;
        flex-direction: column;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        overflow: hidden;
      }

      .dashboard-header {
        padding: 20px;
        border-bottom: 1px solid #e0e0e0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      .dashboard-title {
        display: flex;
        align-items: center;
        gap: 15px;
      }

      .dashboard-title h1 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }

      .dashboard-status {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        opacity: 0.9;
      }

      .status-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #4caf50;
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
      }

      .dashboard-actions {
        display: flex;
        gap: 10px;
      }

      .dashboard-actions button {
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        transition: background 0.2s;
      }

      .dashboard-actions button:hover {
        background: rgba(255,255,255,0.3);
      }

      .dashboard-stats {
        display: flex;
        gap: 15px;
        padding: 20px;
        background: #f8f9fa;
        border-bottom: 1px solid #e0e0e0;
        overflow-x: auto;
      }

      .stat-card {
        background: white;
        border-radius: 8px;
        padding: 15px;
        min-width: 140px;
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        border: 1px solid #e0e0e0;
      }

      .stat-icon {
        font-size: 20px;
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .stat-content {
        flex: 1;
      }

      .stat-value {
        font-size: 18px;
        font-weight: 600;
        color: #333;
        margin-bottom: 2px;
      }

      .stat-label {
        font-size: 11px;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .dashboard-tabs {
        display: flex;
        background: #f8f9fa;
        border-bottom: 1px solid #e0e0e0;
        overflow-x: auto;
      }

      .tab-button {
        background: none;
        border: none;
        padding: 12px 20px;
        cursor: pointer;
        color: #666;
        font-size: 13px;
        font-weight: 500;
        white-space: nowrap;
        transition: all 0.2s;
        border-bottom: 3px solid transparent;
      }

      .tab-button:hover {
        background: rgba(102, 126, 234, 0.1);
        color: #333;
      }

      .tab-button.active {
        color: #667eea;
        border-bottom-color: #667eea;
        background: white;
      }

      .dashboard-content {
        flex: 1;
        overflow-y: auto;
      }

      .tab-panel {
        display: none;
        padding: 20px;
        height: 100%;
      }

      .tab-panel.active {
        display: block;
      }

      .charts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 20px;
        height: 100%;
      }

      .chart-container {
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 15px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      }

      .chart-container h3 {
        margin: 0 0 15px 0;
        font-size: 14px;
        color: #333;
        font-weight: 600;
      }

      .log-controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 8px;
      }

      .log-filters {
        display: flex;
        gap: 10px;
        align-items: center;
      }

      .log-filters select,
      .log-filters input {
        padding: 6px 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 13px;
      }

      .log-list {
        background: #f8f9fa;
        border-radius: 8px;
        max-height: 400px;
        overflow-y: auto;
        padding: 10px;
      }

      .log-entry {
        display: grid;
        grid-template-columns: 80px 60px 100px 1fr auto;
        gap: 10px;
        padding: 8px 10px;
        background: white;
        border-radius: 4px;
        margin-bottom: 2px;
        font-size: 12px;
        align-items: center;
        border-left: 3px solid transparent;
      }

      .log-entry.log-error {
        border-left-color: #f44336;
      }

      .log-entry.log-warn {
        border-left-color: #ff9800;
      }

      .log-entry.log-info {
        border-left-color: #2196f3;
      }

      .log-entry.log-debug {
        border-left-color: #9e9e9e;
      }

      .log-time {
        color: #666;
        font-family: monospace;
      }

      .log-level {
        font-weight: 600;
        font-size: 10px;
        text-transform: uppercase;
      }

      .log-component {
        background: #e3f2fd;
        color: #1976d2;
        padding: 2px 6px;
        border-radius: 10px;
        font-size: 10px;
      }

      .log-message {
        color: #333;
      }

      .settings-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
      }

      .setting-group {
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 20px;
      }

      .setting-group h3 {
        margin: 0 0 15px 0;
        font-size: 16px;
        color: #333;
      }

      .toggle-switch {
        position: relative;
        display: inline-block;
        width: 50px;
        height: 24px;
      }

      .toggle-switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }

      .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: 0.3s;
        border-radius: 24px;
      }

      .slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: 0.3s;
        border-radius: 50%;
      }

      input:checked + .slider {
        background-color: #667eea;
      }

      input:checked + .slider:before {
        transform: translateX(26px);
      }

      .export-buttons {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }

      .export-buttons button {
        padding: 8px 16px;
        border: 1px solid #ddd;
        background: white;
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;
        transition: all 0.2s;
      }

      .export-buttons button:hover {
        background: #f0f0f0;
        border-color: #667eea;
      }

      /* Responsive design */
      @media (max-width: 768px) {
        .dashboard-container {
          width: 100vw;
          height: 100vh;
          border-radius: 0;
        }

        .dashboard-stats {
          flex-direction: column;
          gap: 10px;
        }

        .charts-grid {
          grid-template-columns: 1fr;
        }

        .log-entry {
          grid-template-columns: 1fr;
          text-align: left;
        }
      }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  /**
   * LOAD DASHBOARD DATA
   */
  async _loadDashboardData() {
    try {
      const telemetryDB = new IndexedDBSink();
      await telemetryDB.initialize();
      
      // Get all data
      const [logs, errors, metrics] = await Promise.all([
        telemetryDB.query('logs', { limit: 100 }),
        telemetryDB.query('errors'),
        telemetryDB.query('metrics')
      ]);
      
      // Update stats
      this._updateStats(logs, errors, metrics);
      
      // Update charts
      this._updateCharts(logs, errors, metrics);
      
      // Render logs
      this._renderLogs(logs.slice(0, 50));
      
      // Render errors
      this._renderErrors(errors.slice(0, 20));
      
      // Update performance metrics
      this._updatePerformanceMetrics(metrics);
      
    } catch (error) {
      console.error('[TelemetryDashboard] Failed to load data:', error);
    }
  }

  /**
   * UPDATE STATISTICS
   */
  _updateStats(logs, errors, metrics) {
    const totalEvents = logs.length + errors.length + metrics.length;
    document.getElementById('totalEvents').textContent = totalEvents.toLocaleString();
    document.getElementById('errorCount').textContent = errors.length.toLocaleString();
    
    // Calculate average response time
    const responseTimes = metrics
      .filter(m => m.name.includes('response_time') || m.name.includes('duration'))
      .map(m => m.value);
    const avgResponseTime = responseTimes.length > 0 
      ? Math.round(responseTimes.reduce((a, b) => a + b) / responseTimes.length)
      : 0;
    document.getElementById('avgResponseTime').textContent = `${avgResponseTime}ms`;
    
    // Calculate cache hit rate
    const cacheMetrics = metrics.filter(m => m.name.includes('cache'));
    const cacheHits = cacheMetrics.filter(m => m.name.includes('hit')).length;
    const cacheTotal = cacheMetrics.length;
    const cacheHitRate = cacheTotal > 0 
      ? Math.round((cacheHits / cacheTotal) * 100)
      : 0;
    document.getElementById('cacheHitRate').textContent = `${cacheHitRate}%`;
    
    // Memory usage
    const memoryMetrics = metrics.filter(m => m.name === 'performance.memory_usage');
    const latestMemory = memoryMetrics.length > 0 
      ? memoryMetrics[memoryMetrics.length - 1].value
      : 0;
    document.getElementById('memoryUsage').textContent = this._formatBytes(latestMemory);
  }

  /**
   * RENDER LOGS
   */
  _renderLogs(logs) {
    const logList = document.getElementById('logList');
    if (!logList) return;
    
    logList.innerHTML = logs.map(log => `
      <div class="log-entry log-${log.level.toLowerCase()}">
        <div class="log-time">${new Date(log.timestamp).toLocaleTimeString()}</div>
        <div class="log-level">${log.level}</div>
        <div class="log-component">${log.context?.component || 'unknown'}</div>
        <div class="log-message">${this._escapeHtml(log.message)}</div>
        ${log.error ? `<div class="log-error">${this._escapeHtml(log.error.message)}</div>` : '<div></div>'}
      </div>
    `).join('');
  }

  /**
   * RENDER ERRORS
   */
  _renderErrors(errors) {
    const errorList = document.getElementById('errorList');
    if (!errorList) return;
    
    // Count errors by severity
    const severityCounts = { critical: 0, high: 0, medium: 0, low: 0 };
    errors.forEach(error => {
      const severity = this._mapSeverityLevel(error.severity);
      severityCounts[severity]++;
    });
    
    // Update error stats
    document.getElementById('criticalErrors').textContent = severityCounts.critical;
    document.getElementById('highErrors').textContent = severityCounts.high;
    document.getElementById('mediumErrors').textContent = severityCounts.medium;
    
    errorList.innerHTML = errors.map(error => `
      <div class="error-item severity-${this._mapSeverityLevel(error.severity)}">
        <div class="error-header">
          <span class="error-type">${error.error.name}</span>
          <span class="error-time">${new Date(error.timestamp).toLocaleString()}</span>
        </div>
        <div class="error-message">${this._escapeHtml(error.error.message)}</div>
        <div class="error-context">
          <span class="error-component">${error.context?.component || 'unknown'}</span>
          ${error.context?.operation ? `<span class="error-operation">${error.context.operation}</span>` : ''}
        </div>
      </div>
    `).join('');
  }

  /**
   * UPDATE PERFORMANCE METRICS
   */
  _updatePerformanceMetrics(metrics) {
    const responseTimes = metrics
      .filter(m => m.name.includes('response_time') || m.name.includes('duration'))
      .map(m => m.value)
      .sort((a, b) => a - b);
    
    if (responseTimes.length > 0) {
      const p50 = this._calculatePercentile(responseTimes, 50);
      const p95 = this._calculatePercentile(responseTimes, 95);
      const p99 = this._calculatePercentile(responseTimes, 99);
      
      document.getElementById('p50ResponseTime').textContent = `${p50}ms`;
      document.getElementById('p95ResponseTime').textContent = `${p95}ms`;
      document.getElementById('p99ResponseTime').textContent = `${p99}ms`;
    }
    
    // Memory metrics
    if (performance.memory) {
      document.getElementById('heapUsed').textContent = this._formatBytes(performance.memory.usedJSHeapSize);
      document.getElementById('heapTotal').textContent = this._formatBytes(performance.memory.totalJSHeapSize);
      document.getElementById('heapLimit').textContent = this._formatBytes(performance.memory.jsHeapSizeLimit);
    }
  }

  /**
   * INITIALIZE CHARTS
   */
  async _initializeCharts() {
    // Note: In a real implementation, you would use a charting library like Chart.js
    // For this demo, we'll create simple placeholder visualizations
    this._createSimpleChart('performanceChart', 'line');
    this._createSimpleChart('errorChart', 'bar');
    this._createSimpleChart('memoryChart', 'line');
    this._createSimpleChart('systemChart', 'doughnut');
  }

  _createSimpleChart(canvasId, type) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw simple placeholder chart
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);
    
    ctx.fillStyle = '#667eea';
    ctx.font = '16px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`${type.toUpperCase()} CHART`, width / 2, height / 2);
    ctx.fillText('(Placeholder)', width / 2, height / 2 + 20);
  }

  /**
   * UPDATE CHARTS
   */
  _updateCharts(logs, errors, metrics) {
    // In a real implementation, this would update actual charts
    // For now, we'll just log that charts would be updated
    console.log('[TelemetryDashboard] Charts updated with new data');
  }

  /**
   * SETUP EVENT HANDLERS
   */
  _setupDashboardEvents(dashboard) {
    // Close button
    dashboard.querySelector('#closeDashboard').onclick = () => this.hide();
    
    // Tab navigation
    dashboard.querySelectorAll('.tab-button').forEach(button => {
      button.onclick = () => this._switchTab(button.dataset.tab);
    });
    
    // Export buttons
    dashboard.querySelector('#exportTelemetry').onclick = () => this._exportTelemetry();
    dashboard.querySelector('#clearTelemetry').onclick = () => this._clearTelemetry();
    dashboard.querySelector('#refreshDashboard').onclick = () => this._loadDashboardData();
    dashboard.querySelector('#siemExport').onclick = () => this._showSiemExportDialog();
    
    // Settings
    const remoteTelemetryToggle = dashboard.querySelector('#remoteTelemetryToggle');
    if (remoteTelemetryToggle) {
      const currentSetting = localStorage.getItem('devmentor_telemetry_consent') === 'true';
      remoteTelemetryToggle.checked = currentSetting;
      
      remoteTelemetryToggle.onchange = () => {
        localStorage.setItem('devmentor_telemetry_consent', remoteTelemetryToggle.checked.toString());
        if (window.observabilityManager) {
          window.observabilityManager.config.storage.remote.enabled = remoteTelemetryToggle.checked;
        }
      };
    }
    
    // Refresh rate
    const refreshRateSelect = dashboard.querySelector('#refreshRateSelect');
    if (refreshRateSelect) {
      refreshRateSelect.value = this.refreshRate.toString();
      refreshRateSelect.onchange = () => {
        this.refreshRate = parseInt(refreshRateSelect.value);
        this._restartRealTimeUpdates();
      };
    }
    
    // Log filtering
    const logLevelFilter = dashboard.querySelector('#logLevelFilter');
    const logSearch = dashboard.querySelector('#logSearch');
    
    if (logLevelFilter) {
      logLevelFilter.onchange = () => this._filterLogs();
    }
    if (logSearch) {
      logSearch.oninput = () => this._filterLogs();
    }
  }

  /**
   * SWITCH TABS
   */
  _switchTab(tabName) {
    // Hide all panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-button').forEach(button => {
      button.classList.remove('active');
    });
    
    // Show selected panel and activate button
    document.getElementById(`${tabName}-panel`).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  }

  /**
   * EXPORT TELEMETRY
   */
  async _exportTelemetry() {
    try {
      const telemetryDB = new IndexedDBSink();
      const data = await telemetryDB.exportAll();
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `devmentor-telemetry-${Date.now()}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
      
      window.DevMentorHelpers?.showNotification('Dados exportados com sucesso!', 'success');
    } catch (error) {
      console.error('[TelemetryDashboard] Export failed:', error);
      window.DevMentorHelpers?.showNotification('Falha ao exportar dados', 'error');
    }
  }

  /**
   * CLEAR TELEMETRY
   */
  async _clearTelemetry() {
    if (!confirm('Tem certeza que deseja limpar todos os dados de telemetria?')) {
      return;
    }
    
    try {
      const telemetryDB = new IndexedDBSink();
      await telemetryDB.initialize();
      await Promise.all([
        telemetryDB.clear('logs'),
        telemetryDB.clear('errors'),
        telemetryDB.clear('metrics')
      ]);
      
      // Reload dashboard
      await this._loadDashboardData();
      
      window.DevMentorHelpers?.showNotification('Dados limpos com sucesso!', 'success');
    } catch (error) {
      console.error('[TelemetryDashboard] Clear failed:', error);
      window.DevMentorHelpers?.showNotification('Falha ao limpar dados', 'error');
    }
  }

  /**
   * START REAL-TIME UPDATES
   */
  _startRealTimeUpdates() {
    if (this.updateInterval) return;
    
    this.updateInterval = setInterval(() => {
      if (this.isOpen) {
        this._loadDashboardData();
      }
    }, this.refreshRate);
  }

  _restartRealTimeUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this._startRealTimeUpdates();
  }

  /**
   * UTILITY METHODS
   */
  _formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  _calculatePercentile(values, percentile) {
    if (values.length === 0) return 0;
    const index = Math.ceil((percentile / 100) * values.length) - 1;
    return values[Math.max(0, index)];
  }

  _mapSeverityLevel(severity) {
    if (severity >= 4) return 'critical';
    if (severity >= 3) return 'high';
    if (severity >= 2) return 'medium';
    return 'low';
  }

  _escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  async _showSiemExportDialog() {
    const formats = ['splunk', 'elk', 'datadog', 'newrelic', 'generic_json'];
    const selectedFormat = prompt(`Selecione o formato SIEM:\n${formats.join(', ')}`);
    
    if (selectedFormat && formats.includes(selectedFormat)) {
      try {
        if (window.SIEMIntegration) {
          const siem = new SIEMIntegration();
          await siem.exportToFile(selectedFormat);
          window.DevMentorHelpers?.showNotification(`Dados exportados em formato ${selectedFormat}!`, 'success');
        }
      } catch (error) {
        console.error('[TelemetryDashboard] SIEM export failed:', error);
        window.DevMentorHelpers?.showNotification('Falha ao exportar para SIEM', 'error');
      }
    }
  }

  _filterLogs() {
    // Implementation for log filtering would go here
    console.log('[TelemetryDashboard] Log filtering triggered');
  }
}

// Export for global use
if (typeof window !== 'undefined') {
  window.TelemetryDashboard = TelemetryDashboard;
}



















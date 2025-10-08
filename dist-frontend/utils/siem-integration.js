/**
 * DEVMENTOR AI - SIEM INTEGRATION
 * Enterprise-grade integration with major SIEM platforms
 * Support for Splunk, ELK Stack, Datadog, New Relic, and custom endpoints
 */

class SIEMIntegration {
  constructor() {
    this.supportedFormats = [
      'splunk',      // Splunk HTTP Event Collector
      'elk',         // Elasticsearch/Logstash/Kibana
      'datadog',     // Datadog Logs API
      'newrelic',    // New Relic Logs API
      'cloudwatch',  // AWS CloudWatch Logs
      'sumologic',   // Sumo Logic
      'generic_json' // Generic JSON format
    ];

    this.formatters = {
      splunk: new SplunkFormatter(),
      elk: new ELKFormatter(),
      datadog: new DatadogFormatter(),
      newrelic: new NewRelicFormatter(),
      cloudwatch: new CloudWatchFormatter(),
      sumologic: new SumoLogicFormatter(),
      generic_json: new GenericJSONFormatter()
    };

    this.streamingConnections = new Map();
  }

  /**
   * EXPORT IN SIEM-COMPATIBLE FORMAT
   * Common Event Format (CEF) or JSON
   */
  async exportForSIEM(format, timeRange = {}, options = {}) {
    const telemetryDB = new IndexedDBSink();
    await telemetryDB.initialize();
    
    // Query data with time range filter
    const [logs, errors, metrics] = await Promise.all([
      telemetryDB.query('logs', {
        filter: (log) => this._isInTimeRange(log, timeRange),
        limit: options.limit || 10000
      }),
      telemetryDB.query('errors', {
        filter: (error) => this._isInTimeRange(error, timeRange),
        limit: options.limit || 5000
      }),
      telemetryDB.query('metrics', {
        filter: (metric) => this._isInTimeRange(metric, timeRange),
        limit: options.limit || 20000
      })
    ]);
    
    // Get formatter for specified format
    const formatter = this.formatters[format];
    if (!formatter) {
      throw new Error(`Unsupported SIEM format: ${format}`);
    }
    
    // Format data
    const formattedData = formatter.format(logs, errors, metrics, options);
    
    // Add export metadata
    const exportMetadata = {
      exportedAt: new Date().toISOString(),
      format,
      timeRange,
      recordCounts: {
        logs: logs.length,
        errors: errors.length,
        metrics: metrics.length,
        total: logs.length + errors.length + metrics.length
      },
      devmentorVersion: chrome.runtime.getManifest().version,
      exportOptions: options
    };
    
    return {
      metadata: exportMetadata,
      data: formattedData
    };
  }

  /**
   * REAL-TIME STREAMING TO SIEM
   * For enterprise deployments
   */
  async startSIEMStreaming(siemConfig) {
    const connectionId = `${siemConfig.format}_${Date.now()}`;
    
    // Validate configuration
    this._validateSIEMConfig(siemConfig);
    
    // Create streaming connection
    const connection = new SIEMStreamingConnection(siemConfig, this.formatters[siemConfig.format]);
    await connection.initialize();
    
    this.streamingConnections.set(connectionId, connection);
    
    // Subscribe to observability events
    if (window.observabilityManager) {
      const manager = window.observabilityManager;
      
      connection.subscriptions = [
        manager.on('log', (logEntry) => connection.send(logEntry, 'log')),
        manager.on('error', (errorEntry) => connection.send(errorEntry, 'error')),
        manager.on('metric', (metricEntry) => connection.send(metricEntry, 'metric'))
      ];
    }
    
    console.log(`[SIEM] Real-time streaming started: ${connectionId}`);
    return connectionId;
  }

  /**
   * STOP SIEM STREAMING
   */
  stopSIEMStreaming(connectionId) {
    const connection = this.streamingConnections.get(connectionId);
    if (connection) {
      connection.close();
      this.streamingConnections.delete(connectionId);
      console.log(`[SIEM] Streaming stopped: ${connectionId}`);
    }
  }

  /**
   * BATCH EXPORT TO FILE
   * For offline SIEM import
   */
  async exportToFile(format, timeRange = {}, options = {}) {
    const exportData = await this.exportForSIEM(format, timeRange, options);
    
    // Determine file extension
    const extensions = {
      splunk: 'json',
      elk: 'ndjson',
      datadog: 'json',
      newrelic: 'json',
      cloudwatch: 'json',
      sumologic: 'json',
      generic_json: 'json'
    };
    
    const extension = extensions[format] || 'json';
    const filename = `devmentor-telemetry-${format}-${Date.now()}.${extension}`;
    
    // Format data for file export
    let fileContent;
    if (format === 'elk') {
      // Newline-delimited JSON for ELK
      fileContent = exportData.data.map(entry => JSON.stringify(entry)).join('\n');
    } else {
      // Regular JSON
      fileContent = JSON.stringify(exportData, null, 2);
    }
    
    // Create and download file
    const blob = new Blob([fileContent], { 
      type: extension === 'json' ? 'application/json' : 'application/x-ndjson'
    });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    URL.revokeObjectURL(url);
    
    console.log(`[SIEM] Exported ${exportData.recordCounts.total} records to ${filename}`);
    return filename;
  }

  /**
   * HELPER METHODS
   */
  _isInTimeRange(record, timeRange) {
    if (!timeRange.start && !timeRange.end) return true;
    
    const recordTime = new Date(record.timestamp).getTime();
    
    if (timeRange.start && recordTime < timeRange.start) return false;
    if (timeRange.end && recordTime > timeRange.end) return false;
    
    return true;
  }

  _validateSIEMConfig(config) {
    if (!config.format || !this.supportedFormats.includes(config.format)) {
      throw new Error(`Invalid SIEM format. Supported: ${this.supportedFormats.join(', ')}`);
    }
    
    if (!config.endpoint) {
      throw new Error('SIEM endpoint is required');
    }
    
    // Format-specific validation
    const validator = this.formatters[config.format];
    if (validator.validateConfig) {
      validator.validateConfig(config);
    }
  }

  getSupportedFormats() {
    return this.supportedFormats.map(format => ({
      name: format,
      displayName: this._getFormatDisplayName(format),
      description: this._getFormatDescription(format)
    }));
  }

  _getFormatDisplayName(format) {
    const names = {
      splunk: 'Splunk',
      elk: 'ELK Stack (Elasticsearch)',
      datadog: 'Datadog',
      newrelic: 'New Relic',
      cloudwatch: 'AWS CloudWatch',
      sumologic: 'Sumo Logic',
      generic_json: 'Generic JSON'
    };
    return names[format] || format;
  }

  _getFormatDescription(format) {
    const descriptions = {
      splunk: 'Splunk HTTP Event Collector format',
      elk: 'Elasticsearch bulk format with @timestamp',
      datadog: 'Datadog Logs API format',
      newrelic: 'New Relic Logs API format',
      cloudwatch: 'AWS CloudWatch Logs format',
      sumologic: 'Sumo Logic HTTP collector format',
      generic_json: 'Standard JSON format for custom integrations'
    };
    return descriptions[format] || 'Custom format';
  }
}

/**
 * SPLUNK FORMATTER
 * HTTP Event Collector (HEC) format
 */
class SplunkFormatter {
  format(logs, errors, metrics, options = {}) {
    const events = [];
    
    // Process logs
    logs.forEach(log => {
      events.push({
        time: new Date(log.timestamp).getTime() / 1000,
        host: options.host || 'devmentor-extension',
        source: log.context?.component || 'unknown',
        sourcetype: '_json',
        index: options.index || 'devmentor',
        event: {
          ...log,
          eventType: 'log',
          app: 'devmentor-ai'
        }
      });
    });
    
    // Process errors
    errors.forEach(error => {
      events.push({
        time: new Date(error.timestamp).getTime() / 1000,
        host: options.host || 'devmentor-extension',
        source: error.context?.component || 'unknown',
        sourcetype: '_json',
        index: options.index || 'devmentor',
        event: {
          ...error,
          eventType: 'error',
          app: 'devmentor-ai'
        }
      });
    });
    
    // Process metrics
    metrics.forEach(metric => {
      events.push({
        time: metric.timestamp / 1000,
        host: options.host || 'devmentor-extension',
        source: 'metrics',
        sourcetype: 'devmentor:metric',
        index: options.index || 'devmentor',
        event: {
          ...metric,
          eventType: 'metric',
          app: 'devmentor-ai'
        }
      });
    });
    
    return events;
  }

  validateConfig(config) {
    if (!config.token) {
      throw new Error('Splunk HEC token is required');
    }
  }
}

/**
 * ELK FORMATTER
 * Elasticsearch bulk format
 */
class ELKFormatter {
  format(logs, errors, metrics, options = {}) {
    const bulkData = [];
    
    const processRecord = (record, type) => {
      // Index metadata
      bulkData.push({
        index: {
          _index: options.index || 'devmentor-logs',
          _type: '_doc',
          _id: `${type}_${record.timestamp}_${Math.random().toString(36).substr(2, 9)}`
        }
      });
      
      // Document
      bulkData.push({
        '@timestamp': record.timestamp,
        level: record.level || 'INFO',
        message: record.message || record.error?.message || 'Metric recorded',
        fields: {
          component: record.context?.component || record.tags?.component,
          operation: record.context?.operation || record.tags?.operation,
          sessionId: record.sessionId,
          eventType: type
        },
        tags: ['devmentor', 'chrome-extension'],
        source: {
          application: 'devmentor-ai',
          version: chrome.runtime.getManifest().version
        },
        ...record
      });
    };
    
    logs.forEach(log => processRecord(log, 'log'));
    errors.forEach(error => processRecord(error, 'error'));
    metrics.forEach(metric => processRecord(metric, 'metric'));
    
    return bulkData;
  }

  validateConfig(config) {
    if (!config.endpoint.includes('_bulk')) {
      console.warn('ELK endpoint should include _bulk path for optimal performance');
    }
  }
}

/**
 * DATADOG FORMATTER
 * Datadog Logs API format
 */
class DatadogFormatter {
  format(logs, errors, metrics, options = {}) {
    const ddLogs = [];
    
    const processRecord = (record, service) => {
      ddLogs.push({
        timestamp: new Date(record.timestamp).getTime(),
        status: this._mapLevel(record.level || record.severity || 'info'),
        message: record.message || record.error?.message || JSON.stringify(record),
        service: service,
        source: 'chrome-extension',
        tags: [
          `version:${chrome.runtime.getManifest().version}`,
          `component:${record.context?.component || record.tags?.component || 'unknown'}`,
          `environment:${options.environment || 'production'}`
        ],
        attributes: {
          sessionId: record.sessionId,
          ...record
        }
      });
    };
    
    logs.forEach(log => processRecord(log, 'devmentor-logs'));
    errors.forEach(error => processRecord(error, 'devmentor-errors'));
    metrics.forEach(metric => processRecord(metric, 'devmentor-metrics'));
    
    return ddLogs;
  }

  _mapLevel(level) {
    const mapping = {
      DEBUG: 'debug',
      INFO: 'info',
      WARN: 'warn',
      ERROR: 'error',
      CRITICAL: 'error',
      1: 'debug',
      2: 'warn',
      3: 'error',
      4: 'error',
      5: 'error'
    };
    return mapping[level] || 'info';
  }

  validateConfig(config) {
    if (!config.apiKey) {
      throw new Error('Datadog API key is required');
    }
  }
}

/**
 * NEW RELIC FORMATTER
 */
class NewRelicFormatter {
  format(logs, errors, metrics, options = {}) {
    const commonAttributes = {
      'service.name': 'devmentor-ai',
      'service.version': chrome.runtime.getManifest().version,
      environment: options.environment || 'production'
    };

    return {
      common: {
        attributes: commonAttributes
      },
      logs: logs.concat(errors).map(record => ({
        timestamp: new Date(record.timestamp).getTime(),
        message: record.message || record.error?.message,
        level: record.level || 'INFO',
        attributes: {
          component: record.context?.component,
          operation: record.context?.operation,
          sessionId: record.sessionId,
          ...record
        }
      })),
      metrics: metrics.map(metric => ({
        name: metric.name,
        type: metric.type || 'gauge',
        value: metric.value,
        timestamp: metric.timestamp,
        attributes: {
          ...metric.tags,
          sessionId: metric.sessionId
        }
      }))
    };
  }

  validateConfig(config) {
    if (!config.licenseKey) {
      throw new Error('New Relic license key is required');
    }
  }
}

/**
 * CLOUDWATCH FORMATTER
 */
class CloudWatchFormatter {
  format(logs, errors, metrics, options = {}) {
    const logGroups = {
      '/devmentor/logs': [],
      '/devmentor/errors': [],
      '/devmentor/metrics': []
    };

    logs.forEach(log => {
      logGroups['/devmentor/logs'].push({
        timestamp: new Date(log.timestamp).getTime(),
        message: JSON.stringify(log)
      });
    });

    errors.forEach(error => {
      logGroups['/devmentor/errors'].push({
        timestamp: new Date(error.timestamp).getTime(),
        message: JSON.stringify(error)
      });
    });

    metrics.forEach(metric => {
      logGroups['/devmentor/metrics'].push({
        timestamp: metric.timestamp,
        message: JSON.stringify(metric)
      });
    });

    return logGroups;
  }

  validateConfig(config) {
    if (!config.region) {
      throw new Error('AWS region is required for CloudWatch');
    }
  }
}

/**
 * SUMO LOGIC FORMATTER
 */
class SumoLogicFormatter {
  format(logs, errors, metrics, options = {}) {
    const events = [];
    
    // All records as simple JSON with metadata
    [...logs, ...errors, ...metrics].forEach(record => {
      events.push({
        timestamp: record.timestamp,
        level: record.level || 'INFO',
        source: 'devmentor-ai',
        message: JSON.stringify(record),
        fields: {
          application: 'devmentor-ai',
          version: chrome.runtime.getManifest().version,
          environment: options.environment || 'production'
        }
      });
    });
    
    return events;
  }
}

/**
 * GENERIC JSON FORMATTER
 */
class GenericJSONFormatter {
  format(logs, errors, metrics, options = {}) {
    return {
      metadata: {
        exportedAt: new Date().toISOString(),
        application: 'devmentor-ai',
        version: chrome.runtime.getManifest().version,
        format: 'generic_json',
        recordCounts: {
          logs: logs.length,
          errors: errors.length,
          metrics: metrics.length
        }
      },
      data: {
        logs,
        errors,
        metrics
      }
    };
  }
}

/**
 * SIEM STREAMING CONNECTION
 * Real-time data streaming to SIEM platforms
 */
class SIEMStreamingConnection {
  constructor(config, formatter) {
    this.config = config;
    this.formatter = formatter;
    this.connected = false;
    this.buffer = [];
    this.subscriptions = [];
    this.retryCount = 0;
    this.maxRetries = 5;
  }

  async initialize() {
    try {
      // Test connection
      await this._testConnection();
      this.connected = true;
      
      // Start periodic flush
      this._startPeriodicFlush();
      
      console.log(`[SIEM] Streaming connection established: ${this.config.format}`);
    } catch (error) {
      console.error('[SIEM] Failed to initialize streaming:', error);
      throw error;
    }
  }

  async send(data, type) {
    if (!this.connected) return;
    
    try {
      // Format data using the appropriate formatter
      const formatted = this.formatter.format(
        type === 'log' ? [data] : [],
        type === 'error' ? [data] : [],
        type === 'metric' ? [data] : [],
        this.config.options || {}
      );
      
      // Add to buffer
      this.buffer.push(...(Array.isArray(formatted) ? formatted : [formatted]));
      
      // Flush if buffer is full
      if (this.buffer.length >= (this.config.batchSize || 10)) {
        await this.flush();
      }
      
    } catch (error) {
      console.error('[SIEM] Failed to send data:', error);
      this._handleError(error);
    }
  }

  async flush() {
    if (this.buffer.length === 0) return;
    
    const batch = [...this.buffer];
    this.buffer = [];
    
    try {
      await this._sendBatch(batch);
      this.retryCount = 0;
      
    } catch (error) {
      console.error('[SIEM] Failed to flush batch:', error);
      this._handleError(error);
      
      // Re-add to buffer for retry
      this.buffer.unshift(...batch);
    }
  }

  close() {
    this.connected = false;
    
    // Unsubscribe from events
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions = [];
    
    // Clear buffer
    this.buffer = [];
    
    console.log('[SIEM] Streaming connection closed');
  }

  async _testConnection() {
    const testPayload = this.formatter.format(
      [{
        timestamp: new Date().toISOString(),
        level: 'INFO',
        message: 'SIEM connection test',
        context: { component: 'siem_test' },
        sessionId: 'test_session'
      }],
      [],
      [],
      this.config.options || {}
    );

    await this._sendBatch(Array.isArray(testPayload) ? testPayload : [testPayload]);
  }

  async _sendBatch(batch) {
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': `DevMentor-AI/${chrome.runtime.getManifest().version}`,
      ...this.config.headers
    };

    // Add authentication headers based on format
    if (this.config.token) {
      headers['Authorization'] = `Bearer ${this.config.token}`;
    }
    if (this.config.apiKey) {
      headers['DD-API-KEY'] = this.config.apiKey;
    }

    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(batch)
    });

    if (!response.ok) {
      throw new Error(`SIEM request failed: ${response.status} ${response.statusText}`);
    }

    return response;
  }

  _startPeriodicFlush() {
    this.flushInterval = setInterval(() => {
      this.flush();
    }, this.config.flushInterval || 60000); // Default 1 minute
  }

  _handleError(error) {
    this.retryCount++;
    
    if (this.retryCount >= this.maxRetries) {
      console.error('[SIEM] Max retries reached, disconnecting');
      this.close();
    }
  }
}

// Export for use by other modules
if (typeof window !== 'undefined') {
  window.SIEMIntegration = SIEMIntegration;
}



















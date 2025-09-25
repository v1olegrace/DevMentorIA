/**
 * DEVMENTOR AI - ENTERPRISE OBSERVABILITY SYSTEM
 * Production-grade logging, metrics, and error tracking
 * 
 * Design Principles:
 * 1. Privacy-First: Zero PII/code transmission
 * 2. Structured Logging: Machine-parseable
 * 3. Multi-Sink: Local + Optional Remote
 * 4. Performance: Zero-impact on user experience
 * 5. Actionable: Every log drives improvement
 */

class ObservabilityManager {
  constructor() {
    this.config = {
      // Telemetry levels
      levels: {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3,
        CRITICAL: 4
      },
      
      // Storage strategies
      storage: {
        local: {
          enabled: true,
          maxEntries: 1000,
          retention: 7 * 24 * 60 * 60 * 1000, // 7 days
          compression: true
        },
        remote: {
          enabled: false, // User opt-in only
          endpoint: 'https://telemetry.devmentor.ai/v1/events',
          batchSize: 50,
          flushInterval: 60000, // 1 minute
          retryPolicy: {
            maxRetries: 3,
            backoff: 'exponential'
          }
        }
      },
      
      // Privacy controls
      privacy: {
        anonymizeUserData: true,
        stripCodeSnippets: true,
        hashSensitiveFields: true,
        allowOptOut: true,
        transparentReporting: true
      },
      
      // Performance monitoring
      performance: {
        sampleRate: 1.0, // 100% in development, 10% in production
        longTaskThreshold: 50, // ms
        memoryWarningThreshold: 100 * 1024 * 1024 // 100MB
      }
    };
    
    // In-memory buffers
    this.logBuffer = new CircularBuffer(1000);
    this.metricsBuffer = new CircularBuffer(500);
    this.errorBuffer = new CircularBuffer(100);
    
    // Telemetry sinks
    this.sinks = {
      console: new ConsoleSink(),
      localStorage: new LocalStorageSink(),
      indexedDB: new IndexedDBSink(),
      remote: new RemoteSink(this.config.storage.remote)
    };
    
    // Session context
    this.sessionId = this._generateSessionId();
    this.deviceFingerprint = this._generateDeviceFingerprint();
    
    // Performance observer
    this.performanceObserver = null;
    
    // Active traces
    this._activeTraces = new Map();
    
    // Event emitter
    this._eventHandlers = new Map();
    
    this.initialize();
  }

  /**
   * INITIALIZATION WITH HEALTH CHECK
   */
  async initialize() {
    console.log('[Observability] Initializing telemetry system...');
    
    try {
      // Initialize storage sinks
      await this.sinks.indexedDB.initialize();
      
      // Start performance monitoring
      this._initializePerformanceMonitoring();
      
      // Start error monitoring
      this._initializeErrorMonitoring();
      
      // Start periodic flush
      this._startPeriodicFlush();
      
      // Check user consent for remote telemetry
      await this._checkTelemetryConsent();
      
      // Send initialization event
      this.logEvent('observability_initialized', {
        sessionId: this.sessionId,
        version: chrome.runtime.getManifest().version,
        environment: this._detectEnvironment()
      });
      
      console.log('[Observability] Telemetry system ready');
      
    } catch (error) {
      console.error('[Observability] Initialization failed:', error);
      // Graceful degradation - continue without telemetry
    }
  }

  /**
   * STRUCTURED LOGGING - PRODUCTION GRADE
   * Every log is machine-parseable JSON with context
   */
  log(level, message, context = {}, metadata = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      // Standard fields
      timestamp,
      level: this._getLevelName(level),
      levelValue: level,
      message,
      sessionId: this.sessionId,
      
      // Context enrichment
      context: {
        component: context.component || 'unknown',
        operation: context.operation || 'unknown',
        requestId: context.requestId,
        userId: this._getAnonymousUserId(),
        ...context
      },
      
      // Technical metadata
      metadata: {
        version: chrome.runtime.getManifest().version,
        environment: this._detectEnvironment(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        url: this._sanitizeUrl(window.location.href),
        ...metadata
      },
      
      // Privacy-safe stack trace
      stackTrace: this._captureStackTrace()
    };
    
    // Sanitize for privacy
    const sanitizedEntry = this._sanitizeLogEntry(logEntry);
    
    // Add to buffer
    this.logBuffer.push(sanitizedEntry);
    
    // Write to sinks based on level
    this._writeToSinks(sanitizedEntry);
    
    // Emit event
    this._emit('log', sanitizedEntry);
    
    return sanitizedEntry;
  }

  /**
   * ERROR TRACKING WITH FULL CONTEXT
   * Captures everything needed to reproduce
   */
  logError(error, context = {}) {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      
      // Error details
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code,
        
        // Custom error properties
        ...(error.metadata || {})
      },
      
      // Context when error occurred
      context: {
        component: context.component,
        operation: context.operation,
        requestId: context.requestId,
        
        // System state
        aiSessionsActive: context.aiSessionsActive,
        memoryUsage: this._getMemoryUsage(),
        networkStatus: navigator.onLine ? 'online' : 'offline',
        
        // User action that triggered error
        userAction: context.userAction,
        codeLength: context.codeLength, // Size, not content
        language: context.language,
        
        ...context
      },
      
      // Browser state
      browserState: {
        version: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        performance: {
          memory: performance.memory ? {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
          } : null
        }
      },
      
      // Classification
      severity: this._classifyErrorSeverity(error),
      retryable: this._isRetryableError(error),
      userImpact: this._estimateUserImpact(error, context)
    };
    
    // Sanitize
    const sanitizedError = this._sanitizeLogEntry(errorEntry);
    
    // Add to error buffer
    this.errorBuffer.push(sanitizedError);
    
    // High-severity errors get immediate flush
    if (sanitizedError.severity >= 3) {
      this._flushToRemote([sanitizedError], 'error');
    }
    
    // Write to all sinks
    this._writeToSinks(sanitizedError, 'error');
    
    // Update error metrics
    this._updateErrorMetrics(sanitizedError);
    
    // Emit event
    this._emit('error', sanitizedError);
    
    return sanitizedError;
  }

  /**
   * METRICS COLLECTION - TIME-SERIES DATA
   * For performance analysis and optimization
   */
  recordMetric(name, value, tags = {}, metadata = {}) {
    const metricEntry = {
      timestamp: Date.now(),
      sessionId: this.sessionId,
      
      // Metric identification
      name,
      value,
      unit: metadata.unit || 'count',
      type: metadata.type || 'gauge', // gauge, counter, histogram, timer
      
      // Tags for grouping/filtering
      tags: {
        component: tags.component,
        operation: tags.operation,
        language: tags.language,
        analysisType: tags.analysisType,
        environment: this._detectEnvironment(),
        ...tags
      },
      
      // Additional context
      metadata: {
        sampleRate: this.config.performance.sampleRate,
        ...metadata
      }
    };
    
    // Add to metrics buffer
    this.metricsBuffer.push(metricEntry);
    
    // Check for anomalies
    this._checkMetricAnomaly(metricEntry);
    
    return metricEntry;
  }

  /**
   * DISTRIBUTED TRACING - REQUEST FLOW TRACKING
   * Understand complete request lifecycle
   */
  startTrace(operation, context = {}) {
    const traceId = this._generateTraceId();
    const spanId = this._generateSpanId();
    
    const trace = {
      traceId,
      spanId,
      parentSpanId: context.parentSpanId,
      operation,
      startTime: performance.now(),
      startTimestamp: Date.now(),
      
      // Context
      context: {
        requestId: context.requestId,
        component: context.component,
        ...context
      },
      
      // Tags
      tags: {
        sessionId: this.sessionId,
        version: chrome.runtime.getManifest().version
      },
      
      // State
      status: 'started',
      events: [],
      
      // Child spans
      children: []
    };
    
    // Store active trace
    this._activeTraces.set(traceId, trace);
    
    return {
      traceId,
      spanId,
      
      // Helper methods
      addEvent: (name, data) => this._addTraceEvent(traceId, name, data),
      addTag: (key, value) => this._addTraceTag(traceId, key, value),
      startChild: (childOperation) => this.startTrace(childOperation, { 
        parentSpanId: spanId,
        traceId 
      }),
      finish: (status = 'success') => this.finishTrace(traceId, status)
    };
  }

  finishTrace(traceId, status = 'success', error = null) {
    const trace = this._activeTraces.get(traceId);
    if (!trace) return;
    
    // Calculate duration
    const duration = performance.now() - trace.startTime;
    
    // Update trace
    trace.endTime = performance.now();
    trace.endTimestamp = Date.now();
    trace.duration = duration;
    trace.status = status;
    
    if (error) {
      trace.error = {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    }
    
    // Remove from active traces
    this._activeTraces.delete(traceId);
    
    // Log completed trace
    this.log(this.config.levels.INFO, 'Trace completed', {
      component: 'tracing',
      operation: trace.operation,
      traceId,
      duration,
      status
    }, {
      trace: this._sanitizeLogEntry(trace)
    });
    
    // Record as metric
    this.recordMetric(`trace.duration.${trace.operation}`, duration, {
      status,
      operation: trace.operation
    }, {
      type: 'histogram',
      unit: 'ms'
    });
    
    return trace;
  }

  /**
   * EVENT LOGGING FOR USER ACTIONS
   */
  logEvent(eventName, properties = {}) {
    this.log(this.config.levels.INFO, `Event: ${eventName}`, {
      component: 'events',
      operation: eventName
    }, {
      eventProperties: this._sanitizeLogEntry(properties)
    });
  }

  /**
   * PERFORMANCE MONITORING
   */
  _initializePerformanceMonitoring() {
    // Long task observer
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > this.config.performance.longTaskThreshold) {
            this.recordMetric('performance.long_task', entry.duration, {
              component: 'performance'
            }, {
              type: 'histogram',
              unit: 'ms'
            });
          }
        }
      });
      
      try {
        this.performanceObserver.observe({ entryTypes: ['longtask'] });
      } catch (error) {
        console.warn('[Observability] PerformanceObserver not supported');
      }
    }
    
    // Memory monitoring
    if (performance.memory) {
      setInterval(() => {
        const memoryUsage = performance.memory.usedJSHeapSize;
        this.recordMetric('performance.memory_usage', memoryUsage, {
          component: 'performance'
        }, {
          type: 'gauge',
          unit: 'bytes'
        });
        
        if (memoryUsage > this.config.performance.memoryWarningThreshold) {
          this.log(this.config.levels.WARN, 'High memory usage detected', {
            component: 'performance',
            operation: 'memory_check'
          }, {
            memoryUsage,
            threshold: this.config.performance.memoryWarningThreshold
          });
        }
      }, 30000); // Check every 30 seconds
    }
  }

  /**
   * ERROR MONITORING
   */
  _initializeErrorMonitoring() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.logError(event.error, {
        component: 'global',
        operation: 'unhandled_error',
        userAction: 'unknown',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });
    
    // Unhandled promise rejection
    window.addEventListener('unhandledrejection', (event) => {
      this.logError(event.reason, {
        component: 'global',
        operation: 'unhandled_promise_rejection',
        userAction: 'unknown'
      });
    });
  }

  /**
   * HELPER METHODS
   */
  _generateSessionId() {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  _generateDeviceFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('DevMentor fingerprint', 2, 2);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    return this._hashString(fingerprint);
  }

  _generateTraceId() {
    return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  _generateSpanId() {
    return `span_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  _getLevelName(level) {
    for (const [name, value] of Object.entries(this.config.levels)) {
      if (value === level) return name;
    }
    return 'UNKNOWN';
  }

  _getAnonymousUserId() {
    // Generate consistent anonymous ID per installation
    let userId = localStorage.getItem('devmentor_anonymous_id');
    if (!userId) {
      userId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('devmentor_anonymous_id', userId);
    }
    return this._hashString(userId);
  }

  _detectEnvironment() {
    if (chrome.runtime.getManifest().version.includes('dev')) return 'development';
    if (location.hostname === 'localhost') return 'development';
    return 'production';
  }

  _sanitizeUrl(url) {
    try {
      const urlObj = new URL(url);
      return {
        domain: urlObj.hostname,
        protocol: urlObj.protocol,
        isCodingPlatform: this._isCodingPlatform(urlObj.hostname)
      };
    } catch (error) {
      return { domain: 'unknown', protocol: 'unknown', isCodingPlatform: false };
    }
  }

  _isCodingPlatform(hostname) {
    const codingPlatforms = [
      'github.com', 'stackoverflow.com', 'codepen.io', 'jsfiddle.net',
      'replit.com', 'codesandbox.io', 'leetcode.com', 'hackerrank.com'
    ];
    return codingPlatforms.some(platform => hostname.includes(platform));
  }

  _captureStackTrace() {
    try {
      throw new Error();
    } catch (error) {
      return this._sanitizeStackTrace(error.stack);
    }
  }

  _sanitizeStackTrace(stack) {
    if (!stack) return null;
    
    return stack
      .split('\n')
      .slice(2) // Remove the error message and this function
      .map(line => {
        // Extract function name and line number only
        const match = line.match(/at\s+(\w+).*:(\d+):\d+/);
        return match ? `at ${match[1]} (line ${match[2]})` : null;
      })
      .filter(Boolean)
      .slice(0, 5) // Limit stack depth
      .join('\n');
  }

  _sanitizeLogEntry(entry) {
    const sanitizer = new PrivacySanitizer();
    return sanitizer.sanitize(entry);
  }

  _getMemoryUsage() {
    if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  }

  _classifyErrorSeverity(error) {
    if (error.name === 'AIUnavailableError') return 4; // Critical
    if (error.name === 'TimeoutError') return 3; // Error
    if (error.name === 'ValidationError') return 2; // Warning
    if (error.message.includes('network')) return 3; // Error
    return 2; // Warning (default)
  }

  _isRetryableError(error) {
    const retryableErrors = ['TimeoutError', 'NetworkError', 'ServiceUnavailableError'];
    return retryableErrors.includes(error.name);
  }

  _estimateUserImpact(error, context) {
    if (error.name === 'AIUnavailableError') return 'high';
    if (context.userAction === 'code_analysis') return 'medium';
    return 'low';
  }

  _writeToSinks(entry, type = 'log') {
    // Console (always enabled)
    this.sinks.console.write(entry, type);
    
    // Local storage (if enabled)
    if (this.config.storage.local.enabled) {
      this.sinks.indexedDB.write(type + 's', entry);
    }
    
    // Remote (if enabled and user consented)
    if (this.config.storage.remote.enabled) {
      this.sinks.remote.write(entry);
    }
  }

  _startPeriodicFlush() {
    setInterval(() => {
      if (this.config.storage.remote.enabled) {
        this.sinks.remote.flush();
      }
    }, this.config.storage.remote.flushInterval);
  }

  async _checkTelemetryConsent() {
    const consent = localStorage.getItem('devmentor_telemetry_consent');
    if (consent === 'true') {
      this.config.storage.remote.enabled = true;
      await this.sinks.remote.enable();
    }
  }

  _flushToRemote(entries, type) {
    if (this.config.storage.remote.enabled) {
      entries.forEach(entry => this.sinks.remote.write(entry));
      this.sinks.remote.flush();
    }
  }

  _updateErrorMetrics(errorEntry) {
    this.recordMetric('errors.count', 1, {
      errorType: errorEntry.error.name,
      severity: errorEntry.severity,
      component: errorEntry.context.component
    }, {
      type: 'counter'
    });
  }

  _checkMetricAnomaly(metric) {
    // Simple anomaly detection for demo
    if (metric.name === 'performance.memory_usage' && metric.value > this.config.performance.memoryWarningThreshold) {
      this.log(this.config.levels.WARN, 'Memory usage anomaly detected', {
        component: 'anomaly_detection',
        operation: 'memory_check'
      }, { metric });
    }
  }

  _addTraceEvent(traceId, eventName, data) {
    const trace = this._activeTraces.get(traceId);
    if (trace) {
      trace.events.push({
        name: eventName,
        timestamp: performance.now(),
        data: this._sanitizeLogEntry(data)
      });
    }
  }

  _addTraceTag(traceId, key, value) {
    const trace = this._activeTraces.get(traceId);
    if (trace) {
      trace.tags[key] = value;
    }
  }

  _hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  _emit(eventName, data) {
    const handlers = this._eventHandlers.get(eventName) || [];
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`[Observability] Event handler error for ${eventName}:`, error);
      }
    });
  }

  on(eventName, handler) {
    if (!this._eventHandlers.has(eventName)) {
      this._eventHandlers.set(eventName, []);
    }
    this._eventHandlers.get(eventName).push(handler);
  }

  off(eventName, handler) {
    const handlers = this._eventHandlers.get(eventName);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }
}








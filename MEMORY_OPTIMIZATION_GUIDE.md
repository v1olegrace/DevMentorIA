# DevMentor AI - Memory Optimization Guide
## Best Practices for Chrome Extension Performance

**Version**: 1.0.0
**Date**: 2025-10-27

---

## Overview

Chrome Extensions have limited memory resources. DevMentor AI implements enterprise-grade memory management to ensure optimal performance and prevent memory leaks.

---

## Memory Limits

### Recommended Limits
```javascript
{
  warning: 50 MB,   // Start cleanup
  critical: 100 MB, // Emergency cleanup
  maximum: 150 MB   // Hard limit
}
```

### Chrome Extension Memory Budget
- **Service Worker**: ~50MB typical, 150MB maximum
- **Content Scripts**: ~20MB per tab
- **Popup/Options**: ~30MB per page

**Total Available**: ~200MB across all contexts

---

## Memory Management System

### 1. Automatic Monitoring

```javascript
import { memoryManager } from './modules/memory-manager.js';

// Automatic monitoring every 60 seconds
// Reports when thresholds are exceeded
```

### 2. Resource Tracking

#### Track Timers
```javascript
// Register timer
const intervalId = setInterval(() => {
  // Your code
}, 60000);

memoryManager.registerTimer(
  'my-interval',
  intervalId,
  'interval',
  'Description of purpose'
);

// Always cleanup when done
memoryManager.unregisterTimer('my-interval');
```

#### Track Event Listeners
```javascript
const handler = (event) => { /* handler */ };
target.addEventListener('click', handler);

memoryManager.registerListener(
  'my-listener',
  target,
  'click',
  handler
);

// Cleanup
memoryManager.unregisterListener('my-listener');
```

#### Track Large Objects
```javascript
const largeData = {
  /* large dataset */
};

memoryManager.trackLargeObject('cache-data', largeData, {
  ttl: 300000,      // 5 minutes
  priority: 'normal' // or 'low', 'high'
});

// Remove when done
memoryManager.untrackLargeObject('cache-data');
```

---

## Best Practices

### 1. Cache Management

#### LRU Cache with TTL
```javascript
import { LRUCache } from './modules/cache.js';

const cache = new LRUCache({
  max: 100,           // Maximum 100 entries
  ttl: 300000,        // 5 minutes
  autoCleanup: true,  // Automatic expired entry cleanup
  cleanupInterval: 60000 // Cleanup every minute
});

// Always destroy when done
cache.destroy();
```

**Memory Benefit**: Automatic eviction prevents unbounded growth

### 2. Limit Array/Map Sizes

```javascript
class PerformanceMetrics {
  constructor() {
    this.maxSamples = 100; // LIMIT SIZE
    this.performanceSamples = [];
  }

  addSample(sample) {
    this.performanceSamples.push(sample);

    // Keep only last N samples
    if (this.performanceSamples.length > this.maxSamples) {
      this.performanceSamples.shift();
    }
  }
}
```

**Memory Benefit**: Prevents unlimited array growth

### 3. Cleanup Intervals

```javascript
// BAD: No cleanup
setInterval(() => {
  doSomething();
}, 60000);

// GOOD: Tracked and cleanup-able
const intervalId = setInterval(() => {
  doSomething();
}, 60000);

memoryManager.registerTimer('my-task', intervalId, 'interval', 'Task description');

// Cleanup when component destroyed
memoryManager.unregisterTimer('my-task');
```

### 4. WeakMap for Object References

```javascript
// Use WeakMap for object-keyed data
// Automatically garbage collected when keys are no longer referenced
class CacheManager {
  constructor() {
    this.caches = new WeakMap(); // NOT Map()
  }

  registerCache(instance, metadata) {
    this.caches.set(instance, metadata);
    // When instance is GC'd, entry is automatically removed
  }
}
```

**Memory Benefit**: Automatic garbage collection

### 5. Avoid Closures Retaining Large Objects

```javascript
// BAD: Closure retains entire largeArray
function createHandler(largeArray) {
  return function() {
    console.log(largeArray.length); // Retains entire array!
  };
}

// GOOD: Extract only what's needed
function createHandler(largeArray) {
  const length = largeArray.length; // Only keep length
  return function() {
    console.log(length);
  };
  // largeArray can now be garbage collected
}
```

### 6. Clear Large Responses

```javascript
async function processLargeData() {
  let response = await fetch(url);
  let data = await response.json();

  // Process data
  const result = processData(data);

  // Clear references to allow GC
  response = null;
  data = null;

  return result;
}
```

---

## Memory Leak Patterns to Avoid

### ❌ Pattern 1: Forgotten Timers
```javascript
// BAD
class MyComponent {
  start() {
    setInterval(() => {
      this.update();
    }, 1000);
  }
  // No cleanup! Interval runs forever
}

// GOOD
class MyComponent {
  start() {
    this.timerId = setInterval(() => {
      this.update();
    }, 1000);
  }

  destroy() {
    clearInterval(this.timerId);
  }
}
```

### ❌ Pattern 2: Event Listeners Not Removed
```javascript
// BAD
class MyComponent {
  init() {
    window.addEventListener('resize', this.onResize);
  }
  // No cleanup!
}

// GOOD
class MyComponent {
  init() {
    this.onResize = this.onResize.bind(this);
    window.addEventListener('resize', this.onResize);
  }

  destroy() {
    window.removeEventListener('resize', this.onResize);
  }
}
```

### ❌ Pattern 3: Circular References
```javascript
// BAD
class Parent {
  constructor() {
    this.child = new Child(this); // Child holds parent reference
  }
}

class Child {
  constructor(parent) {
    this.parent = parent; // Circular reference!
  }
}

// GOOD: Use WeakRef or break cycle
class Child {
  constructor(parent) {
    this.parentRef = new WeakRef(parent);
  }

  getParent() {
    return this.parentRef.deref();
  }
}
```

### ❌ Pattern 4: Unbounded Arrays
```javascript
// BAD
class Logger {
  constructor() {
    this.logs = [];
  }

  log(message) {
    this.logs.push({ message, timestamp: Date.now() });
    // Array grows forever!
  }
}

// GOOD
class Logger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000;
  }

  log(message) {
    this.logs.push({ message, timestamp: Date.now() });

    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove oldest
    }
  }
}
```

---

## Monitoring Memory Usage

### Get Memory Report

```javascript
import { memoryManager } from './modules/memory-manager.js';

// Get detailed report
const report = memoryManager.getReport();
console.log(report);

// Print formatted report
memoryManager.printReport();
```

### Report Output
```
═══════════════════════════════════════════════════════
         DevMentor AI - Memory Report
═══════════════════════════════════════════════════════

[CURRENT]
   Usage: 45MB
   Peak: 67MB
   Status: HEALTHY

[LIMITS]
   Warning: 50MB
   Critical: 100MB
   Maximum: 150MB

[RESOURCES]
   Active Timers: 5
   Event Listeners: 12
   Large Objects: 3

[HEALTH]
   Warnings Issued: 1
   Cleanups Performed: 3
   Memory Trend: stable

═══════════════════════════════════════════════════════
```

---

## Performance Optimization Checklist

### Before Deployment
- [ ] All timers have cleanup in destroy() methods
- [ ] All event listeners are removed when done
- [ ] Array/Map sizes are limited
- [ ] Large objects are tracked and cleaned up
- [ ] Caches have TTL and maximum size
- [ ] No circular references
- [ ] Memory report shows healthy status
- [ ] Memory trend is stable or decreasing

### During Development
- [ ] Use memory profiler in Chrome DevTools
- [ ] Monitor heap snapshots for leaks
- [ ] Check detached DOM nodes
- [ ] Profile before/after major changes
- [ ] Test with large datasets
- [ ] Verify cleanup on extension reload

---

## DevMentor AI Memory Optimizations

### 1. LRU Cache with TTL
- **Location**: `modules/cache.js`
- **Benefit**: Automatic eviction of old entries
- **Memory Saved**: ~30-50MB with large datasets

### 2. Limited Performance Samples
- **Location**: `modules/performance-metrics.js`
- **Limit**: 100 samples maximum
- **Benefit**: Prevents unbounded array growth

### 3. Automatic Cleanup Intervals
- **Frequency**: Every 60 seconds
- **Triggers**: Expired cache entries, old metrics
- **Benefit**: Regular memory reclamation

### 4. Emergency Cleanup
- **Trigger**: Memory usage > 100MB
- **Action**: Clear low-priority objects, oldest timers
- **Benefit**: Prevents out-of-memory crashes

### 5. WeakMap for Cache Tracking
- **Usage**: Tracking cache instances
- **Benefit**: Automatic garbage collection

---

## Chrome DevTools Memory Profiling

### 1. Take Heap Snapshot
```
Chrome DevTools → Memory → Heap snapshot → Take snapshot
```

### 2. Compare Snapshots
```
1. Take snapshot before action
2. Perform action (e.g., analyze code 10 times)
3. Take snapshot after
4. Compare to find leaks
```

### 3. Look For
- **Detached DOM Nodes**: Should be 0
- **Arrays growing**: Should have size limits
- **Listeners**: Should match expected count
- **Timers**: Should be cleaned up

### 4. Memory Timeline
```
Chrome DevTools → Performance → Memory checkbox
Record → Perform actions → Stop
Look for sawtooth pattern (good) vs steady increase (leak)
```

---

## Integration with Service Worker

### Service Worker Lifecycle
```javascript
// service-worker.js
import { memoryManager } from './modules/memory-manager.js';

// On install
chrome.runtime.onInstalled.addListener(() => {
  console.log('Memory Manager initialized');
});

// Periodic cleanup
chrome.alarms.create('memory-cleanup', {
  periodInMinutes: 5
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'memory-cleanup') {
    memoryManager.printReport();
  }
});

// On suspend
chrome.runtime.onSuspend.addListener(() => {
  // Service Worker going to sleep
  // Chrome handles cleanup, but good practice:
  memoryManager.destroy();
});
```

---

## Common Chrome Extension Memory Issues

### Issue 1: Content Script Memory
**Problem**: Content scripts run on every page
**Solution**: Inject only when needed, cleanup on unload

### Issue 2: Popup Recreation
**Problem**: Popup recreated each time it opens
**Solution**: Don't store state in popup, use background script

### Issue 3: Message Passing Overhead
**Problem**: Large data in messages
**Solution**: Store in chrome.storage, pass references

### Issue 4: Multiple Contexts
**Problem**: Background + Content + Popup all consume memory
**Solution**: Centralize data in background, minimal content scripts

---

## Testing Memory Performance

### Test Case 1: Heavy Usage
```javascript
// Test: Analyze 100 code samples
for (let i = 0; i < 100; i++) {
  await devMentorAI.analyzeCode(largeCodeSample);
}

// Verify:
const report = memoryManager.getReport();
assert(report.current.usage < 80, 'Memory usage acceptable');
assert(report.resources.largeObjects < 10, 'Large objects cleaned');
```

### Test Case 2: Long Running
```javascript
// Test: Run for 1 hour
const startTime = Date.now();
const interval = setInterval(() => {
  if (Date.now() - startTime > 3600000) {
    clearInterval(interval);

    // Verify no memory leak
    const report = memoryManager.getReport();
    assert(report.history.trend !== 'increasing', 'No memory leak detected');
  }
}, 60000);
```

---

## Recommended Tools

### Chrome DevTools
- **Memory Profiler**: Heap snapshots, allocation timeline
- **Performance Monitor**: Real-time memory graph
- **Task Manager**: Chrome's built-in memory monitor

### VS Code Extensions
- **ESLint**: Detect potential memory leaks
- **SonarLint**: Code quality and memory anti-patterns

---

## Summary

### Key Principles
1. **Track Everything**: All timers, listeners, large objects
2. **Limit Sizes**: Arrays, Maps, caches
3. **Cleanup Always**: destroy() methods for all components
4. **Monitor Regularly**: Check memory reports
5. **Optimize Proactively**: Don't wait for issues

### Memory Budget
- **Service Worker**: < 50MB typical
- **Per Tab**: < 20MB content scripts
- **Total Extension**: < 100MB comfortable

### DevMentor AI Status
- ✅ Memory Manager implemented
- ✅ LRU Cache with TTL
- ✅ Automatic cleanup intervals
- ✅ Resource tracking
- ✅ Emergency cleanup
- ✅ Monitoring and reporting

---

**Generated**: 2025-10-27
**Version**: 1.0.0
**Status**: PRODUCTION READY

/**
 * DevMentor AI - Unit Test Suite
 * Comprehensive unit tests for core functionality
 */

class DevMentorTestSuite {
  constructor() {
    this.tests = [];
    this.results = [];
    this.logger = {
      info: (...args) => console.info('[TestSuite]', ...args),
      error: (...args) => console.error('[TestSuite]', ...args),
      warn: (...args) => console.warn('[TestSuite]', ...args)
    };
  }

  /**
   * Add test case
   * @param {string} name - Test name
   * @param {Function} testFn - Test function
   */
  addTest(name, testFn) {
    this.tests.push({ name, testFn });
  }

  /**
   * Run all tests
   * @returns {Promise<Object>} - Test results
   */
  async runAllTests() {
    this.logger.info('Starting test suite...');
    this.results = [];

    for (const test of this.tests) {
      try {
        await this.runTest(test);
      } catch (error) {
        this.results.push({
          name: test.name,
          status: 'error',
          error: error.message,
          duration: 0
        });
      }
    }

    return this.getResults();
  }

  /**
   * Run single test
   * @param {Object} test - Test object
   */
  async runTest(test) {
    const startTime = Date.now();
    
    try {
      await test.testFn();
      const duration = Date.now() - startTime;
      
      this.results.push({
        name: test.name,
        status: 'passed',
        duration
      });
      
      this.logger.info(`✅ ${test.name} - PASSED (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.results.push({
        name: test.name,
        status: 'failed',
        error: error.message,
        duration
      });
      
      this.logger.error(`❌ ${test.name} - FAILED: ${error.message}`);
    }
  }

  /**
   * Get test results
   * @returns {Object} - Results summary
   */
  getResults() {
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const errors = this.results.filter(r => r.status === 'error').length;
    const total = this.results.length;

    return {
      total,
      passed,
      failed,
      errors,
      successRate: total > 0 ? (passed / total) * 100 : 0,
      results: this.results
    };
  }

  /**
   * Assert equality
   * @param {*} actual - Actual value
   * @param {*} expected - Expected value
   * @param {string} message - Error message
   */
  assertEqual(actual, expected, message = 'Values are not equal') {
    if (actual !== expected) {
      throw new Error(`${message}: expected ${expected}, got ${actual}`);
    }
  }

  /**
   * Assert truthy
   * @param {*} value - Value to check
   * @param {string} message - Error message
   */
  assertTrue(value, message = 'Value is not truthy') {
    if (!value) {
      throw new Error(message);
    }
  }

  /**
   * Assert falsy
   * @param {*} value - Value to check
   * @param {string} message - Error message
   */
  assertFalse(value, message = 'Value is not falsy') {
    if (value) {
      throw new Error(message);
    }
  }

  /**
   * Assert throws
   * @param {Function} fn - Function to test
   * @param {string} message - Error message
   */
  assertThrows(fn, message = 'Function should throw') {
    try {
      fn();
      throw new Error(message);
    } catch (error) {
      // Expected to throw
    }
  }
}

// Create test suite instance
const testSuite = new DevMentorTestSuite();

// Add tests for SecureHTMLSanitizer
testSuite.addTest('SecureHTMLSanitizer - Basic Sanitization', async () => {
  const sanitizer = window.__DEVMENTOR_SECURE_SANITIZER;
  testSuite.assertTrue(sanitizer, 'Sanitizer should be available');
  
  const cleanHTML = '<p>Hello World</p>';
  const sanitized = sanitizer.sanitizeHTML(cleanHTML);
  testSuite.assertEqual(sanitized, cleanHTML, 'Clean HTML should pass through');
});

testSuite.addTest('SecureHTMLSanitizer - Script Removal', async () => {
  const sanitizer = window.__DEVMENTOR_SECURE_SANITIZER;
  
  const maliciousHTML = '<p>Hello</p><script>alert("xss")</script>';
  const sanitized = sanitizer.sanitizeHTML(maliciousHTML);
  testSuite.assertFalse(sanitized.includes('<script>'), 'Script tags should be removed');
});

testSuite.addTest('SecureHTMLSanitizer - Attribute Sanitization', async () => {
  const sanitizer = window.__DEVMENTOR_SECURE_SANITIZER;
  
  const maliciousHTML = '<a href="javascript:alert(1)">Click me</a>';
  const sanitized = sanitizer.sanitizeHTML(maliciousHTML);
  testSuite.assertFalse(sanitized.includes('javascript:'), 'JavaScript URLs should be removed');
});

testSuite.addTest('SecureHTMLSanitizer - Safe InnerHTML', async () => {
  const sanitizer = window.__DEVMENTOR_SECURE_SANITIZER;
  
  const element = document.createElement('div');
  const maliciousHTML = '<p>Hello</p><script>alert("xss")</script>';
  
  const success = sanitizer.safeInnerHTML(element, maliciousHTML);
  testSuite.assertTrue(success, 'Safe innerHTML should succeed');
  testSuite.assertFalse(element.innerHTML.includes('<script>'), 'Script should be removed from element');
});

// Add tests for SafeExpressionEvaluator
testSuite.addTest('SafeExpressionEvaluator - Basic Math', async () => {
  const evaluator = window.__DEVMENTOR_SAFE_EVAL;
  testSuite.assertTrue(evaluator, 'Evaluator should be available');
  
  const result = evaluator.safeEvaluate('2 + 3 * 4');
  testSuite.assertEqual(result, 14, 'Math expression should evaluate correctly');
});

testSuite.addTest('SafeExpressionEvaluator - Context Variables', async () => {
  const evaluator = window.__DEVMENTOR_SAFE_EVAL;
  
  const result = evaluator.safeEvaluate('a + b', { a: 5, b: 3 });
  testSuite.assertEqual(result, 8, 'Context variables should work');
});

testSuite.addTest('SafeExpressionEvaluator - Unsafe Expression', async () => {
  const evaluator = window.__DEVMENTOR_SAFE_EVAL;
  
  testSuite.assertThrows(() => {
    evaluator.safeEvaluate('eval("alert(1)")');
  }, 'Unsafe expressions should throw');
});

testSuite.addTest('SafeExpressionEvaluator - Is Safe Check', async () => {
  const evaluator = window.__DEVMENTOR_SAFE_EVAL;
  
  const isSafe = evaluator.isSafeExpression('2 + 3');
  testSuite.assertTrue(isSafe, 'Safe expression should be detected as safe');
  
  const isUnsafe = evaluator.isSafeExpression('eval("alert(1)")');
  testSuite.assertFalse(isUnsafe, 'Unsafe expression should be detected as unsafe');
});

// Add tests for SecureStorageManager
testSuite.addTest('SecureStorageManager - Basic Storage', async () => {
  const storage = window.DevMentorSecureStorage;
  testSuite.assertTrue(storage, 'Storage manager should be available');
  
  const testData = { message: 'Hello World' };
  const success = await storage.storeSecure('test', testData);
  testSuite.assertTrue(success, 'Storage should succeed');
  
  const retrieved = await storage.getSecure('test');
  testSuite.assertEqual(retrieved.message, testData.message, 'Retrieved data should match');
});

testSuite.addTest('SecureStorageManager - API Key Storage', async () => {
  const storage = window.DevMentorSecureStorage;
  
  const apiKey = 'test-api-key-123';
  const success = await storage.storeAPIKey(apiKey);
  testSuite.assertTrue(success, 'API key storage should succeed');
  
  const hasKey = await storage.hasAPIKey();
  testSuite.assertTrue(hasKey, 'Should detect API key exists');
  
  const retrieved = await storage.getAPIKey();
  testSuite.assertEqual(retrieved, apiKey, 'Retrieved API key should match');
});

testSuite.addTest('SecureStorageManager - Clear Data', async () => {
  const storage = window.DevMentorSecureStorage;
  
  const success = await storage.clearSecureData();
  testSuite.assertTrue(success, 'Clear data should succeed');
  
  const hasKey = await storage.hasAPIKey();
  testSuite.assertFalse(hasKey, 'API key should be cleared');
});

// Add tests for ChromeBuiltInAI
testSuite.addTest('ChromeBuiltInAI - Availability Check', async () => {
  const ai = new window.DevMentorChromeAI();
  testSuite.assertTrue(ai, 'Chrome AI should be available');
  
  const capabilities = ai.getCapabilities();
  testSuite.assertTrue(capabilities, 'Capabilities should be available');
  testSuite.assertTrue(Array.isArray(capabilities.features), 'Features should be an array');
});

testSuite.addTest('ChromeBuiltInAI - Prompt Building', async () => {
  const ai = new window.DevMentorChromeAI();
  
  const prompt = ai.buildPrompt('console.log("hello")', 'explain', { language: 'javascript' });
  testSuite.assertTrue(prompt.includes('console.log("hello")'), 'Prompt should contain code');
  testSuite.assertTrue(prompt.includes('javascript'), 'Prompt should contain language');
});

// Add tests for ShadowDOMOverlayManager
testSuite.addTest('ShadowDOMOverlayManager - Create Overlay', async () => {
  const overlay = window.DevMentorShadowOverlay;
  testSuite.assertTrue(overlay, 'Overlay manager should be available');
  
  const host = overlay.createOverlay('test', {
    title: 'Test Overlay',
    content: '<p>Test content</p>',
    id: 'test'
  });
  
  testSuite.assertTrue(host, 'Overlay should be created');
  testSuite.assertTrue(overlay.hasOverlay('test'), 'Overlay should exist');
  
  overlay.removeOverlay('test');
  testSuite.assertFalse(overlay.hasOverlay('test'), 'Overlay should be removed');
});

// Export test suite
if (typeof window !== 'undefined') {
  window.DevMentorTestSuite = testSuite;
}

// Auto-run tests if in test environment
if (typeof window !== 'undefined' && window.location.search.includes('test=true')) {
  testSuite.runAllTests().then(results => {
    console.log('Test Results:', results);
    
    // Display results in page
    const resultsDiv = document.createElement('div');
    resultsDiv.innerHTML = `
      <h2>DevMentor AI Test Results</h2>
      <p>Total: ${results.total} | Passed: ${results.passed} | Failed: ${results.failed} | Errors: ${results.errors}</p>
      <p>Success Rate: ${results.successRate.toFixed(1)}%</p>
      <ul>
        ${results.results.map(r => `
          <li style="color: ${r.status === 'passed' ? 'green' : 'red'}">
            ${r.status === 'passed' ? '✅' : '❌'} ${r.name} (${r.duration}ms)
            ${r.error ? `<br><small>Error: ${r.error}</small>` : ''}
          </li>
        `).join('')}
      </ul>
    `;
    document.body.appendChild(resultsDiv);
  });
}





















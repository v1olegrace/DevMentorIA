/**
 * DevMentor AI - Test Script for Hackathon
 * Script de teste para validar se a extensão está funcionando corretamente
 */

class DevMentorTester {
  constructor() {
    this.testResults = [];
    this.passedTests = 0;
    this.failedTests = 0;
  }

  async runAllTests() {
    console.log('🧪 [DevMentorTester] Starting comprehensive tests...');
    
    try {
      // Test 1: Manifest validation
      await this.testManifest();
      
      // Test 2: Service Worker initialization
      await this.testServiceWorker();
      
      // Test 3: Chrome AI fallback
      await this.testChromeAIFallback();
      
      // Test 4: Security fixes
      await this.testSecurityFixes();
      
      // Test 5: Content scripts
      await this.testContentScripts();
      
      // Test 6: UI components
      await this.testUIComponents();
      
      // Show results
      this.showResults();
      
    } catch (error) {
      console.error('❌ [DevMentorTester] Test suite failed:', error);
    }
  }

  async testManifest() {
    console.log('📋 Testing manifest.json...');
    
    try {
      // Check if manifest is valid JSON
      const manifest = chrome.runtime.getManifest();
      
      if (!manifest) {
        throw new Error('Manifest not found');
      }

      // Check required fields
      const requiredFields = ['name', 'version', 'manifest_version', 'permissions'];
      for (const field of requiredFields) {
        if (!manifest[field]) {
          throw new Error(`Required field missing: ${field}`);
        }
      }

      // Check content scripts
      if (!manifest.content_scripts || manifest.content_scripts.length === 0) {
        throw new Error('Content scripts not configured');
      }

      // Check web accessible resources
      if (!manifest.web_accessible_resources || manifest.web_accessible_resources.length === 0) {
        throw new Error('Web accessible resources not configured');
      }

      this.addTestResult('Manifest Validation', true, 'All required fields present');
      
    } catch (error) {
      this.addTestResult('Manifest Validation', false, error.message);
    }
  }

  async testServiceWorker() {
    console.log('⚙️ Testing Service Worker...');
    
    try {
      // Test if service worker is responding
      const response = await chrome.runtime.sendMessage({ action: 'keep-alive' });
      
      if (!response || !response.success) {
        throw new Error('Service worker not responding');
      }

      // Test Chrome AI initialization
      const aiResponse = await chrome.runtime.sendMessage({ 
        action: 'explain-code', 
        code: 'console.log("test");',
        context: { url: 'https://github.com/test' }
      });

      if (!aiResponse) {
        throw new Error('Chrome AI not responding');
      }

      this.addTestResult('Service Worker', true, 'Service worker responding correctly');
      
    } catch (error) {
      this.addTestResult('Service Worker', false, error.message);
    }
  }

  async testChromeAIFallback() {
    console.log('🤖 Testing Chrome AI Fallback...');
    
    try {
      // Test fallback explanation
      const response = await chrome.runtime.sendMessage({ 
        action: 'explain-code', 
        code: 'function test() { return "hello"; }',
        context: { url: 'https://github.com/test' }
      });

      if (!response.success) {
        throw new Error('Chrome AI fallback failed');
      }

      // Check if response has fallback indicators
      const data = response.data;
      if (data.source === 'fallback' || data.note) {
        this.addTestResult('Chrome AI Fallback', true, 'Fallback working correctly');
      } else {
        this.addTestResult('Chrome AI Fallback', true, 'Chrome AI working (not fallback)');
      }
      
    } catch (error) {
      this.addTestResult('Chrome AI Fallback', false, error.message);
    }
  }

  async testSecurityFixes() {
    console.log('🔒 Testing Security Fixes...');
    
    try {
      // Test if security fixes are loaded
      if (typeof window.__DEVMENTOR_SECURITY === 'undefined') {
        throw new Error('Security fixes not loaded');
      }

      // Run security validation
      const securityCheck = window.__DEVMENTOR_SECURITY.validateSecurity();
      
      if (!securityCheck.secure) {
        console.warn('⚠️ Security issues found:', securityCheck.issues);
      }

      // Test eval blocking
      try {
        eval('1+1');
        throw new Error('eval() should be blocked');
      } catch (error) {
        if (error.name === 'SecurityError') {
          // eval is blocked - good
        } else {
          throw error;
        }
      }

      // Test Function constructor blocking
      try {
        new Function('return 1+1')();
        throw new Error('Function constructor should be blocked');
      } catch (error) {
        if (error.name === 'SecurityError') {
          // Function constructor is blocked - good
        } else {
          throw error;
        }
      }

      this.addTestResult('Security Fixes', true, 'Security measures active');
      
    } catch (error) {
      this.addTestResult('Security Fixes', false, error.message);
    }
  }

  async testContentScripts() {
    console.log('📄 Testing Content Scripts...');
    
    try {
      // Check if content script is injected
      if (!window.__DEVMENTOR_CONTENT_SCRIPT_INJECTED__) {
        throw new Error('Content script not injected');
      }

      // Test if UI manager is available
      if (typeof window.DevMentorUIManager === 'undefined') {
        throw new Error('UI Manager not available');
      }

      // Test if helpers are available
      if (typeof window.DevMentorHelpers === 'undefined') {
        throw new Error('Helpers not available');
      }

      this.addTestResult('Content Scripts', true, 'Content scripts loaded correctly');
      
    } catch (error) {
      this.addTestResult('Content Scripts', false, error.message);
    }
  }

  async testUIComponents() {
    console.log('🎨 Testing UI Components...');
    
    try {
      // Test if popup loads
      const popupResponse = await fetch(chrome.runtime.getURL('popup.html'));
      
      if (!popupResponse.ok) {
        throw new Error('Popup HTML not accessible');
      }

      // Test if options page loads
      const optionsResponse = await fetch(chrome.runtime.getURL('options.html'));
      
      if (!optionsResponse.ok) {
        throw new Error('Options HTML not accessible');
      }

      // Test if CSS files are accessible
      const cssResponse = await fetch(chrome.runtime.getURL('style.css'));
      
      if (!cssResponse.ok) {
        throw new Error('CSS files not accessible');
      }

      this.addTestResult('UI Components', true, 'All UI components accessible');
      
    } catch (error) {
      this.addTestResult('UI Components', false, error.message);
    }
  }

  addTestResult(testName, passed, message) {
    const result = {
      test: testName,
      passed: passed,
      message: message,
      timestamp: new Date().toISOString()
    };
    
    this.testResults.push(result);
    
    if (passed) {
      this.passedTests++;
      console.log(`✅ ${testName}: ${message}`);
    } else {
      this.failedTests++;
      console.log(`❌ ${testName}: ${message}`);
    }
  }

  showResults() {
    console.log('\n🏆 [DevMentorTester] Test Results Summary:');
    console.log(`✅ Passed: ${this.passedTests}`);
    console.log(`❌ Failed: ${this.failedTests}`);
    console.log(`📊 Total: ${this.testResults.length}`);
    
    const successRate = (this.passedTests / this.testResults.length) * 100;
    console.log(`📈 Success Rate: ${successRate.toFixed(1)}%`);
    
    if (this.failedTests === 0) {
      console.log('🎉 All tests passed! Extension is ready for hackathon!');
    } else {
      console.log('⚠️ Some tests failed. Check the issues above.');
    }
    
    // Store results for debugging
    window.__DEVMENTOR_TEST_RESULTS__ = {
      results: this.testResults,
      passed: this.passedTests,
      failed: this.failedTests,
      successRate: successRate,
      timestamp: new Date().toISOString()
    };
  }
}

// Auto-run tests when script loads
if (typeof window !== 'undefined') {
  window.DevMentorTester = DevMentorTester;
  
  // Run tests after a short delay to ensure everything is loaded
  setTimeout(() => {
    const tester = new DevMentorTester();
    tester.runAllTests();
  }, 1000);
}

console.log('[DevMentorTester] ✅ Test script loaded successfully');






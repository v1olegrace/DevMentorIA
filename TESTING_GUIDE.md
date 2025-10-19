# 🧪 DevMentor AI - Testing Guide

## Quick Start Testing

### 1. Load the Extension

1. Open Chrome (version 127+ required)
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked"
5. Select the `devmentor-ai` folder
6. The extension should now be loaded!

### 2. Enable Chrome Built-in AI (Required)

Before testing, you MUST enable Chrome's Built-in AI features:

1. Open `chrome://flags`
2. Search for and enable these flags:
   - `#optimization-guide-on-device-model` → **Enabled**
   - `#prompt-api-for-gemini-nano` → **Enabled**
   - `#summarization-api-for-gemini-nano` → **Enabled**
   - `#writer-rewriter-api-for-gemini-nano` → **Enabled**
3. Click "Relaunch" at the bottom
4. Wait 5-10 minutes for Gemini Nano to download (happens in background)

### 3. Verify Model Status

Open DevTools Console and run:

```javascript
// Check Prompt API (Gemini Nano)
const promptStatus = await window.ai.languageModel.capabilities();
console.log('Prompt API:', promptStatus.available); // Should be 'readily'

// Check Summarization API
const summarizerStatus = await window.ai.summarizer.capabilities();
console.log('Summarization API:', summarizerStatus.available);

// Check Write API
const writerStatus = await window.ai.writer.capabilities();
console.log('Write API:', writerStatus.available);

// Check Rewrite API
const rewriterStatus = await window.ai.rewriter.capabilities();
console.log('Rewrite API:', rewriterStatus.available);
```

Expected output: All should show `'readily'` or `'after-download'`

---

## Testing Methods

### Method 1: Automated Test Suite (Recommended)

Open the test HTML file:

1. Navigate to: `chrome-extension://<YOUR-EXTENSION-ID>/test-hybrid-architecture.html`
2. Or right-click the extension icon → "Inspect" → Navigate to the test page

The test suite includes:

- **System Status Check** - Verify initialization
- **Chrome Built-in AI Tests** - Test all 4 APIs
- **Code Analysis Features** - Test explain, debug, document, refactor, review
- **Educational Features** - Test enhanced FREE tier capabilities
- **Premium Features** - Test PRO/ENTERPRISE tier features
- **Performance Metrics** - Measure response times
- **Tier Management** - Test subscription upgrades
- **Full Integration Test** - Run all tests at once

### Method 2: Browser Console Testing

Open any supported website (GitHub, StackOverflow, etc.) and run:

```javascript
// Test System Status
chrome.runtime.sendMessage(
  { action: 'get-status' },
  (response) => console.log('Status:', response)
);

// Test Code Explanation (Prompt API)
chrome.runtime.sendMessage({
  action: 'explain-code',
  code: 'function add(a, b) { return a + b; }',
  context: { language: 'javascript' }
}, (response) => console.log('Explanation:', response));

// Test Documentation Generation (Write API)
chrome.runtime.sendMessage({
  action: 'generate-documentation',
  code: 'function multiply(x, y) { return x * y; }',
  context: { language: 'javascript', style: 'jsdoc' }
}, (response) => console.log('Documentation:', response));

// Test Code Refactoring (Rewrite API)
chrome.runtime.sendMessage({
  action: 'refactor-code',
  code: 'var x = 5; var y = 10;',
  context: { language: 'javascript', goals: ['modern-syntax'] }
}, (response) => console.log('Refactored:', response));

// Check Capabilities
chrome.runtime.sendMessage(
  { action: 'get-capabilities' },
  (response) => console.log('Capabilities:', response)
);
```

### Method 3: UI Testing (In-Context)

1. Visit a code-heavy website (e.g., GitHub repository)
2. Select some code on the page
3. Use keyboard shortcuts:
   - `Ctrl+Shift+E` (Mac: `Cmd+Shift+E`) - Explain Code
   - `Ctrl+Shift+B` (Mac: `Cmd+Shift+B`) - Debug Code
   - `Ctrl+Shift+G` (Mac: `Cmd+Shift+G`) - Generate Documentation
   - `Ctrl+Shift+R` (Mac: `Cmd+Shift+R`) - Refactor Code
4. Check the DevMentor AI panel that appears

---

## Test Scenarios

### Scenario 1: Basic Code Explanation (FREE Tier)

**Test:** Explain simple code
**Expected:** Quick, educational explanation using Chrome Built-in AI

```javascript
// Test Code
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Expected Result
{
  success: true,
  data: {
    core: {
      explanation: "Detailed educational explanation...",
      provider: "Chrome Prompt API (Gemini Nano)",
      processingTime: 1234
    },
    tier: "free"
  }
}
```

### Scenario 2: Complex Code Teaching (Enhanced FREE Tier)

**Test:** Explain complex code with educational mode
**Expected:** Comprehensive teaching with concepts, analogies, best practices

```javascript
// Test Code
class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  emit(event, ...args) {
    if (this.events[event]) {
      this.events[event].forEach(listener => listener(...args));
    }
  }
}

// Expected Result
{
  core: {
    explanation: "
      🎯 What & Why (Big Picture)
      This implements the Observer Pattern...

      🧠 Core Concepts (Deep Understanding)
      1. Event-driven architecture...

      📖 Line-by-Line Teaching...

      💡 Real-World Analogy...

      ⚠️ Common Mistakes...

      🚀 Next Steps...
    "
  }
}
```

### Scenario 3: Debugging Buggy Code

**Test:** Debug code with potential issues
**Expected:** Identify bugs, suggest fixes

```javascript
// Test Code
function divide(a, b) {
  return a / b;  // No zero check!
}

// Expected Result
{
  core: {
    debugInfo: "
      🐛 Issues Found:
      1. Missing zero division check
      2. No input validation

      🔧 Suggested Fixes:
      - Add if (b === 0) check
      - Throw error or return null
      - Add parameter validation
    "
  }
}
```

### Scenario 4: Upgrading to PRO Tier

**Test:** Upgrade tier and access premium features
**Expected:** Tier upgrade + access to Gemini Pro enhancements

```javascript
// Upgrade
chrome.runtime.sendMessage(
  { action: 'upgrade-tier', tier: 'PRO' },
  (response) => console.log(response)
);

// Now test enhanced explanation
chrome.runtime.sendMessage({
  action: 'explain-code',
  code: 'function test() { ... }',
  context: {}
}, (response) => {
  console.log(response.data.core);      // Chrome Built-in AI
  console.log(response.data.enhanced);  // Gemini Pro enhancement (now available!)
});
```

---

## Performance Benchmarks

### Expected Performance (Chrome Built-in AI)

- **Simple Code Explanation:** 500-1000ms
- **Complex Code Explanation:** 1000-2000ms
- **Documentation Generation:** 800-1500ms
- **Code Refactoring:** 1000-2000ms
- **Bug Detection:** 1000-1800ms

### Comparison: OLD vs NEW Architecture

| Metric | OLD (External API) | NEW (Chrome Built-in AI) |
|--------|-------------------|--------------------------|
| Response Time | 2-5 seconds | 0.5-2 seconds |
| Offline Support | ❌ No | ✅ Yes |
| Privacy | ⚠️ Data sent externally | ✅ 100% on-device |
| Cost per Request | $0.001-0.01 | $0 (FREE!) |
| Requires Internet | ✅ Yes | ❌ No |

---

## Troubleshooting

### Issue: "Chrome Built-in AI not available"

**Cause:** Gemini Nano not downloaded or flags not enabled

**Solution:**
1. Check `chrome://flags` - ensure all 4 flags are enabled
2. Check `chrome://components` - look for "Optimization Guide On Device Model"
3. Wait 5-10 minutes after enabling flags
4. Restart Chrome

### Issue: API returns "after-download"

**Cause:** Model is still downloading

**Solution:**
1. Wait for download to complete
2. Check progress in `chrome://components`
3. Ensure stable internet connection

### Issue: "Session creation failed"

**Cause:** Too many concurrent sessions

**Solution:**
1. Reload the extension
2. Close other tabs using Chrome AI
3. Wait 30 seconds and retry

### Issue: Slow responses

**Cause:** Large code input or system resources

**Solution:**
1. Break code into smaller chunks
2. Close resource-intensive applications
3. Check if model is still initializing

---

## Debugging Tools

### Service Worker Logs

1. Go to `chrome://extensions/`
2. Click "Service Worker" link under DevMentor AI
3. View console logs for detailed information

Look for:
- `[ChromeBuiltInAI] ✅ All APIs initialized successfully`
- `[HybridArchitecture] ✅ Initialized`
- API call traces with timing information

### Check Extension State

```javascript
// In service worker context (chrome://extensions → Service Worker)
console.log('AI Architecture:', swCore.aiArchitecture);
console.log('Status:', await swCore.aiArchitecture.getStatus());
console.log('Stats:', swCore.aiArchitecture.stats);
```

### Check Chrome AI Availability

```javascript
// In any page context
console.log('AI Available:', 'ai' in window);
console.log('APIs:', {
  languageModel: 'languageModel' in window.ai,
  summarizer: 'summarizer' in window.ai,
  writer: 'writer' in window.ai,
  rewriter: 'rewriter' in window.ai
});
```

---

## Test Checklist for Hackathon Submission

- [ ] Extension loads without errors
- [ ] All 4 Chrome Built-in AI APIs are available
- [ ] Code explanation works (Prompt API)
- [ ] Documentation generation works (Write API)
- [ ] Code refactoring works (Rewrite API)
- [ ] Summarization works (Summarization API)
- [ ] FREE tier is powerful and educational
- [ ] Tier upgrades work (PRO, ENTERPRISE)
- [ ] Performance is under 2 seconds for most operations
- [ ] Works offline (after model download)
- [ ] No external API calls for core features
- [ ] Privacy: All processing is on-device
- [ ] Error handling works gracefully
- [ ] Circuit breakers prevent cascading failures
- [ ] UI is responsive and user-friendly
- [ ] Keyboard shortcuts work

---

## Automated Testing Script

```javascript
// Run this in the test-hybrid-architecture.html console

async function runFullHackathonTest() {
  console.log('🚀 Starting Full Hackathon Test Suite...\n');

  const tests = [
    {
      name: '1. System Status',
      fn: async () => {
        const response = await new Promise(resolve =>
          chrome.runtime.sendMessage({ action: 'get-status' }, resolve)
        );
        return response.success && response.data.initialized;
      }
    },
    {
      name: '2. Prompt API (Explain Code)',
      fn: async () => {
        const response = await new Promise(resolve =>
          chrome.runtime.sendMessage({
            action: 'explain-code',
            code: 'function test() { return 42; }',
            context: {}
          }, resolve)
        );
        return response.success && response.data.core;
      }
    },
    {
      name: '3. Write API (Generate Docs)',
      fn: async () => {
        const response = await new Promise(resolve =>
          chrome.runtime.sendMessage({
            action: 'generate-documentation',
            code: 'function test() { return 42; }',
            context: {}
          }, resolve)
        );
        return response.success;
      }
    },
    {
      name: '4. Rewrite API (Refactor)',
      fn: async () => {
        const response = await new Promise(resolve =>
          chrome.runtime.sendMessage({
            action: 'refactor-code',
            code: 'var x = 5;',
            context: {}
          }, resolve)
        );
        return response.success;
      }
    },
    {
      name: '5. Debug Code',
      fn: async () => {
        const response = await new Promise(resolve =>
          chrome.runtime.sendMessage({
            action: 'debug-code',
            code: 'function bad() { return 1/0; }',
            context: {}
          }, resolve)
        );
        return response.success;
      }
    },
    {
      name: '6. Educational Mode (Complex)',
      fn: async () => {
        const response = await new Promise(resolve =>
          chrome.runtime.sendMessage({
            action: 'explain-code',
            code: 'class Observer { constructor() { this.listeners = []; } }',
            context: { educationalMode: true }
          }, resolve)
        );
        return response.success && response.data.core.explanation.length > 100;
      }
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        console.log(`✅ ${test.name} - PASSED`);
        passed++;
      } else {
        console.log(`❌ ${test.name} - FAILED`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} - ERROR: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Results: ${passed}/${tests.length} tests passed`);

  if (passed === tests.length) {
    console.log('🎉 ALL TESTS PASSED! Ready for hackathon submission!');
  } else {
    console.log(`⚠️ ${failed} test(s) failed. Please review.`);
  }
}

// Run the test
runFullHackathonTest();
```

---

## Next Steps After Testing

1. **Create Demo Video** (3 minutes max)
   - Show extension installation
   - Demonstrate all 4 Chrome Built-in AI APIs
   - Showcase FREE tier educational features
   - Show tier upgrades (PRO/ENTERPRISE)
   - Highlight privacy and offline capabilities

2. **Prepare Devpost Submission**
   - Project description
   - Technical details
   - Hackathon alignment explanation
   - Screenshots/GIFs
   - GitHub repository link

3. **GitHub Repository**
   - Make repository public
   - Add comprehensive README
   - Include installation instructions
   - Document Chrome Built-in AI requirements
   - Add license

4. **Final Checks**
   - Test on fresh Chrome installation
   - Verify all features work
   - Check performance benchmarks
   - Ensure no console errors
   - Test on multiple websites

---

## Support

If you encounter any issues during testing:

1. Check the [ARCHITECTURE_UPGRADE.md](./ARCHITECTURE_UPGRADE.md) document
2. Review service worker logs
3. Verify Chrome version (need 127+)
4. Ensure Gemini Nano is downloaded
5. Check Chrome flags are enabled

---

**🎯 Ready to win the hackathon!** This testing guide ensures DevMentor AI works perfectly and showcases Chrome Built-in AI at its best.

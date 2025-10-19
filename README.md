# 🚀 DevMentor AI - Your Personal Code Learning Assistant

<div align="center">

**AI-powered coding mentor that teaches you to understand complex code, right in your browser**

[![Chrome 127+](https://img.shields.io/badge/Chrome-127%2B-blue.svg)](https://www.google.com/chrome/)
[![Chrome Built-in AI](https://img.shields.io/badge/Chrome%20Built--in%20AI-Gemini%20Nano-green.svg)](https://developer.chrome.com/docs/ai/built-in)
[![Privacy First](https://img.shields.io/badge/Privacy-100%25%20On--Device-orange.svg)](https://developer.chrome.com/docs/ai/built-in)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Architecture](#-architecture) • [Demo](#-demo)

</div>

---

## 🎯 What is DevMentor AI?

DevMentor AI is a Chrome extension that helps developers understand complex code they encounter on GitHub, StackOverflow, MDN, and other platforms. It doesn't just explain code - it **teaches** you to understand it.

### 🌟 Key Highlights

- 🧠 **Educational Approach** - Teaches concepts, not just descriptions
- 🔒 **100% Private** - All processing happens on-device with Chrome's Built-in AI
- ⚡ **Lightning Fast** - Sub-2-second responses
- 🌐 **Works Offline** - No internet required after model download
- 🆓 **Genuinely Free** - Powerful FREE tier with all core features
- 🎨 **4 Chrome AI APIs** - Uses Prompt, Summarization, Write, and Rewrite APIs

---

## ✨ Features

### Core Features (FREE - Chrome Built-in AI)

| Feature | Description | API Used |
|---------|-------------|----------|
| **Code Explanation** | Comprehensive teaching with concepts, analogies, and best practices | Prompt API |
| **Bug Detection** | Identify potential issues and get suggestions for fixes | Prompt API |
| **Documentation Generation** | Auto-generate JSDoc/comments from code | Write API |
| **Code Refactoring** | Get suggestions to improve code quality | Rewrite API |
| **Code Review** | Comprehensive code review with actionable feedback | Prompt API |
| **Quick Summaries** | Get instant overviews of code functionality | Summarization API |

### Educational Features (Enhanced FREE Tier)

- 🎓 **Deep Analysis** - Understand complex patterns and architectures
- 💡 **Concept Extraction** - Learn the underlying programming concepts
- 🔍 **Pattern Detection** - Recognize common design patterns
- 📚 **Learning Paths** - Get suggestions for what to learn next
- 🎯 **Real-World Analogies** - Memorable explanations that stick

### Premium Features (PRO/ENTERPRISE)

- 🎥 **AI Video Lessons** - Generated video tutorials for complex topics
- 📊 **Interactive Diagrams** - Visual representations of code flow
- 📝 **Personalized Quizzes** - Test your understanding
- 📖 **Academic Citations** - Proper references for learning materials
- 📈 **Learning Analytics** - Track your progress over time
- 👥 **Team Collaboration** - Share insights with your team (ENTERPRISE)

---

## 🚀 Installation

### Prerequisites

- **Chrome 127+** (Check: `chrome://version`)
- **Chrome Built-in AI** enabled (see setup below)

### Step 1: Enable Chrome Built-in AI

1. Open `chrome://flags` in Chrome
2. Search for and enable these flags:
   - `#optimization-guide-on-device-model` → **Enabled**
   - `#prompt-api-for-gemini-nano` → **Enabled**
   - `#summarization-api-for-gemini-nano` → **Enabled**
   - `#writer-rewriter-api-for-gemini-nano` → **Enabled**
3. Click **"Relaunch"** at the bottom
4. Wait 5-10 minutes for Gemini Nano model to download

### Step 2: Verify Model Status

Open DevTools Console and run:

```javascript
const status = await window.ai.languageModel.capabilities();
console.log('Gemini Nano Status:', status.available); // Should be 'readily'
```

### Step 3: Install Extension

#### Option A: From Source (Recommended for Development)

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/devmentor-ai.git
   cd devmentor-ai
   ```

2. Load the extension:
   - Open `chrome://extensions/`
   - Enable **"Developer mode"** (top right)
   - Click **"Load unpacked"**
   - Select the `devmentor-ai` folder

#### Option B: From Chrome Web Store (Coming Soon)

Will be available after hackathon submission.

---

## 📖 Usage

### Quick Start

1. Visit any code-heavy website (GitHub, StackOverflow, etc.)
2. Select some code on the page
3. Use keyboard shortcuts or context menu:

| Action | Windows/Linux | Mac | Context Menu |
|--------|---------------|-----|--------------|
| **Explain Code** | `Ctrl+Shift+E` | `Cmd+Shift+E` | Right-click → DevMentor AI |
| **Debug Code** | `Ctrl+Shift+B` | `Cmd+Shift+B` | Right-click → Debug with AI |
| **Generate Docs** | `Ctrl+Shift+G` | `Cmd+Shift+G` | Right-click → Generate Docs |
| **Refactor Code** | `Ctrl+Shift+R` | `Cmd+Shift+R` | Right-click → Refactor Code |

### Examples

#### Example 1: Explain Complex Code

**Input:**
```javascript
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
```

**Output:**
```
🎯 What & Why (Big Picture)
This implements the Observer Pattern, allowing objects to subscribe to
and receive notifications about events.

🧠 Core Concepts (Deep Understanding)
1. Event-Driven Architecture - Decouples event producers from consumers
2. Observer Pattern - Classic design pattern for publish-subscribe systems
3. Dynamic Event Registration - Events don't need to be predefined

📖 Line-by-Line Teaching
- constructor(): Initializes empty event registry
- on(event, listener): Subscribes listener to event
- emit(event, ...args): Notifies all listeners of event

💡 Real-World Analogy
Like subscribing to a YouTube channel - you get notified when
new content (events) is published.

⚠️ Common Mistakes
- Memory leaks if listeners aren't removed
- No error handling if listener throws
- No way to unsubscribe (missing off() method)

🚀 Next Steps
- Learn about: Node.js EventEmitter, RxJS Observables
- Try implementing: removeListener(), once(), listenerCount()
```

#### Example 2: Debug Buggy Code

**Input:**
```javascript
function divide(a, b) {
  return a / b;
}

const result = divide(10, 0);
console.log(result); // Infinity
```

**Output:**
```
🐛 Issues Found:

1. CRITICAL: Missing Zero Division Check
   Severity: High
   Line: return a / b
   Issue: Division by zero returns Infinity, not an error
   Fix: Add check: if (b === 0) throw new Error('Division by zero')

2. WARNING: No Input Validation
   Severity: Medium
   Issue: Accepts non-numeric inputs (NaN results)
   Fix: Add type checking at function start

3. SUGGESTION: Add JSDoc Documentation
   Severity: Low
   Fix: Document parameters and return value

✅ Suggested Refactor:
function divide(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new TypeError('Parameters must be numbers');
  }
  if (b === 0) {
    throw new Error('Division by zero is not allowed');
  }
  return a / b;
}
```

---

## 🏗️ Architecture

DevMentor AI uses a sophisticated **Hybrid Architecture** that combines Chrome Built-in AI (core) with optional premium enhancements.

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Service Worker                          │
│                  (sw-loader-hybrid.js)                      │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  Hybrid Architecture                        │
│              (hybrid-architecture.js)                       │
│                                                             │
│  ┌──────────────────────┐      ┌──────────────────────┐  │
│  │  Chrome Built-in AI  │      │  Premium Features    │  │
│  │       (Core)         │      │    (Optional)        │  │
│  │                      │      │                      │  │
│  │ • Prompt API         │      │ • Gemini Pro        │  │
│  │ • Summarization API  │      │ • Video Generator   │  │
│  │ • Write API          │      │ • Diagram Generator │  │
│  │ • Rewrite API        │      │ • Quiz Generator    │  │
│  └──────────────────────┘      └──────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Key Components

1. **ChromeBuiltInAIIntegration** ([chrome-builtin-ai-integration.js](background/modules/chrome-builtin-ai-integration.js))
   - Implements all 4 Chrome Built-in AI APIs
   - Circuit breakers for fault tolerance
   - Timeout protection
   - Session management

2. **HybridArchitecture** ([hybrid-architecture.js](background/modules/hybrid-architecture.js))
   - Orchestrates core and premium features
   - Manages subscription tiers (FREE/PRO/ENTERPRISE)
   - Usage tracking and limits
   - Graceful degradation

3. **Service Worker** ([sw-loader-hybrid.js](background/sw-loader-hybrid.js))
   - Message routing
   - Event handling
   - State management

### Data Flow

```
User Action → Content Script → Service Worker → HybridArchitecture
                                                      ↓
                                          Chrome Built-in AI (Core)
                                                      ↓
                                          Response Processing
                                                      ↓
                                          Optional Premium Enhancement
                                                      ↓
                                          Return to User
```

---

## 🎓 Chrome Built-in AI APIs

DevMentor AI showcases **all four** Chrome Built-in AI APIs:

### 1. Prompt API (Gemini Nano)

**Used for:** Code explanation, debugging, code review

```javascript
const model = await window.ai.languageModel.create();
const result = await model.prompt('Explain this code...');
```

**Features:**
- Streaming responses
- Context window: 4096 tokens
- Temperature control
- Top-K sampling

### 2. Summarization API

**Used for:** Quick code overviews, concept extraction

```javascript
const summarizer = await window.ai.summarizer.create({
  type: 'key-points',
  length: 'short'
});
const summary = await summarizer.summarize(code);
```

**Options:**
- Type: `key-points`, `tl;dr`, `headline`
- Length: `short`, `medium`, `long`

### 3. Write API

**Used for:** Documentation generation, code comments

```javascript
const writer = await window.ai.writer.create({
  tone: 'formal',
  format: 'markdown',
  length: 'medium'
});
const docs = await writer.write('Generate docs for...');
```

**Capabilities:**
- Multiple tones (formal, casual, neutral)
- Format control (markdown, plain, HTML)
- Length adjustment

### 4. Rewrite API

**Used for:** Code refactoring, optimization suggestions

```javascript
const rewriter = await window.ai.rewriter.create({
  tone: 'as-is',
  format: 'as-is',
  length: 'as-is'
});
const refactored = await rewriter.rewrite(code, {
  context: 'Improve readability and performance'
});
```

**Options:**
- Preserve structure or rewrite
- Style adjustments
- Context-aware rewriting

---

## 🧪 Testing

We provide a comprehensive test suite:

### Automated Testing

1. Open test page: `chrome-extension://<YOUR-EXTENSION-ID>/test-hybrid-architecture.html`
2. Click **"Run Complete Test Suite"**
3. Verify all tests pass

### Manual Testing

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for detailed testing instructions.

### Test Coverage

- ✅ System initialization
- ✅ All 4 Chrome Built-in AI APIs
- ✅ Code explanation (simple and complex)
- ✅ Bug detection
- ✅ Documentation generation
- ✅ Code refactoring
- ✅ Educational features
- ✅ Tier management
- ✅ Performance benchmarks
- ✅ Error handling
- ✅ Offline functionality

---

## 📊 Performance

### Benchmarks

| Operation | Average Time | API Used |
|-----------|-------------|----------|
| Simple Code Explanation | 500-1000ms | Prompt API |
| Complex Code Explanation | 1000-2000ms | Prompt API |
| Documentation Generation | 800-1500ms | Write API |
| Code Refactoring | 1000-2000ms | Rewrite API |
| Bug Detection | 1000-1800ms | Prompt API |
| Quick Summary | 300-600ms | Summarization API |

### Comparison: External API vs Chrome Built-in AI

| Metric | External API | Chrome Built-in AI |
|--------|-------------|-------------------|
| Response Time | 2-5 seconds | 0.5-2 seconds |
| Offline Support | ❌ No | ✅ Yes |
| Privacy | ⚠️ Data sent externally | ✅ 100% on-device |
| Cost per Request | $0.001-0.01 | $0 (FREE!) |
| Internet Required | ✅ Yes | ❌ No |
| Rate Limits | ✅ Yes | ❌ No |

---

## 🔒 Privacy & Security

### Privacy-First Design

- ✅ **100% On-Device Processing** - All AI inference happens locally
- ✅ **No Data Collection** - We don't collect, store, or transmit your code
- ✅ **No External API Calls** - Core features work without internet
- ✅ **No Tracking** - No analytics, no telemetry
- ✅ **Open Source** - Audit the code yourself

### Security Features

- Content Security Policy (CSP) enforcement
- Manifest V3 compliance
- Minimum permissions required
- No `eval()` or unsafe code execution
- Regular security audits

---

## 💰 Pricing

### FREE (Chrome Built-in AI)

**$0/month**

- ✅ 1000 explanations/day (effectively unlimited)
- ✅ All core features
- ✅ Deep code analysis
- ✅ Educational mode
- ✅ Bug detection
- ✅ Documentation generation
- ✅ Code refactoring
- ✅ Works offline
- ✅ 100% private

### PRO

**$9.99/month**

- ✅ Everything in FREE
- ✅ Unlimited requests
- ✅ Enhanced with Gemini Pro
- ✅ AI video lessons
- ✅ Interactive diagrams
- ✅ Personalized quizzes
- ✅ Academic citations
- ✅ Learning analytics
- ✅ Priority support

### ENTERPRISE

**$29.99/month**

- ✅ Everything in PRO
- ✅ Team collaboration
- ✅ Advanced analytics
- ✅ Custom integrations
- ✅ SSO support
- ✅ Dedicated support
- ✅ SLA guarantee

---

## 🛠️ Development

### Setup

```bash
# Clone repository
git clone https://github.com/yourusername/devmentor-ai.git
cd devmentor-ai

# No build step required - pure JavaScript!
```

### Project Structure

```
devmentor-ai/
├── background/
│   ├── modules/
│   │   ├── chrome-builtin-ai-integration.js  # Core Chrome AI
│   │   ├── hybrid-architecture.js            # Orchestrator
│   │   └── chrome-ai.js                      # Legacy (deprecated)
│   └── sw-loader-hybrid.js                   # Service Worker
├── content/
│   ├── content-script.js                     # Main content script
│   ├── ui-manager.js                         # UI components
│   ├── code-analyzer.js                      # Code detection
│   └── ...
├── assets/
│   ├── icons/                                # Extension icons
│   └── styles/                               # CSS files
├── manifest.json                             # Extension config
├── ARCHITECTURE_UPGRADE.md                   # Architecture docs
├── TESTING_GUIDE.md                          # Testing instructions
├── HACKATHON_SUBMISSION_CHECKLIST.md        # Submission guide
└── README.md                                 # This file
```

---

## 📚 Documentation

- [Architecture Upgrade Guide](./ARCHITECTURE_UPGRADE.md) - Detailed architecture explanation
- [Testing Guide](./TESTING_GUIDE.md) - Comprehensive testing instructions
- [Hackathon Checklist](./HACKATHON_SUBMISSION_CHECKLIST.md) - Submission guide
- [Chrome Built-in AI Docs](https://developer.chrome.com/docs/ai/built-in) - Official API docs

---

## 🎬 Demo

📹 **Demo Video Coming Soon**

**Video will showcase:**
- Extension installation and setup
- Live demo of all 4 Chrome Built-in AI APIs
- Educational features showcase
- Privacy and offline capabilities
- Performance demonstration

---

## 🏆 Hackathon

This project was built for the **Chrome Built-in AI Hackathon**.

### Hackathon Highlights

- ✅ Uses **ALL 4** Chrome Built-in AI APIs
- ✅ Solves real developer pain points
- ✅ Production-ready code quality
- ✅ Enterprise-grade architecture
- ✅ Clear monetization path
- ✅ Privacy-first approach
- ✅ Educational focus

---

## 🤝 Support

### Getting Help

- 📖 [Documentation](./ARCHITECTURE_UPGRADE.md)
- 🧪 [Testing Guide](./TESTING_GUIDE.md)
- 🐛 [Report Issues](https://github.com/yourusername/devmentor-ai/issues)

### FAQ

**Q: Why isn't Chrome Built-in AI working?**
A: Ensure you're using Chrome 127+, have enabled the required flags at `chrome://flags`, and have waited for Gemini Nano to download (5-10 minutes after enabling flags).

**Q: Does this work offline?**
A: Yes! After the initial Gemini Nano model download, all core features work completely offline.

**Q: Is my code sent to external servers?**
A: No! All AI processing happens on-device using Chrome's Built-in AI. Your code never leaves your machine.

**Q: What's the difference between FREE and PRO?**
A: FREE tier uses Chrome Built-in AI (Gemini Nano) on-device. PRO tier adds Gemini Pro enhancements and premium features like video lessons and diagrams.

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- Chrome team for building amazing Built-in AI APIs
- Gemini Nano for powering the on-device AI
- All contributors and testers

---

<div align="center">

**Built with ❤️ for developers, by developers**

**Powered by Chrome Built-in AI (Gemini Nano)**

[⬆ Back to Top](#-devmentor-ai---your-personal-code-learning-assistant)

</div>

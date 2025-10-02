# 📚 DevMentor AI - User Guide

> **Complete guide to using DevMentor AI Chrome Extension**

## Getting Started

### **Installation**

1. **Download Chrome Canary** (version 127+)
   - Visit [Chrome Canary](https://www.google.com/chrome/canary/)
   - Install the latest version

2. **Enable AI Flags**
   - Open Chrome Canary
   - Navigate to `chrome://flags/#optimization-guide-on-device-model`
   - Enable the flag
   - Restart Chrome

3. **Install DevMentor AI**
   - Download the extension from GitHub releases
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the extension folder

### **First Use**

1. **Visit a coding website** (GitHub, Stack Overflow, etc.)
2. **Select any code snippet**
3. **Right-click** and choose "Explain with DevMentor AI"
4. Watch the magic happen!

---

## Core Features

### **1. Code Explanation**

**What it does:** Provides educational explanations of code functionality

**How to use:**
1. Select code snippet
2. Right-click → "Explain Code"
3. Or use keyboard shortcut: `Ctrl+Shift+E`

**Example:**
```javascript
// Selected code
const users = await fetch('/api/users')
  .then(response => response.json())
  .catch(error => console.error(error));
```

**DevMentor AI Response:**
> This code fetches user data from an API endpoint. Here's what happens:
> 1. **fetch('/api/users')** - Makes HTTP request to users endpoint
> 2. **.then(response => response.json())** - Converts response to JavaScript object
> 3. **.catch(error => console.error(error))** - Handles any errors
> 
> **Best Practice:** Consider using async/await for cleaner code:
> ```javascript
> try {
>   const users = await fetch('/api/users').then(r => r.json());
> } catch (error) {
>   console.error('Failed to fetch users:', error);
> }
> ```

### **2. Bug Detection**

**What it does:** Identifies potential bugs and issues

**How to use:**
1. Select code snippet
2. Right-click → "Debug Code"
3. Or use keyboard shortcut: `Ctrl+Shift+D`

**Example:**
```javascript
// Selected code with potential bug
function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i <= items.length; i++) {
    total += items[i].price;
  }
  return total;
}
```

**DevMentor AI Response:**
> 🐛 **Bug Found:** Array index out of bounds
> 
> **Issue:** Loop condition `i <= items.length` will cause `items[items.length]` to be undefined
> 
> **Fix:** Change condition to `i < items.length`
> 
> **Corrected Code:**
> ```javascript
> function calculateTotal(items) {
>   let total = 0;
>   for (let i = 0; i < items.length; i++) {
>     total += items[i].price;
>   }
>   return total;
> }
> ```

### **3. Code Optimization**

**What it does:** Suggests performance improvements

**How to use:**
1. Select code snippet
2. Right-click → "Optimize Code"

**Example:**
```javascript
// Selected code
const expensiveOperation = (data) => {
  return data.map(item => {
    return item.value * 2;
  }).filter(item => item > 10);
};
```

**DevMentor AI Response:**
> Performance Optimization
> 
> **Current:** Two separate array iterations
> **Optimized:** Single iteration with reduce
> 
> **Improved Code:**
> ```javascript
> const expensiveOperation = (data) => {
>   return data.reduce((acc, item) => {
>     const doubled = item.value * 2;
>     if (doubled > 10) acc.push(doubled);
>     return acc;
>   }, []);
> };
> ```
> 
> **Performance Gain:** ~40% faster for large datasets

### **4. Documentation Generation**

**What it does:** Creates comprehensive documentation

**How to use:**
1. Select function or class
2. Right-click → "Generate Documentation"

**Example:**
```javascript
// Selected function
function processUserData(userData, options = {}) {
  const { includeInactive = false, sortBy = 'name' } = options;
  return userData
    .filter(user => includeInactive || user.active)
    .sort((a, b) => a[sortBy].localeCompare(b[sortBy]));
}
```

**DevMentor AI Response:**
> Generated Documentation
> 
> ```javascript
> /**
>  * Processes user data with filtering and sorting options
>  * 
>  * @param {Array<Object>} userData - Array of user objects
>  * @param {Object} options - Processing options
>  * @param {boolean} options.includeInactive - Include inactive users (default: false)
>  * @param {string} options.sortBy - Field to sort by (default: 'name')
>  * @returns {Array<Object>} Processed and sorted user data
>  * 
>  * @example
>  * const users = [
>  *   { name: 'John', active: true },
>  *   { name: 'Jane', active: false }
>  * ];
>  * const processed = processUserData(users, { includeInactive: true });
>  */
> ```

---

## 📷 **Screenshot Analysis**

### **Multimodal AI Processing**

**What it does:** Analyzes code from screenshots with image enhancement

**How to use:**
1. Press `Ctrl+Shift+S` or click screenshot icon in sidebar
2. Upload image or drag & drop
3. Wait for analysis

**Supported formats:**
- PNG, JPG, JPEG, WebP
- Screenshots of code
- Handwritten code
- Diagrams and flowcharts

**Example workflow:**
1. **Upload screenshot** of complex algorithm
2. **AI enhances image** for better OCR
3. **Extracts code** from image
4. **Analyzes and explains** the algorithm
5. **Provides optimization** suggestions

---

## Settings & Configuration

### **Accessing Settings**

1. Click extension icon in toolbar
2. Click "Settings" button
3. Or visit `chrome://extensions/` → DevMentor AI → Options

### **AI Configuration**

| Setting | Description | Options |
|---------|-------------|---------|
| **Auto-Analysis** | Automatically analyze selected code | On/Off |
| **Default Analysis Type** | Default mode for new selections | Explain/Debug/Optimize/Document |
| **Detail Level** | Explanation depth | Beginner/Intermediate/Expert |
| **Response Speed** | Balance speed vs. analysis depth | 1-5 (slower-faster) |

### **Privacy Settings**

| Setting | Description | Default |
|---------|-------------|---------|
| Local Processing | All analysis happens locally | On |
| **Analytics** | Anonymous usage data | ❌ Off |
| **Cache Duration** | How long to keep results | 24 hours |

### **Interface Preferences**

| Setting | Description | Options |
|---------|-------------|---------|
| **Sidebar Position** | Where sidebar appears | Right/Left/Bottom |
| **Theme** | Color scheme | Dark/Light/Auto |
| **Animations** | Enable transitions | On/Off |
| **Font Size** | Text size adjustment | 12-20px |

---

## Keyboard Shortcuts

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl+Shift+E` | Explain Code | Analyze and explain selected code |
| `Ctrl+Shift+D` | Debug Code | Find bugs and issues |
| `Ctrl+Shift+M` | Toggle Sidebar | Show/hide DevMentor sidebar |
| `Ctrl+Shift+S` | Screenshot Analysis | Open screenshot upload modal |
| `Ctrl+Shift+O` | Open Settings | Access extension settings |

---

## 🌐 **Supported Websites**

### **Code Repositories**
- GitHub (github.com)
- ✅ GitLab (gitlab.com)
- ✅ Bitbucket (bitbucket.org)

### **Code Editors**
- ✅ CodePen (codepen.io)
- ✅ JSFiddle (jsfiddle.net)
- ✅ CodeSandbox (codesandbox.io)
- ✅ Replit (replit.com)

### **Learning Platforms**
- ✅ Stack Overflow (stackoverflow.com)
- ✅ Stack Exchange (stackexchange.com)
- ✅ LeetCode (leetcode.com)
- ✅ HackerRank (hackerrank.com)

### **Documentation**
- ✅ MDN Web Docs (developer.mozilla.org)
- ✅ Google Developers (developers.google.com)
- ✅ React Docs (reactjs.org)
- ✅ Vue.js Docs (vuejs.org)

### **Local Development**
- ✅ Localhost (http://localhost:*)
- ✅ Development servers
- ✅ Local file systems

---

## 🔧 **Troubleshooting**

### **Common Issues**

#### **"AI not available" error**
**Cause:** Chrome AI flags not enabled
**Solution:**
1. Go to `chrome://flags/#optimization-guide-on-device-model`
2. Enable the flag
3. Restart Chrome

#### **Extension not working on website**
**Cause:** Website not in supported list
**Solution:**
1. Check if website is supported
2. Try refreshing the page
3. Check if extension is enabled

#### **Slow response times**
**Cause:** Large code snippets or slow AI processing
**Solution:**
1. Reduce code selection size
2. Adjust "Response Speed" setting
3. Clear cache in settings

#### **Sidebar not appearing**
**Cause:** CSS conflicts or extension disabled
**Solution:**
1. Check extension is enabled
2. Try keyboard shortcut `Ctrl+Shift+M`
3. Refresh the page

### **Performance Tips**

1. **Select smaller code snippets** for faster analysis
2. **Use keyboard shortcuts** for quicker access
3. **Enable caching** to avoid re-analyzing same code
4. **Close unused tabs** to free up memory
5. **Update Chrome** to latest version

---

## 🎓 **Learning Features**

### **Educational Modes**

#### **Beginner Mode**
- Simple explanations
- Basic concepts
- Step-by-step breakdowns
- Visual examples

#### **Intermediate Mode**
- Technical details
- Best practices
- Common patterns
- Performance considerations

#### **Expert Mode**
- Advanced concepts
- Edge cases
- Optimization techniques
- Architecture insights

### **Learning Paths**

DevMentor AI adapts explanations based on:
- **Code complexity** detected
- **User skill level** (if set)
- **Previous interactions**
- **Context** from surrounding code

---

## 🤝 **Collaboration Features**

### **Real-time Code Review**

1. **Start collaboration session**
2. **Invite team members**
3. **Share analysis results**
4. **Discuss improvements**

### **Team Learning**

- **Shared knowledge base**
- **Best practices** documentation
- **Code review** templates
- **Learning progress** tracking

---

## 📊 **Analytics & Insights**

### **Personal Dashboard**

Track your learning progress:
- **Code analyzed** count
- **Concepts learned**
- **Performance improvements** made
- **Time saved** with AI assistance

### **Team Metrics**

For team accounts:
- **Collaboration** statistics
- **Knowledge sharing** metrics
- **Code quality** improvements
- **Learning velocity**

---

## 🔒 **Privacy & Security**

### **Data Protection**

- ✅ **No data transmission** - Code never leaves your device
- ✅ **Local processing** - All AI analysis happens locally
- ✅ **No tracking** - No user behavior monitoring
- ✅ **Open source** - Transparent codebase

### **Security Features**

- ✅ **Input validation** - All code is validated before processing
- ✅ **Sandboxed execution** - Isolated processing environment
- ✅ **Error handling** - Secure error management
- ✅ **CSP compliance** - Content Security Policy implementation

---

## 🆘 **Support & Help**

### **Getting Help**

1. **Check this guide** for common solutions
2. **Visit GitHub Issues** for bug reports
3. **Contact support** via email
4. **Join community** discussions

### **Reporting Issues**

When reporting issues, include:
- **Chrome version** (chrome://version/)
- **Extension version** (chrome://extensions/)
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Screenshots** if applicable

### **Feature Requests**

We welcome feature suggestions:
- **GitHub Discussions** for ideas
- **Email** for detailed proposals
- **Community voting** on priorities

---

## 🚀 **Advanced Usage**

### **Power User Tips**

1. **Batch analysis** - Select multiple code blocks
2. **Custom prompts** - Modify analysis requests
3. **Integration** - Use with other developer tools
4. **Automation** - Set up automated analysis workflows

### **API Integration**

For advanced users:
- **Chrome extension APIs**
- **Custom analysis** pipelines
- **Team collaboration** APIs
- **Performance monitoring**

---

## 📈 **Roadmap**

### **Upcoming Features**

- **More languages** support (Python, Java, C++)
- **IDE integration** (VS Code, IntelliJ)
- **Advanced ML** insights
- **Team collaboration** enhancements
- **Mobile companion** app

### **Community Contributions**

- **Open source** development
- **Plugin ecosystem**
- **Custom analysis** engines
- **Educational content** library

---

**Happy coding with DevMentor AI! 🧠✨**


 HEAD








 b285e24 ( HOTFIX: Aplicar correções críticas de segurança)

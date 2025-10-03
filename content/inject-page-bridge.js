/**
 * DevMentor AI - Page Bridge Script (MAIN World)
 * Executes in MAIN world to interact with page variables
 * Used for GitHub, Stack Overflow, and other site-specific integrations
 */

// This script runs in MAIN world (not ISOLATED)
// It can access page variables and global objects

class PageBridge {
  constructor() {
    this.isInitialized = false;
    this.siteType = this.detectSiteType();
    this.init();
  }

  init() {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('[PageBridge] Initializing for site:', this.siteType);
      
      // Set up site-specific integrations
      this.setupSiteIntegration();
      
      // Set up global functions for content script communication
      this.setupGlobalFunctions();
      
      this.isInitialized = true;
      console.log('[PageBridge] ✅ Page bridge initialized');
      
    } catch (error) {
      console.error('[PageBridge] Initialization failed:', error);
    }
  }

  detectSiteType() {
    const hostname = window.location.hostname;
    
    if (hostname.includes('github.com')) {
      return 'github';
    } else if (hostname.includes('stackoverflow.com')) {
      return 'stackoverflow';
    } else if (hostname.includes('developer.mozilla.org')) {
      return 'mdn';
    } else if (hostname.includes('gitlab.com')) {
      return 'gitlab';
    } else if (hostname.includes('bitbucket.org')) {
      return 'bitbucket';
    } else if (hostname.includes('codepen.io')) {
      return 'codepen';
    } else if (hostname.includes('jsfiddle.net')) {
      return 'jsfiddle';
    } else if (hostname.includes('codesandbox.io')) {
      return 'codesandbox';
    }
    
    return 'generic';
  }

  setupSiteIntegration() {
    switch (this.siteType) {
      case 'github':
        this.setupGitHubIntegration();
        break;
      case 'stackoverflow':
        this.setupStackOverflowIntegration();
        break;
      case 'mdn':
        this.setupMDNIntegration();
        break;
      case 'codepen':
        this.setupCodePenIntegration();
        break;
      case 'jsfiddle':
        this.setupJSFiddleIntegration();
        break;
      case 'codesandbox':
        this.setupCodeSandboxIntegration();
        break;
      default:
        this.setupGenericIntegration();
    }
  }

  setupGitHubIntegration() {
    // GitHub-specific functionality
    window.__DEVMENTOR_GITHUB__ = {
      // Get repository information
      getRepoInfo: () => {
        const pathParts = window.location.pathname.split('/');
        if (pathParts.length >= 3) {
          return {
            owner: pathParts[1],
            repo: pathParts[2],
            branch: pathParts[4] || 'main',
            path: pathParts.slice(5).join('/')
          };
        }
        return null;
      },
      
      // Get current file information
      getCurrentFile: () => {
        const fileElement = document.querySelector('[data-testid="file-name"]');
        if (fileElement) {
          return {
            name: fileElement.textContent,
            path: window.location.pathname,
            language: this.detectLanguageFromPath(window.location.pathname)
          };
        }
        return null;
      },
      
      // Get code blocks
      getCodeBlocks: () => {
        const codeBlocks = document.querySelectorAll('pre code, .blob-code-inner');
        return Array.from(codeBlocks).map(block => ({
          element: block,
          code: block.textContent,
          language: this.detectLanguage(block),
          lineNumbers: this.getLineNumbers(block)
        }));
      },
      
      // Get selected code with context
      getSelectedCodeWithContext: () => {
        const selection = window.getSelection();
        if (!selection.toString().trim()) {
          return null;
        }
        
        const selectedText = selection.toString();
        const range = selection.getRangeAt(0);
        const codeBlock = range.commonAncestorContainer.closest('pre, .blob-code');
        
        return {
          code: selectedText,
          context: {
            file: this.getCurrentFile(),
            repo: this.getRepoInfo(),
            language: this.detectLanguage(codeBlock),
            lineNumbers: this.getLineNumbers(codeBlock)
          }
        };
      }
    };
  }

  setupStackOverflowIntegration() {
    // Stack Overflow-specific functionality
    window.__DEVMENTOR_STACKOVERFLOW__ = {
      // Get question information
      getQuestionInfo: () => {
        const titleElement = document.querySelector('#question-header h1');
        const tagsElement = document.querySelector('.post-taglist');
        
        return {
          title: titleElement?.textContent?.trim(),
          tags: tagsElement ? Array.from(tagsElement.querySelectorAll('.post-tag')).map(tag => tag.textContent) : [],
          url: window.location.href
        };
      },
      
      // Get code blocks
      getCodeBlocks: () => {
        const codeBlocks = document.querySelectorAll('pre code, .s-code-block');
        return Array.from(codeBlocks).map(block => ({
          element: block,
          code: block.textContent,
          language: this.detectLanguage(block),
          isAccepted: block.closest('.answer')?.querySelector('.accepted-answer') !== null
        }));
      },
      
      // Get selected code with context
      getSelectedCodeWithContext: () => {
        const selection = window.getSelection();
        if (!selection.toString().trim()) {
          return null;
        }
        
        const selectedText = selection.toString();
        const range = selection.getRangeAt(0);
        const codeBlock = range.commonAncestorContainer.closest('pre');
        
        return {
          code: selectedText,
          context: {
            question: this.getQuestionInfo(),
            language: this.detectLanguage(codeBlock),
            isAccepted: codeBlock?.closest('.answer')?.querySelector('.accepted-answer') !== null
          }
        };
      }
    };
  }

  setupMDNIntegration() {
    // MDN-specific functionality
    window.__DEVMENTOR_MDN__ = {
      // Get page information
      getPageInfo: () => {
        const titleElement = document.querySelector('h1');
        const breadcrumbElement = document.querySelector('.breadcrumbs');
        
        return {
          title: titleElement?.textContent?.trim(),
          breadcrumb: breadcrumbElement?.textContent?.trim(),
          url: window.location.href
        };
      },
      
      // Get code examples
      getCodeExamples: () => {
        const codeBlocks = document.querySelectorAll('pre code');
        return Array.from(codeBlocks).map(block => ({
          element: block,
          code: block.textContent,
          language: this.detectLanguage(block),
          description: this.getCodeDescription(block)
        }));
      }
    };
  }

  setupCodePenIntegration() {
    // CodePen-specific functionality
    window.__DEVMENTOR_CODEPEN__ = {
      // Get pen information
      getPenInfo: () => {
        const titleElement = document.querySelector('.pen-title');
        const authorElement = document.querySelector('.pen-author');
        
        return {
          title: titleElement?.textContent?.trim(),
          author: authorElement?.textContent?.trim(),
          url: window.location.href
        };
      },
      
      // Get code from editors
      getCodeFromEditors: () => {
        const editors = {
          html: document.querySelector('#html-editor')?.textContent || '',
          css: document.querySelector('#css-editor')?.textContent || '',
          js: document.querySelector('#js-editor')?.textContent || ''
        };
        
        return editors;
      }
    };
  }

  setupJSFiddleIntegration() {
    // JSFiddle-specific functionality
    window.__DEVMENTOR_JSFIDDLE__ = {
      // Get fiddle information
      getFiddleInfo: () => {
        const titleElement = document.querySelector('.fiddle-title');
        
        return {
          title: titleElement?.textContent?.trim(),
          url: window.location.href
        };
      },
      
      // Get code from panels
      getCodeFromPanels: () => {
        const panels = {
          html: document.querySelector('#html-panel')?.textContent || '',
          css: document.querySelector('#css-panel')?.textContent || '',
          js: document.querySelector('#js-panel')?.textContent || ''
        };
        
        return panels;
      }
    };
  }

  setupCodeSandboxIntegration() {
    // CodeSandbox-specific functionality
    window.__DEVMENTOR_CODESANDBOX__ = {
      // Get sandbox information
      getSandboxInfo: () => {
        const titleElement = document.querySelector('[data-testid="sandbox-title"]');
        
        return {
          title: titleElement?.textContent?.trim(),
          url: window.location.href
        };
      },
      
      // Get file tree
      getFileTree: () => {
        const fileElements = document.querySelectorAll('[data-testid="file-tree-item"]');
        return Array.from(fileElements).map(file => ({
          name: file.textContent,
          path: file.getAttribute('data-path'),
          type: file.getAttribute('data-type')
        }));
      }
    };
  }

  setupGenericIntegration() {
    // Generic functionality for any site
    window.__DEVMENTOR_GENERIC__ = {
      // Get page information
      getPageInfo: () => {
        return {
          title: document.title,
          url: window.location.href,
          hostname: window.location.hostname
        };
      },
      
      // Get all code blocks
      getCodeBlocks: () => {
        const codeBlocks = document.querySelectorAll('pre code, code');
        return Array.from(codeBlocks).map(block => ({
          element: block,
          code: block.textContent,
          language: this.detectLanguage(block)
        }));
      },
      
      // Get selected code
      getSelectedCode: () => {
        const selection = window.getSelection();
        return selection.toString().trim() || null;
      }
    };
  }

  setupGlobalFunctions() {
    // Global functions for content script communication
    window.__DEVMENTOR_BRIDGE__ = {
      // Get site-specific data
      getSiteData: () => {
        switch (this.siteType) {
          case 'github':
            return window.__DEVMENTOR_GITHUB__;
          case 'stackoverflow':
            return window.__DEVMENTOR_STACKOVERFLOW__;
          case 'mdn':
            return window.__DEVMENTOR_MDN__;
          case 'codepen':
            return window.__DEVMENTOR_CODEPEN__;
          case 'jsfiddle':
            return window.__DEVMENTOR_JSFIDDLE__;
          case 'codesandbox':
            return window.__DEVMENTOR_CODESANDBOX__;
          default:
            return window.__DEVMENTOR_GENERIC__;
        }
      },
      
      // Get selected code with context
      getSelectedCodeWithContext: () => {
        const siteData = this.getSiteData();
        if (siteData && siteData.getSelectedCodeWithContext) {
          return siteData.getSelectedCodeWithContext();
        }
        
        // Fallback to generic selection
        const selection = window.getSelection();
        return selection.toString().trim() || null;
      },
      
      // Detect language from element
      detectLanguage: (element) => {
        return this.detectLanguage(element);
      },
      
      // Get site type
      getSiteType: () => {
        return this.siteType;
      }
    };
  }

  detectLanguage(element) {
    if (!element) return 'unknown';
    
    // Check for language classes
    const classList = element.classList;
    for (const className of classList) {
      if (className.startsWith('language-')) {
        return className.replace('language-', '');
      }
      if (className.startsWith('lang-')) {
        return className.replace('lang-', '');
      }
    }
    
    // Check parent elements
    const parent = element.parentElement;
    if (parent) {
      for (const className of parent.classList) {
        if (className.startsWith('language-')) {
          return className.replace('language-', '');
        }
      }
    }
    
    // Detect from file extension or content
    const text = element.textContent || '';
    return this.detectLanguageFromContent(text);
  }

  detectLanguageFromPath(path) {
    const extension = path.split('.').pop()?.toLowerCase();
    const languageMap = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'json': 'json',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
      'md': 'markdown',
      'sh': 'bash',
      'sql': 'sql'
    };
    
    return languageMap[extension] || 'unknown';
  }

  detectLanguageFromContent(text) {
    // Simple heuristics for language detection
    if (text.includes('function') && text.includes('var')) return 'javascript';
    if (text.includes('def ') && text.includes('import ')) return 'python';
    if (text.includes('public class') || text.includes('private ')) return 'java';
    if (text.includes('#include') || text.includes('int main')) return 'cpp';
    if (text.includes('<?php') || text.includes('$')) return 'php';
    if (text.includes('package ') && text.includes('import ')) return 'go';
    if (text.includes('fn ') && text.includes('let ')) return 'rust';
    if (text.includes('def ') && text.includes('end')) return 'ruby';
    if (text.includes('<html') || text.includes('<div')) return 'html';
    if (text.includes('{') && text.includes('}') && text.includes(':')) return 'css';
    
    return 'unknown';
  }

  getLineNumbers(element) {
    if (!element) return null;
    
    // Try to find line numbers in GitHub
    const lineNumbers = element.parentElement?.querySelectorAll('.blob-num');
    if (lineNumbers && lineNumbers.length > 0) {
      return Array.from(lineNumbers).map(num => parseInt(num.textContent));
    }
    
    return null;
  }

  getCodeDescription(element) {
    if (!element) return null;
    
    // Try to find description in MDN
    const description = element.parentElement?.querySelector('p');
    return description?.textContent?.trim() || null;
  }
}

// Initialize page bridge
const pageBridge = new PageBridge();

console.log('[PageBridge] ✅ Page bridge loaded in MAIN world');

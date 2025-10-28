/* global chrome, window, document */
/* eslint-disable no-console, security/detect-object-injection */
/**
 * DevMentor AI - Minimal Content Script (Dynamic Injection)
 * Injected only when needed via chrome.scripting.executeScript
 * Optimized for performance and security
 */

// Mark as injected to prevent duplicate injection
window.__DEVMENTOR_CONTENT_SCRIPT_INJECTED__ = true;

class MinimalContentScript {
  constructor () {
    this.isInitialized = false;
    this.messageHandlers = new Map();
    this.init();
  }

  async init () {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('[ContentScript] Minimal content script initialized');

      // Set up message handlers
      this.setupMessageHandlers();

      // Set up keyboard shortcuts
      this.setupKeyboardHandlers();

      this.isInitialized = true;
      console.log('[ContentScript] ✅ Setup completed');
    } catch (error) {
      console.error('[ContentScript] Initialization failed:', error);
    }
  }

  setupMessageHandlers () {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      const handler = this.messageHandlers.get(request.action);

      if (handler) {
        handler(request, sender, sendResponse);
        return true; // Keep message channel open for async response
      }

      console.warn('[ContentScript] Unknown message action:', request.action);
      sendResponse({ success: false, error: `Unknown action: ${request.action}` });
      return false;
    });

    // Register message handlers
    this.messageHandlers.set('explain-selection', this.handleExplainSelection.bind(this));
    this.messageHandlers.set('debug-selection', this.handleDebugSelection.bind(this));
    this.messageHandlers.set('document-selection', this.handleDocumentSelection.bind(this));
    this.messageHandlers.set('refactor-selection', this.handleRefactorSelection.bind(this));
    this.messageHandlers.set('show-analysis-result', this.showAnalysisResult.bind(this));
    this.messageHandlers.set('show-analysis-error', this.showAnalysisError.bind(this));

    // NEW: Handlers para o popup
    this.messageHandlers.set('getSelectedCode', this.handleGetSelectedCode.bind(this));
    this.messageHandlers.set('showResult', this.handleShowResult.bind(this));
  }

  // NEW: Obter código selecionado
  handleGetSelectedCode (request, sender, sendResponse) {
    try {
      const selectedText = window.getSelection().toString().trim();

      if (!selectedText) {
        sendResponse({ success: false, error: 'Nenhum código selecionado' });
        return;
      }

      // Detectar linguagem do código (simplificado)
      const language = this.detectLanguage(selectedText);

      sendResponse({
        success: true,
        code: selectedText,
        language
      });
    } catch (error) {
      console.error('[ContentScript] GetSelectedCode failed:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  // NEW: Exibir resultado da análise
  handleShowResult (request, sender, sendResponse) {
    try {
      this.showAnalysisResult({
        type: request.type,
        result: request.data,
        code: request.data.code
      });

      sendResponse({ success: true });
    } catch (error) {
      console.error('[ContentScript] ShowResult failed:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  // Enhanced language detector with support for major programming languages
  detectLanguage (code) {
    const trimmedCode = code.trim();

    // JSON - highest priority (very specific format)
    if ((trimmedCode.startsWith('{') && trimmedCode.endsWith('}')) ||
        (trimmedCode.startsWith('[') && trimmedCode.endsWith(']'))) {
      try {
        JSON.parse(trimmedCode);
        return 'json';
      } catch (e) {
        // Not valid JSON, continue detection
      }
    }

    // XML/HTML
    if (trimmedCode.startsWith('<?xml') ||
        (trimmedCode.startsWith('<') && trimmedCode.includes('</') && !trimmedCode.includes('<?php'))) {
      if (trimmedCode.includes('<!DOCTYPE html') || trimmedCode.includes('<html')) {
        return 'html';
      }
      return 'xml';
    }

    // Markdown
    if (trimmedCode.includes('# ') || trimmedCode.includes('## ') ||
        trimmedCode.includes('```') || trimmedCode.match(/\[.*\]\(.*\)/)) {
      return 'markdown';
    }

    // CSS/SCSS/LESS
    if (trimmedCode.match(/[.#][\w-]+\s*{/) || trimmedCode.includes('@media') ||
        trimmedCode.includes('@import') && trimmedCode.includes('{')) {
      if (trimmedCode.includes('$') && trimmedCode.includes('@mixin')) return 'scss';
      if (trimmedCode.includes('@') && trimmedCode.includes('.')) return 'less';
      return 'css';
    }

    // PHP
    if (trimmedCode.includes('<?php') || trimmedCode.includes('<?=')) {
      return 'php';
    }

    // Python - check for distinctive Python syntax
    if (trimmedCode.match(/^def\s+\w+\s*\(/) ||
        trimmedCode.match(/^class\s+\w+.*:/) ||
        trimmedCode.includes('import ') && trimmedCode.includes('from ') ||
        trimmedCode.includes('def ') || trimmedCode.includes('self.') ||
        trimmedCode.includes('__init__') || trimmedCode.includes('print(')) {
      return 'python';
    }

    // Java - distinctive patterns
    if (trimmedCode.includes('public class') || trimmedCode.includes('private class') ||
        trimmedCode.includes('public static void') || trimmedCode.includes('extends ') ||
        trimmedCode.includes('implements ') || trimmedCode.match(/import\s+java\./)) {
      return 'java';
    }

    // C# - similar to Java but with distinctive features
    if (trimmedCode.includes('namespace ') || trimmedCode.includes('using System') ||
        trimmedCode.includes('public sealed') || trimmedCode.includes('async Task')) {
      return 'csharp';
    }

    // C/C++
    if (trimmedCode.includes('#include') || trimmedCode.includes('int main(') ||
        trimmedCode.includes('std::') || trimmedCode.includes('cout') ||
        trimmedCode.includes('printf(') || trimmedCode.match(/^\s*#define/m)) {
      if (trimmedCode.includes('std::') || trimmedCode.includes('cout') ||
          trimmedCode.includes('class ') || trimmedCode.includes('namespace ')) {
        return 'cpp';
      }
      return 'c';
    }

    // Go
    if (trimmedCode.includes('package ') && (trimmedCode.includes('func ') ||
        trimmedCode.includes('import (') || trimmedCode.includes('type ') ||
        trimmedCode.includes('var ') || trimmedCode.includes(':='))) {
      return 'go';
    }

    // Rust
    if (trimmedCode.includes('fn ') || trimmedCode.includes('let mut') ||
        trimmedCode.includes('impl ') || trimmedCode.includes('use std::') ||
        trimmedCode.includes('pub fn')) {
      return 'rust';
    }

    // TypeScript - check before JavaScript
    if ((trimmedCode.includes('interface ') || trimmedCode.includes('type ') ||
         trimmedCode.includes(': string') || trimmedCode.includes(': number') ||
         trimmedCode.includes('enum ') || trimmedCode.includes('<T>')) &&
        (trimmedCode.includes('const') || trimmedCode.includes('let') || trimmedCode.includes('function'))) {
      return 'typescript';
    }

    // JavaScript/JSX
    if (trimmedCode.includes('function') || trimmedCode.includes('const ') ||
        trimmedCode.includes('let ') || trimmedCode.includes('var ') ||
        trimmedCode.includes('=>') || trimmedCode.includes('require(') ||
        trimmedCode.includes('import ') || trimmedCode.includes('export ')) {
      if (trimmedCode.includes('React.') || trimmedCode.includes('useState') ||
          trimmedCode.includes('useEffect') || trimmedCode.match(/<\w+.*>/)) {
        return 'jsx';
      }
      return 'javascript';
    }

    // Ruby
    if (trimmedCode.includes('def ') && (trimmedCode.includes('end') ||
        trimmedCode.includes('puts ') || trimmedCode.includes('require '))) {
      return 'ruby';
    }

    // Swift
    if (trimmedCode.includes('func ') && (trimmedCode.includes('var ') ||
        trimmedCode.includes('let ')) || trimmedCode.includes('import UIKit') ||
        trimmedCode.includes('import Foundation')) {
      return 'swift';
    }

    // Kotlin
    if (trimmedCode.includes('fun ') && (trimmedCode.includes('val ') ||
        trimmedCode.includes('var ')) || trimmedCode.includes('import kotlin')) {
      return 'kotlin';
    }

    // SQL
    if (trimmedCode.match(/^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\s+/i) ||
        trimmedCode.includes('FROM ') || trimmedCode.includes('WHERE ') ||
        trimmedCode.includes('JOIN ')) {
      return 'sql';
    }

    // YAML
    if (trimmedCode.match(/^\w+:\s*$/) || trimmedCode.match(/^-\s+\w+:/m) ||
        trimmedCode.includes('---') && trimmedCode.includes(':')) {
      return 'yaml';
    }

    // Shell/Bash
    if (trimmedCode.startsWith('#!') || trimmedCode.includes('#!/bin/bash') ||
        trimmedCode.includes('#!/bin/sh') || trimmedCode.match(/^(echo|cd|ls|mkdir|rm)\s+/m)) {
      return 'bash';
    }

    // Docker
    if (trimmedCode.startsWith('FROM ') || trimmedCode.includes('RUN ') ||
        trimmedCode.includes('CMD ') || trimmedCode.includes('EXPOSE ')) {
      return 'dockerfile';
    }

    // Default fallback
    return 'plaintext';
  }

  async handleExplainSelection (request, sender, sendResponse) {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'explain-code',
        code: request.code,
        context: { url: window.location.href }
      });

      sendResponse(response);
    } catch (error) {
      console.error('[ContentScript] Explain selection failed:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  async handleDebugSelection (request, sender, sendResponse) {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'debug-code',
        code: request.code,
        context: { url: window.location.href }
      });

      sendResponse(response);
    } catch (error) {
      console.error('[ContentScript] Debug selection failed:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  async handleDocumentSelection (request, sender, sendResponse) {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'document-code',
        code: request.code,
        context: { url: window.location.href }
      });

      sendResponse(response);
    } catch (error) {
      console.error('[ContentScript] Document selection failed:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  async handleRefactorSelection (request, sender, sendResponse) {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'refactor-code',
        code: request.code,
        context: { url: window.location.href }
      });

      sendResponse(response);
    } catch (error) {
      console.error('[ContentScript] Refactor selection failed:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  setupKeyboardHandlers () {
    document.addEventListener('keydown', (event) => {
      // Handle extension shortcuts
      if (event.ctrlKey && event.shiftKey) {
        switch (event.key) {
        case 'E':
          event.preventDefault();
          this.handleExplainShortcut();
          break;
        case 'B':
          event.preventDefault();
          this.handleDebugShortcut();
          break;
        case 'G':
          event.preventDefault();
          this.handleDocumentShortcut();
          break;
        case 'R':
          event.preventDefault();
          this.handleRefactorShortcut();
          break;
        }
      }
    });
  }

  async handleExplainShortcut () {
    const selectedCode = window.getSelection().toString().trim();
    if (!selectedCode) {
      this.showNotification('Please select some code first', 'warning');
      return;
    }

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'explain-code',
        code: selectedCode,
        context: { url: window.location.href }
      });

      if (response.success) {
        this.showAnalysisResult({
          type: 'explanation',
          result: response.data,
          code: selectedCode
        });
      } else {
        this.showAnalysisError({
          type: 'explanation',
          error: response.error
        });
      }
    } catch (error) {
      console.error('[ContentScript] Explain shortcut failed:', error);
      this.showNotification('Failed to explain code', 'error');
    }
  }

  async handleDebugShortcut () {
    const selectedCode = window.getSelection().toString().trim();
    if (!selectedCode) {
      this.showNotification('Please select some code first', 'warning');
      return;
    }

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'debug-code',
        code: selectedCode,
        context: { url: window.location.href }
      });

      if (response.success) {
        this.showAnalysisResult({
          type: 'debug',
          result: response.data,
          code: selectedCode
        });
      } else {
        this.showAnalysisError({
          type: 'debug',
          error: response.error
        });
      }
    } catch (error) {
      console.error('[ContentScript] Debug shortcut failed:', error);
      this.showNotification('Failed to debug code', 'error');
    }
  }

  async handleDocumentShortcut () {
    const selectedCode = window.getSelection().toString().trim();
    if (!selectedCode) {
      this.showNotification('Please select some code first', 'warning');
      return;
    }

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'document-code',
        code: selectedCode,
        context: { url: window.location.href }
      });

      if (response.success) {
        this.showAnalysisResult({
          type: 'documentation',
          result: response.data,
          code: selectedCode
        });
      } else {
        this.showAnalysisError({
          type: 'documentation',
          error: response.error
        });
      }
    } catch (error) {
      console.error('[ContentScript] Document shortcut failed:', error);
      this.showNotification('Failed to generate documentation', 'error');
    }
  }

  async handleRefactorShortcut () {
    const selectedCode = window.getSelection().toString().trim();
    if (!selectedCode) {
      this.showNotification('Please select some code first', 'warning');
      return;
    }

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'refactor-code',
        code: selectedCode,
        context: { url: window.location.href }
      });

      if (response.success) {
        this.showAnalysisResult({
          type: 'refactor',
          result: response.data,
          code: selectedCode
        });
      } else {
        this.showAnalysisError({
          type: 'refactor',
          error: response.error
        });
      }
    } catch (error) {
      console.error('[ContentScript] Refactor shortcut failed:', error);
      this.showNotification('Failed to refactor code', 'error');
    }
  }

  showAnalysisResult (request) {
    const tooltip = this.createAnalysisTooltip(request);
    document.body.appendChild(tooltip);

    // Auto-remove after 30 seconds
    setTimeout(() => {
      if (tooltip.parentNode) {
        tooltip.remove();
      }
    }, 30000);
  }

  showAnalysisError (request) {
    const errorTooltip = this.createErrorTooltip(request);
    document.body.appendChild(errorTooltip);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (errorTooltip.parentNode) {
        errorTooltip.remove();
      }
    }, 10000);
  }

  createAnalysisTooltip (request) {
    const tooltip = document.createElement('div');
    tooltip.className = 'devmentor-analysis-tooltip';
    tooltip.innerHTML = `
      <div class="tooltip-header">
        <span class="tooltip-title">${this.getTooltipTitle(request.type)}</span>
        <button class="close-btn" aria-label="Close">&times;</button>
      </div>
      <div class="tooltip-content">
        <div class="analysis-result">${this.formatAnalysisResult(request.result)}</div>
        <div class="tooltip-footer">
          <button class="copy-btn">Copy</button>
          <button class="expand-btn">Expand</button>
        </div>
      </div>
    `;

    // Add event listeners
    tooltip.querySelector('.close-btn').onclick = () => tooltip.remove();
    const copyPayload =
      request.result && typeof request.result === 'object' && request.result.analysis
        ? request.result.analysis
        : request.result;
    tooltip.querySelector('.copy-btn').onclick = () => this.copyToClipboard(copyPayload);
    tooltip.querySelector('.expand-btn').onclick = () => this.expandTooltip(tooltip);

    return tooltip;
  }

  createErrorTooltip (request) {
    const tooltip = document.createElement('div');
    tooltip.className = 'devmentor-error-tooltip';
    tooltip.innerHTML = `
      <div class="error-header">
        <span class="error-title">Error: ${this.getTooltipTitle(request.type)}</span>
        <button class="close-btn" aria-label="Close">&times;</button>
      </div>
      <div class="error-content">
        <div class="error-message">${request.error}</div>
      </div>
    `;

    tooltip.querySelector('.close-btn').onclick = () => tooltip.remove();

    return tooltip;
  }

  getTooltipTitle (type) {
    const titles = {
      explanation: 'Code Explanation',
      explain: 'Code Explanation',
      debug: 'Bug Analysis',
      bugs: 'Bug Analysis',
      documentation: 'Documentation',
      docs: 'Documentation',
      refactor: 'Refactoring Suggestions',
      optimize: 'Refactoring Suggestions',
      review: 'Code Review'
    };
    return titles[type] || 'Analysis';
  }

  formatAnalysisResult (result) {
    if (typeof result === 'string') {
      return `<pre class="analysis-text">${this.escapeHtml(result)}</pre>`;
    }

    if (result && typeof result.analysis === 'string') {
      return `<pre class="analysis-text">${this.escapeHtml(result.analysis)}</pre>`;
    }

    if (result && typeof result.text === 'string') {
      return `<pre class="analysis-text">${this.escapeHtml(result.text)}</pre>`;
    }

    // Resultado do Chrome Built-in AI (core)
    if (result?.core) {
      let html = '<div class="analysis-section">';
      html += '<h4 class="section-title">Analysis (Chrome Built-in AI)</h4>';
      html += `<pre class="analysis-text">${this.escapeHtml(result.core.explanation || result.core.debugInfo || result.core.documentation || result.core.refactoredCode || JSON.stringify(result.core, null, 2))}</pre>`;
      html += `<div class="section-meta">${result.core.processingTime}ms | ${result.core.provider}</div>`;
      html += '</div>';

      if (result.enhanced) {
        html += '<div class="analysis-section premium">';
        html += '<h4 class="section-title">Premium Analysis</h4>';
        html += `<pre class="analysis-text">${this.escapeHtml(JSON.stringify(result.enhanced, null, 2))}</pre>`;
        html += '</div>';
      }

      return html;
    }

    if (result?.explanation) {
      return `<pre class="analysis-text">${this.escapeHtml(result.explanation)}</pre>`;
    }

    if (result?.debugInfo) {
      return `<pre class="analysis-text">${this.escapeHtml(result.debugInfo)}</pre>`;
    }

    if (result?.documentation) {
      return `<pre class="analysis-text">${this.escapeHtml(result.documentation)}</pre>`;
    }

    if (result?.refactoredCode) {
      return `<pre class="analysis-text">${this.escapeHtml(result.refactoredCode)}</pre>`;
    }

    return `<pre class="analysis-text">${this.escapeHtml(JSON.stringify(result, null, 2))}</pre>`;
  }

  escapeHtml (text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  async copyToClipboard (value) {
    try {
      const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
      await navigator.clipboard.writeText(text);
      this.showNotification('Copied to clipboard', 'success');
    } catch (error) {
      console.error('[ContentScript] Copy failed:', error);
      this.showNotification('Failed to copy', 'error');
    }
  }

  expandTooltip (tooltip) {
    tooltip.classList.toggle('expanded');
  }

  showNotification (message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `devmentor-notification devmentor-notification-${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 3000);
  }
}

window.DevMentorContentScript = new MinimalContentScript();
console.log('[ContentScript] Minimal content script loaded');

// ---------------------------------------------------------------------------
// UI ⇄ Service Worker bridge (used when extension UI runs in MAIN world)
// ---------------------------------------------------------------------------
if (typeof window !== 'undefined' && !window.__DEVMENTOR_BRIDGE_SETUP__) {
  window.__DEVMENTOR_BRIDGE_SETUP__ = true;
  window.addEventListener('message', (event) => {
    if (event.source !== window) {
      return;
    }

    const data = event.data;
    if (!data || data.__from !== 'devmentor-ui' || !data.payload) {
      return;
    }

    chrome.runtime.sendMessage(data.payload, (response) => {
      window.postMessage({
        __from: 'devmentor-sw',
        id: data.id,
        resp: response,
        error: chrome.runtime.lastError?.message
      }, '*');
    });
  });
}

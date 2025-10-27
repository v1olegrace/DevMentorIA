/* global window, document, setTimeout, clearTimeout */
/* eslint-disable no-console */
/**
 * This file is web-accessible and can be injected into pages
 */

// Simple injection script for DevMentor AI
console.log('[DevMentor AI] Content injection script loaded');

// Export functions that can be used by content scripts
window.DevMentorInject = {
  // Inject analysis sidebar
  injectSidebar: function (analysis, type, metadata) {
    console.log('[DevMentor AI] Injecting sidebar with analysis:', type);

    // Remove existing sidebar if present
    const existing = document.getElementById('devmentor-sidebar');
    if (existing) {
      existing.remove();
    }

    // Create sidebar element
    const sidebar = document.createElement('div');
    sidebar.id = 'devmentor-sidebar';
    sidebar.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      width: 400px;
      height: 100vh;
      background: white;
      border-left: 2px solid #007acc;
      box-shadow: -2px 0 10px rgba(0,0,0,0.1);
      z-index: 10000;
      overflow-y: auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    // Create header
    const header = document.createElement('div');
    header.style.cssText = `
      background: #007acc;
      color: white;
      padding: 16px;
      font-weight: bold;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    header.innerHTML = `
      <span></span>
      <button id="devmentor-close" style="background: none; border: none; color: white; cursor: pointer; font-size: 18px;">×</button>
    `;
    // Use textContent to prevent XSS
    header.querySelector('span').textContent = `🔍 DevMentor AI - ${type}`;

    // Create content
    const content = document.createElement('div');
    content.style.cssText = `
      padding: 16px;
      line-height: 1.6;
    `;

    // Create analysis block with textContent to prevent XSS
    const analysisBlock = document.createElement('div');
    analysisBlock.style.cssText = 'white-space: pre-wrap; font-family: "Monaco", "Consolas", monospace; background: #f5f5f5; padding: 12px; border-radius: 4px; margin-bottom: 16px;';
    analysisBlock.textContent = analysis;
    content.appendChild(analysisBlock);

    // Add metadata if present, using textContent to prevent XSS
    if (metadata) {
      const metadataBlock = document.createElement('div');
      metadataBlock.style.cssText = 'font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 12px;';

      const timeDiv = document.createElement('div');
      timeDiv.textContent = `Tempo de processamento: ${metadata.processingTime}ms`;

      const langDiv = document.createElement('div');
      langDiv.textContent = `Linguagem: ${metadata.language || 'N/A'}`;

      const confDiv = document.createElement('div');
      confDiv.textContent = `Confiança: ${metadata.confidence ? (metadata.confidence * 100).toFixed(1) + '%' : 'N/A'}`;

      metadataBlock.appendChild(timeDiv);
      metadataBlock.appendChild(langDiv);
      metadataBlock.appendChild(confDiv);
      content.appendChild(metadataBlock);
    }

    // Assemble sidebar
    sidebar.appendChild(header);
    sidebar.appendChild(content);

    // Add to page
    document.body.appendChild(sidebar);

    // Add close functionality
    const closeBtn = sidebar.querySelector('#devmentor-close');
    const autoCloseTimer = setTimeout(() => {
      if (document.body.contains(sidebar)) {
        sidebar.remove();
      }
    }, 30000);

    const closeSidebar = () => {
      sidebar.remove();
      clearTimeout(autoCloseTimer);
    };

    closeBtn.addEventListener('click', () => {
      closeSidebar();
    });
  },

  // Remove sidebar
  removeSidebar: function () {
    const sidebar = document.getElementById('devmentor-sidebar');
    if (sidebar) {
      sidebar.remove();
    }
  }
};

console.log('[DevMentor AI] ✅ Injection functions ready');

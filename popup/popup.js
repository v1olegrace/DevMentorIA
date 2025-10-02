/**
 * DevMentor AI - Popup Script
 * Handles popup UI interactions and communication with background script
 */

class DevMentorPopup {
  constructor() {
    this.isInitialized = false;
    this.currentTab = null;
    this.aiStatus = null;
    this.stats = null;
    
    // Initialize logger
    this.logger = {
      debug: (...args) => console.debug('[Popup]', ...args),
      info: (...args) => console.info('[Popup]', ...args),
      warn: (...args) => console.warn('[Popup]', ...args),
      error: (...args) => console.error('[Popup]', ...args)
    };
    
    this.init();
  }

  /**
   * Initialize popup
   */
  async init() {
    try {
      this.logger.info('[Popup] Initializing DevMentor AI popup...');
      
      // Get current tab
      this.currentTab = await this.getCurrentTab();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Load initial data
      await this.loadInitialData();
      
      // Update UI
      this.updateUI();
      
      this.isInitialized = true;
      this.logger.info('[Popup] Popup initialized successfully');
      
    } catch (error) {
      this.logger.error('[Popup] Initialization failed:', error);
      this.showError('Failed to initialize popup');
    }
  }

  /**
   * Get current active tab
   * @returns {Promise<Object>} Current tab
   */
  async getCurrentTab() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    return tabs[0];
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Action buttons
    document.querySelectorAll('.action-btn').forEach(btn => {
      btn.addEventListener('click', this.handleActionClick.bind(this));
    });

    // Setting buttons
    document.getElementById('clearDataBtn')?.addEventListener('click', this.handleClearData.bind(this));
    document.getElementById('feedbackBtn')?.addEventListener('click', this.handleFeedback.bind(this));
    document.getElementById('helpBtn')?.addEventListener('click', this.handleHelp.bind(this));
    document.getElementById('aboutBtn')?.addEventListener('click', this.handleAbout.bind(this));

    // Footer links
    document.getElementById('githubLink')?.addEventListener('click', this.handleGitHub.bind(this));
    document.getElementById('websiteLink')?.addEventListener('click', this.handleWebsite.bind(this));
    document.getElementById('supportLink')?.addEventListener('click', this.handleSupport.bind(this));

    // Close popup on outside click
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('popup-container')) {
        window.close();
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  /**
   * Load initial data
   */
  async loadInitialData() {
    try {
      // Get AI status
      const aiStatusResponse = await chrome.runtime.sendMessage({
        action: 'getAIStatus'
      });
      this.aiStatus = aiStatusResponse;

      // Get usage statistics
      const statsResponse = await chrome.runtime.sendMessage({
        action: 'getStats'
      });
      this.stats = statsResponse;

    } catch (error) {
      this.logger.error('[Popup] Failed to load data:', error);
    }
  }

  /**
   * Update UI based on current state
   */
  updateUI() {
    this.updateStatus();
    this.updateStats();
    this.updateActions();
  }

  /**
   * Update status indicator
   */
  updateStatus() {
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    
    if (!statusDot || !statusText) return;

    if (this.aiStatus?.initialized && this.aiStatus?.aiAvailable) {
      statusDot.className = 'status-dot online';
      statusText.textContent = 'Ready';
    } else if (this.aiStatus?.initialized && !this.aiStatus?.aiAvailable) {
      statusDot.className = 'status-dot warning';
      statusText.textContent = 'AI Unavailable';
    } else {
      statusDot.className = 'status-dot offline';
      statusText.textContent = 'Initializing...';
    }
  }

  /**
   * Update statistics display
   */
  updateStats() {
    if (!this.stats) return;

    const totalAnalyses = document.getElementById('totalAnalyses');
    const codeExplained = document.getElementById('codeExplained');
    const bugsFound = document.getElementById('bugsFound');
    const docsGenerated = document.getElementById('docsGenerated');

    if (totalAnalyses) {
      totalAnalyses.textContent = this.stats.totalEvents || 0;
    }

    if (this.stats.byEvent) {
      if (codeExplained) {
        codeExplained.textContent = this.stats.byEvent['analysis_success'] || 0;
      }
      if (bugsFound) {
        bugsFound.textContent = this.stats.byEvent['bug_analysis'] || 0;
      }
      if (docsGenerated) {
        docsGenerated.textContent = this.stats.byEvent['doc_generation'] || 0;
      }
    }
  }

  /**
   * Update action buttons based on current context
   */
  updateActions() {
    const actionBtns = document.querySelectorAll('.action-btn');
    const isAIReady = this.aiStatus?.initialized && this.aiStatus?.aiAvailable;
    
    actionBtns.forEach(btn => {
      btn.disabled = !isAIReady;
      if (!isAIReady) {
        btn.classList.add('disabled');
        btn.title = 'Chrome Built-in AI is not available';
      } else {
        btn.classList.remove('disabled');
        btn.title = '';
      }
    });
  }

  /**
   * Handle action button clicks
   * @param {Event} event - Click event
   */
  async handleActionClick(event) {
    const button = event.currentTarget;
    const action = button.dataset.action;
    
    if (!action || button.disabled) return;

    try {
      // Show loading
      this.showLoading('Processing...');
      
      // Check if code is selected on the page
      const hasSelection = await this.checkSelection();
      
      if (!hasSelection) {
        this.showError('Please select some code on the webpage first');
        return;
      }

      // Trigger analysis
      await this.triggerAnalysis(action);
      
      // Show success and close popup
      this.showSuccess('Analysis started! Check the sidebar.');
      setTimeout(() => window.close(), 1500);

    } catch (error) {
      this.logger.error('[Popup] Action failed:', error);
      this.showError('Failed to start analysis');
    } finally {
      this.hideLoading();
    }
  }

  /**
   * Check if code is selected on the current page
   * @returns {Promise<boolean>} Has selection
   */
  async checkSelection() {
    try {
      const response = await chrome.tabs.sendMessage(this.currentTab.id, {
        action: 'getPageInfo'
      });
      
      return response?.selection?.text && response.selection.text.trim().length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Trigger code analysis
   * @param {string} type - Analysis type
   */
  async triggerAnalysis(type) {
    // Simulate context menu click
    await chrome.tabs.sendMessage(this.currentTab.id, {
      action: 'triggerAnalysis',
      type
    });
  }

  /**
   * Handle clear data action
   */
  async handleClearData() {
    try {
      const confirmed = confirm('Are you sure you want to clear all usage data?');
      if (!confirmed) return;

      this.showLoading('Clearing data...');
      
      await chrome.runtime.sendMessage({
        action: 'clearData'
      });
      
      // Reset stats
      this.stats = { totalEvents: 0, byEvent: {} };
      this.updateStats();
      
      this.showSuccess('Data cleared successfully');
      
    } catch (error) {
      this.logger.error('[Popup] Clear data failed:', error);
      this.showError('Failed to clear data');
    } finally {
      this.hideLoading();
    }
  }

  /**
   * Handle feedback action
   */
  handleFeedback() {
    const feedbackUrl = 'https://github.com/your-username/devmentor-ai/issues/new';
    chrome.tabs.create({ url: feedbackUrl });
  }

  /**
   * Handle help action
   */
  handleHelp() {
    const helpUrl = 'https://github.com/your-username/devmentor-ai/wiki';
    chrome.tabs.create({ url: helpUrl });
  }

  /**
   * Handle about action
   */
  handleAbout() {
    const aboutInfo = `
DevMentor AI v1.0.0

Your personal AI coding assistant powered by Chrome's Built-in AI APIs.

Features:
• Code explanation and analysis
• Bug detection and fixes
• Documentation generation  
• Code refactoring suggestions
• Screenshot analysis
• Complete privacy (runs locally)

Built for the Chrome Built-in AI Challenge 2025.
    `;
    
    alert(aboutInfo.trim());
  }

  /**
   * Handle GitHub link
   */
  handleGitHub() {
    const githubUrl = 'https://github.com/your-username/devmentor-ai';
    chrome.tabs.create({ url: githubUrl });
  }

  /**
   * Handle website link
   */
  handleWebsite() {
    const websiteUrl = 'https://your-website.com/devmentor-ai';
    chrome.tabs.create({ url: websiteUrl });
  }

  /**
   * Handle support link
   */
  handleSupport() {
    const supportUrl = 'mailto:support@your-domain.com?subject=DevMentor AI Support';
    chrome.tabs.create({ url: supportUrl });
  }

  /**
   * Handle keyboard shortcuts
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleKeyDown(event) {
    // Escape key - close popup
    if (event.key === 'Escape') {
      window.close();
    }
    
    // Enter key on focused button
    if (event.key === 'Enter' && event.target.classList.contains('action-btn')) {
      event.target.click();
    }
  }

  /**
   * Show loading state
   * @param {string} message - Loading message
   */
  showLoading(message = 'Loading...') {
    const overlay = document.getElementById('loadingOverlay');
    const text = overlay?.querySelector('.loading-text');
    
    if (overlay) {
      overlay.style.display = 'flex';
      if (text) text.textContent = message;
    }
  }

  /**
   * Hide loading state
   */
  hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
  }

  /**
   * Show success toast
   * @param {string} message - Success message
   */
  showSuccess(message) {
    this.showToast('success', message);
  }

  /**
   * Show error toast
   * @param {string} message - Error message
   */
  showError(message) {
    this.showToast('error', message);
  }

  /**
   * Show toast notification
   * @param {string} type - Toast type (success/error)
   * @param {string} message - Toast message
   */
  showToast(type, message) {
    const toastId = type === 'success' ? 'successToast' : 'errorToast';
    const toast = document.getElementById(toastId);
    const text = toast?.querySelector('.toast-text');
    
    if (toast && text) {
      text.textContent = message;
      toast.classList.add('show');
      
      setTimeout(() => {
        toast.classList.remove('show');
      }, 3000);
    }
  }

  /**
   * Format number for display
   * @param {number} num - Number to format
   * @returns {string} Formatted number
   */
  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  /**
   * Get friendly status text
   * @param {Object} status - Status object
   * @returns {string} Friendly status text
   */
  getFriendlyStatus(status) {
    if (!status) return 'Unknown';
    
    if (status.initialized && status.aiAvailable) {
      return 'Ready to help!';
    }
    if (status.initialized && !status.aiAvailable) {
      return 'AI features unavailable';
    }
    return 'Starting up...';
  }

  /**
   * Update popup periodically
   */
  startPeriodicUpdate() {
    setInterval(async () => {
      if (!this.isInitialized) return;
      
      try {
        await this.loadInitialData();
        this.updateUI();
      } catch (error) {
        // Silent fail for periodic updates
      }
    }, 5000); // Update every 5 seconds
  }
}

// Initialize popup when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const popup = new DevMentorPopup();
    popup.startPeriodicUpdate();
  });
} else {
  const popup = new DevMentorPopup();
  popup.startPeriodicUpdate();
}






 HEAD
 HEAD








 b285e24 ( HOTFIX: Aplicar correções críticas de segurança)



515fa31 (Normalize line endings)

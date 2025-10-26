/**
 * DevMentor AI - Message Handler Module
 * Advanced message handling with timeout protection and error boundaries
 */

export class MessageHandler {
  constructor() {
    this.handlers = new Map();
    this.setupRuntimeListener();
    this.requestTimeouts = new Map();
  }

  on(messageType, handler) {
    this.handlers.set(messageType, handler);
    console.log(`[MessageHandler] Registered handler for: ${messageType}`);
  }

  setupRuntimeListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      const handler = this.handlers.get(request.action);
      
      if (!handler) {
        console.warn(`[MessageHandler] Unknown action: ${request.action}`);
        sendResponse({ success: false, error: `Unknown action: ${request.action}` });
        return false;
      }

      // Execute handler with timeout protection
      this.executeWithTimeout(handler, request, sender, sendResponse)
        .catch(error => {
          console.error(`[MessageHandler] Handler failed for ${request.action}:`, error);
          sendResponse({ success: false, error: error.message });
        });

      return true; // Keep message channel open for async response
    });
  }

  async executeWithTimeout(handler, request, sender, sendResponse, timeout = 30000) {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const timeoutPromise = new Promise((_, reject) => {
      const timeoutId = setTimeout(() => {
        this.requestTimeouts.delete(requestId);
        reject(new Error(`Operation timeout after ${timeout}ms`));
      }, timeout);
      
      this.requestTimeouts.set(requestId, timeoutId);
    });

    const handlerPromise = Promise.resolve(handler(request, sender, sendResponse));
    
    try {
      const result = await Promise.race([handlerPromise, timeoutPromise]);
      this.requestTimeouts.delete(requestId);
      return result;
    } catch (error) {
      this.requestTimeouts.delete(requestId);
      throw error;
    }
  }

  // Cleanup method for service worker shutdown
  cleanup() {
    for (const timeoutId of this.requestTimeouts.values()) {
      clearTimeout(timeoutId);
    }
    this.requestTimeouts.clear();
    this.handlers.clear();
  }
}



















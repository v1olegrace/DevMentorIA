/**
 * Minimal storage manager providing the helpers required by the service worker.
 */

/* eslint-disable no-console, security/detect-object-injection */

const ANALYTICS_KEY = 'devmentorAnalytics';

export class StorageManager {
  async initialize () {
    // Nothing to do at the moment – placeholder for future migrations.
    return true;
  }

  async getData (key) {
    const result = await chrome.storage.local.get(key);
    return result[key];
  }

  async setData (key, value) {
    await chrome.storage.local.set({ [key]: value });
  }

  async cleanupOldData () {
    // Placeholder – extensions may store analytics or caches in the future.
    return true;
  }

  async trackEvent (eventName, data = {}) {
    const analytics = await this.getData(ANALYTICS_KEY) ?? [];
    analytics.push({
      event: eventName,
      data,
      timestamp: Date.now()
    });
    await this.setData(ANALYTICS_KEY, analytics);
  }
}

export default StorageManager;

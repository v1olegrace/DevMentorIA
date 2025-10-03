/**
 * DevMentor AI - Storage Manager Module
 * Handles secure storage with encryption and cleanup
 */

export class StorageManager {
  constructor() {
    this.encryptionKey = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Generate or retrieve encryption key
      this.encryptionKey = await this.getOrCreateEncryptionKey();
      this.isInitialized = true;
      console.log('[StorageManager] ✅ Initialized with encryption');
    } catch (error) {
      console.error('[StorageManager] ❌ Initialization failed:', error);
      throw error;
    }
  }

  async getOrCreateEncryptionKey() {
    try {
      const result = await chrome.storage.local.get(['encryptionKey']);
      
      if (result.encryptionKey) {
        return result.encryptionKey;
      }
      
      // Generate new key
      const key = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
      
      const exportedKey = await crypto.subtle.exportKey('raw', key);
      const keyString = Array.from(new Uint8Array(exportedKey))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      await chrome.storage.local.set({ encryptionKey: keyString });
      return keyString;
    } catch (error) {
      console.error('[StorageManager] Failed to get/create encryption key:', error);
      throw error;
    }
  }

  async storeSensitiveData(key, data) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    try {
      const encryptedData = await this.encrypt(JSON.stringify(data));
      await chrome.storage.session.set({ [key]: encryptedData });
      console.log(`[StorageManager] Stored sensitive data: ${key}`);
    } catch (error) {
      console.error(`[StorageManager] Failed to store sensitive data ${key}:`, error);
      throw error;
    }
  }

  async retrieveSensitiveData(key) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    try {
      const result = await chrome.storage.session.get([key]);
      if (!result[key]) {
        return null;
      }
      
      const decryptedData = await this.decrypt(result[key]);
      return JSON.parse(decryptedData);
    } catch (error) {
      console.error(`[StorageManager] Failed to retrieve sensitive data ${key}:`, error);
      return null;
    }
  }

  async encrypt(data) {
    try {
      const key = await this.getCryptoKey();
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encodedData = new TextEncoder().encode(data);
      
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encodedData
      );
      
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);
      
      return Array.from(combined).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.error('[StorageManager] Encryption failed:', error);
      throw error;
    }
  }

  async decrypt(encryptedData) {
    try {
      const key = await this.getCryptoKey();
      const combined = new Uint8Array(
        encryptedData.match(/.{2}/g).map(byte => parseInt(byte, 16))
      );
      
      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);
      
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encrypted
      );
      
      return new TextDecoder().decode(decrypted);
    } catch (error) {
      console.error('[StorageManager] Decryption failed:', error);
      throw error;
    }
  }

  async getCryptoKey() {
    const keyData = new Uint8Array(
      this.encryptionKey.match(/.{2}/g).map(byte => parseInt(byte, 16))
    );
    
    return await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async trackEvent(eventName, data = {}) {
    try {
      const events = await this.getStoredData('analytics_events') || [];
      
      events.push({
        event: eventName,
        data: data,
        timestamp: Date.now(),
        sessionId: await this.getSessionId()
      });
      
      // Keep only last 1000 events
      if (events.length > 1000) {
        events.splice(0, events.length - 1000);
      }
      
      await this.setStoredData('analytics_events', events);
    } catch (error) {
      console.error('[StorageManager] Failed to track event:', error);
    }
  }

  async getSessionId() {
    let sessionId = await this.getStoredData('sessionId');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await this.setStoredData('sessionId', sessionId);
    }
    return sessionId;
  }

  async getStoredData(key) {
    try {
      const result = await chrome.storage.local.get([key]);
      return result[key];
    } catch (error) {
      console.error(`[StorageManager] Failed to get data ${key}:`, error);
      return null;
    }
  }

  async setStoredData(key, value) {
    try {
      await chrome.storage.local.set({ [key]: value });
    } catch (error) {
      console.error(`[StorageManager] Failed to set data ${key}:`, error);
      throw error;
    }
  }

  async cleanupOldData() {
    try {
      const events = await this.getStoredData('analytics_events') || [];
      const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      
      const filteredEvents = events.filter(event => event.timestamp > oneWeekAgo);
      
      if (filteredEvents.length !== events.length) {
        await this.setStoredData('analytics_events', filteredEvents);
        console.log(`[StorageManager] Cleaned up ${events.length - filteredEvents.length} old events`);
      }
      
      // Clean up session storage
      await chrome.storage.session.clear();
      console.log('[StorageManager] ✅ Cleanup completed');
    } catch (error) {
      console.error('[StorageManager] Cleanup failed:', error);
    }
  }

  async clearAllData() {
    try {
      await chrome.storage.local.clear();
      await chrome.storage.session.clear();
      console.log('[StorageManager] ✅ All data cleared');
    } catch (error) {
      console.error('[StorageManager] Failed to clear data:', error);
      throw error;
    }
  }
}

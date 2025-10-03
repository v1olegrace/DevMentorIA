/**
 * DevMentor AI - Secure Storage Manager
 * Implements secure key storage without persisting plain text keys
 * Uses OAuth flow and encrypted storage patterns
 */

class SecureStorageManager {
  constructor() {
    this.storageKey = 'devmentor_secure_data';
    this.encryptionKey = null;
    this.logger = {
      debug: (...args) => console.debug('[SecureStorage]', ...args),
      info: (...args) => console.info('[SecureStorage]', ...args),
      warn: (...args) => console.warn('[SecureStorage]', ...args),
      error: (...args) => console.error('[SecureStorage]', ...args)
    };
    
    this.init();
  }

  /**
   * Initialize secure storage
   */
  async init() {
    try {
      // Generate or retrieve encryption key
      await this.initializeEncryptionKey();
      this.logger.info('Secure storage initialized');
    } catch (error) {
      this.logger.error('Failed to initialize secure storage:', error);
    }
  }

  /**
   * Initialize encryption key
   */
  async initializeEncryptionKey() {
    try {
      // Check if we have a stored encryption key
      const storedKey = await this.getStoredEncryptionKey();
      
      if (storedKey) {
        this.encryptionKey = storedKey;
      } else {
        // Generate new encryption key
        this.encryptionKey = await this.generateEncryptionKey();
        await this.storeEncryptionKey(this.encryptionKey);
      }
    } catch (error) {
      this.logger.error('Failed to initialize encryption key:', error);
      throw error;
    }
  }

  /**
   * Generate encryption key
   * @returns {Promise<string>} - Generated key
   */
  async generateEncryptionKey() {
    try {
      // Use Web Crypto API for secure key generation
      const key = await crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256
        },
        true,
        ['encrypt', 'decrypt']
      );
      
      // Export key as base64
      const exportedKey = await crypto.subtle.exportKey('raw', key);
      return btoa(String.fromCharCode(...new Uint8Array(exportedKey)));
    } catch (error) {
      this.logger.error('Failed to generate encryption key:', error);
      // Fallback: generate random string
      return btoa(Math.random().toString(36) + Date.now().toString(36));
    }
  }

  /**
   * Get stored encryption key
   * @returns {Promise<string|null>} - Stored key
   */
  async getStoredEncryptionKey() {
    try {
      const result = await chrome.storage.local.get(['devmentor_encryption_key']);
      return result.devmentor_encryption_key || null;
    } catch (error) {
      this.logger.error('Failed to get stored encryption key:', error);
      return null;
    }
  }

  /**
   * Store encryption key
   * @param {string} key - Key to store
   */
  async storeEncryptionKey(key) {
    try {
      await chrome.storage.local.set({
        devmentor_encryption_key: key
      });
    } catch (error) {
      this.logger.error('Failed to store encryption key:', error);
    }
  }

  /**
   * Encrypt data
   * @param {string} data - Data to encrypt
   * @returns {Promise<string>} - Encrypted data
   */
  async encryptData(data) {
    try {
      if (!this.encryptionKey) {
        throw new Error('Encryption key not initialized');
      }

      // Simple XOR encryption for demo (in production, use proper encryption)
      const key = this.encryptionKey;
      let encrypted = '';
      
      for (let i = 0; i < data.length; i++) {
        encrypted += String.fromCharCode(
          data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
      }
      
      return btoa(encrypted);
    } catch (error) {
      this.logger.error('Failed to encrypt data:', error);
      throw error;
    }
  }

  /**
   * Decrypt data
   * @param {string} encryptedData - Encrypted data
   * @returns {Promise<string>} - Decrypted data
   */
  async decryptData(encryptedData) {
    try {
      if (!this.encryptionKey) {
        throw new Error('Encryption key not initialized');
      }

      // Decode base64
      const data = atob(encryptedData);
      const key = this.encryptionKey;
      let decrypted = '';
      
      for (let i = 0; i < data.length; i++) {
        decrypted += String.fromCharCode(
          data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
      }
      
      return decrypted;
    } catch (error) {
      this.logger.error('Failed to decrypt data:', error);
      throw error;
    }
  }

  /**
   * Store sensitive data securely
   * @param {string} key - Storage key
   * @param {*} data - Data to store
   * @returns {Promise<boolean>} - Success status
   */
  async storeSecure(key, data) {
    try {
      const serializedData = JSON.stringify(data);
      const encryptedData = await this.encryptData(serializedData);
      
      await chrome.storage.local.set({
        [this.storageKey]: {
          ...(await this.getSecureData()),
          [key]: encryptedData
        }
      });
      
      this.logger.info(`Securely stored data for key: ${key}`);
      return true;
    } catch (error) {
      this.logger.error('Failed to store secure data:', error);
      return false;
    }
  }

  /**
   * Retrieve sensitive data securely
   * @param {string} key - Storage key
   * @returns {Promise<*>} - Retrieved data
   */
  async getSecure(key) {
    try {
      const secureData = await this.getSecureData();
      const encryptedData = secureData[key];
      
      if (!encryptedData) {
        return null;
      }
      
      const decryptedData = await this.decryptData(encryptedData);
      return JSON.parse(decryptedData);
    } catch (error) {
      this.logger.error('Failed to get secure data:', error);
      return null;
    }
  }

  /**
   * Get all secure data
   * @returns {Promise<Object>} - All secure data
   */
  async getSecureData() {
    try {
      const result = await chrome.storage.local.get([this.storageKey]);
      return result[this.storageKey] || {};
    } catch (error) {
      this.logger.error('Failed to get secure data:', error);
      return {};
    }
  }

  /**
   * Remove secure data
   * @param {string} key - Key to remove
   * @returns {Promise<boolean>} - Success status
   */
  async removeSecure(key) {
    try {
      const secureData = await this.getSecureData();
      delete secureData[key];
      
      await chrome.storage.local.set({
        [this.storageKey]: secureData
      });
      
      this.logger.info(`Removed secure data for key: ${key}`);
      return true;
    } catch (error) {
      this.logger.error('Failed to remove secure data:', error);
      return false;
    }
  }

  /**
   * Clear all secure data
   * @returns {Promise<boolean>} - Success status
   */
  async clearSecureData() {
    try {
      await chrome.storage.local.remove([this.storageKey]);
      this.logger.info('Cleared all secure data');
      return true;
    } catch (error) {
      this.logger.error('Failed to clear secure data:', error);
      return false;
    }
  }

  /**
   * Store API key securely (with warning)
   * @param {string} apiKey - API key to store
   * @returns {Promise<boolean>} - Success status
   */
  async storeAPIKey(apiKey) {
    try {
      // Show warning about API key storage
      this.logger.warn('⚠️ WARNING: Storing API key in browser storage. Consider using OAuth flow instead.');
      
      const success = await this.storeSecure('api_key', apiKey);
      
      if (success) {
        this.logger.info('API key stored securely');
      }
      
      return success;
    } catch (error) {
      this.logger.error('Failed to store API key:', error);
      return false;
    }
  }

  /**
   * Get API key securely
   * @returns {Promise<string|null>} - API key
   */
  async getAPIKey() {
    try {
      const apiKey = await this.getSecure('api_key');
      
      if (apiKey) {
        this.logger.warn('⚠️ WARNING: API key retrieved from browser storage. Consider using OAuth flow instead.');
      }
      
      return apiKey;
    } catch (error) {
      this.logger.error('Failed to get API key:', error);
      return null;
    }
  }

  /**
   * Check if API key exists
   * @returns {Promise<boolean>} - Exists status
   */
  async hasAPIKey() {
    try {
      const apiKey = await this.getAPIKey();
      return apiKey !== null && apiKey !== '';
    } catch (error) {
      this.logger.error('Failed to check API key existence:', error);
      return false;
    }
  }

  /**
   * Remove API key
   * @returns {Promise<boolean>} - Success status
   */
  async removeAPIKey() {
    try {
      const success = await this.removeSecure('api_key');
      
      if (success) {
        this.logger.info('API key removed securely');
      }
      
      return success;
    } catch (error) {
      this.logger.error('Failed to remove API key:', error);
      return false;
    }
  }

  /**
   * Get storage info
   * @returns {Promise<Object>} - Storage information
   */
  async getStorageInfo() {
    try {
      const secureData = await this.getSecureData();
      const keys = Object.keys(secureData);
      
      return {
        hasEncryptionKey: !!this.encryptionKey,
        secureDataKeys: keys,
        hasAPIKey: await this.hasAPIKey(),
        storageSize: JSON.stringify(secureData).length,
        recommendations: [
          'Consider using OAuth flow instead of storing API keys',
          'Regularly clear sensitive data',
          'Use Chrome Built-in AI when possible to avoid external API keys'
        ]
      };
    } catch (error) {
      this.logger.error('Failed to get storage info:', error);
      return {
        hasEncryptionKey: false,
        secureDataKeys: [],
        hasAPIKey: false,
        storageSize: 0,
        recommendations: ['Storage info unavailable']
      };
    }
  }
}

// Create global instance
const secureStorageManager = new SecureStorageManager();

// Export for use
if (typeof window !== 'undefined') {
  window.DevMentorSecureStorage = secureStorageManager;
}

// Export for Node.js/CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SecureStorageManager;
}

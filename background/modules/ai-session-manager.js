/**
 * DevMentor AI - AI Session Manager (ES6 Module)
 * Manages AI sessions using persistent storage instead of in-memory Maps
 * Follows official Chrome Extensions documentation for state persistence
 */

export class AISessionManager {
  constructor() {
    this.storageKey = 'aiSessions';
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      // Clean up expired sessions on initialization
      await this.cleanupExpiredSessions();
      this.isInitialized = true;
      console.log('[AISessionManager] ✅ Initialized successfully');
    } catch (error) {
      console.error('[AISessionManager] ❌ Initialization failed:', error);
      throw error;
    }
  }

  async initializeSession(userId) {
    try {
      // Read from persistent storage instead of global Map
      const result = await chrome.storage.local.get([this.storageKey]);
      const sessions = result[this.storageKey] || {};

      // Check and update the session
      if (!sessions[userId]) {
        sessions[userId] = {
          id: userId,
          startTime: Date.now(),
          requestCount: 0,
          lastActivity: Date.now(),
          status: 'active'
        };
      } else {
        sessions[userId].requestCount++;
        sessions[userId].lastActivity = Date.now();
        sessions[userId].status = 'active';
      }

      // Save the updated sessions back to persistent storage
      await chrome.storage.local.set({ [this.storageKey]: sessions });
      
      console.log(`[AISessionManager] Session initialized for user: ${userId}`);
      return sessions[userId];
      
    } catch (error) {
      console.error('[AISessionManager] Failed to initialize session:', error);
      throw error;
    }
  }

  async getSession(userId) {
    try {
      const result = await chrome.storage.local.get([this.storageKey]);
      const sessions = result[this.storageKey] || {};
      return sessions[userId] || null;
    } catch (error) {
      console.error('[AISessionManager] Failed to get session:', error);
      return null;
    }
  }

  async updateSession(userId, updates) {
    try {
      const result = await chrome.storage.local.get([this.storageKey]);
      const sessions = result[this.storageKey] || {};

      if (sessions[userId]) {
        sessions[userId] = {
          ...sessions[userId],
          ...updates,
          lastActivity: Date.now()
        };

        await chrome.storage.local.set({ [this.storageKey]: sessions });
        console.log(`[AISessionManager] Session updated for user: ${userId}`);
      }
    } catch (error) {
      console.error('[AISessionManager] Failed to update session:', error);
      throw error;
    }
  }

  async endSession(userId) {
    try {
      const result = await chrome.storage.local.get([this.storageKey]);
      const sessions = result[this.storageKey] || {};

      if (sessions[userId]) {
        sessions[userId].status = 'ended';
        sessions[userId].endTime = Date.now();
        sessions[userId].lastActivity = Date.now();

        await chrome.storage.local.set({ [this.storageKey]: sessions });
        console.log(`[AISessionManager] Session ended for user: ${userId}`);
      }
    } catch (error) {
      console.error('[AISessionManager] Failed to end session:', error);
      throw error;
    }
  }

  async cleanupExpiredSessions() {
    try {
      const result = await chrome.storage.local.get([this.storageKey]);
      const sessions = result[this.storageKey] || {};
      
      const now = Date.now();
      const oneHourAgo = now - (60 * 60 * 1000); // 1 hour
      const oneDayAgo = now - (24 * 60 * 60 * 1000); // 1 day
      
      let cleanedCount = 0;
      
      for (const [userId, session] of Object.entries(sessions)) {
        // Remove sessions that haven't been active for 1 hour
        if (session.lastActivity < oneHourAgo) {
          delete sessions[userId];
          cleanedCount++;
        }
        // Mark old sessions as inactive
        else if (session.lastActivity < oneDayAgo && session.status === 'active') {
          sessions[userId].status = 'inactive';
        }
      }
      
      if (cleanedCount > 0) {
        await chrome.storage.local.set({ [this.storageKey]: sessions });
        console.log(`[AISessionManager] Cleaned up ${cleanedCount} expired sessions`);
      }
      
    } catch (error) {
      console.error('[AISessionManager] Failed to cleanup expired sessions:', error);
    }
  }

  async getAllSessions() {
    try {
      const result = await chrome.storage.local.get([this.storageKey]);
      return result[this.storageKey] || {};
    } catch (error) {
      console.error('[AISessionManager] Failed to get all sessions:', error);
      return {};
    }
  }

  async getActiveSessions() {
    try {
      const sessions = await this.getAllSessions();
      const activeSessions = {};
      
      for (const [userId, session] of Object.entries(sessions)) {
        if (session.status === 'active') {
          activeSessions[userId] = session;
        }
      }
      
      return activeSessions;
    } catch (error) {
      console.error('[AISessionManager] Failed to get active sessions:', error);
      return {};
    }
  }

  async getSessionStats() {
    try {
      const sessions = await this.getAllSessions();
      const stats = {
        total: 0,
        active: 0,
        inactive: 0,
        ended: 0,
        totalRequests: 0
      };
      
      for (const session of Object.values(sessions)) {
        stats.total++;
        stats.totalRequests += session.requestCount || 0;
        
        switch (session.status) {
          case 'active':
            stats.active++;
            break;
          case 'inactive':
            stats.inactive++;
            break;
          case 'ended':
            stats.ended++;
            break;
        }
      }
      
      return stats;
    } catch (error) {
      console.error('[AISessionManager] Failed to get session stats:', error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
        ended: 0,
        totalRequests: 0
      };
    }
  }

  async clearAllSessions() {
    try {
      await chrome.storage.local.remove([this.storageKey]);
      console.log('[AISessionManager] All sessions cleared');
    } catch (error) {
      console.error('[AISessionManager] Failed to clear all sessions:', error);
      throw error;
    }
  }

  // Utility method to check if a session exists
  async hasSession(userId) {
    const session = await this.getSession(userId);
    return session !== null;
  }

  // Utility method to get session age
  getSessionAge(session) {
    if (!session || !session.startTime) {
      return 0;
    }
    return Date.now() - session.startTime;
  }

  // Utility method to check if session is expired
  isSessionExpired(session, maxAgeMinutes = 60) {
    if (!session || !session.lastActivity) {
      return true;
    }
    const maxAge = maxAgeMinutes * 60 * 1000; // Convert to milliseconds
    return (Date.now() - session.lastActivity) > maxAge;
  }
}

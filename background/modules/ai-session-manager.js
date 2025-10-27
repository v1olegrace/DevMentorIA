/**
 * Minimal AI session manager backed by chrome.storage.local
 * Stores per-user session metadata and exposes the subset of methods
 * consumed by the service worker.
 */

/* eslint-disable no-console, security/detect-object-injection */

const STORAGE_KEY = 'aiSessions';
const SESSION_TIMEOUT = 1000 * 60 * 30; // 30 minutes

export class AISessionManager {
  constructor () {
    this.initialized = false;
  }

  async initialize () {
    if (this.initialized) {
      return;
    }

    await this.cleanupExpiredSessions();
    this.initialized = true;
    console.info('[AISessionManager] Initialized');
  }

  async startSession (userId) {
    const sessions = await this.#readSessions();
    const session = sessions[userId] ?? {
      id: userId,
      startTime: Date.now(),
      lastActivity: Date.now(),
      requestCount: 0,
      status: 'active'
    };

    session.lastActivity = Date.now();
    session.requestCount += 1;
    sessions[userId] = session;

    await chrome.storage.local.set({ [STORAGE_KEY]: sessions });
    return session;
  }

  async endSession (userId) {
    const sessions = await this.#readSessions();
    if (!sessions[userId]) return;

    sessions[userId].status = 'ended';
    sessions[userId].endedAt = Date.now();
    await chrome.storage.local.set({ [STORAGE_KEY]: sessions });
  }

  async cleanupExpiredSessions () {
    const sessions = await this.#readSessions();
    const threshold = Date.now() - SESSION_TIMEOUT;
    let modified = false;

    for (const session of Object.values(sessions)) {
      if (session.status === 'ended') continue;
      if ((session.lastActivity ?? 0) < threshold) {
        session.status = 'expired';
        session.endedAt = Date.now();
        modified = true;
      }
    }

    if (modified) {
      await chrome.storage.local.set({ [STORAGE_KEY]: sessions });
      console.info('[AISessionManager] Expired sessions cleaned up');
    }
  }

  async getMetrics () {
    const sessions = await this.#readSessions();
    const values = Object.values(sessions);
    const active = values.filter(session => session.status === 'active');

    return {
      totalSessions: values.length,
      activeSessions: active.length,
      lastCleanup: Date.now()
    };
  }

  async #readSessions () {
    const data = await chrome.storage.local.get(STORAGE_KEY);
    return data[STORAGE_KEY] ?? {};
  }
}

export default AISessionManager;

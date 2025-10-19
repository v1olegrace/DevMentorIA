/**
 * DevMentor AI - Context Menu Manager Module
 * Handles context menu creation and management with proper error handling
 */

export class ContextMenuManager {
  constructor() {
    this.createdMenus = new Set();
  }

  async create(menuItem) {
    try {
      await chrome.contextMenus.create(menuItem);
      this.createdMenus.add(menuItem.id);
      console.log(`[ContextMenuManager] Created menu: ${menuItem.id}`);
    } catch (error) {
      console.error(`[ContextMenuManager] Failed to create menu ${menuItem.id}:`, error);
      throw error;
    }
  }

  async clearAll() {
    try {
      await chrome.contextMenus.removeAll();
      this.createdMenus.clear();
      console.log('[ContextMenuManager] ✅ All context menus cleared');
    } catch (error) {
      console.error('[ContextMenuManager] Failed to clear menus:', error);
      throw error;
    }
  }

  async remove(menuItemId) {
    try {
      await chrome.contextMenus.remove(menuItemId);
      this.createdMenus.delete(menuItemId);
      console.log(`[ContextMenuManager] Removed menu: ${menuItemId}`);
    } catch (error) {
      console.error(`[ContextMenuManager] Failed to remove menu ${menuItemId}:`, error);
      throw error;
    }
  }

  hasMenu(menuItemId) {
    return this.createdMenus.has(menuItemId);
  }

  getCreatedMenus() {
    return Array.from(this.createdMenus);
  }
}



















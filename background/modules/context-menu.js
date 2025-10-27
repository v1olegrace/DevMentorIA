/**
 * Thin wrapper around chrome.contextMenus with Promise helpers.
 */

/* eslint-disable no-console */

export class ContextMenuManager {
  async create (item) {
    await this.clear(item.id);

    return new Promise((resolve, reject) => {
      chrome.contextMenus.create(item, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  }

  async clear (id) {
    if (!id) return;

    return new Promise(resolve => {
      chrome.contextMenus.remove(id, () => resolve());
    });
  }

  async clearAll () {
    return new Promise(resolve => {
      chrome.contextMenus.removeAll(() => resolve());
    });
  }
}

export default ContextMenuManager;

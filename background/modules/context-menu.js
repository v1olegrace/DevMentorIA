/**
 * Thin wrapper around chrome.contextMenus with Promise helpers.
 */

/* eslint-disable no-console */

export class ContextMenuManager {
  async create (item) {
    return new Promise((resolve, reject) => {
      chrome.contextMenus.create(item, () => {
        const error = chrome.runtime.lastError;
        if (!error) {
          resolve();
          return;
        }

        const message = error.message || '';
        if (message.includes('duplicate id')) {
          chrome.contextMenus.update(item.id, item, () => {
            const updateError = chrome.runtime.lastError;
            if (updateError) {
              reject(new Error(updateError.message));
            } else {
              resolve();
            }
          });
          return;
        }

        if (message.includes('Cannot find menu item')) {
          // benign race: menu was already removed
          resolve();
          return;
        }

        reject(new Error(message));
      });
    });
  }

  async clear (id) {
    if (!id) return;

    return new Promise(resolve => {
      chrome.contextMenus.remove(id, () => {
        // Ignore "Cannot find menu item" errors as we're clearing defensively
        if (chrome.runtime.lastError) {
          console.debug('[ContextMenuManager] clear noop:', chrome.runtime.lastError.message);
        }
        resolve();
      });
    });
  }

  async clearAll () {
    return new Promise(resolve => {
      chrome.contextMenus.removeAll(() => {
        // ignore errors caused by already cleared menus
        resolve();
      });
    });
  }
}

export default ContextMenuManager;

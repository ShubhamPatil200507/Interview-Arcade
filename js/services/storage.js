/**
 * Interview Arcade — Storage Service
 * Versioned local storage wrapper with memory fallback and recovery.
 */

const STORAGE_VERSION = 1;
const STORAGE_PREFIX = `interview_arcade_v${STORAGE_VERSION}_`;

class StorageService {
  constructor() {
    this.memoryStore = new Map();
    this.isLocalStorageAvailable = this._checkLocalStorage();
  }

  _checkLocalStorage() {
    try {
      const testKey = '__ia_test__';
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.warn('localStorage is unavailable; falling back to in-memory storage.', e);
      return false;
    }
  }

  get(key, defaultValue = null) {
    const fullKey = STORAGE_PREFIX + key;
    try {
      let raw = null;
      if (this.isLocalStorageAvailable) {
        raw = window.localStorage.getItem(fullKey);
      } else {
        raw = this.memoryStore.get(fullKey) || null;
      }

      if (raw === null || raw === undefined) {
        return defaultValue;
      }
      return JSON.parse(raw);
    } catch (err) {
      console.error(`Failed to parse stored key "${key}". Returning default value.`, err);
      return defaultValue;
    }
  }

  set(key, value) {
    const fullKey = STORAGE_PREFIX + key;
    try {
      const serialized = JSON.stringify(value);
      if (this.isLocalStorageAvailable) {
        window.localStorage.setItem(fullKey, serialized);
      } else {
        this.memoryStore.set(fullKey, serialized);
      }
      return true;
    } catch (err) {
      console.error(`Failed to store key "${key}".`, err);
      return false;
    }
  }

  remove(key) {
    const fullKey = STORAGE_PREFIX + key;
    try {
      if (this.isLocalStorageAvailable) {
        window.localStorage.removeItem(fullKey);
      } else {
        this.memoryStore.delete(fullKey);
      }
      return true;
    } catch (err) {
      console.error(`Failed to remove key "${key}".`, err);
      return false;
    }
  }

  clearAllArcadeData() {
    try {
      if (this.isLocalStorageAvailable) {
        const keysToRemove = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const k = window.localStorage.key(i);
          if (k && k.startsWith(STORAGE_PREFIX)) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach(k => window.localStorage.removeItem(k));
      }
      this.memoryStore.clear();
      return true;
    } catch (err) {
      console.error('Failed to clear arcade data.', err);
      return false;
    }
  }

  exportData() {
    const data = {};
    try {
      if (this.isLocalStorageAvailable) {
        for (let i = 0; i < window.localStorage.length; i++) {
          const k = window.localStorage.key(i);
          if (k && k.startsWith(STORAGE_PREFIX)) {
            const shortKey = k.replace(STORAGE_PREFIX, '');
            data[shortKey] = this.get(shortKey);
          }
        }
      } else {
        for (const [k, v] of this.memoryStore.entries()) {
          const shortKey = k.replace(STORAGE_PREFIX, '');
          data[shortKey] = JSON.parse(v);
        }
      }
      return JSON.stringify(data, null, 2);
    } catch (e) {
      console.error('Failed to export data.', e);
      return null;
    }
  }
}

export const storage = new StorageService();

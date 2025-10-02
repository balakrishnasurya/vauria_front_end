/**
 * Safe wrapper around localStorage with type support
 */
export class LocalStorageService {
  private readonly isClient = typeof window !== 'undefined';

  private ensureClient(): boolean {
    if (!this.isClient) {
      console.warn('localStorage not available.');
      return false;
    }
    return true;
  }

  private handleError(action: string, key?: string, error?: unknown): void {
    console.warn(`localStorage ${action} failed${key ? `: ${key}` : ''}`, error);
  }

  // Basic CRUD
  getItem(key: string): string | null {
    if (!this.ensureClient()) return null;
    try {
      return localStorage.getItem(key);
    } catch (e) {
      this.handleError('get', key, e);
      return null;
    }
  }

  setItem(key: string, value: string): boolean {
    if (!this.ensureClient()) return false;
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      this.handleError('set', key, e);
      return false;
    }
  }

  removeItem(key: string): boolean {
    if (!this.ensureClient()) return false;
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      this.handleError('remove', key, e);
      return false;
    }
  }

  clear(): boolean {
    if (!this.ensureClient()) return false;
    try {
      localStorage.clear();
      return true;
    } catch (e) {
      this.handleError('clear', undefined, e);
      return false;
    }
  }

  // JSON helpers
  getJSON<T>(key: string): T | null {
    const item = this.getItem(key);
    if (!item) return null;
    try {
      return JSON.parse(item) as T;
    } catch (e) {
      this.handleError('parse JSON', key, e);
      return null;
    }
  }

  setJSON<T>(key: string, value: T): boolean {
    try {
      return this.setItem(key, JSON.stringify(value));
    } catch (e) {
      this.handleError('stringify JSON', key, e);
      return false;
    }
  }

  // Utilities
  hasItem(key: string): boolean {
    return this.getItem(key) !== null;
  }

  getAllKeys(): string[] {
    if (!this.ensureClient()) return [];
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) keys.push(key);
      }
      return keys;
    } catch (e) {
      this.handleError('get keys', undefined, e);
      return [];
    }
  }

  removeItems(keys: string[]): boolean {
    if (!this.ensureClient()) return false;
    try {
      keys.forEach((k) => this.removeItem(k));
      return true;
    } catch (e) {
      this.handleError('remove multiple', undefined, e);
      return false;
    }
  }

  getStorageSize(): number {
    if (!this.ensureClient()) return 0;
    try {
      let total = 0;
      for (const key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          const val = localStorage.getItem(key) ?? '';
          total += key.length + val.length;
        }
      }
      return total;
    } catch (e) {
      this.handleError('calc size', undefined, e);
      return 0;
    }
  }
}

export const localStorageService = new LocalStorageService();

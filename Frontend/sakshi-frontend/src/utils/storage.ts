/**
 * Type-safe localStorage helpers with JSON serialization and error swallowing.
 */
export const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.warn(`storage.set: failed to write key "${key}"`);
    }
  },

  remove(key: string): void {
    try { localStorage.removeItem(key); } catch { /* noop */ }
  },

  clear(): void {
    try { localStorage.clear(); } catch { /* noop */ }
  },
};

/** Session storage variant */
export const session = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = sessionStorage.getItem(key);
      return raw !== null ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set<T>(key: string, value: T): void {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch { /* noop */ }
  },
  remove(key: string): void {
    try { sessionStorage.removeItem(key); } catch { /* noop */ }
  },
};

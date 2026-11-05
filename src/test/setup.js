import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Recent Node versions ship their own experimental localStorage global, which
// hides jsdom's and is undefined unless Node is given a storage file. Provide an
// in-memory Storage so tests behave like a browser.
if (typeof globalThis.localStorage === 'undefined' || globalThis.localStorage === null) {
  class MemoryStorage {
    #items = new Map();
    get length() { return this.#items.size; }
    key(index) { return [...this.#items.keys()][index] ?? null; }
    getItem(key) { return this.#items.has(key) ? this.#items.get(key) : null; }
    setItem(key, value) { this.#items.set(String(key), String(value)); }
    removeItem(key) { this.#items.delete(key); }
    clear() { this.#items.clear(); }
  }
  Object.defineProperty(globalThis, 'localStorage', { value: new MemoryStorage(), configurable: true, writable: true });
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  // Each test starts without responses cached by earlier tests
  localStorage.clear();
});

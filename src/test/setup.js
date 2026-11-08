import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { resetApiState } from '../app/api';

// Always provide our own in-memory Storage rather than relying on whatever the
// environment supplies. Node ships an experimental localStorage global and jsdom
// supplies one too, and jsdom's is a proxy-backed platform object that silently
// swallows `vi.spyOn(localStorage, ...)` (the spy is stored as a named item
// instead of replacing the method), so tests of the quota path never ran.
// A plain object behaves like a browser's and can be spied on. `window` is the
// global object under vitest's jsdom environment, so this covers both.
{
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
  // Forget which API server failed in the previous test
  resetApiState();
});

import { describe, it, expect, vi } from 'vitest';
import { getCached, setCached, pruneCache, clearCache, CACHE_PREFIX, CACHE_TTL_MS } from './cache';

const at = (time) => vi.spyOn(Date, 'now').mockReturnValue(time);
const T0 = 1_700_000_000_000;

describe('response cache', () => {
  it('returns saved data while it is fresh', () => {
    at(T0);
    setCached('page', { results: [1] });
    at(T0 + CACHE_TTL_MS - 1);
    expect(getCached('page')).toEqual({ results: [1] });
  });

  it('treats expired data as missing and removes it', () => {
    at(T0);
    setCached('page', { results: [1] });
    at(T0 + CACHE_TTL_MS);
    expect(getCached('page')).toBeUndefined();
    expect(localStorage.getItem(CACHE_PREFIX + 'page')).toBeNull();
  });

  it('drops unreadable entries', () => {
    localStorage.setItem(CACHE_PREFIX + 'broken', '{not json');
    localStorage.setItem(CACHE_PREFIX + 'wrong-shape', JSON.stringify({ results: [] }));
    expect(getCached('broken')).toBeUndefined();
    expect(getCached('wrong-shape')).toBeUndefined();
    expect(localStorage.getItem(CACHE_PREFIX + 'broken')).toBeNull();
  });

  it('does not let an older request overwrite a newer response', () => {
    at(T0 + 200);
    setCached('page', 'newer', T0 + 100);
    // A request that started before the newer one was saved finishes later
    at(T0 + 300);
    setCached('page', 'older', T0);
    expect(getCached('page')).toBe('newer');
  });

  it('lets a newer request replace an older response', () => {
    at(T0);
    setCached('page', 'older', T0);
    at(T0 + 100);
    setCached('page', 'newer', T0 + 50);
    expect(getCached('page')).toBe('newer');
  });

  it('prunes only expired entries and leaves unrelated storage alone', () => {
    at(T0);
    setCached('old', 1);
    at(T0 + CACHE_TTL_MS / 2);
    setCached('recent', 2);
    localStorage.setItem('someone-else', 'keep');
    at(T0 + CACHE_TTL_MS + 1);
    pruneCache();
    expect(localStorage.getItem(CACHE_PREFIX + 'old')).toBeNull();
    expect(getCached('recent')).toBe(2);
    expect(localStorage.getItem('someone-else')).toBe('keep');
  });

  it('clears only its own entries', () => {
    setCached('a', 1);
    localStorage.setItem('someone-else', 'keep');
    clearCache();
    expect(getCached('a')).toBeUndefined();
    expect(localStorage.getItem('someone-else')).toBe('keep');
  });

  it('frees expired entries when storage is full and carries on if it still does not fit', () => {
    at(T0);
    setCached('old', 1);
    at(T0 + CACHE_TTL_MS + 1);
    const realSetItem = localStorage.setItem.bind(localStorage);
    const setItem = vi.spyOn(localStorage, 'setItem')
      .mockImplementationOnce(() => { throw new DOMException('full', 'QuotaExceededError'); })
      .mockImplementation(realSetItem);
    expect(() => setCached('new', 2)).not.toThrow();
    expect(localStorage.getItem(CACHE_PREFIX + 'old')).toBeNull();
    expect(getCached('new')).toBe(2);

    setItem.mockImplementation(() => { throw new DOMException('full', 'QuotaExceededError'); });
    expect(() => setCached('too-big', 3)).not.toThrow();
  });

  it('works without storage', () => {
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => { throw new Error('blocked'); });
    expect(() => setCached('a', 1)).not.toThrow();
    expect(getCached('a')).toBeUndefined();
    expect(() => pruneCache()).not.toThrow();
  });
});

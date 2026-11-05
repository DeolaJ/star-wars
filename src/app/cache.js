// Response cache kept in localStorage so a returning visitor does not repeat
// the same API requests. Entries expire after CACHE_TTL_MS; bump the version in
// CACHE_PREFIX if the shape of cached data ever changes.
export const CACHE_PREFIX = 'swapi-cache:v1:';
export const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const storage = () => {
  try {
    return window.localStorage;
  } catch {
    // Storage can be unavailable (privacy mode, blocked cookies); run uncached
    return null;
  }
};

const readEntry = (key) => {
  const store = storage();
  if (!store) return null;
  const raw = store.getItem(CACHE_PREFIX + key);
  if (raw === null) return null;
  try {
    const entry = JSON.parse(raw);
    if (typeof entry.savedAt === 'number' && 'data' in entry) return entry;
  } catch {
    // Fall through and drop the corrupt entry
  }
  store.removeItem(CACHE_PREFIX + key);
  return null;
};

const isFresh = (entry, now = Date.now()) => now - entry.savedAt < CACHE_TTL_MS;

// Returns the cached data, or undefined when it is missing or has expired
export const getCached = (key) => {
  const entry = readEntry(key);
  if (!entry) return undefined;
  if (!isFresh(entry)) {
    storage().removeItem(CACHE_PREFIX + key);
    return undefined;
  }
  return entry.data;
};

const cacheKeys = (store) => {
  const keys = [];
  for (let i = 0; i < store.length; i++) {
    const key = store.key(i);
    if (key && key.startsWith(CACHE_PREFIX)) keys.push(key.slice(CACHE_PREFIX.length));
  }
  return keys;
};

// Removes every expired or unreadable entry
export const pruneCache = () => {
  const store = storage();
  if (!store) return;
  cacheKeys(store).forEach(key => {
    const entry = readEntry(key);
    if (entry && !isFresh(entry)) store.removeItem(CACHE_PREFIX + key);
  });
};

// Saves data fetched by a request that started at `requestedAt`. If a newer
// response for the same key has been saved in the meantime, the older one is
// discarded so it cannot overwrite fresher data.
export const setCached = (key, data, requestedAt = Date.now()) => {
  const store = storage();
  if (!store) return;
  const existing = readEntry(key);
  if (existing && existing.savedAt > requestedAt) return;
  const value = JSON.stringify({ savedAt: Date.now(), data });
  try {
    store.setItem(CACHE_PREFIX + key, value);
  } catch {
    // Storage is full: make room by dropping expired entries and try once more.
    // If it still does not fit the app carries on without caching this response.
    pruneCache();
    try {
      store.setItem(CACHE_PREFIX + key, value);
    } catch {
      // Ignore
    }
  }
};

export const clearCache = () => {
  const store = storage();
  if (!store) return;
  cacheKeys(store).forEach(key => store.removeItem(CACHE_PREFIX + key));
};

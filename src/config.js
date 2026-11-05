// Base URL for the Star Wars API.
export const API_BASE_URL = 'https://swapi.dev/api';

// Mirror with the same data and response format, used when swapi.dev fails.
// It has a few newer entries at the end of each list that swapi.dev does not.
export const API_FALLBACK_BASE_URL = 'https://swapi.py4e.com/api';

// Tried in order for every request
export const API_BASE_URLS = [API_BASE_URL, API_FALLBACK_BASE_URL];

// A request that takes longer than this counts as failed, so a server that
// hangs instead of erroring still falls through to the mirror
export const API_TIMEOUT_MS = 8000;

// After swapi.dev fails, the mirror is tried first for this long
export const API_PRIMARY_RETRY_MS = 5 * 60 * 1000;

// Paths of each resource, relative to a base URL
export const API_PATHS = {
  characters: 'people/',
  planets: 'planets/',
  starships: 'starships/',
};

// Endpoints for the first page of each resource on swapi.dev. Cache entries are
// keyed by these URLs whichever server answered, so they stay valid either way.
export const API_ENDPOINTS = {
  characters: `${API_BASE_URL}/${API_PATHS.characters}`,
  planets: `${API_BASE_URL}/${API_PATHS.planets}`,
  starships: `${API_BASE_URL}/${API_PATHS.starships}`,
};

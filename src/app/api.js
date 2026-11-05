import {
  API_BASE_URL, API_BASE_URLS, API_TIMEOUT_MS, API_PRIMARY_RETRY_MS,
} from '../config';

// When swapi.dev last failed, so the mirror can be tried first for a while
let primaryFailedAt = null;

export const resetApiState = () => {
  primaryFailedAt = null;
};

const baseOrder = () => {
  const primaryRecentlyFailed = primaryFailedAt !== null
    && Date.now() - primaryFailedAt < API_PRIMARY_RETRY_MS;
  return primaryRecentlyFailed ? [...API_BASE_URLS.slice(1), API_BASE_URL] : API_BASE_URLS;
};

// Turns an absolute API link, such as a `next` link from either server, back
// into a path so it can be requested from whichever server is working
export const toApiPath = (url) => {
  const base = API_BASE_URLS.find(candidate => url.startsWith(`${candidate}/`));
  if (!base) {
    throw new Error(`Unexpected API link: ${url}`);
  }
  return url.slice(base.length + 1);
};

const getJSON = async (url) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (response.ok === false) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error('The request timed out');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
};

// Requests `path` from swapi.dev, falling back to the mirror. `validate` should
// throw for a response that cannot be used, so an incomplete body from one
// server also falls through to the other. If both fail, the error from
// swapi.dev is the one reported.
export const fetchFromAPI = async (path, validate = body => body) => {
  const errors = new Map();
  for (const base of baseOrder()) {
    try {
      const body = validate(await getJSON(`${base}/${path}`));
      if (base === API_BASE_URL) primaryFailedAt = null;
      return body;
    } catch (error) {
      errors.set(base, error);
      if (base === API_BASE_URL) primaryFailedAt = Date.now();
    }
  }
  throw errors.get(API_BASE_URL) || [...errors.values()][0];
};

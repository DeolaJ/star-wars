import { API_BASE_URL, API_PATHS } from '../config';
import { RESOURCE_KEYS } from '../resources';
import { fetchFromAPI, toApiPath } from './api';
import { getCached, setCached } from './cache';
import { stateKeys } from './selectors';

export const FETCH_PAGE_START = "FETCH_PAGE_START";
export const FETCH_PAGE_SUCCESS = "FETCH_PAGE_SUCCESS";
export const FETCH_PAGE_FAILURE = "FETCH_PAGE_FAILURE";
export const SEARCH_RESOURCE = "SEARCH_RESOURCE";
export const SEARCH_ALL = "SEARCH_ALL";
export const RESET_SEARCH_RESOURCE = "RESET_SEARCH_RESOURCE";
export const RESET_SEARCH_ALL = "RESET_SEARCH_ALL";
export const SET_RECENTLY_VIEWED = "SET_RECENTLY_VIEWED";
export const SET_DESCRIPTION = "SET_DESCRIPTION";

const action = (type) => (payload) => ({ type, payload });

const fetchPageStart = action(FETCH_PAGE_START);
const fetchPageSuccess = action(FETCH_PAGE_SUCCESS);
const fetchPageFailure = action(FETCH_PAGE_FAILURE);
const searchResource = action(SEARCH_RESOURCE);
const searchAll = action(SEARCH_ALL);
const resetSearchResource = action(RESET_SEARCH_RESOURCE);
const resetAll = action(RESET_SEARCH_ALL);
const recentlyViewed = action(SET_RECENTLY_VIEWED);
const setDescription = action(SET_DESCRIPTION);

// A response is only used, and cached, if it has the shape SWAPI returns.
// Anything else (an HTML error page, a truncated body) is treated as a failure.
const assertResults = (body, needsCount) => {
  const complete = body && Array.isArray(body.results) && (!needsCount || typeof body.count === 'number');
  if (!complete) {
    throw new Error('Incomplete response from the API');
  }
  return body;
};

// Pages come from the cache when a fresh copy exists, otherwise from the API
// (swapi.dev, or the mirror if it fails). Only complete responses are saved,
// keyed by the swapi.dev URL whichever server answered.
const getPage = async (path) => {
  const cacheKey = `${API_BASE_URL}/${path}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;
  const requestedAt = Date.now();
  const body = await fetchFromAPI(path, response => assertResults(response, true));
  const page = { count: body.count, results: body.results };
  setCached(cacheKey, page, requestedAt);
  return page;
};

// Loading Action Creators
// SWAPI returns 10 results per page, which matches the page size of the list pages,
// so a page of the UI is exactly one request. Page 1 is the initial load of a
// resource; later pages are fetched when the user opens them.
export const doFetchPage = (resource, page) => (dispatch, getState) => {
  const paging = getState().app[stateKeys(resource).paging];
  if (paging.pages[page] || paging.loading[page]) {
    // Already loaded or on its way
    return Promise.resolve();
  }
  dispatch(fetchPageStart({ resource, page }));

  return getPage(`${API_PATHS[resource]}?page=${page}`)
  .then(response => {
    dispatch(fetchPageSuccess({
      resource,
      page,
      results: response.results,
      count: response.count,
    }))
  })
  .catch(error => {
    dispatch(fetchPageFailure({
      resource,
      page,
      error: { message: error.message },
    }))
  })
}

// Search runs against the API so it covers every page, not only the loaded ones.
// SWAPI also matches starship models, so results are narrowed to name matches
// to keep the previous behaviour.
// The finished result of a search is cached as one entry, and only once every
// page of it has loaded, so a search that fails part way is never stored.
const fetchSearchResults = async (resource, param) => {
  const filter = param.toLowerCase();
  const cacheKey = `search:${resource}:${filter}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const requestedAt = Date.now();
  let results = [];
  let path = `${API_PATHS[resource]}?search=${encodeURIComponent(param)}`;
  while (path) {
    const response = await fetchFromAPI(path, body => assertResults(body, false));
    results = [...results, ...response.results];
    // The next link points at whichever server answered; follow it as a path
    // so a later page can still fall back
    path = response.next ? toApiPath(response.next) : null;
  }
  const matches = results.filter(item => item.name.toLowerCase().includes(filter));
  setCached(cacheKey, matches, requestedAt);
  return matches;
};

const getSearchResults = (state, resource, param) => {
  const cache = state.app[stateKeys(resource).search];
  return param in cache ? Promise.resolve(cache[param]) : fetchSearchResults(resource, param);
};

// The latest query per search box, so slow responses for older queries are ignored
const latestSearch = {};

// Filter Action Creators
export const doSearch = (resource, param) => async (dispatch, getState) => {
  latestSearch[resource] = param;
  let results;
  let failed = false;
  try {
    results = await getSearchResults(getState(), resource, param);
  } catch {
    // Shown as no results, as before, but not remembered so it can be retried
    results = [];
    failed = true;
  }
  if (latestSearch[resource] !== param) return;
  return dispatch(searchResource({ resource, param, results, failed }))
};

export const doSearchAll = (param) => async (dispatch, getState) => {
  latestSearch.all = param;
  const state = getState();
  const failed = {};
  const settled = await Promise.all(
    RESOURCE_KEYS.map(resource => (
      getSearchResults(state, resource, param).catch(() => {
        failed[resource] = true;
        return [];
      })
    ))
  );
  if (latestSearch.all !== param) return;
  const results = Object.fromEntries(RESOURCE_KEYS.map((resource, index) => [resource, settled[index]]));
  return dispatch(searchAll({ param, results, failed }))
}

export const resetSearch = (resource) => (dispatch) => {
  latestSearch[resource] = null;
  return dispatch(resetSearchResource({ resource }))
}

export const resetSearchAll = () => (dispatch) => {
  latestSearch.all = null;
  return dispatch(resetAll())
}

export const setRecentlyViewed = (type, item) => (dispatch) => (
  dispatch(recentlyViewed({
    type,
    item
  }))
)

// Items that are already in the store (loaded pages, search results, recently
// viewed) are used directly. Anything else, such as a description URL for an item
// on a page that has not been loaded, is looked up through the search API.
const findLoadedItem = (app, category, name) => {
  const keys = stateKeys(category);
  const candidates = [
    ...app[keys.items],
    ...(app.recentlyViewed[category] || []),
    ...Object.values(app[keys.search]).flat(),
  ];
  return candidates.find(item => item.name && item.name.toLowerCase() === name);
};

export const doSetDescription = (category, name) => async (dispatch, getState) => {
  let item = findLoadedItem(getState().app, category, name);
  if (!item) {
    try {
      const results = await fetchSearchResults(category, name);
      item = results.find(result => result.name.toLowerCase() === name);
    } catch {
      item = undefined;
    }
  }
  if (!item) return;
  return dispatch(setDescription({
    category,
    name,
    item,
  }))
}

export default {
  doFetchPage,
  doSearch,
  doSearchAll,
  resetSearch,
  resetSearchAll,
  setRecentlyViewed,
  doSetDescription,
}

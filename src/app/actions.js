import { API_ENDPOINTS } from '../config';

export const FETCH_PAGE_START = "FETCH_PAGE_START";
export const FETCH_PAGE_SUCCESS = "FETCH_PAGE_SUCCESS";
export const FETCH_PAGE_FAILURE = "FETCH_PAGE_FAILURE";
export const SEARCH_ALL = "SEARCH_ALL";
export const SEARCH_CHARACTERS = "SEARCH_CHARACTERS";
export const SEARCH_PLANETS = "SEARCH_PLANETS";
export const SEARCH_STARSHIPS = "SEARCH_STARSHIPS";
export const RESET_SEARCH_ALL = "RESET_SEARCH_ALL";
export const RESET_SEARCH_CHARACTERS = "RESET_SEARCH_CHARACTERS";
export const RESET_SEARCH_PLANETS = "RESET_SEARCH_PLANETS";
export const RESET_SEARCH_STARSHIPS = "RESET_SEARCH_STARSHIPS";
export const SET_RECENTLY_VIEWED = "SET_RECENTLY_VIEWED";
export const SET_DESCRIPTION = "SET_DESCRIPTION";

const fetchPageStart = (payload) => ({
  type: FETCH_PAGE_START,
  payload,
})

const fetchPageSuccess = (payload) => ({
  type: FETCH_PAGE_SUCCESS,
  payload,
})

const fetchPageFailure = (payload) => ({
  type: FETCH_PAGE_FAILURE,
  payload,
})

const searchAll = (payload) => ({
  type: SEARCH_ALL,
  payload,
})

const searchCharacters = (payload) => ({
  type: SEARCH_CHARACTERS,
  payload,
})

const searchPlanets = (payload) => ({
  type: SEARCH_PLANETS,
  payload,
})

const searchStarships = (payload) => ({
  type: SEARCH_STARSHIPS,
  payload,
})

const resetAll = (payload) => ({
  type: RESET_SEARCH_ALL,
  payload,
})

const resetCharacters = (payload) => ({
  type: RESET_SEARCH_CHARACTERS,
  payload,
})

const resetPlanets = (payload) => ({
  type: RESET_SEARCH_PLANETS,
  payload,
})

const resetStarships = (payload) => ({
  type: RESET_SEARCH_STARSHIPS,
  payload,
})

const recentlyViewed = (payload) => ({
  type: SET_RECENTLY_VIEWED,
  payload,
})

const setDescription = (payload) => ({
  type: SET_DESCRIPTION,
  payload,
})

const getJSON = (url) => fetch(url).then(response => {
  if (response.ok === false) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json();
});

// Loading Action Creators
// SWAPI returns 10 results per page, which matches the page size of the list pages,
// so a page of the UI is exactly one request.
export const doFetchPage = (resource, page) => (dispatch, getState) => {
  const paging = getState().app[`${resource}Paging`];
  if (paging.pages[page] || paging.loading[page]) {
    // Already loaded or on its way
    return Promise.resolve();
  }
  dispatch(fetchPageStart({ resource, page }));

  return getJSON(`${API_ENDPOINTS[resource]}?page=${page}`)
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

// Only the first page is fetched up front; later pages load when they are opened
export const doFetchCharacters = () => doFetchPage('characters', 1);
export const doFetchPlanets = () => doFetchPage('planets', 1);
export const doFetchStarships = () => doFetchPage('starships', 1);
export const doFetchCharactersPage = (page) => doFetchPage('characters', page);
export const doFetchPlanetsPage = (page) => doFetchPage('planets', page);
export const doFetchStarshipsPage = (page) => doFetchPage('starships', page);

// Search runs against the API so it covers every page, not only the loaded ones.
// SWAPI also matches starship models, so results are narrowed to name matches
// to keep the previous behaviour.
const fetchSearchResults = async (resource, param) => {
  const filter = param.toLowerCase();
  let results = [];
  let next = `${API_ENDPOINTS[resource]}?search=${encodeURIComponent(param)}`;
  while (next) {
    const response = await getJSON(next);
    results = [...results, ...response.results];
    next = response.next;
  }
  return results.filter(item => item.name.toLowerCase().includes(filter));
};

const getSearchResults = (state, resource, param) => {
  const cache = state.app[`${resource}Search`];
  return param in cache ? Promise.resolve(cache[param]) : fetchSearchResults(resource, param);
};

// The latest query per search box, so slow responses for older queries are ignored
const latestSearch = {};

const searchResource = (resource, param, actionCreator, filteringKey) => async (dispatch, getState) => {
  latestSearch[resource] = param;
  let results;
  try {
    results = await getSearchResults(getState(), resource, param);
  } catch {
    results = [];
  }
  if (latestSearch[resource] !== param) return;
  return dispatch(actionCreator({
    [resource]: results,
    param,
    [filteringKey]: true,
  }))
};

// Filter Action Creators
export const doSearchCharacters = (param) => searchResource('characters', param, searchCharacters, 'isFilteringCharacters');
export const doSearchPlanets = (param) => searchResource('planets', param, searchPlanets, 'isFilteringPlanets');
export const doSearchStarships = (param) => searchResource('starships', param, searchStarships, 'isFilteringStarships');

export const doSearchAll = (param) => async (dispatch, getState) => {
  latestSearch.all = param;
  const state = getState();
  const [characters, planets, starships] = await Promise.all(
    ['characters', 'planets', 'starships'].map(resource => (
      getSearchResults(state, resource, param).catch(() => [])
    ))
  );
  if (latestSearch.all !== param) return;
  return dispatch(searchAll({
    param,
    characters,
    planets,
    starships,
    isFilteringAll: true,
  }))
}

export const resetSearchCharacters = () => (dispatch) => {
  latestSearch.characters = null;
  return dispatch(resetCharacters({
    allFilteredCharacters: [],
    isFilteringCharacters: false
  }))
}

export const resetSearchPlanets = () => (dispatch) => {
  latestSearch.planets = null;
  return dispatch(resetPlanets({
    allFilteredStarships: [],
    isFilteringPlanets: false
  }))
}

export const resetSearchStarships = () => (dispatch) => {
  latestSearch.starships = null;
  return dispatch(resetStarships({
    allFilteredStarships: [],
    isFilteringStarships: false,
  }))
}

export const resetSearchAll = () => (dispatch) => {
  latestSearch.all = null;
  return dispatch(resetAll({
    allFilteredCharacters: [],
    allFilteredPlanets: [],
    allFilteredStarships: [],
    isFilteringAll: false,
  }))
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
  const candidates = [
    ...app[category],
    ...(app.recentlyViewed[category] || []),
    ...Object.values(app[`${category}Search`]).flat(),
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
  doFetchCharacters,
  doFetchPlanets,
  doFetchStarships,
  doFetchCharactersPage,
  doFetchPlanetsPage,
  doFetchStarshipsPage,
  doSearchAll,
  doSearchCharacters,
  doSearchPlanets,
  doSearchStarships,
  resetSearchAll,
  resetSearchCharacters,
  resetSearchPlanets,
  resetSearchStarships,
  setRecentlyViewed,
  doSetDescription,
}
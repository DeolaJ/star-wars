import { RESOURCES, RESOURCE_KEYS } from '../resources';
import { stateKeys } from './selectors';
import {
  FETCH_PAGE_START,
  FETCH_PAGE_SUCCESS,
  FETCH_PAGE_FAILURE,
  SEARCH_RESOURCE,
  SEARCH_ALL,
  RESET_SEARCH_RESOURCE,
  RESET_SEARCH_ALL,
  SET_RECENTLY_VIEWED,
  SET_DESCRIPTION,
} from "./actions"

// Per-resource paging: total count from the API, results by page number,
// pages being fetched and pages that failed to load
const emptyPaging = {
  count: 0,
  pages: {},
  loading: {},
  errors: {},
};

// Loaded results in page order, for the parts of the app that use a flat list
const flattenPages = (pages) => (
  Object.keys(pages)
    .map(Number)
    .sort((a, b) => a - b)
    .flatMap(page => pages[page])
);

const omit = (object, key) => (
  Object.fromEntries(Object.entries(object).filter(([entry]) => entry !== String(key)))
);

// Merges what `produce` returns for each resource into one object
const forEachResource = (produce) => Object.assign({}, ...RESOURCE_KEYS.map(produce));

const resourceDefaults = (resource) => {
  const keys = stateKeys(resource);
  return {
    [keys.paging]: emptyPaging,
    [keys.items]: [],
    [keys.loading]: true,
    [keys.error]: {},
    [keys.search]: {},
    [keys.filtered]: [],
    [keys.isFiltering]: false,
  };
};

export const defaultState = {
  ...forEachResource(resourceDefaults),
  isFilteringAll: false,
  recentlyViewed: {},
  descriptionItem: {},
}

// The results of one query for one resource. A repeated query is served from
// the in-memory cache; a new one is shown, and remembered unless it failed so
// that it can be retried.
const applySearch = (state, resource, param, results, failed) => {
  const keys = stateKeys(resource);
  const cache = state[keys.search];
  if (param in cache) {
    return { [keys.filtered]: cache[param] };
  }
  return {
    [keys.filtered]: results,
    ...(!failed && { [keys.search]: { ...cache, [param]: results } }),
  };
};

export default function appReducers (state=defaultState, action) {
  const { type, payload } = action

  switch (type) {

    // Page 1 is the initial load, so it also drives the resource's loading flag
    // and error message, as the full fetch did before
    case FETCH_PAGE_START: {
      const { resource, page } = payload;
      const keys = stateKeys(resource);
      const paging = state[keys.paging];
      return {
        ...state,
        [keys.paging]: {
          ...paging,
          loading: { ...paging.loading, [page]: true },
          errors: omit(paging.errors, page),
        },
        ...(page === 1 && { [keys.loading]: true }),
      }
    }

    case FETCH_PAGE_SUCCESS: {
      const { resource, page, results, count } = payload;
      const keys = stateKeys(resource);
      const paging = state[keys.paging];
      const pages = { ...paging.pages, [page]: results };
      return {
        ...state,
        [keys.paging]: {
          ...paging,
          count,
          pages,
          loading: omit(paging.loading, page),
        },
        [keys.items]: flattenPages(pages),
        ...(page === 1 && {
          [keys.loading]: false,
          recentlyViewed: {
            ...state.recentlyViewed,
            [resource]: results.slice(0, 9),
          },
        }),
      }
    }

    case FETCH_PAGE_FAILURE: {
      const { resource, page, error } = payload;
      const keys = stateKeys(resource);
      const paging = state[keys.paging];
      return {
        ...state,
        [keys.paging]: {
          ...paging,
          loading: omit(paging.loading, page),
          errors: { ...paging.errors, [page]: error },
        },
        ...(page === 1 && {
          [keys.loading]: false,
          [keys.error]: error,
        }),
      }
    }

    case SEARCH_RESOURCE: {
      const { resource, param, results, failed } = payload;
      return {
        ...state,
        ...applySearch(state, resource, param, results, failed),
        [stateKeys(resource).isFiltering]: true,
      }
    }

    case SEARCH_ALL: {
      const { param, results, failed = {} } = payload;
      return {
        ...state,
        ...forEachResource(resource => applySearch(state, resource, param, results[resource], failed[resource])),
        isFilteringAll: true,
      }
    }

    case RESET_SEARCH_RESOURCE: {
      const keys = stateKeys(payload.resource);
      return {
        ...state,
        [keys.filtered]: [],
        [keys.isFiltering]: false,
      }
    }

    case RESET_SEARCH_ALL: {
      return {
        ...state,
        ...forEachResource(resource => ({ [stateKeys(resource).filtered]: [] })),
        isFilteringAll: false,
      }
    }

    case SET_RECENTLY_VIEWED: {
      const { type: category, item } = payload;
      return {
        ...state,
        recentlyViewed: {
          ...state.recentlyViewed,
          [category]: [...(state.recentlyViewed[category] || []), item],
        },
      }
    }

    case SET_DESCRIPTION: {
      const { category, item } = payload;
      const resource = RESOURCES[category];
      if (!resource) return state;
      return {
        ...state,
        descriptionItem: {
          category: item,
          description: resource.describe(item),
        },
      }
    }

    default: {
      return state
    }
  }
}

import { RESOURCE_KEYS } from '../resources';

const capitalise = (word) => word.charAt(0).toUpperCase() + word.slice(1);

// Where each part of a resource's state lives in the app slice. The slice is
// flat, with one set of keys per resource (charactersPaging, loadingCharacters,
// ...), and this is the only place that naming is spelled out.
export const stateKeys = (resource) => {
  const name = capitalise(resource);
  return {
    items: resource,
    paging: `${resource}Paging`,
    loading: `loading${name}`,
    error: `loading${name}Error`,
    search: `${resource}Search`,
    filtered: `allFiltered${name}`,
    isFiltering: `isFiltering${name}`,
    searchError: `${resource}SearchError`,
  };
};

// One resource's state gathered under plain names
export const selectResource = (app, resource) => (
  Object.fromEntries(
    Object.entries(stateKeys(resource)).map(([part, key]) => [part, app[key]])
  )
);

// Every resource's state, by resource. The result is reused until the slice
// changes, so connected components are not re-rendered for nothing.
let lastApp = null;
let lastResources = null;
export const selectResources = (app) => {
  if (app !== lastApp) {
    lastApp = app;
    lastResources = Object.fromEntries(
      RESOURCE_KEYS.map(resource => [resource, selectResource(app, resource)])
    );
  }
  return lastResources;
};

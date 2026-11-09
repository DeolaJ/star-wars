import { describe, it, expect } from 'vitest';
import reducer, { defaultState } from './reducers';
import * as types from './actions';
import { RESOURCE_KEYS } from '../resources';

const characters = [
  { name: 'Luke Skywalker', gender: 'male', height: '172', mass: '77', hair_color: 'blond', eye_color: 'blue', skin_color: 'fair', birth_year: '19BBY' },
  { name: 'Leia Organa', gender: 'female', height: '150', mass: '49', hair_color: 'brown', eye_color: 'brown', skin_color: 'light', birth_year: '19BBY' },
];
const loaded = { ...defaultState, characters, planets: [{ name: 'Tatooine' }], starships: [{ name: 'X-wing' }] };

describe('app reducer', () => {
  it('returns the default state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(defaultState);
  });

  it('stores character search results and caches them by query', () => {
    const state = reducer(loaded, { type: types.SEARCH_RESOURCE, payload: { resource: 'characters', results: [characters[0]], param: 'LUKE' } });
    expect(state.allFilteredCharacters.map(c => c.name)).toEqual(['Luke Skywalker']);
    expect(state.isFilteringCharacters).toBe(true);
    expect(state.charactersSearch.LUKE).toHaveLength(1);
  });

  it('searches every category at once', () => {
    const state = reducer(loaded, { type: types.SEARCH_ALL, payload: { param: 'o', results: { characters: [characters[1]], planets: [{ name: 'Tatooine' }], starships: [] } } });
    expect(state.allFilteredCharacters).toHaveLength(1);
    expect(state.allFilteredPlanets).toHaveLength(1);
    expect(state.allFilteredStarships).toHaveLength(0);
    expect(state.isFilteringAll).toBe(true);
    expect(state.planetsSearch.o).toHaveLength(1);
  });

  it('serves a repeated search from the cache', () => {
    const cached = { ...loaded, charactersSearch: { luke: [characters[0]] } };
    const state = reducer(cached, { type: types.SEARCH_RESOURCE, payload: { resource: 'characters', results: [], param: 'luke' } });
    expect(state.allFilteredCharacters).toEqual([characters[0]]);
  });

  it('resets a search', () => {
    const searching = { ...loaded, isFilteringAll: true, allFilteredCharacters: characters };
    const state = reducer(searching, { type: types.RESET_SEARCH_ALL });
    expect(state.isFilteringAll).toBe(false);
    expect(state.allFilteredCharacters).toEqual([]);
  });

  it('builds the description for an item without mutating the previous state', () => {
    const before = JSON.parse(JSON.stringify(loaded));
    const state = reducer(loaded, { type: types.SET_DESCRIPTION, payload: { category: 'characters', name: 'leia organa', item: characters[1] } });
    expect(state.descriptionItem.category.name).toBe('Leia Organa');
    expect(state.descriptionItem.description).toContain('She has a mass of 49');
    expect(loaded).toEqual(before);
  });

  it('appends to recently viewed', () => {
    const state = reducer({ ...loaded, recentlyViewed: { characters: [characters[0]] } }, { type: types.SET_RECENTLY_VIEWED, payload: { type: 'characters', item: characters[1] } });
    expect(state.recentlyViewed.characters.map(c => c.name)).toEqual(['Luke Skywalker', 'Leia Organa']);
  });

  describe('page loading', () => {
    const start = (page) => ({ type: types.FETCH_PAGE_START, payload: { resource: 'planets', page } });
    const success = (page, results) => ({ type: types.FETCH_PAGE_SUCCESS, payload: { resource: 'planets', page, results, count: 13 } });
    const failure = (page) => ({ type: types.FETCH_PAGE_FAILURE, payload: { resource: 'planets', page, error: { message: 'Down' } } });
    const firstPage = Array.from({ length: 10 }, (_, i) => ({ name: `Planet ${i + 1}` }));

    it('tracks the first page as the initial load', () => {
      let state = reducer(defaultState, start(1));
      expect(state.loadingPlanets).toBe(true);
      expect(state.planetsPaging.loading[1]).toBe(true);
      state = reducer(state, success(1, firstPage));
      expect(state.loadingPlanets).toBe(false);
      expect(state.planetsPaging).toEqual({ count: 13, pages: { 1: firstPage }, loading: {}, errors: {} });
      expect(state.planets).toEqual(firstPage);
      expect(state.recentlyViewed.planets).toHaveLength(9);
    });

    it('keeps later pages out of the initial loading flags', () => {
      const loadedFirst = reducer(defaultState, success(1, firstPage));
      let state = reducer(loadedFirst, start(2));
      expect(state.loadingPlanets).toBe(false);
      state = reducer(state, failure(2));
      expect(state.loadingPlanetsError).toEqual({});
      expect(state.planetsPaging.errors[2]).toEqual({ message: 'Down' });
      state = reducer(state, start(2));
      expect(state.planetsPaging.errors[2]).toBeUndefined();
    });

    it('keeps the flat list in page order whatever order pages arrive in', () => {
      let state = reducer(defaultState, success(2, [{ name: 'Extra' }]));
      state = reducer(state, success(1, firstPage));
      expect(state.planets.map(p => p.name).slice(-2)).toEqual(['Planet 10', 'Extra']);
    });

    it('sets the initial load error when the first page fails', () => {
      const state = reducer(defaultState, failure(1));
      expect(state.loadingPlanets).toBe(false);
      expect(state.loadingPlanetsError).toEqual({ message: 'Down' });
    });
  });
});

describe('resource-generic state', () => {
  const stateFor = (resource) => ({
    items: resource,
    paging: `${resource}Paging`,
    loading: `loading${resource[0].toUpperCase()}${resource.slice(1)}`,
    error: `loading${resource[0].toUpperCase()}${resource.slice(1)}Error`,
    search: `${resource}Search`,
    filtered: `allFiltered${resource[0].toUpperCase()}${resource.slice(1)}`,
    isFiltering: `isFiltering${resource[0].toUpperCase()}${resource.slice(1)}`,
  });

  it.each(RESOURCE_KEYS)('starts with the full set of state for %s', (resource) => {
    const keys = stateFor(resource);
    expect(defaultState[keys.items]).toEqual([]);
    expect(defaultState[keys.paging]).toEqual({ count: 0, pages: {}, loading: {}, errors: {} });
    expect(defaultState[keys.loading]).toBe(true);
    expect(defaultState[keys.error]).toEqual({});
    expect(defaultState[keys.search]).toEqual({});
    expect(defaultState[keys.filtered]).toEqual([]);
    expect(defaultState[keys.isFiltering]).toBe(false);
  });

  it('resets one resource search without touching the others', () => {
    const searching = {
      ...loaded,
      isFilteringPlanets: true, allFilteredPlanets: [{ name: 'Tatooine' }],
      isFilteringStarships: true, allFilteredStarships: [{ name: 'X-wing' }],
    };
    const state = reducer(searching, { type: types.RESET_SEARCH_RESOURCE, payload: { resource: 'planets' } });
    expect(state.isFilteringPlanets).toBe(false);
    expect(state.allFilteredPlanets).toEqual([]);
    expect(state.isFilteringStarships).toBe(true);
    expect(state.allFilteredStarships).toEqual([{ name: 'X-wing' }]);
  });

  it('shows a failed search as no results without remembering it', () => {
    const state = reducer(loaded, { type: types.SEARCH_RESOURCE, payload: { resource: 'starships', results: [], param: 'wing', failed: true } });
    expect(state.isFilteringStarships).toBe(true);
    expect(state.allFilteredStarships).toEqual([]);
    expect(state.starshipsSearch).not.toHaveProperty('wing');
  });

  it('only remembers the resources of a site-wide search that succeeded', () => {
    const state = reducer(loaded, {
      type: types.SEARCH_ALL,
      payload: { param: 'wing', results: { characters: [], planets: [], starships: [{ name: 'X-wing' }] }, failed: { characters: true } },
    });
    expect(state.charactersSearch).not.toHaveProperty('wing');
    expect(state.planetsSearch.wing).toEqual([]);
    expect(state.starshipsSearch.wing).toHaveLength(1);
  });

  it('clears every resource on a site-wide reset and leaves the caches', () => {
    const searching = { ...loaded, isFilteringAll: true, allFilteredPlanets: [{ name: 'Tatooine' }], planetsSearch: { tat: [{ name: 'Tatooine' }] } };
    const state = reducer(searching, { type: types.RESET_SEARCH_ALL });
    expect(state.isFilteringAll).toBe(false);
    expect(state.allFilteredPlanets).toEqual([]);
    expect(state.planetsSearch.tat).toHaveLength(1);
  });

  it('starts recently viewed for a category that has none yet', () => {
    const state = reducer(loaded, { type: types.SET_RECENTLY_VIEWED, payload: { type: 'planets', item: { name: 'Hoth' } } });
    expect(state.recentlyViewed.planets.map(p => p.name)).toEqual(['Hoth']);
  });

  it('describes a planet and a starship from their configuration', () => {
    const planet = { name: 'Tatooine', rotation_period: '23', diameter: '10465', orbital_period: '304', climate: 'arid', gravity: '1 standard', terrain: 'desert, canyons', population: '200000', surface_water: '1' };
    const starship = { name: 'X-wing', model: 'T-65', manufacturer: 'Incom', cost_in_credits: '149999', length: '12.5', max_atmosphering_speed: '1050', crew: '1', cargo_capacity: '110', passengers: '0', consumables: '1 week', hyperdrive_rating: '1.0', MGLT: '100', starship_class: 'Starfighter' };
    expect(reducer(loaded, { type: types.SET_DESCRIPTION, payload: { category: 'planets', item: planet } }).descriptionItem.description)
      .toContain('has desert and canyons terrains');
    expect(reducer(loaded, { type: types.SET_DESCRIPTION, payload: { category: 'starships', item: starship } }).descriptionItem.description)
      .toContain('X-wing is of the T-65 model and was manufactured by Incom');
  });
});

describe('related items', () => {
  const path = 'people/1/';

  it('starts with nothing fetched', () => {
    expect(defaultState.items).toEqual({ byPath: {}, loading: {}, errors: {} });
  });

  it('tracks an item being fetched, then keeps it by path', () => {
    let state = reducer(defaultState, { type: types.FETCH_ITEM_START, payload: { path } });
    expect(state.items.loading[path]).toBe(true);
    state = reducer(state, { type: types.FETCH_ITEM_SUCCESS, payload: { path, item: characters[0] } });
    expect(state.items.byPath[path].name).toBe('Luke Skywalker');
    expect(state.items.loading[path]).toBeUndefined();
  });

  it('records a failed item and forgets the failure when it is tried again', () => {
    let state = reducer(defaultState, { type: types.FETCH_ITEM_START, payload: { path } });
    state = reducer(state, { type: types.FETCH_ITEM_FAILURE, payload: { path, error: { message: 'Down' } } });
    expect(state.items.errors[path]).toEqual({ message: 'Down' });
    expect(state.items.loading[path]).toBeUndefined();
    state = reducer(state, { type: types.FETCH_ITEM_START, payload: { path } });
    expect(state.items.errors[path]).toBeUndefined();
  });

  it('does not list a recently viewed item twice', () => {
    const before = { ...loaded, recentlyViewed: { characters: [characters[0]] } };
    const state = reducer(before, { type: types.SET_RECENTLY_VIEWED, payload: { type: 'characters', item: characters[0] } });
    expect(state.recentlyViewed.characters).toHaveLength(1);
    expect(state).toBe(before);
  });

  it('remembers which resource the description belongs to', () => {
    const state = reducer(loaded, { type: types.SET_DESCRIPTION, payload: { category: 'characters', item: characters[0] } });
    expect(state.descriptionItem.resource).toBe('characters');
  });
});

describe('search failures', () => {
  const failed = { message: 'Down' };

  it('starts with no failure recorded for any resource', () => {
    RESOURCE_KEYS.forEach(resource => {
      expect(defaultState[`${resource}SearchError`]).toBeNull();
    });
  });

  it('keeps why a search failed, and does not remember the search', () => {
    const state = reducer(loaded, { type: types.SEARCH_RESOURCE, payload: { resource: 'planets', results: [], param: 'tat', failed } });
    expect(state.planetsSearchError).toEqual(failed);
    expect(state.isFilteringPlanets).toBe(true);
    expect(state.planetsSearch).not.toHaveProperty('tat');
  });

  it('clears the failure when the same search succeeds', () => {
    const broken = { ...loaded, planetsSearchError: failed };
    const state = reducer(broken, { type: types.SEARCH_RESOURCE, payload: { resource: 'planets', results: [{ name: 'Tatooine' }], param: 'tat' } });
    expect(state.planetsSearchError).toBeNull();
    expect(state.planetsSearch.tat).toHaveLength(1);
  });

  it('clears the failure when a search is served from memory', () => {
    const broken = { ...loaded, planetsSearchError: failed, planetsSearch: { tat: [{ name: 'Tatooine' }] } };
    const state = reducer(broken, { type: types.SEARCH_RESOURCE, payload: { resource: 'planets', results: [], param: 'tat' } });
    expect(state.planetsSearchError).toBeNull();
  });

  it('clears the failure when the search is reset', () => {
    const broken = { ...loaded, planetsSearchError: failed, charactersSearchError: failed };
    expect(reducer(broken, { type: types.RESET_SEARCH_RESOURCE, payload: { resource: 'planets' } }).planetsSearchError).toBeNull();
    expect(reducer(broken, { type: types.RESET_SEARCH_RESOURCE, payload: { resource: 'planets' } }).charactersSearchError).toEqual(failed);
    const all = reducer(broken, { type: types.RESET_SEARCH_ALL });
    expect(all.planetsSearchError).toBeNull();
    expect(all.charactersSearchError).toBeNull();
  });

  it('records which resources of a site-wide search failed', () => {
    const state = reducer(loaded, {
      type: types.SEARCH_ALL,
      payload: { param: 'x', results: { characters: [], planets: [], starships: [], films: [], species: [], vehicles: [] }, failed: { characters: failed } },
    });
    expect(state.charactersSearchError).toEqual(failed);
    expect(state.planetsSearchError).toBeNull();
    expect(state.charactersSearch).not.toHaveProperty('x');
    expect(state.planetsSearch.x).toEqual([]);
  });
});

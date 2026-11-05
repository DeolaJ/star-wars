import { describe, it, expect } from 'vitest';
import reducer, { defaultState } from './reducers';
import * as types from './actions';

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
    const state = reducer(loaded, { type: types.SEARCH_CHARACTERS, payload: { characters: [characters[0]], param: 'LUKE', isFilteringCharacters: true } });
    expect(state.allFilteredCharacters.map(c => c.name)).toEqual(['Luke Skywalker']);
    expect(state.isFilteringCharacters).toBe(true);
    expect(state.charactersSearch.LUKE).toHaveLength(1);
  });

  it('searches every category at once', () => {
    const state = reducer(loaded, { type: types.SEARCH_ALL, payload: { param: 'o', characters: [characters[1]], planets: [{ name: 'Tatooine' }], starships: [], isFilteringAll: true } });
    expect(state.allFilteredCharacters).toHaveLength(1);
    expect(state.allFilteredPlanets).toHaveLength(1);
    expect(state.allFilteredStarships).toHaveLength(0);
    expect(state.isFilteringAll).toBe(true);
    expect(state.planetsSearch.o).toHaveLength(1);
  });

  it('serves a repeated search from the cache', () => {
    const cached = { ...loaded, charactersSearch: { luke: [characters[0]] } };
    const state = reducer(cached, { type: types.SEARCH_CHARACTERS, payload: { characters: [], param: 'luke', isFilteringCharacters: true } });
    expect(state.allFilteredCharacters).toEqual([characters[0]]);
  });

  it('resets a search', () => {
    const searching = { ...loaded, isFilteringAll: true, allFilteredCharacters: characters };
    const state = reducer(searching, { type: types.RESET_SEARCH_ALL, payload: { allFilteredCharacters: [], allFilteredPlanets: [], allFilteredStarships: [], isFilteringAll: false } });
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

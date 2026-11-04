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

  it('searches characters case-insensitively and caches the result', () => {
    const state = reducer(loaded, { type: types.SEARCH_CHARACTERS, payload: { characters, param: 'LUKE', isFilteringCharacters: true } });
    expect(state.allFilteredCharacters.map(c => c.name)).toEqual(['Luke Skywalker']);
    expect(state.isFilteringCharacters).toBe(true);
    expect(state.charactersSearch.LUKE).toHaveLength(1);
  });

  it('searches every category at once', () => {
    const state = reducer(loaded, { type: types.SEARCH_ALL, payload: { param: 'o', isFilteringAll: true } });
    expect(state.allFilteredCharacters).toHaveLength(1);
    expect(state.allFilteredPlanets).toHaveLength(1);
    expect(state.allFilteredStarships).toHaveLength(0);
    expect(state.isFilteringAll).toBe(true);
  });

  it('resets a search', () => {
    const searching = { ...loaded, isFilteringAll: true, allFilteredCharacters: characters };
    const state = reducer(searching, { type: types.RESET_SEARCH_ALL, payload: { allFilteredCharacters: [], allFilteredPlanets: [], allFilteredStarships: [], isFilteringAll: false } });
    expect(state.isFilteringAll).toBe(false);
    expect(state.allFilteredCharacters).toEqual([]);
  });

  it('builds the description for an item without mutating the previous state', () => {
    const before = JSON.parse(JSON.stringify(loaded));
    const state = reducer(loaded, { type: types.SET_DESCRIPTION, payload: { category: 'characters', name: 'leia organa' } });
    expect(state.descriptionItem.category.name).toBe('Leia Organa');
    expect(state.descriptionItem.description).toContain('She has a mass of 49');
    expect(loaded).toEqual(before);
  });

  it('appends to recently viewed', () => {
    const state = reducer({ ...loaded, recentlyViewed: { characters: [characters[0]] } }, { type: types.SET_RECENTLY_VIEWED, payload: { type: 'characters', item: characters[1] } });
    expect(state.recentlyViewed.characters.map(c => c.name)).toEqual(['Luke Skywalker', 'Leia Organa']);
  });
});

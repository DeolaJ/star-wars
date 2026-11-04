import { describe, it, expect } from 'vitest';
import configureAppStore from '../modules/store';
import { defaultState } from './reducers';
import actions from './actions';
import { API_ENDPOINTS } from '../config';
import { mockFetch } from '../test/fixtures';

const makeStore = () => configureAppStore({ app: { ...defaultState } });

describe('fetch thunks', () => {
  it.each([
    ['doFetchCharacters', 'characters', 'loadingCharacters', 15],
    ['doFetchPlanets', 'planets', 'loadingPlanets', 13],
    ['doFetchStarships', 'starships', 'loadingStarships', 12],
  ])('%s follows the next link and stores every page', async (thunk, key, loadingKey, total) => {
    const fetchSpy = mockFetch();
    const store = makeStore();

    await store.dispatch(actions[thunk](true));

    const state = store.getState().app;
    expect(fetchSpy).toHaveBeenCalledWith(API_ENDPOINTS[key]);
    expect(fetchSpy).toHaveBeenCalledWith(`${API_ENDPOINTS[key]}?page=2`);
    expect(state[key]).toHaveLength(total);
    expect(state[loadingKey]).toBe(false);
    expect(state.recentlyViewed[key]).toHaveLength(9);
  });

  it('exposes the first page before the remaining pages arrive when initial is true', async () => {
    mockFetch();
    const store = makeStore();
    const lengths = [];
    store.subscribe(() => lengths.push(store.getState().app.characters.length));

    await store.dispatch(actions.doFetchCharacters(true));

    // start (placeholder), first page, all pages
    expect(lengths).toEqual([1, 10, 15]);
  });

  it('stores the error and clears loading when the request fails', async () => {
    mockFetch({ [API_ENDPOINTS.planets]: new Error('Network down') });
    const store = makeStore();

    await store.dispatch(actions.doFetchPlanets(true));

    const state = store.getState().app;
    expect(state.loadingPlanets).toBe(false);
    expect(state.loadingPlanetsError.message).toBe('Network down');
  });
});

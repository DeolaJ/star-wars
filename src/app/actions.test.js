import { describe, it, expect, vi } from 'vitest';
import configureAppStore from '../modules/store';
import { defaultState } from './reducers';
import actions from './actions';
import { API_ENDPOINTS } from '../config';
import { mockFetch, fetchedUrls } from '../test/fixtures';

const makeStore = () => configureAppStore({ app: { ...defaultState } });
const page = (resource, n) => `${API_ENDPOINTS[resource]}?page=${n}`;

describe('initial load', () => {
  it.each([
    ['doFetchCharacters', 'characters', 'loadingCharacters', 15],
    ['doFetchPlanets', 'planets', 'loadingPlanets', 13],
    ['doFetchStarships', 'starships', 'loadingStarships', 12],
  ])('%s fetches only the first page', async (thunk, resource, loadingKey, total) => {
    const fetchSpy = mockFetch();
    const store = makeStore();

    await store.dispatch(actions[thunk]());

    const state = store.getState().app;
    expect(fetchedUrls(fetchSpy)).toEqual([page(resource, 1)]);
    expect(state[resource]).toHaveLength(10);
    expect(state[`${resource}Paging`].count).toBe(total);
    expect(state[`${resource}Paging`].pages[1]).toHaveLength(10);
    expect(state[loadingKey]).toBe(false);
    expect(state.recentlyViewed[resource]).toHaveLength(9);
  });

  it('keeps the app loading until the first page arrives', async () => {
    mockFetch();
    const store = makeStore();
    const promise = store.dispatch(actions.doFetchCharacters());
    expect(store.getState().app.loadingCharacters).toBe(true);
    await promise;
    expect(store.getState().app.loadingCharacters).toBe(false);
  });

  it('stores the error and clears loading when the first page fails', async () => {
    mockFetch({ [page('planets', 1)]: new Error('Network down') });
    const store = makeStore();

    await store.dispatch(actions.doFetchPlanets());

    const state = store.getState().app;
    expect(state.loadingPlanets).toBe(false);
    expect(state.loadingPlanetsError.message).toBe('Network down');
  });

  it('treats an HTTP error status as a failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false, status: 404, json: async () => ({}) });
    const store = makeStore();

    await store.dispatch(actions.doFetchStarships());

    expect(store.getState().app.loadingStarshipsError.message).toBe('Request failed with status 404');
  });
});

describe('loading later pages', () => {
  it('fetches a page when asked and appends it to the loaded results', async () => {
    const fetchSpy = mockFetch();
    const store = makeStore();
    await store.dispatch(actions.doFetchCharacters());

    await store.dispatch(actions.doFetchCharactersPage(2));

    const state = store.getState().app;
    expect(fetchedUrls(fetchSpy)).toEqual([page('characters', 1), page('characters', 2)]);
    expect(state.charactersPaging.pages[2]).toHaveLength(5);
    expect(state.characters.map(c => c.name).slice(9, 11)).toEqual(['Person 8', 'Extra Person 1']);
    // Recently viewed belongs to the first page and the description history
    expect(state.recentlyViewed.characters).toHaveLength(9);
  });

  it('does not fetch a page that is already loaded', async () => {
    const fetchSpy = mockFetch();
    const store = makeStore();
    await store.dispatch(actions.doFetchPlanets());
    await store.dispatch(actions.doFetchPlanetsPage(2));

    await store.dispatch(actions.doFetchPlanetsPage(1));
    await store.dispatch(actions.doFetchPlanetsPage(2));

    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('does not fetch a page twice while it is still loading', async () => {
    const fetchSpy = mockFetch();
    const store = makeStore();

    await Promise.all([
      store.dispatch(actions.doFetchStarshipsPage(2)),
      store.dispatch(actions.doFetchStarshipsPage(2)),
    ]);

    expect(fetchedUrls(fetchSpy)).toEqual([page('starships', 2)]);
  });

  it('records a failed page without touching the initial load error, and allows a retry', async () => {
    const fetchSpy = mockFetch({ [page('characters', 2)]: new Error('Timeout') });
    const store = makeStore();
    await store.dispatch(actions.doFetchCharacters());

    await store.dispatch(actions.doFetchCharactersPage(2));
    let state = store.getState().app;
    expect(state.charactersPaging.errors[2].message).toBe('Timeout');
    expect(state.charactersPaging.loading[2]).toBeUndefined();
    expect(state.loadingCharactersError).toEqual({});

    fetchSpy.mockRestore();
    mockFetch();
    await store.dispatch(actions.doFetchCharactersPage(2));
    state = store.getState().app;
    expect(state.charactersPaging.errors[2]).toBeUndefined();
    expect(state.charactersPaging.pages[2]).toHaveLength(5);
  });
});

describe('search', () => {
  it('searches every page through the API, not just the loaded ones', async () => {
    const fetchSpy = mockFetch();
    const store = makeStore();
    await store.dispatch(actions.doFetchCharacters());

    await store.dispatch(actions.doSearchCharacters('Extra'));

    const state = store.getState().app;
    expect(fetchedUrls(fetchSpy)).toContain(`${API_ENDPOINTS.characters}?search=Extra`);
    expect(state.isFilteringCharacters).toBe(true);
    expect(state.allFilteredCharacters).toHaveLength(5);
    expect(state.charactersPaging.pages[2]).toBeUndefined();
  });

  it('reuses cached results for a repeated search', async () => {
    const fetchSpy = mockFetch();
    const store = makeStore();

    await store.dispatch(actions.doSearchPlanets('tatoo'));
    await store.dispatch(actions.resetSearchPlanets());
    await store.dispatch(actions.doSearchPlanets('tatoo'));

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(store.getState().app.allFilteredPlanets.map(p => p.name)).toEqual(['Tatooine']);
  });

  it('follows the next link of a search with several pages of results', async () => {
    const term = 'person';
    const base = `${API_ENDPOINTS.characters}?search=${term}`;
    mockFetch({
      [base]: { count: 3, next: `${base}&page=2`, results: [{ name: 'Person 1' }, { name: 'Person 2' }] },
      [`${base}&page=2`]: { count: 3, next: null, results: [{ name: 'Person 3' }] },
    });
    const store = makeStore();

    await store.dispatch(actions.doSearchCharacters(term));

    expect(store.getState().app.allFilteredCharacters).toHaveLength(3);
  });

  it('only keeps name matches, as the previous in-memory search did', async () => {
    mockFetch({
      [`${API_ENDPOINTS.starships}?search=T-65`]: { count: 1, next: null, results: [{ name: 'X-wing', model: 'T-65' }] },
    });
    const store = makeStore();

    await store.dispatch(actions.doSearchStarships('T-65'));

    expect(store.getState().app.allFilteredStarships).toEqual([]);
  });

  it('searches all categories from the home page', async () => {
    mockFetch();
    const store = makeStore();

    await store.dispatch(actions.doSearchAll('wing'));

    const state = store.getState().app;
    expect(state.isFilteringAll).toBe(true);
    expect(state.allFilteredCharacters).toEqual([]);
    expect(state.allFilteredPlanets).toEqual([]);
    expect(state.allFilteredStarships.map(s => s.name)).toEqual(['X-wing']);
  });

  it('ignores a slow response for an older query', async () => {
    let releaseSlow;
    vi.spyOn(globalThis, 'fetch').mockImplementation((url) => {
      const body = url.endsWith('search=luke')
        ? { count: 1, next: null, results: [{ name: 'Luke Skywalker' }] }
        : { count: 1, next: null, results: [{ name: 'Leia Organa' }] };
      const response = { ok: true, json: async () => body };
      if (url.endsWith('search=luke')) return new Promise(resolve => { releaseSlow = () => resolve(response); });
      return Promise.resolve(response);
    });
    const store = makeStore();

    const slow = store.dispatch(actions.doSearchCharacters('luke'));
    await store.dispatch(actions.doSearchCharacters('leia'));
    releaseSlow();
    await slow;

    expect(store.getState().app.allFilteredCharacters.map(c => c.name)).toEqual(['Leia Organa']);
  });

  it('does not show results that arrive after the search was cleared', async () => {
    let release;
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => new Promise(resolve => {
      release = () => resolve({ ok: true, json: async () => ({ count: 1, next: null, results: [{ name: 'Tatooine' }] }) });
    }));
    const store = makeStore();

    const pending = store.dispatch(actions.doSearchPlanets('tat'));
    await store.dispatch(actions.resetSearchPlanets());
    release();
    await pending;

    expect(store.getState().app.isFilteringPlanets).toBe(false);
  });
});

describe('description', () => {
  it('uses a loaded item without fetching', async () => {
    const fetchSpy = mockFetch();
    const store = makeStore();
    await store.dispatch(actions.doFetchCharacters());
    fetchSpy.mockClear();

    await store.dispatch(actions.doSetDescription('characters', 'leia organa'));

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(store.getState().app.descriptionItem.category.name).toBe('Leia Organa');
  });

  it('looks up an item from a page that has not been loaded', async () => {
    const fetchSpy = mockFetch();
    const store = makeStore();
    await store.dispatch(actions.doFetchCharacters());

    await store.dispatch(actions.doSetDescription('characters', 'extra person 3'));

    expect(fetchedUrls(fetchSpy)).toContain(`${API_ENDPOINTS.characters}?search=extra%20person%203`);
    expect(fetchedUrls(fetchSpy)).not.toContain(page('characters', 2));
    expect(store.getState().app.descriptionItem.category.name).toBe('Extra Person 3');
  });

  it('leaves the description empty when the item does not exist', async () => {
    mockFetch();
    const store = makeStore();

    await store.dispatch(actions.doSetDescription('planets', 'nowhere'));

    expect(store.getState().app.descriptionItem).toEqual({});
  });
});

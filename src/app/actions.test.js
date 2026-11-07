import { describe, it, expect, vi } from 'vitest';
import configureAppStore from '../modules/store';
import { defaultState } from './reducers';
import actions from './actions';
import { API_ENDPOINTS } from '../config';
import { mockFetch, fetchedUrls, mirrorUrl } from '../test/fixtures';

const makeStore = () => configureAppStore({ app: { ...defaultState } });
const page = (resource, n) => `${API_ENDPOINTS[resource]}?page=${n}`;

describe('initial load', () => {
  it.each([
    ['characters', 'loadingCharacters', 15],
    ['planets', 'loadingPlanets', 13],
    ['starships', 'loadingStarships', 12],
  ])('fetches only the first page of %s', async (resource, loadingKey, total) => {
    const fetchSpy = mockFetch();
    const store = makeStore();

    await store.dispatch(actions.doFetchPage(resource, 1));

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
    const promise = store.dispatch(actions.doFetchPage('characters', 1));
    expect(store.getState().app.loadingCharacters).toBe(true);
    await promise;
    expect(store.getState().app.loadingCharacters).toBe(false);
  });

  it('stores the error and clears loading when the first page fails', async () => {
    mockFetch({ [page('planets', 1)]: new Error('Network down') });
    const store = makeStore();

    await store.dispatch(actions.doFetchPage('planets', 1));

    const state = store.getState().app;
    expect(state.loadingPlanets).toBe(false);
    expect(state.loadingPlanetsError.message).toBe('Network down');
  });

  it('treats an HTTP error status as a failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false, status: 404, json: async () => ({}) });
    const store = makeStore();

    await store.dispatch(actions.doFetchPage('starships', 1));

    expect(store.getState().app.loadingStarshipsError.message).toBe('Request failed with status 404');
  });
});

describe('loading later pages', () => {
  it('fetches a page when asked and appends it to the loaded results', async () => {
    const fetchSpy = mockFetch();
    const store = makeStore();
    await store.dispatch(actions.doFetchPage('characters', 1));

    await store.dispatch(actions.doFetchPage('characters', 2));

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
    await store.dispatch(actions.doFetchPage('planets', 1));
    await store.dispatch(actions.doFetchPage('planets', 2));

    await store.dispatch(actions.doFetchPage('planets', 1));
    await store.dispatch(actions.doFetchPage('planets', 2));

    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('does not fetch a page twice while it is still loading', async () => {
    const fetchSpy = mockFetch();
    const store = makeStore();

    await Promise.all([
      store.dispatch(actions.doFetchPage('starships', 2)),
      store.dispatch(actions.doFetchPage('starships', 2)),
    ]);

    expect(fetchedUrls(fetchSpy)).toEqual([page('starships', 2)]);
  });

  it('records a failed page without touching the initial load error, and allows a retry', async () => {
    const fetchSpy = mockFetch({ [page('characters', 2)]: new Error('Timeout') });
    const store = makeStore();
    await store.dispatch(actions.doFetchPage('characters', 1));

    await store.dispatch(actions.doFetchPage('characters', 2));
    let state = store.getState().app;
    expect(state.charactersPaging.errors[2].message).toBe('Timeout');
    expect(state.charactersPaging.loading[2]).toBeUndefined();
    expect(state.loadingCharactersError).toEqual({});

    fetchSpy.mockRestore();
    mockFetch();
    await store.dispatch(actions.doFetchPage('characters', 2));
    state = store.getState().app;
    expect(state.charactersPaging.errors[2]).toBeUndefined();
    expect(state.charactersPaging.pages[2]).toHaveLength(5);
  });
});

describe('search', () => {
  it('searches every page through the API, not just the loaded ones', async () => {
    const fetchSpy = mockFetch();
    const store = makeStore();
    await store.dispatch(actions.doFetchPage('characters', 1));

    await store.dispatch(actions.doSearch('characters', 'Extra'));

    const state = store.getState().app;
    expect(fetchedUrls(fetchSpy)).toContain(`${API_ENDPOINTS.characters}?search=Extra`);
    expect(state.isFilteringCharacters).toBe(true);
    expect(state.allFilteredCharacters).toHaveLength(5);
    expect(state.charactersPaging.pages[2]).toBeUndefined();
  });

  it('reuses cached results for a repeated search', async () => {
    const fetchSpy = mockFetch();
    const store = makeStore();

    await store.dispatch(actions.doSearch('planets', 'tatoo'));
    await store.dispatch(actions.resetSearch('planets'));
    await store.dispatch(actions.doSearch('planets', 'tatoo'));

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

    await store.dispatch(actions.doSearch('characters', term));

    expect(store.getState().app.allFilteredCharacters).toHaveLength(3);
  });

  it('only keeps name matches, as the previous in-memory search did', async () => {
    mockFetch({
      [`${API_ENDPOINTS.starships}?search=T-65`]: { count: 1, next: null, results: [{ name: 'X-wing', model: 'T-65' }] },
    });
    const store = makeStore();

    await store.dispatch(actions.doSearch('starships', 'T-65'));

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

    const slow = store.dispatch(actions.doSearch('characters', 'luke'));
    await store.dispatch(actions.doSearch('characters', 'leia'));
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

    const pending = store.dispatch(actions.doSearch('planets', 'tat'));
    await store.dispatch(actions.resetSearch('planets'));
    release();
    await pending;

    expect(store.getState().app.isFilteringPlanets).toBe(false);
  });
});

describe('description', () => {
  it('uses a loaded item without fetching', async () => {
    const fetchSpy = mockFetch();
    const store = makeStore();
    await store.dispatch(actions.doFetchPage('characters', 1));
    fetchSpy.mockClear();

    await store.dispatch(actions.doSetDescription('characters', 'leia organa'));

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(store.getState().app.descriptionItem.category.name).toBe('Leia Organa');
  });

  it('looks up an item from a page that has not been loaded', async () => {
    const fetchSpy = mockFetch();
    const store = makeStore();
    await store.dispatch(actions.doFetchPage('characters', 1));

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

describe('caching between visits', () => {
  const T0 = 1_700_000_000_000;
  const DAY = 24 * 60 * 60 * 1000;
  const at = (time) => vi.spyOn(Date, 'now').mockReturnValue(time);

  it('serves a page from the cache on the next visit without a request', async () => {
    at(T0);
    const fetchSpy = mockFetch();
    await makeStore().dispatch(actions.doFetchPage('characters', 2));
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const revisit = makeStore();
    await revisit.dispatch(actions.doFetchPage('characters', 2));

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const state = revisit.getState().app;
    expect(state.charactersPaging.pages[2]).toHaveLength(5);
    expect(state.charactersPaging.count).toBe(15);
  });

  it('keeps the first page cached too, so a revisit needs no startup requests', async () => {
    at(T0);
    const fetchSpy = mockFetch();
    const first = makeStore();
    await Promise.all([actions.doFetchPage('characters', 1), actions.doFetchPage('planets', 1), actions.doFetchPage('starships', 1)].map(first.dispatch));
    fetchSpy.mockClear();

    const revisit = makeStore();
    await Promise.all([actions.doFetchPage('characters', 1), actions.doFetchPage('planets', 1), actions.doFetchPage('starships', 1)].map(revisit.dispatch));

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(revisit.getState().app.loadingCharacters).toBe(false);
    expect(revisit.getState().app.recentlyViewed.planets).toHaveLength(9);
  });

  it('requests a page again once the cached copy has expired, and refreshes the cache', async () => {
    at(T0);
    const fetchSpy = mockFetch();
    await makeStore().dispatch(actions.doFetchPage('planets', 1));

    at(T0 + DAY - 1);
    await makeStore().dispatch(actions.doFetchPage('planets', 1));
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    at(T0 + DAY);
    await makeStore().dispatch(actions.doFetchPage('planets', 1));
    expect(fetchSpy).toHaveBeenCalledTimes(2);

    // The new copy is good for another day from when it was fetched
    at(T0 + DAY + DAY - 1);
    await makeStore().dispatch(actions.doFetchPage('planets', 1));
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it.each([
    ['a network error', new Error('Network down')],
    ['an incomplete body', { next: null }],
    ['a body without results', { count: 3, results: null }],
  ])('does not cache a page that failed with %s', async (_, failure) => {
    const url = page('starships', 1);
    const fetchSpy = mockFetch({ [url]: failure });
    const store = makeStore();
    await store.dispatch(actions.doFetchPage('starships', 1));
    expect(store.getState().app.loadingStarshipsError.message).toBeTruthy();

    fetchSpy.mockRestore();
    const retrySpy = mockFetch();
    const revisit = makeStore();
    await revisit.dispatch(actions.doFetchPage('starships', 1));

    // One request for the page; swapi.dev failed moments ago, so the mirror goes first
    expect(fetchedUrls(retrySpy)).toEqual([mirrorUrl(url)]);
    expect(revisit.getState().app.starshipsPaging.pages[1]).toHaveLength(10);
  });

  it('does not cache an HTTP error response', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false, status: 500, json: async () => ({ results: [], count: 0 }) });
    await makeStore().dispatch(actions.doFetchPage('characters', 1));

    fetchSpy.mockRestore();
    const retrySpy = mockFetch();
    await makeStore().dispatch(actions.doFetchPage('characters', 1));
    expect(retrySpy).toHaveBeenCalledTimes(1);
  });

  it('serves a search from the cache on the next visit, whatever the letter case', async () => {
    at(T0);
    const fetchSpy = mockFetch();
    await makeStore().dispatch(actions.doSearch('characters', 'Extra'));

    const revisit = makeStore();
    await revisit.dispatch(actions.doSearch('characters', 'extra'));

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(revisit.getState().app.allFilteredCharacters).toHaveLength(5);
  });

  it('shares cached searches with the home search', async () => {
    at(T0);
    const fetchSpy = mockFetch();
    await makeStore().dispatch(actions.doSearchAll('wing'));
    expect(fetchSpy).toHaveBeenCalledTimes(3);

    const revisit = makeStore();
    await revisit.dispatch(actions.doSearch('starships', 'wing'));
    expect(fetchSpy).toHaveBeenCalledTimes(3);
    expect(revisit.getState().app.allFilteredStarships.map(s => s.name)).toEqual(['X-wing']);
  });

  it('searches the API again after the cached result expires', async () => {
    at(T0);
    const fetchSpy = mockFetch();
    await makeStore().dispatch(actions.doSearch('planets', 'tatoo'));
    at(T0 + DAY);
    await makeStore().dispatch(actions.doSearch('planets', 'tatoo'));
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('does not cache a search that fails part way through its pages', async () => {
    const term = 'person';
    const base = `${API_ENDPOINTS.characters}?search=${term}`;
    const fetchSpy = mockFetch({
      [base]: { count: 3, next: `${base}&page=2`, results: [{ name: 'Person 1' }, { name: 'Person 2' }] },
      [`${base}&page=2`]: new Error('Timeout'),
    });
    const store = makeStore();
    await store.dispatch(actions.doSearch('characters', term));
    // A failed search shows no results, as before, and is not stored in memory either
    expect(store.getState().app.allFilteredCharacters).toEqual([]);
    expect(store.getState().app.charactersSearch).not.toHaveProperty(term);

    fetchSpy.mockRestore();
    const retrySpy = mockFetch({
      [base]: { count: 3, next: `${base}&page=2`, results: [{ name: 'Person 1' }, { name: 'Person 2' }] },
      [`${base}&page=2`]: { count: 3, next: null, results: [{ name: 'Person 3' }] },
    });
    const revisit = makeStore();
    await revisit.dispatch(actions.doSearch('characters', term));
    expect(retrySpy).toHaveBeenCalledTimes(2);
    expect(revisit.getState().app.allFilteredCharacters).toHaveLength(3);
  });

  it('retries a failed search in the same visit instead of remembering the failure', async () => {
    const fetchSpy = mockFetch({ [`${API_ENDPOINTS.planets}?search=tatoo`]: new Error('Down') });
    const store = makeStore();
    await store.dispatch(actions.doSearch('planets', 'tatoo'));
    expect(store.getState().app.allFilteredPlanets).toEqual([]);

    fetchSpy.mockRestore();
    mockFetch();
    await store.dispatch(actions.resetSearch('planets'));
    await store.dispatch(actions.doSearch('planets', 'tatoo'));
    expect(store.getState().app.allFilteredPlanets.map(p => p.name)).toEqual(['Tatooine']);
  });

  it('only remembers the categories of a home search that succeeded', async () => {
    mockFetch({ [`${API_ENDPOINTS.characters}?search=wing`]: new Error('Down') });
    const store = makeStore();
    await store.dispatch(actions.doSearchAll('wing'));

    const { charactersSearch, starshipsSearch } = store.getState().app;
    expect(charactersSearch).not.toHaveProperty('wing');
    expect(starshipsSearch.wing.map(s => s.name)).toEqual(['X-wing']);
  });

  it('uses a cached search for a description URL on the next visit', async () => {
    at(T0);
    const fetchSpy = mockFetch();
    await makeStore().dispatch(actions.doSetDescription('characters', 'extra person 3'));
    fetchSpy.mockClear();

    const revisit = makeStore();
    await revisit.dispatch(actions.doSetDescription('characters', 'extra person 3'));

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(revisit.getState().app.descriptionItem.category.name).toBe('Extra Person 3');
  });

  it('does not let a slow older request overwrite a newer cached page', async () => {
    // Two visits (for example two tabs) load the same page. The first request is
    // slow and returns older data after the second has already been saved.
    const url = page('planets', 2);
    let releaseOld;
    vi.spyOn(globalThis, 'fetch').mockImplementation((requested) => {
      if (requested !== url) throw new Error(`Unexpected fetch: ${requested}`);
      if (!releaseOld) {
        return new Promise(resolve => {
          releaseOld = () => resolve({ ok: true, json: async () => ({ count: 13, results: [{ name: 'Old Planet' }] }) });
        });
      }
      return Promise.resolve({ ok: true, json: async () => ({ count: 13, results: [{ name: 'New Planet' }] }) });
    });
    const now = at(T0);
    const oldVisit = makeStore().dispatch(actions.doFetchPage('planets', 2));
    now.mockReturnValue(T0 + 1000);
    await makeStore().dispatch(actions.doFetchPage('planets', 2));
    now.mockReturnValue(T0 + 2000);
    releaseOld();
    await oldVisit;

    vi.mocked(globalThis.fetch).mockClear();
    const revisit = makeStore();
    await revisit.dispatch(actions.doFetchPage('planets', 2));
    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(revisit.getState().app.planetsPaging.pages[2].map(p => p.name)).toEqual(['New Planet']);
  });
});

describe('fallback API', () => {
  const mirrorPage = (resource, n) => mirrorUrl(page(resource, n));

  it('loads the first page from the mirror when swapi.dev is down', async () => {
    const fetchSpy = mockFetch({}, { down: ['primary'] });
    const store = makeStore();

    await store.dispatch(actions.doFetchPage('characters', 1));

    const state = store.getState().app;
    expect(fetchedUrls(fetchSpy)).toEqual([page('characters', 1), mirrorPage('characters', 1)]);
    expect(state.loadingCharacters).toBe(false);
    expect(state.loadingCharactersError).toEqual({});
    expect(state.charactersPaging.pages[1]).toHaveLength(10);
    expect(state.charactersPaging.count).toBe(15);
  });

  it('loads later pages from the mirror, going straight to it once swapi.dev has failed', async () => {
    const fetchSpy = mockFetch({}, { down: ['primary'] });
    const store = makeStore();
    await store.dispatch(actions.doFetchPage('planets', 1));
    fetchSpy.mockClear();

    await store.dispatch(actions.doFetchPage('planets', 2));

    expect(fetchedUrls(fetchSpy)).toEqual([mirrorPage('planets', 2)]);
    expect(store.getState().app.planetsPaging.pages[2]).toHaveLength(3);
  });

  it('searches through the mirror when swapi.dev is down', async () => {
    mockFetch({}, { down: ['primary'] });
    const store = makeStore();

    await store.dispatch(actions.doSearch('characters', 'extra'));

    expect(store.getState().app.allFilteredCharacters).toHaveLength(5);
    expect(store.getState().app.isFilteringCharacters).toBe(true);
  });

  it('follows search pages across servers when swapi.dev fails part way', async () => {
    const term = 'person';
    const path = `people/?search=${term}`;
    const fetchSpy = mockFetch({
      [`${API_ENDPOINTS.characters}?search=${term}`]: { count: 3, next: `${API_ENDPOINTS.characters}?search=${term}&page=2`, results: [{ name: 'Person 1' }, { name: 'Person 2' }] },
      [`${API_ENDPOINTS.characters}?search=${term}&page=2`]: new Error('Down'),
      [mirrorUrl(`${API_ENDPOINTS.characters}?search=${term}&page=2`)]: { count: 3, next: null, results: [{ name: 'Person 3' }] },
    });
    const store = makeStore();

    await store.dispatch(actions.doSearch('characters', term));

    expect(store.getState().app.allFilteredCharacters.map(c => c.name)).toEqual(['Person 1', 'Person 2', 'Person 3']);
    expect(fetchedUrls(fetchSpy).map(url => url.replace(/^https:\/\/[^/]+\/api\//, ''))).toEqual([path, `${path}&page=2`, `${path}&page=2`]);
  });

  it('follows next links that point at the mirror', async () => {
    const term = 'person';
    const mirrorBase = mirrorUrl(`${API_ENDPOINTS.characters}?search=${term}`);
    mockFetch({
      [mirrorBase]: { count: 3, next: `${mirrorBase}&page=2`, results: [{ name: 'Person 1' }, { name: 'Person 2' }] },
      [`${mirrorBase}&page=2`]: { count: 3, next: null, results: [{ name: 'Person 3' }] },
    }, { down: ['primary'] });
    const store = makeStore();

    await store.dispatch(actions.doSearch('characters', term));

    expect(store.getState().app.allFilteredCharacters).toHaveLength(3);
  });

  it('finds a description item through the mirror', async () => {
    mockFetch({}, { down: ['primary'] });
    const store = makeStore();

    await store.dispatch(actions.doSetDescription('planets', 'extra planet 2'));

    expect(store.getState().app.descriptionItem.category.name).toBe('Extra Planet 2');
  });

  it('shows the initial load error when both servers are down, and caches nothing', async () => {
    const fetchSpy = mockFetch({}, { down: ['primary', 'mirror'] });
    const store = makeStore();

    await store.dispatch(actions.doFetchPage('starships', 1));

    const state = store.getState().app;
    expect(fetchedUrls(fetchSpy)).toEqual([page('starships', 1), mirrorPage('starships', 1)]);
    expect(state.loadingStarships).toBe(false);
    expect(state.loadingStarshipsError.message).toBe('Failed to fetch');
    expect(localStorage.length).toBe(0);
  });

  it('records a page error when both servers are down and recovers on retry', async () => {
    const fetchSpy = mockFetch();
    const store = makeStore();
    await store.dispatch(actions.doFetchPage('characters', 1));
    fetchSpy.mockRestore();

    mockFetch({}, { down: ['primary', 'mirror'] });
    await store.dispatch(actions.doFetchPage('characters', 2));
    expect(store.getState().app.charactersPaging.errors[2].message).toBe('Failed to fetch');
    expect(store.getState().app.loadingCharactersError).toEqual({});

    vi.mocked(globalThis.fetch).mockRestore();
    mockFetch({}, { down: ['primary'] });
    await store.dispatch(actions.doFetchPage('characters', 2));
    expect(store.getState().app.charactersPaging.errors[2]).toBeUndefined();
    expect(store.getState().app.charactersPaging.pages[2]).toHaveLength(5);
  });

  it('shows no results for a search when both servers are down, and does not remember it', async () => {
    mockFetch({}, { down: ['primary', 'mirror'] });
    const store = makeStore();

    await store.dispatch(actions.doSearch('planets', 'tatoo'));

    expect(store.getState().app.allFilteredPlanets).toEqual([]);
    expect(store.getState().app.planetsSearch).not.toHaveProperty('tatoo');
  });

  it('caches mirror responses under the swapi.dev URL, so a later visit uses them', async () => {
    const fetchSpy = mockFetch({}, { down: ['primary'] });
    await makeStore().dispatch(actions.doFetchPage('planets', 2));
    await makeStore().dispatch(actions.doSearch('starships', 'wing'));
    expect(localStorage.getItem(`swapi-cache:v1:${page('planets', 2)}`)).not.toBeNull();
    fetchSpy.mockClear();

    // swapi.dev is back; cached data is still used without any request
    fetchSpy.mockRestore();
    const healthy = mockFetch();
    const revisit = makeStore();
    await revisit.dispatch(actions.doFetchPage('planets', 2));
    await revisit.dispatch(actions.doSearch('starships', 'wing'));
    expect(healthy).not.toHaveBeenCalled();
    expect(revisit.getState().app.allFilteredStarships.map(s => s.name)).toEqual(['X-wing']);
  });

  it('serves cached data even when both servers are down', async () => {
    const fetchSpy = mockFetch();
    await makeStore().dispatch(actions.doFetchPage('characters', 1));
    fetchSpy.mockRestore();

    const offline = mockFetch({}, { down: ['primary', 'mirror'] });
    const revisit = makeStore();
    await revisit.dispatch(actions.doFetchPage('characters', 1));

    expect(offline).not.toHaveBeenCalled();
    expect(revisit.getState().app.loadingCharactersError).toEqual({});
    expect(revisit.getState().app.characters).toHaveLength(10);
  });
});

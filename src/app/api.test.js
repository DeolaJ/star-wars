import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchFromAPI, toApiPath } from './api';
import {
  API_BASE_URL, API_FALLBACK_BASE_URL, API_TIMEOUT_MS, API_PRIMARY_RETRY_MS,
} from '../config';

const PATH = 'planets/?page=1';
const PRIMARY = `${API_BASE_URL}/${PATH}`;
const MIRROR = `${API_FALLBACK_BASE_URL}/${PATH}`;
const ok = (body) => ({ ok: true, json: async () => body });
const calledUrls = (spy) => spy.mock.calls.map(([url]) => url);

// Each server answers with a response, or throws/rejects
const serve = (handlers) => vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, options) => {
  const handler = url.startsWith(API_FALLBACK_BASE_URL) ? handlers.mirror : handlers.primary;
  return handler(url, options);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('fetchFromAPI', () => {
  it('uses swapi.dev when it works and does not touch the mirror', async () => {
    const spy = serve({ primary: async () => ok({ from: 'primary' }), mirror: async () => ok({ from: 'mirror' }) });
    await expect(fetchFromAPI(PATH)).resolves.toEqual({ from: 'primary' });
    expect(calledUrls(spy)).toEqual([PRIMARY]);
  });

  it.each([
    ['a network error', async () => { throw new TypeError('Failed to fetch'); }],
    ['an HTTP error', async () => ({ ok: false, status: 503, json: async () => ({}) })],
    ['an invalid body', async () => ok({ unexpected: true })],
  ])('falls back to the mirror after %s from swapi.dev', async (_, primary) => {
    const spy = serve({ primary, mirror: async () => ok({ results: [], from: 'mirror' }) });
    const validate = (body) => {
      if (!Array.isArray(body.results)) throw new Error('Incomplete response from the API');
      return body;
    };
    await expect(fetchFromAPI(PATH, validate)).resolves.toMatchObject({ from: 'mirror' });
    expect(calledUrls(spy)).toEqual([PRIMARY, MIRROR]);
  });

  it('falls back when swapi.dev hangs instead of failing', async () => {
    vi.useFakeTimers();
    serve({
      // Never answers; only settles when the request is aborted
      primary: (url, { signal }) => new Promise((_, reject) => {
        signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
      }),
      mirror: async () => ok({ from: 'mirror' }),
    });
    const result = fetchFromAPI(PATH);
    await vi.advanceTimersByTimeAsync(API_TIMEOUT_MS);
    await expect(result).resolves.toEqual({ from: 'mirror' });
  });

  it('reports the swapi.dev error when both servers fail', async () => {
    const spy = serve({
      primary: async () => ({ ok: false, status: 500, json: async () => ({}) }),
      mirror: async () => { throw new TypeError('Failed to fetch'); },
    });
    await expect(fetchFromAPI(PATH)).rejects.toThrow('Request failed with status 500');
    expect(calledUrls(spy)).toEqual([PRIMARY, MIRROR]);
  });

  it('reports a timeout clearly', async () => {
    vi.useFakeTimers();
    const hang = (url, { signal }) => new Promise((_, reject) => {
      signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
    });
    serve({ primary: hang, mirror: hang });
    const result = fetchFromAPI(PATH);
    const assertion = expect(result).rejects.toThrow('The request timed out');
    await vi.advanceTimersByTimeAsync(API_TIMEOUT_MS * 2);
    await assertion;
  });

  it('tries the mirror first for a while after swapi.dev fails, then swapi.dev again', async () => {
    const now = vi.spyOn(Date, 'now').mockReturnValue(1_000_000);
    let primaryUp = false;
    const spy = serve({
      primary: async () => {
        if (!primaryUp) throw new TypeError('Failed to fetch');
        return ok({ from: 'primary' });
      },
      mirror: async () => ok({ from: 'mirror' }),
    });

    await fetchFromAPI(PATH);
    spy.mockClear();
    // While swapi.dev is considered down, the mirror answers without waiting on it
    await expect(fetchFromAPI(PATH)).resolves.toEqual({ from: 'mirror' });
    expect(calledUrls(spy)).toEqual([MIRROR]);

    // Once the retry window has passed, swapi.dev is tried first again
    primaryUp = true;
    now.mockReturnValue(1_000_000 + API_PRIMARY_RETRY_MS);
    spy.mockClear();
    await expect(fetchFromAPI(PATH)).resolves.toEqual({ from: 'primary' });
    expect(calledUrls(spy)).toEqual([PRIMARY]);
  });

  it('still tries swapi.dev if the mirror fails while swapi.dev is considered down', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_000_000);
    let primaryUp = false;
    let mirrorUp = true;
    const spy = serve({
      primary: async () => (primaryUp ? ok({ from: 'primary' }) : Promise.reject(new TypeError('Failed to fetch'))),
      mirror: async () => (mirrorUp ? ok({ from: 'mirror' }) : Promise.reject(new TypeError('Failed to fetch'))),
    });

    // swapi.dev fails, so it is considered down
    await fetchFromAPI(PATH);
    // Then the mirror goes down and swapi.dev recovers
    primaryUp = true;
    mirrorUp = false;
    spy.mockClear();
    await expect(fetchFromAPI(PATH)).resolves.toEqual({ from: 'primary' });
    expect(calledUrls(spy)).toEqual([MIRROR, PRIMARY]);
  });
});

describe('toApiPath', () => {
  it('turns links from either server into a path', () => {
    expect(toApiPath(`${API_BASE_URL}/people/?search=a&page=2`)).toBe('people/?search=a&page=2');
    expect(toApiPath(`${API_FALLBACK_BASE_URL}/people/?search=a&page=2`)).toBe('people/?search=a&page=2');
  });

  it('rejects links to other hosts', () => {
    expect(() => toApiPath('https://example.com/api/people/')).toThrow('Unexpected API link');
  });
});

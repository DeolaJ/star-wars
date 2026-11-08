import { vi } from 'vitest';
import { API_ENDPOINTS, API_BASE_URL, API_FALLBACK_BASE_URL } from '../config';

const person = (name, gender = 'male') => ({
  name, gender, height: '172', mass: '77', hair_color: 'blond',
  eye_color: 'blue', skin_color: 'fair', birth_year: '19BBY',
});
const planet = (name) => ({
  name, rotation_period: '23', diameter: '10465', orbital_period: '304',
  climate: 'arid', gravity: '1 standard', terrain: 'desert',
  population: '200000', surface_water: '1',
});
// SWAPI titles a film rather than naming it; the app normalises that on ingest
const film = (title, episode = 4) => ({
  title, episode_id: episode, director: 'George Lucas', producer: 'Gary Kurtz',
  release_date: '1977-05-25', opening_crawl: `It is a period of civil war. ${title} begins.`,
});
const creature = (name) => ({
  name, classification: 'mammal', designation: 'sentient', average_height: '180',
  skin_colors: 'caucasian', hair_colors: 'blonde', eye_colors: 'blue',
  average_lifespan: '120', language: 'Galactic Basic',
});
const vehicle = (name) => ({
  name, model: 'Digger Crawler', manufacturer: 'Corellia Mining', cost_in_credits: '150000',
  length: '36.8', max_atmosphering_speed: '30', crew: '46', passengers: '30',
  cargo_capacity: '50000', consumables: '2 months', vehicle_class: 'wheeled',
});
const starship = (name) => ({
  name, model: 'T-65', manufacturer: 'Incom', cost_in_credits: '149999',
  length: '12.5', max_atmosphering_speed: '1050', crew: '1',
  cargo_capacity: '110', passengers: '0', consumables: '1 week',
  hyperdrive_rating: '1.0', MGLT: '100', starship_class: 'Starfighter',
});

const range = (n, fn, prefix) => Array.from({ length: n }, (_, i) => fn(`${prefix} ${i + 1}`));

// Two pages per resource, mirroring how SWAPI paginates with `count` and `next`
const resource = (endpoint, page1, page2) => {
  const count = page1.length + page2.length;
  return {
    [`${endpoint}?page=1`]: { count, next: `${endpoint}?page=2`, previous: null, results: page1 },
    [`${endpoint}?page=2`]: { count, next: null, previous: `${endpoint}?page=1`, results: page2 },
  };
};

// A resource that fits on one page, as films do on the real API
const onePage = (endpoint, items) => ({
  [`${endpoint}?page=1`]: { count: items.length, next: null, previous: null, results: items },
});

export const pages = {
  ...resource(API_ENDPOINTS.characters, [person('Luke Skywalker'), person('Leia Organa', 'female'), ...range(8, person, 'Person')], range(5, person, 'Extra Person')),
  ...resource(API_ENDPOINTS.planets, [planet('Tatooine'), ...range(9, planet, 'Planet')], range(3, planet, 'Extra Planet')),
  ...resource(API_ENDPOINTS.starships, [starship('X-wing'), ...range(9, starship, 'Starship')], range(2, starship, 'Extra Starship')),
  // One page only, and every episode so the era-based artwork rules are exercised
  ...onePage(API_ENDPOINTS.films, [
    film('A New Hope', 4), film('The Empire Strikes Back', 5), film('Return of the Jedi', 6),
    film('The Phantom Menace', 1), film('Attack of the Clones', 2), film('Revenge of the Sith', 3),
  ]),
  ...resource(API_ENDPOINTS.species, [creature('Wookiee'), ...range(9, creature, 'Species')], range(4, creature, 'Extra Species')),
  ...resource(API_ENDPOINTS.vehicles, [vehicle('Sand Crawler'), ...range(9, vehicle, 'Vehicle')], range(3, vehicle, 'Extra Vehicle')),
};

const allItems = (endpoint) => Object.entries(pages)
  .filter(([url]) => url.startsWith(`${endpoint}?page=`))
  .flatMap(([, body]) => body.results);

// Answers ?search= the way SWAPI does: a case-insensitive name match across every page
const label = (item) => item.name || item.title;
const searchResponse = (url) => {
  const [endpoint, query] = url.split('?search=');
  const term = decodeURIComponent(query).toLowerCase();
  const results = allItems(endpoint).filter(item => label(item).toLowerCase().includes(term));
  return { count: results.length, next: null, previous: null, results };
};

// The mirror serves the same data as swapi.dev. An override keyed by a swapi.dev
// URL applies to both servers (the API is down everywhere), unless the mirror URL
// has its own override. `down` makes a whole server unreachable, for example
// { down: ['primary'] } to simulate swapi.dev being down while the mirror works.
export const mirrorUrl = (url) => url.replace(API_BASE_URL, API_FALLBACK_BASE_URL);

export const mockFetch = (overrides = {}, { down = [] } = {}) => {
  const table = { ...pages, ...overrides };
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (requested) => {
    const isMirror = requested.startsWith(API_FALLBACK_BASE_URL);
    if (down.includes(isMirror ? 'mirror' : 'primary')) {
      throw new TypeError('Failed to fetch');
    }
    const url = isMirror && !(requested in table) ? requested.replace(API_FALLBACK_BASE_URL, API_BASE_URL) : requested;
    let body = table[url];
    if (!body && url.includes('?search=')) body = searchResponse(url);
    if (body instanceof Error) throw body;
    if (!body) throw new Error(`Unexpected fetch: ${url}`);
    return { ok: true, json: async () => body };
  });
};

// URLs requested so far, for asserting exactly which pages were fetched
export const fetchedUrls = (fetchSpy) => fetchSpy.mock.calls.map(([url]) => url);

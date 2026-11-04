import { vi } from 'vitest';
import { API_ENDPOINTS } from '../config';

const person = (name, gender = 'male') => ({
  name, gender, height: '172', mass: '77', hair_color: 'blond',
  eye_color: 'blue', skin_color: 'fair', birth_year: '19BBY',
});
const planet = (name) => ({
  name, rotation_period: '23', diameter: '10465', orbital_period: '304',
  climate: 'arid', gravity: '1 standard', terrain: 'desert',
  population: '200000', surface_water: '1',
});
const starship = (name) => ({
  name, model: 'T-65', manufacturer: 'Incom', cost_in_credits: '149999',
  length: '12.5', max_atmosphering_speed: '1050', crew: '1',
  cargo_capacity: '110', passengers: '0', consumables: '1 week',
  hyperdrive_rating: '1.0', MGLT: '100', starship_class: 'Starfighter',
});

const range = (n, fn, prefix) => Array.from({ length: n }, (_, i) => fn(`${prefix} ${i + 1}`));

// Two pages per resource, mirroring how SWAPI paginates with a `next` link
export const pages = {
  [API_ENDPOINTS.characters]: { next: `${API_ENDPOINTS.characters}?page=2`, results: [person('Luke Skywalker'), person('Leia Organa', 'female'), ...range(8, person, 'Person')] },
  [`${API_ENDPOINTS.characters}?page=2`]: { next: null, results: range(5, person, 'Extra Person') },
  [API_ENDPOINTS.planets]: { next: `${API_ENDPOINTS.planets}?page=2`, results: [planet('Tatooine'), ...range(9, planet, 'Planet')] },
  [`${API_ENDPOINTS.planets}?page=2`]: { next: null, results: range(3, planet, 'Extra Planet') },
  [API_ENDPOINTS.starships]: { next: `${API_ENDPOINTS.starships}?page=2`, results: [starship('X-wing'), ...range(9, starship, 'Starship')] },
  [`${API_ENDPOINTS.starships}?page=2`]: { next: null, results: range(2, starship, 'Extra Starship') },
};

export const mockFetch = (overrides = {}) => {
  const table = { ...pages, ...overrides };
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
    const body = table[url];
    if (body instanceof Error) throw body;
    if (!body) throw new Error(`Unexpected fetch: ${url}`);
    return { json: async () => body };
  });
};

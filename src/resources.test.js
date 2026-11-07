import { describe, it, expect } from 'vitest';
import { RESOURCES, RESOURCE_KEYS, descriptionPath, listPath } from './resources';
import { API_BASE_URL, API_PATHS, API_ENDPOINTS } from './config';

describe('resource configuration', () => {
  it('lists the resources the app shows', () => {
    expect(RESOURCE_KEYS).toEqual(['characters', 'planets', 'starships']);
  });

  it.each(RESOURCE_KEYS)('describes %s completely', (key) => {
    const resource = RESOURCES[key];
    expect(resource.path).toMatch(/^[a-z]+\/$/);
    expect(resource.label).toBeTruthy();
    expect(['left', 'top']).toContain(resource.imagePosition.page);
    expect(['left', 'top']).toContain(resource.imagePosition.card);
    expect(typeof resource.cardText).toBe('function');
    expect(typeof resource.describe).toBe('function');
  });

  it('drives the API paths and endpoints', () => {
    expect(API_PATHS).toEqual({ characters: 'people/', planets: 'planets/', starships: 'starships/' });
    expect(API_ENDPOINTS.characters).toBe(`${API_BASE_URL}/people/`);
    expect(Object.keys(API_ENDPOINTS)).toEqual(RESOURCE_KEYS);
  });

  it('writes the card text from the item', () => {
    expect(RESOURCES.characters.cardText({ name: 'Luke Skywalker', birth_year: '19BBY', gender: 'male' }))
      .toBe('Luke was born in the year 19BBY, and is male');
    expect(RESOURCES.planets.cardText({ name: 'Tatooine', climate: 'arid', population: '200000' }))
      .toBe('Tatooine has a climate of arid, and a population of 200000');
    expect(RESOURCES.starships.cardText({ name: 'Millennium Falcon', model: 'YT-1300', cargo_capacity: '100000' }))
      .toBe('Millennium is of the YT-1300 model, and has a cargo of 100000');
  });

  it('builds routes from the resource and the item name', () => {
    expect(listPath('planets')).toBe('/planets');
    expect(descriptionPath('characters', 'Luke Skywalker')).toBe('/description/characters/luke_skywalker');
    expect(descriptionPath('starships', 'X-wing')).toBe('/description/starships/x-wing');
  });
});

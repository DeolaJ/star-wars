import { describe, it, expect } from 'vitest';
import { RESOURCES, RESOURCE_KEYS, HOME_SECTIONS, normalise, normaliseAll, descriptionPath, listPath, resourceForPath, relatedUrls } from './resources';
import { API_BASE_URL, API_PATHS, API_ENDPOINTS } from './config';

describe('resource configuration', () => {
  it('lists the resources the app shows', () => {
    expect(RESOURCE_KEYS).toEqual(['characters', 'planets', 'starships', 'films', 'species', 'vehicles']);
  });

  it('gives every resource a home page section, and only real ones', () => {
    expect(HOME_SECTIONS.map(s => s.resource).sort()).toEqual([...RESOURCE_KEYS].sort());
    HOME_SECTIONS.forEach(section => {
      expect(['cards', 'slider']).toContain(section.display);
      expect(section.count).toBeGreaterThan(0);
    });
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
    expect(API_PATHS).toEqual({
      characters: 'people/', planets: 'planets/', starships: 'starships/',
      films: 'films/', species: 'species/', vehicles: 'vehicles/',
    });
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

  describe('naming', () => {
    it('gives a film a name from its title, keeping the title', () => {
      const film = normalise('films', { title: 'A New Hope', episode_id: 4 });
      expect(film.name).toBe('A New Hope');
      expect(film.title).toBe('A New Hope');
    });

    it.each(['characters', 'planets', 'starships', 'species', 'vehicles'])('leaves a %s item untouched', (resource) => {
      const item = { name: 'Tatooine', climate: 'arid' };
      expect(normalise(resource, item)).toBe(item);
    });

    it('leaves a film alone when the API sends no title', () => {
      const broken = { episode_id: 4 };
      expect(normalise('films', broken)).toBe(broken);
    });

    it('names a whole page of films', () => {
      expect(normaliseAll('films', [{ title: 'A' }, { title: 'B' }]).map(f => f.name)).toEqual(['A', 'B']);
    });

    it('routes a film by its title', () => {
      expect(descriptionPath('films', normalise('films', { title: 'The Empire Strikes Back' }).name))
        .toBe('/description/films/the_empire_strikes_back');
    });
  });

  it('writes the card text for the new resources', () => {
    expect(RESOURCES.films.cardText({ episode_id: 4, director: 'George Lucas', release_date: '1977-05-25' }))
      .toBe('Episode 4, directed by George Lucas and released in 1977-05-25');
    expect(RESOURCES.species.cardText({ name: 'Wookiee', classification: 'mammal', language: 'Shyriiwook' }))
      .toBe('Wookiee are a mammal species that speak Shyriiwook');
    expect(RESOURCES.vehicles.cardText({ name: 'Sand Crawler', vehicle_class: 'wheeled', cargo_capacity: '50000' }))
      .toBe('Sand Crawler is a wheeled vehicle, and has a cargo of 50000');
  });

  it('picks the right article for a vowel-initial classification', () => {
    expect(RESOURCES.species.cardText({ name: 'Droid', classification: 'artificial', language: 'n/a' }))
      .toBe('Droid are an artificial species that speak n/a');
    expect(RESOURCES.vehicles.cardText({ name: 'Snowspeeder', vehicle_class: 'airspeeder', cargo_capacity: '10' }))
      .toBe('Snowspeeder is an airspeeder vehicle, and has a cargo of 10');
  });

  it('builds routes from the resource and the item name', () => {
    expect(listPath('planets')).toBe('/planets');
    expect(descriptionPath('characters', 'Luke Skywalker')).toBe('/description/characters/luke_skywalker');
    expect(descriptionPath('starships', 'X-wing')).toBe('/description/starships/x-wing');
  });
});

describe('related links', () => {
  it.each(RESOURCE_KEYS)('%s names the fields that link to other items', (key) => {
    expect(RESOURCES[key].related.length).toBeGreaterThan(0);
    RESOURCES[key].related.forEach(({ field, label }) => {
      expect(field).toMatch(/^[a-z]+$/);
      expect(label).toBeTruthy();
    });
  });

  it('tells the resource from an API path', () => {
    expect(resourceForPath('people/1/')).toBe('characters');
    expect(resourceForPath('films/3/')).toBe('films');
    expect(resourceForPath('species/2/')).toBe('species');
    expect(resourceForPath('droids/1/')).toBeUndefined();
    expect(resourceForPath(null)).toBeUndefined();
  });

  it('reads the links out of a related field, whatever its shape', () => {
    expect(relatedUrls('https://swapi.dev/api/planets/1/')).toEqual(['https://swapi.dev/api/planets/1/']);
    expect(relatedUrls(['https://swapi.dev/api/films/1/', 'https://swapi.py4e.com/api/films/2/'])).toHaveLength(2);
    expect(relatedUrls(null)).toEqual([]);
    expect(relatedUrls('unknown')).toEqual([]);
    expect(relatedUrls('n/a')).toEqual([]);
    expect(relatedUrls([])).toEqual([]);
  });
});

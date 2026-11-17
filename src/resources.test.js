import { describe, it, expect } from 'vitest';
import { RESOURCES, RESOURCE_KEYS, HOME_SECTIONS, normalise, normaliseAll, descriptionPath, listPath, resourceForPath, relatedUrls, filterValues, filterItems, sortItems, paragraphs } from './resources';
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

describe('filtering and sorting', () => {
  const planets = [
    { name: 'Tatooine', climate: 'arid', population: '200000' },
    { name: 'Hoth', climate: 'frozen', population: 'unknown' },
    { name: 'Yavin IV', climate: 'temperate, tropical', population: '1000' },
    { name: 'Bespin', climate: 'temperate', population: '6000000' },
  ];
  const sortFields = RESOURCES.planets.sortFields;

  it.each(RESOURCE_KEYS)('%s says what it can be filtered and sorted by', (key) => {
    expect(RESOURCES[key].filters.length).toBeGreaterThan(0);
    RESOURCES[key].filters.forEach(({ field, label }) => {
      expect(field).toMatch(/^[a-z_]+$/);
      expect(label).toBeTruthy();
    });
    expect(RESOURCES[key].sortFields.length).toBeGreaterThan(0);
    RESOURCES[key].sortFields.forEach(({ field, label }) => {
      expect(field).toMatch(/^[a-z_]+$/);
      expect(label).toBeTruthy();
    });
  });

  describe('the values a filter offers', () => {
    it('lists each value once, in order, splitting fields that hold several', () => {
      expect(filterValues(planets, 'climate')).toEqual(['arid', 'frozen', 'temperate', 'tropical']);
    });

    it('ignores items with nothing in the field', () => {
      expect(filterValues([{ name: 'A' }, { name: 'B', climate: '' }, { name: 'C', climate: 'arid' }], 'climate'))
        .toEqual(['arid']);
    });
  });

  describe('narrowing', () => {
    it('keeps only the items with the chosen value', () => {
      expect(filterItems(planets, { climate: 'frozen' }).map(p => p.name)).toEqual(['Hoth']);
    });

    it('matches one value of a field that holds several', () => {
      expect(filterItems(planets, { climate: 'temperate' }).map(p => p.name)).toEqual(['Yavin IV', 'Bespin']);
      expect(filterItems(planets, { climate: 'tropical' }).map(p => p.name)).toEqual(['Yavin IV']);
    });

    it('matches whatever the letter case', () => {
      expect(filterItems(planets, { climate: 'FROZEN' }).map(p => p.name)).toEqual(['Hoth']);
    });

    it('leaves the list alone when nothing is chosen', () => {
      expect(filterItems(planets, { climate: '' })).toBe(planets);
      expect(filterItems(planets, {})).toBe(planets);
    });
  });

  describe('ordering', () => {
    const names = (key) => sortItems(planets, key, sortFields).map(p => p.name);

    it('orders by name both ways', () => {
      expect(names('name')).toEqual(['Bespin', 'Hoth', 'Tatooine', 'Yavin IV']);
      expect(names('-name')).toEqual(['Yavin IV', 'Tatooine', 'Hoth', 'Bespin']);
    });

    it('compares a numeric field as numbers, not text', () => {
      expect(names('population')).toEqual(['Yavin IV', 'Tatooine', 'Bespin', 'Hoth']);
      expect(names('-population')).toEqual(['Bespin', 'Tatooine', 'Yavin IV', 'Hoth']);
    });

    it('puts a value the API does not have last, whichever way round it is', () => {
      expect(names('population')[3]).toBe('Hoth');
      expect(names('-population')[3]).toBe('Hoth');
    });

    it('leaves the list alone for no sort, or one it does not know', () => {
      expect(sortItems(planets, '', sortFields)).toBe(planets);
      expect(sortItems(planets, 'colour', sortFields)).toBe(planets);
    });

    it('does not disturb the list it was given', () => {
      const before = planets.map(p => p.name);
      sortItems(planets, '-name', sortFields);
      expect(planets.map(p => p.name)).toEqual(before);
    });
  });
});

describe('description paragraphs', () => {
  it('splits on the blank line and tidies the indentation away', () => {
    expect(paragraphs('\n  One line.\n  Still the first.\n\n  A second.\n'))
      .toEqual(['One line. Still the first.', 'A second.']);
  });

  it('gives a single paragraph back as one', () => {
    expect(paragraphs('  Just the one.  ')).toEqual(['Just the one.']);
  });

  it('has nothing to show for nothing', () => {
    expect(paragraphs('')).toEqual([]);
    expect(paragraphs(undefined)).toEqual([]);
  });

  it.each(RESOURCE_KEYS)('leaves no stray slash-n in the %s description', (key) => {
    const item = {
      name: 'Thing', gender: 'male', height: '1', mass: '1', hair_color: 'x', eye_color: 'x',
      skin_color: 'x', birth_year: '1', rotation_period: '1', diameter: '1', orbital_period: '1',
      climate: 'arid', gravity: '1', terrain: 'desert', population: '1', surface_water: '1',
      model: 'x', manufacturer: 'x', cost_in_credits: '1', length: '1', max_atmosphering_speed: '1',
      crew: '1', cargo_capacity: '1', passengers: '1', consumables: '1', hyperdrive_rating: '1',
      MGLT: '1', starship_class: 'x', episode_id: 1, director: 'x', producer: 'x',
      release_date: '1977-05-25', opening_crawl: 'Crawl.', classification: 'mammal',
      designation: 'sentient', average_height: '1', skin_colors: 'x', hair_colors: 'x',
      eye_colors: 'x', average_lifespan: '1', language: 'x', vehicle_class: 'x',
    };
    const text = RESOURCES[key].describe(item);
    expect(text).not.toMatch(/\/n/);
    // every resource's description reads as more than one paragraph
    expect(paragraphs(text).length).toBeGreaterThan(1);
  });
});

import { describe, it, expect } from 'vitest';
import { artworkFor, heroArtwork, heroBackground } from './artwork';

describe('artwork', () => {
  it.each([
    ['characters', 4, /character-[1-4]-600\.webp/, 600, 600],
    ['planets', 3, /planet-[1-3]-600\.webp/, 600, 600],
    ['starships', 6, /starship-[1-6]-720\.webp/, 720, 405],
    ['films', 3, /film-[1-3]-720\.webp/, 720, 405],
    ['species', 4, /species-[1-4]-600\.webp/, 600, 600],
    ['vehicles', 4, /vehicle-[1-4]-720\.webp/, 720, 405],
  ])('gives %s a WebP picture with every size in its srcset', (category, count, smallest, width, height) => {
    const image = artworkFor(category, 'Luke Skywalker');
    expect(image.src).toMatch(smallest);
    expect(image.srcSet.split(', ')).toHaveLength(2);
    image.srcSet.split(', ').forEach(entry => expect(entry).toMatch(/\.webp \d+w$/));
    expect([image.width, image.height]).toEqual([width, height]);
  });

  it('always picks the same picture for the same item, whatever the letter case', () => {
    expect(artworkFor('planets', 'Tatooine')).toEqual(artworkFor('planets', 'tatooine'));
    expect(artworkFor('planets', 'Tatooine')).toEqual(artworkFor('planets', 'Tatooine'));
  });

  it('spreads items across the whole set', () => {
    const names = Array.from({ length: 40 }, (_, i) => `Starship ${i}`);
    const used = new Set(names.map(name => artworkFor('starships', name).src));
    expect(used.size).toBe(6);
  });

  it('returns nothing for an unknown category', () => {
    expect(artworkFor('weapons', 'Lightsaber')).toBeNull();
  });

  it('offers the hero in three widths and a full-screen background', () => {
    expect(heroArtwork.srcSet.split(', ').map(entry => entry.split(' ')[1])).toEqual(['1280w', '1920w', '2880w']);
    expect(heroBackground).toMatch(/hero-1920\.webp/);
  });

  describe('matching artwork to the item', () => {
    const number = (image) => Number(image.src.match(/-(\d)-\d+\.webp/)[1]);

    it.each([
      ['C-3PO', { name: 'C-3PO', species: ['https://swapi.dev/api/species/2/'] }],
      ['R2-D2', { name: 'R2-D2' }],
      ['IG-88', { name: 'IG-88', species: [] }],
    ])('shows a droid for %s', (_, item) => {
      expect(number(artworkFor('characters', item))).toBe(4);
    });

    it('never shows the droid for people', () => {
      ['Luke Skywalker', 'Leia Organa', 'Darth Vader', 'Han Solo', 'Yoda'].forEach(name => {
        expect(number(artworkFor('characters', { name, species: [] }))).not.toBe(4);
      });
    });

    it.each([
      ['Tatooine', 'arid', 'desert', 1],
      ['Mustafar', 'hot', 'volcanoes, lava rivers, mountains, caves', 1],
      ['Hoth', 'frozen', 'tundra, ice caves, mountain ranges', 2],
      ['Kamino', 'temperate', 'ocean', 3],
      // "hot" alone does not outweigh a world of jungles and oceans
      ['Rodia', 'hot', 'jungles, oceans, urban, swamps', 3],
    ])('gives %s the matching world', (name, climate, terrain, expected) => {
      expect(number(artworkFor('planets', { name, climate, terrain }))).toBe(expected);
    });

    it.each([
      ['Star Destroyer', 'Star Destroyer', [1]],
      ['Death Star', 'Deep Space Mobile Battlestation', [1]],
      ['CR90 corvette', 'corvette', [5]],
      ['Millennium Falcon', 'Light freighter', [3]],
      ['Imperial shuttle', 'Armed government transport', [6]],
      ['X-wing', 'Starfighter', [2, 4]],
      ['TIE Advanced x1', 'Starfighter', [2, 4]],
    ])('gives the %s a matching ship', (name, starshipClass, expected) => {
      expect(expected).toContain(number(artworkFor('starships', { name, starship_class: starshipClass, model: '' })));
    });

    // The API only has episodes 1-6, so films spread over the whole set by name
    // rather than being bucketed by era, which would never show one of the three
    it('spreads the real films across every film picture', () => {
      const titles = ['A New Hope', 'The Empire Strikes Back', 'Return of the Jedi',
        'The Phantom Menace', 'Attack of the Clones', 'Revenge of the Sith'];
      const used = titles.map(name => number(artworkFor('films', { name, episode_id: 4 })));
      expect(new Set(used).size).toBe(3);
    });

    it('gives a film the same picture whatever its episode number', () => {
      expect(artworkFor('films', { name: 'A New Hope', episode_id: 4 }))
        .toEqual(artworkFor('films', { name: 'A New Hope', episode_id: 7 }));
    });

    it.each([
      ['Wookiee', 'mammal', 'sentient', 1],
      ['Trandoshan', 'reptile', 'sentient', 2],
      ['Geonosian', 'insectoid', 'sentient', 3],
      ['Droid', 'artificial', 'sentient', 4],
    ])('gives the %s species a matching body plan', (name, classification, designation, expected) => {
      expect(number(artworkFor('species', { name, classification, designation }))).toBe(expected);
    });

    it.each([
      ['AT-AT', 'assault walker', 1],
      ['Snowspeeder', 'airspeeder', 2],
      ['Sand Crawler', 'wheeled', 3],
      ['TIE bomber', 'space/planetary bomber', 4],
    ])('gives the %s a matching vehicle', (name, vehicleClass, expected) => {
      expect(number(artworkFor('vehicles', { name, vehicle_class: vehicleClass, model: '' }))).toBe(expected);
    });

    it('falls back to a stable pick when the API has nothing to go on', () => {
      const item = { name: 'Aleen Minor', climate: 'unknown', terrain: 'unknown' };
      expect(artworkFor('planets', item)).toEqual(artworkFor('planets', { ...item }));
      expect(artworkFor('planets', 'Aleen Minor')).toEqual(artworkFor('planets', item));
    });
  });
});

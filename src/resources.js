// Everything that differs between the resources the app shows. The shared code
// (fetching, paging, search, the list pages and the cards) reads from here, so
// supporting another resource means adding an entry rather than another copy
// of each file.
//
//   path           where the resource lives on the API, relative to a base URL
//   label          how it is named in headings ("Popular Planets")
//   imagePosition  where a card puts its picture: on the resource's own list
//                  page, and on the cards used everywhere else (home, search
//                  results, recently viewed)
//   cardText       the one-line summary shown on a card
//   describe       the paragraph shown on the detail page
//   related        the fields holding links to other items, with a heading for
//                  each; the linked resource is read from the link itself
//   filters        fields the list can be narrowed by; the options come from
//                  the data rather than a fixed list, as the API keeps adding
//                  values (36 starship classes and counting)
//   sortFields     fields the list can be ordered by; `numeric` ones compare as
//                  numbers, with "unknown" and "n/a" last

const firstWord = (name) => name.split(' ')[0];
const trimmed = (text) => (text || '').replace(/\s+/g, ' ').trim();
// "a mammal species" but "an artificial species"
const article = (word) => (/^[aeiou]/i.test(word || '') ? 'an' : 'a');
const pronoun = (gender) => (gender === 'male' ? 'He' : (gender === 'female' ? 'She' : 'It'));
const asList = (text) => text.split(', ').join(' and ');

export const RESOURCES = {
  characters: {
    path: 'people/',
    label: 'Characters',
    imagePosition: { page: 'left', card: 'left' },
    related: [
      { field: 'homeworld', label: 'Homeworld' }, { field: 'films', label: 'Films' },
      { field: 'species', label: 'Species' }, { field: 'starships', label: 'Starships' },
      { field: 'vehicles', label: 'Vehicles' },
    ],
    filters: [{ field: 'gender', label: 'Gender' }],
    sortFields: [{ field: 'name', label: 'Name' }, { field: 'height', label: 'Height', numeric: true }, { field: 'mass', label: 'Mass', numeric: true }],
    cardText: (character) => (
      `${firstWord(character.name)} was born in the year ${character.birth_year}, and is ${character.gender}`
    ),
    describe: (character) => `
      ${character.name} is ${character.gender}, and is ${character.height} tall.

      ${pronoun(character.gender)} has a mass of ${character.mass}, 
      ${character.hair_color} hair color, ${character.eye_color} eye color, ${character.skin_color} skin color, 
      and was born in the year ${character.birth_year}.
    `,
  },

  planets: {
    path: 'planets/',
    label: 'Planets',
    imagePosition: { page: 'left', card: 'top' },
    related: [{ field: 'residents', label: 'Residents' }, { field: 'films', label: 'Films' }],
    filters: [{ field: 'climate', label: 'Climate' }],
    sortFields: [{ field: 'name', label: 'Name' }, { field: 'population', label: 'Population', numeric: true }, { field: 'diameter', label: 'Diameter', numeric: true }],
    cardText: (planet) => (
      `${planet.name} has a climate of ${planet.climate}, and a population of ${planet.population}`
    ),
    describe: (planet) => `
      ${planet.name} has a rotation period of ${planet.rotation_period}, and has a diamater of ${planet.diameter}.

      It has an orbital period of ${planet.orbital_period}, ${asList(planet.climate)} climate, gravity of ${planet.gravity}, and has ${asList(planet.terrain)} terrains. 
      The population of ${planet.name} is ${planet.population}, and has a surface water of ${planet.surface_water}.
    `,
  },

  starships: {
    path: 'starships/',
    label: 'Starships',
    imagePosition: { page: 'top', card: 'top' },
    related: [{ field: 'pilots', label: 'Pilots' }, { field: 'films', label: 'Films' }],
    filters: [{ field: 'starship_class', label: 'Class' }],
    sortFields: [{ field: 'name', label: 'Name' }, { field: 'cost_in_credits', label: 'Cost', numeric: true }, { field: 'length', label: 'Length', numeric: true }],
    cardText: (starship) => (
      `${firstWord(starship.name)} is of the ${starship.model} model, and has a cargo of ${starship.cargo_capacity}`
    ),
    describe: (starship) => `
      ${starship.name} is of the ${starship.model} model and was manufactured by ${starship.manufacturer}. It cost ${starship.cost_in_credits} credits.

      It has a length of ${starship.length}, maximum atmosphering speed of ${starship.max_atmosphering_speed}, crew capacity of ${starship.crew}, and cargo capacity of ${starship.cargo_capacity}. It has ${starship.passengers} passengers.
      It has ${starship.consumables} consumables, ${starship.hyperdrive_rating} hyperdrive rating, ${starship.MGLT} MGLT, and starship class of ${starship.starship_class}.
    `,
  },
  films: {
    path: 'films/',
    label: 'Films',
    // SWAPI calls a film's name its title; everything downstream uses `name`
    nameField: 'title',
    imagePosition: { page: 'top', card: 'top' },
    related: [
      { field: 'characters', label: 'Characters' }, { field: 'planets', label: 'Planets' },
      { field: 'starships', label: 'Starships' }, { field: 'vehicles', label: 'Vehicles' },
      { field: 'species', label: 'Species' },
    ],
    filters: [{ field: 'director', label: 'Director' }],
    sortFields: [{ field: 'episode_id', label: 'Episode', numeric: true }, { field: 'release_date', label: 'Release date' }, { field: 'name', label: 'Title' }],
    cardText: (film) => (
      `Episode ${film.episode_id}, directed by ${film.director} and released in ${film.release_date}`
    ),
    describe: (film) => `
      ${film.name} is episode ${film.episode_id} of the saga, directed by ${film.director}
      and produced by ${film.producer}. It was released on ${film.release_date}.

      ${trimmed(film.opening_crawl)}
    `,
  },

  species: {
    path: 'species/',
    label: 'Species',
    imagePosition: { page: 'left', card: 'left' },
    related: [{ field: 'homeworld', label: 'Homeworld' }, { field: 'people', label: 'People' }, { field: 'films', label: 'Films' }],
    filters: [{ field: 'classification', label: 'Classification' }],
    sortFields: [{ field: 'name', label: 'Name' }, { field: 'average_lifespan', label: 'Lifespan', numeric: true }],
    cardText: (species) => (
      `${species.name} are ${article(species.classification)} ${species.classification} species that speak ${species.language}`
    ),
    describe: (species) => `
      ${species.name} are ${article(species.classification)} ${species.classification} species, designated ${species.designation},
      and speak ${species.language}. They stand ${species.average_height} on average
      and live for about ${species.average_lifespan} years.

      They have ${species.skin_colors} skin, ${species.hair_colors} hair and ${species.eye_colors} eyes.
    `,
  },

  vehicles: {
    path: 'vehicles/',
    label: 'Vehicles',
    imagePosition: { page: 'top', card: 'top' },
    related: [{ field: 'pilots', label: 'Pilots' }, { field: 'films', label: 'Films' }],
    filters: [{ field: 'vehicle_class', label: 'Class' }],
    sortFields: [{ field: 'name', label: 'Name' }, { field: 'cost_in_credits', label: 'Cost', numeric: true }, { field: 'length', label: 'Length', numeric: true }],
    cardText: (vehicle) => (
      `${vehicle.name} is ${article(vehicle.vehicle_class)} ${vehicle.vehicle_class} vehicle, and has a cargo of ${vehicle.cargo_capacity}`
    ),
    describe: (vehicle) => `
      ${vehicle.name} is ${article(vehicle.vehicle_class)} ${vehicle.vehicle_class} vehicle of the ${vehicle.model} model,
      manufactured by ${vehicle.manufacturer}. It cost ${vehicle.cost_in_credits} credits.

      It has a length of ${vehicle.length}, a maximum atmosphering speed of ${vehicle.max_atmosphering_speed},
      a crew of ${vehicle.crew} and room for ${vehicle.passengers} passengers.
      It carries ${vehicle.cargo_capacity} of cargo and ${vehicle.consumables} of consumables.
    `,
  },
};

// In the order they are listed in search results and in the routes
export const RESOURCE_KEYS = Object.keys(RESOURCES);

// Films are titled rather than named. Every item is given a `name` as it comes
// in from the API, so the store, search, routes and cards only ever deal with
// one field. The original field is kept alongside it.
export const normalise = (resource, item) => {
  const field = RESOURCES[resource].nameField;
  if (!field || !item || typeof item[field] !== 'string') return item;
  return { ...item, name: item[field] };
};

export const normaliseAll = (resource, items) => items.map(item => normalise(resource, item));

// The home page, in the order its sections appear. `slider` steps through the
// items a few at a time; `cards` lays them all out at once.
export const HOME_SECTIONS = [
  { resource: 'starships', display: 'cards', count: 6 },
  { resource: 'planets', display: 'slider', count: 9 },
  { resource: 'characters', display: 'cards', count: 4 },
  { resource: 'films', display: 'cards', count: 6 },
  { resource: 'species', display: 'slider', count: 9 },
  { resource: 'vehicles', display: 'cards', count: 6 },
];

// The resource an API path such as "people/1/" belongs to
export const resourceForPath = (path) => (
  RESOURCE_KEYS.find(resource => typeof path === 'string' && path.startsWith(RESOURCES[resource].path))
);

// The API links in a related field: a single link, a list of them, or nothing
// ("unknown", "n/a" and null all mean nothing)
export const relatedUrls = (value) => (
  (Array.isArray(value) ? value : [value]).filter(entry => typeof entry === 'string' && /^https?:\/\//.test(entry))
);

// A description split into its paragraphs. The templates above separate them
// with a blank line, and each line carries the indentation of the source.
export const paragraphs = (description) => (
  String(description || '')
    .split(/\n\s*\n/)
    .map(part => part.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
);

// The values a filter field takes across `items`. Fields such as a planet's
// climate hold several at once ("temperate, tropical"), so each counts separately.
export const filterValues = (items, field) => {
  const values = new Set();
  items.forEach(item => String(item[field] ?? '').split(',').forEach(part => {
    const value = part.trim();
    if (value) values.add(value);
  }));
  return [...values].sort((a, b) => a.localeCompare(b));
};

const hasValue = (item, field, value) => (
  String(item[field] ?? '').split(',').some(part => part.trim().toLowerCase() === value.toLowerCase())
);

// Narrows `items` to those matching every chosen filter
export const filterItems = (items, chosen) => (
  Object.entries(chosen).reduce(
    (rest, [field, value]) => (value ? rest.filter(item => hasValue(item, field, value)) : rest),
    items,
  )
);

const asNumber = (value) => {
  const number = Number(String(value ?? '').replace(/,/g, ''));
  return Number.isFinite(number) ? number : null;
};

// Orders `items` by `key`, descending when it starts with "-". Values the API
// does not have ("unknown", "n/a") sort last whichever way round it is.
export const sortItems = (items, key, sortFields) => {
  if (!key) return items;
  const descending = key.startsWith('-');
  const field = descending ? key.slice(1) : key;
  const config = sortFields.find(entry => entry.field === field);
  if (!config) return items;
  return [...items].sort((a, b) => {
    if (config.numeric) {
      const left = asNumber(a[field]);
      const right = asNumber(b[field]);
      if (left === null || right === null) return left === right ? 0 : (left === null ? 1 : -1);
      return descending ? right - left : left - right;
    }
    const left = String(a[field] ?? '');
    const right = String(b[field] ?? '');
    return descending ? right.localeCompare(left) : left.localeCompare(right);
  });
};

// Routes. Items are addressed by name: "Luke Skywalker" becomes luke_skywalker.
export const listPath = (resource) => `/${resource}`;
export const descriptionPath = (resource, name) => (
  `/description/${resource}/${name.split(' ').join('_').toLowerCase()}`
);

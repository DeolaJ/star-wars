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

const firstWord = (name) => name.split(' ')[0];
const pronoun = (gender) => (gender === 'male' ? 'He' : (gender === 'female' ? 'She' : 'It'));
const asList = (text) => text.split(', ').join(' and ');

export const RESOURCES = {
  characters: {
    path: 'people/',
    label: 'Characters',
    imagePosition: { page: 'left', card: 'left' },
    cardText: (character) => (
      `${firstWord(character.name)} was born in the year ${character.birth_year}, and is ${character.gender}`
    ),
    describe: (character) => `
      ${character.name} is ${character.gender}, and is ${character.height} tall. /n/n
      ${pronoun(character.gender)} has a mass of ${character.mass}, 
      ${character.hair_color} hair color, ${character.eye_color} eye color, ${character.skin_color} skin color, 
      and was born in the year ${character.birth_year}.
    `,
  },

  planets: {
    path: 'planets/',
    label: 'Planets',
    imagePosition: { page: 'left', card: 'top' },
    cardText: (planet) => (
      `${planet.name} has a climate of ${planet.climate}, and a population of ${planet.population}`
    ),
    describe: (planet) => `
      ${planet.name} has a rotation period of ${planet.rotation_period}, and has a diamater of ${planet.diameter}. /n/n
      It has an orbital period of ${planet.orbital_period}, ${asList(planet.climate)} climate, gravity of ${planet.gravity}, and has ${asList(planet.terrain)} terrains. 
      The population of ${planet.name} is ${planet.population}, and has a surface water of ${planet.surface_water}.
    `,
  },

  starships: {
    path: 'starships/',
    label: 'Starships',
    imagePosition: { page: 'top', card: 'top' },
    cardText: (starship) => (
      `${firstWord(starship.name)} is of the ${starship.model} model, and has a cargo of ${starship.cargo_capacity}`
    ),
    describe: (starship) => `
      ${starship.name} is of the ${starship.model} model and was manufactured by ${starship.manufacturer}. It cost ${starship.cost_in_credits} credits. /n/n
      It has a length of ${starship.length}, maximum atmosphering speed of ${starship.max_atmosphering_speed}, crew capacity of ${starship.crew}, and cargo capacity of ${starship.cargo_capacity}. It has ${starship.passengers} passengers.
      It has ${starship.consumables} consumables, ${starship.hyperdrive_rating} hyperdrive rating, ${starship.MGLT} MGLT, and starship class of ${starship.starship_class}.
    `,
  },
};

// In the order they are listed on the home page search results and in the routes
export const RESOURCE_KEYS = Object.keys(RESOURCES);

// Routes. Items are addressed by name: "Luke Skywalker" becomes luke_skywalker.
export const listPath = (resource) => `/${resource}`;
export const descriptionPath = (resource, name) => (
  `/description/${resource}/${name.split(' ').join('_').toLowerCase()}`
);

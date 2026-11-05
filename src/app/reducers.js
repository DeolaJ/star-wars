import cloneDeep from 'lodash/cloneDeep';
import {
  FETCH_PAGE_START,
  FETCH_PAGE_SUCCESS,
  FETCH_PAGE_FAILURE,
  SEARCH_CHARACTERS,
  SEARCH_PLANETS,
  SEARCH_STARSHIPS,
  SEARCH_ALL,
  RESET_SEARCH_CHARACTERS,
  RESET_SEARCH_PLANETS,
  RESET_SEARCH_STARSHIPS,
  RESET_SEARCH_ALL,
  SET_RECENTLY_VIEWED,
  SET_DESCRIPTION,
} from "./actions"
  
// Per-resource paging: total count from the API, results by page number,
// pages being fetched and pages that failed to load
const emptyPaging = {
  count: 0,
  pages: {},
  loading: {},
  errors: {},
};

const capitalise = (word) => word.charAt(0).toUpperCase() + word.slice(1);

// Loaded results in page order, for the parts of the app that use a flat list
const flattenPages = (pages) => (
  Object.keys(pages)
    .map(Number)
    .sort((a, b) => a - b)
    .flatMap(page => pages[page])
);

const omit = (object, key) => (
  Object.fromEntries(Object.entries(object).filter(([entry]) => entry !== String(key)))
);

export const defaultState = {
  charactersPaging: emptyPaging,
  planetsPaging: emptyPaging,
  starshipsPaging: emptyPaging,
  characters: [{}],
  planets: [{}],
  starships: [{}],
  loadingCharacters: true,
  loadingPlanets: true,
  loadingStarships: true,
  loadingCharactersError: {},
  loadingPlanetsError: {},
  loadingStarshipsError: {},
  charactersSearch: {},
  planetsSearch: {},
  starshipsSearch: {},
  allFilteredCharacters: [],
  allFilteredPlanets: [],
  allFilteredStarships: [],
  isFilteringAll: false,
  isFilteringCharacters: false,
  isFilteringPlanets: false,
  isFilteringStarships: false,
  recentlyViewed: {},
  descriptionItem: {},
}

export default function appReducers (state=defaultState, action) {
  const { type, payload } = action
  
  switch (type) {

    case RESET_SEARCH_ALL:
    case RESET_SEARCH_CHARACTERS:
    case RESET_SEARCH_PLANETS:
    case RESET_SEARCH_STARSHIPS: {
      return {
        ...state,
        ...payload
      }
    }

    // Page 1 is the initial load, so it also drives the app-wide loading flag
    // and error message, as the full fetch did before
    case FETCH_PAGE_START: {
      const { resource, page } = payload;
      const pagingKey = `${resource}Paging`;
      const paging = state[pagingKey];
      return {
        ...state,
        [pagingKey]: {
          ...paging,
          loading: { ...paging.loading, [page]: true },
          errors: omit(paging.errors, page),
        },
        ...(page === 1 && { [`loading${capitalise(resource)}`]: true }),
      }
    }

    case FETCH_PAGE_SUCCESS: {
      const { resource, page, results, count } = payload;
      const pagingKey = `${resource}Paging`;
      const paging = state[pagingKey];
      const pages = { ...paging.pages, [page]: results };
      return {
        ...state,
        [pagingKey]: {
          ...paging,
          count,
          pages,
          loading: omit(paging.loading, page),
        },
        [resource]: flattenPages(pages),
        ...(page === 1 && {
          [`loading${capitalise(resource)}`]: false,
          recentlyViewed: {
            ...state.recentlyViewed,
            [resource]: results.slice(0, 9),
          },
        }),
      }
    }

    case FETCH_PAGE_FAILURE: {
      const { resource, page, error } = payload;
      const pagingKey = `${resource}Paging`;
      const paging = state[pagingKey];
      return {
        ...state,
        [pagingKey]: {
          ...paging,
          loading: omit(paging.loading, page),
          errors: { ...paging.errors, [page]: error },
        },
        ...(page === 1 && {
          [`loading${capitalise(resource)}`]: false,
          [`loading${capitalise(resource)}Error`]: error,
        }),
      }
    }

    case SEARCH_CHARACTERS: {
      const app = cloneDeep(state);
      const { characters, param, isFilteringCharacters } = payload;
      const { charactersSearch } = app;
      let allFilteredCharacters;

      if (param in charactersSearch) {
        allFilteredCharacters = charactersSearch[param];

        return {
          ...state,
          allFilteredCharacters,
          isFilteringCharacters,
        }
      } else {
        allFilteredCharacters = characters;
        charactersSearch[param] = allFilteredCharacters;

        return {
          ...state,
          allFilteredCharacters,
          isFilteringCharacters,
          charactersSearch,
        }
      }
    }

    case SEARCH_PLANETS: {
      const app = cloneDeep(state);
      const { planets, param, isFilteringPlanets } = payload;
      const { planetsSearch } = app;
      let allFilteredPlanets;

      if (param in planetsSearch) {
        allFilteredPlanets = planetsSearch[param];

        return {
          ...state,
          allFilteredPlanets,
          isFilteringPlanets,
        }
      } else {
        allFilteredPlanets = planets;
        planetsSearch[param] = allFilteredPlanets;

        return {
          ...state,
          allFilteredPlanets,
          isFilteringPlanets,
          planetsSearch,
        }
      }
    }

    case SEARCH_STARSHIPS: {
      const app = cloneDeep(state);
      const { starships, param, isFilteringStarships } = payload;
      const { starshipsSearch } = app;
      let allFilteredStarships;

      if (param in starshipsSearch) {
        allFilteredStarships = starshipsSearch[param];

        return {
          ...state,
          allFilteredStarships,
          isFilteringStarships,
        }
      } else {
        allFilteredStarships = starships;
        starshipsSearch[param] = allFilteredStarships;

        return {
          ...state,
          allFilteredStarships,
          isFilteringStarships,
          starshipsSearch,
        }
      }
    }

    case SEARCH_ALL: {
      const app = cloneDeep(state);
      const { param, isFilteringAll } = payload;
      const { charactersSearch, planetsSearch, starshipsSearch } = app;
      let allFilteredStarships,
          allFilteredCharacters,
          allFilteredPlanets;

      // Search characters
      if (param in charactersSearch) {
        allFilteredCharacters = charactersSearch[param];
      } else {
        allFilteredCharacters = payload.characters;
        charactersSearch[param] = allFilteredCharacters;
      }

      // Search Starships
      if (param in starshipsSearch) {
        allFilteredStarships = starshipsSearch[param];
      } else {
        allFilteredStarships = payload.starships;
        starshipsSearch[param] = allFilteredStarships;
      }

      // Search Planets
      if (param in planetsSearch) {
        allFilteredPlanets = planetsSearch[param];
      } else {
        allFilteredPlanets = payload.planets;
        planetsSearch[param] = allFilteredPlanets;
      }

      return {
        ...state,
        allFilteredCharacters,
        allFilteredPlanets,
        allFilteredStarships,
        isFilteringAll,
        charactersSearch,
        planetsSearch,
        starshipsSearch,
      }
    }

    case SET_RECENTLY_VIEWED: {
      const app = cloneDeep(state);
      const { recentlyViewed } = app;
      const { type, item } = payload;

      recentlyViewed[type].push(item);

      return {
        ...state,
        recentlyViewed,
      }
    }

    case SET_DESCRIPTION: {
      const { category, item } = payload;

      const getItem = (category) => {
        switch(category) {
          case 'characters': {
            const character = item;
            const description = `
              ${character.name} is ${character.gender}, and is ${character.height} tall. /n/n
              ${character.gender === "male" ? "He" : (character.gender === "female" ? "She" : "It")} has a mass of ${character.mass}, 
              ${character.hair_color} hair color, ${character.eye_color} eye color, ${character.skin_color} skin color, 
              and was born in the year ${character.birth_year}.
            `
            return {
              category: character,
              description,
            }
          }
          case 'planets': {
            const planet = item;
            const description = `
              ${planet.name} has a rotation period of ${planet.rotation_period}, and has a diamater of ${planet.diameter}. /n/n
              It has an orbital period of ${planet.orbital_period}, ${planet.climate.split(", ").join(" and ")} climate, gravity of ${planet.gravity}, and has ${planet.terrain.split(", ").join(" and ")} terrains. 
              The population of ${planet.name} is ${planet.population}, and has a surface water of ${planet.surface_water}.
            `
            return {
              category: planet,
              description,
            }
          }
          case 'starships': {
            const starship = item;
            const description = `
              ${starship.name} is of the ${starship.model} model and was manufactured by ${starship.manufacturer}. It cost ${starship.cost_in_credits} credits. /n/n
              It has a length of ${starship.length}, maximum atmosphering speed of ${starship.max_atmosphering_speed}, crew capacity of ${starship.crew}, and cargo capacity of ${starship.cargo_capacity}. It has ${starship.passengers} passengers.
              It has ${starship.consumables} consumables, ${starship.hyperdrive_rating} hyperdrive rating, ${starship.MGLT} MGLT, and starship class of ${starship.starship_class}.
            `
            return {
              category: starship,
              description,
            }
          }
          
          default: return
        };
      };

      const descriptionItem = getItem(category);

      return {
        ...state,
        descriptionItem,
      }
    }

    default: {
      return state
    }
  }
}
  
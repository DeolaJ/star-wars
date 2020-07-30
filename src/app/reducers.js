import cloneDeep from 'lodash/cloneDeep';
import {
  FETCH_CHARACTERS_START,
  FETCH_CHARACTERS_FAILURE,
  FETCH_CHARACTERS_SUCCESS,
  FETCH_PLANETS_START,
  FETCH_PLANETS_FAILURE,
  FETCH_PLANETS_SUCCESS,
  FETCH_STARSHIPS_START,
  FETCH_STARSHIPS_FAILURE,
  FETCH_STARSHIPS_SUCCESS,
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
  
export const defaultState = {
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

    case FETCH_CHARACTERS_START:
    case FETCH_CHARACTERS_FAILURE:
    case FETCH_PLANETS_START:
    case FETCH_PLANETS_FAILURE:
    case FETCH_STARSHIPS_START:
    case FETCH_STARSHIPS_FAILURE:
    case RESET_SEARCH_ALL:
    case RESET_SEARCH_CHARACTERS:
    case RESET_SEARCH_PLANETS:
    case RESET_SEARCH_STARSHIPS: {
      return {
        ...state,
        ...payload
      }
    }

    case FETCH_CHARACTERS_SUCCESS: {
      const { characters, loadingCharacters } = payload;
      const app = cloneDeep(state);
      let recentlyViewed = app.recentlyViewed;
      recentlyViewed.characters = characters.slice(0, 9);

      return {
        ...state,
        characters,
        loadingCharacters,
        recentlyViewed,
      }
    }

    case FETCH_PLANETS_SUCCESS: {
      const { planets, loadingPlanets } = payload;
      const app = cloneDeep(state);
      let recentlyViewed = app.recentlyViewed;
      recentlyViewed.planets = planets.slice(0, 9);

      return {
        ...state,
        planets,
        loadingPlanets,
        recentlyViewed,
      }
    }

    case FETCH_STARSHIPS_SUCCESS: {
      const { starships, loadingStarships } = payload;
      const app = cloneDeep(state);
      let recentlyViewed = app.recentlyViewed;
      recentlyViewed.starships = starships.slice(0, 9);

      return {
        ...state,
        starships,
        loadingStarships,
        recentlyViewed,
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
        allFilteredCharacters = characters.filter(item => {
          const name = item.name.toLowerCase();
          const filter = param.toLowerCase();
          return name.includes(filter);
        })
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
        allFilteredPlanets = planets.filter(item => {
          const name = item.name.toLowerCase();
          const filter = param.toLowerCase();
          return name.includes(filter);
        })
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
        allFilteredStarships = starships.filter(item => {
          const name = item.name.toLowerCase();
          const filter = param.toLowerCase();
          return name.includes(filter);
        })
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
      const { characters, planets, starships, charactersSearch, 
        planetsSearch, starshipsSearch 
      } = app;
      let allFilteredStarships,
          allFilteredCharacters,
          allFilteredPlanets;

      // Search characters
      if (param in charactersSearch) {
        allFilteredCharacters = charactersSearch[param];
      } else {
        allFilteredCharacters = characters.filter(item => {
          const name = item.name.toLowerCase();
          const filter = param.toLowerCase();
          return name.includes(filter);
        })
        charactersSearch[param] = allFilteredCharacters;
      }

      // Search Starships
      if (param in starshipsSearch) {
        allFilteredStarships = starshipsSearch[param];
      } else {
        allFilteredStarships = starships.filter(item => {
          const name = item.name.toLowerCase();
          const filter = param.toLowerCase();
          return name.includes(filter);
        })
        starshipsSearch[param] = allFilteredStarships;
      }

      // Search Planets
      if (param in planetsSearch) {
        allFilteredPlanets = planetsSearch[param];
      } else {
        allFilteredPlanets = planets.filter(item => {
          const name = item.name.toLowerCase();
          const filter = param.toLowerCase();
          return name.includes(filter);
        })
        planetsSearch[param] = allFilteredPlanets;
      }

      return {
        ...state,
        allFilteredCharacters,
        allFilteredPlanets,
        allFilteredStarships,
        isFilteringAll,
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
      const app = cloneDeep(state);
      const { planets, characters, starships } = app;
      const { category, name } = payload;

      const getItem = (category) => {
        const findItem = (item) => {
          return item.name.toLowerCase() === name
        };
        switch(category) {
          case 'characters': {
            const character = characters.find(findItem);
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
            const planet = planets.find(findItem);
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
            const starship = starships.find(findItem);
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
  
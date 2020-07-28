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
} from "./actions"
  
export const defaultState = {
  characters: [{}],
  planets: [{}],
  starships: [{}],
  loadingCharacters: true,
  loadingPlanets: true,
  loadingStarships: true,
  loadingCharactersError: '',
  loadingPlanetsError: '',
  loadingStarshipsError: '',
}

export default function appReducers (state=defaultState, action) {
  const { type, payload } = action
  
  switch (type) {

    case FETCH_CHARACTERS_START:
    case FETCH_CHARACTERS_FAILURE:
    case FETCH_CHARACTERS_SUCCESS:
    case FETCH_PLANETS_START:
    case FETCH_PLANETS_FAILURE:
    case FETCH_PLANETS_SUCCESS:
    case FETCH_STARSHIPS_START:
    case FETCH_STARSHIPS_FAILURE:
    case FETCH_STARSHIPS_SUCCESS: {
      return {
        ...state,
        ...payload
      }
    }

    default: {
      return state
    }
  }
}
  
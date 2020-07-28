export const FETCH_CHARACTERS_START = "FETCH_CHARACTERS_START";
export const FETCH_CHARACTERS_SUCCESS = "FETCH_CHARACTERS_SUCCESS";
export const FETCH_CHARACTERS_FAILURE = "FETCH_CHARACTERS_FAILURE";
export const FETCH_PLANETS_START = "FETCH_PLANETS_START";
export const FETCH_PLANETS_SUCCESS = "FETCH_PLANETS_SUCCESS";
export const FETCH_PLANETS_FAILURE = "FETCH_PLANETS_FAILURE";
export const FETCH_STARSHIPS_START = "FETCH_STARSHIPS_START";
export const FETCH_STARSHIPS_SUCCESS = "FETCH_STARSHIPS_SUCCESS";
export const FETCH_STARSHIPS_FAILURE = "FETCH_STARSHIPS_FAILURE";

const fetchCharactersStart = (payload) => ({
  type: FETCH_CHARACTERS_START,
  payload,
})

const fetchCharactersFailure = (payload) => ({
  type: FETCH_CHARACTERS_FAILURE,
  payload,
})

const fetchCharactersSuccess = (payload) => ({
  type: FETCH_CHARACTERS_SUCCESS,
  payload,
})

const fetchPlanetsStart = (payload) => ({
  type: FETCH_PLANETS_START,
  payload,
})

const fetchPlanetsFailure = (payload) => ({
  type: FETCH_PLANETS_FAILURE,
  payload,
})

const fetchPlanetsSuccess = (payload) => ({
  type: FETCH_PLANETS_SUCCESS,
  payload,
})

const fetchStarshipsStart = (payload) => ({
  type: FETCH_STARSHIPS_START,
  payload,
})

const fetchStarshipsFailure = (payload) => ({
  type: FETCH_STARSHIPS_FAILURE,
  payload,
})

const fetchStarshipsSuccess = (payload) => ({
  type: FETCH_STARSHIPS_SUCCESS,
  payload,
})

const updateMoreResults = async (item, next) => {
  if (!next) {
    return item;
  } else {
    let nextPage;
    const results = await fetch(
      next
    )
    .then(response => response.json())
    .then(response => {
      nextPage = response.next;
      return response.results;
    })
    item.push(...results);
    return updateMoreResults(item, nextPage);
  }
}

export const doFetchCharacters = () => async (dispatch) => {
  dispatch(fetchCharactersStart());

  let characters = [];
  return fetch(
    'https://swapi.dev/api/people/'
  )
  .then(response => response.json())
  .then(async response => {
    characters.push(...response.results);
    if (response.next) {
      characters = await updateMoreResults(characters, response.next);
    }
    dispatch(fetchCharactersSuccess({
      characters,
      loadingCharacters: false
    }))
  })
  .catch(error => {
    dispatch(fetchCharactersFailure({
      loadingCharactersError: error,
      loadingCharacters: false
    }))
  })
}

export const doFetchPlanets = () => async (dispatch) => {
  dispatch(fetchPlanetsStart());

  let planets = [];
  return fetch(
    'https://swapi.dev/api/planets/'
  )
  .then(response => response.json())
  .then(async response => {
    planets.push(...response.results);
    if (response.next) {
      planets = await updateMoreResults(planets, response.next);
    }
    dispatch(fetchPlanetsSuccess({
      planets,
      loadingPlanets: false
    }))
  })
  .catch(error => {
    dispatch(fetchPlanetsFailure({
      loadingPlanetsError: error,
      loadingPlanets: false
    }))
  })
}

export const doFetchStarships = () => async (dispatch) => {
  dispatch(fetchStarshipsStart());

  let starships = [];
  return fetch(
    'https://swapi.dev/api/starships/'
  )
  .then(response => response.json())
  .then(async response => {
    starships.push(...response.results);
    if (response.next) {
      starships = await updateMoreResults(starships, response.next);
    }
    dispatch(fetchStarshipsSuccess({
      starships,
      loadingStarships: false
    }))
  })
  .catch(error => {
    dispatch(fetchStarshipsFailure({
      loadingStarshipsError: error,
      loadingStarships: false
    }))
  })
}

export default {
  doFetchCharacters,
  doFetchPlanets,
  doFetchStarships,
}
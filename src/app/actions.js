export const FETCH_CHARACTERS_START = "FETCH_CHARACTERS_START";
export const FETCH_CHARACTERS_SUCCESS = "FETCH_CHARACTERS_SUCCESS";
export const FETCH_CHARACTERS_FAILURE = "FETCH_CHARACTERS_FAILURE";
export const FETCH_PLANETS_START = "FETCH_PLANETS_START";
export const FETCH_PLANETS_SUCCESS = "FETCH_PLANETS_SUCCESS";
export const FETCH_PLANETS_FAILURE = "FETCH_PLANETS_FAILURE";
export const FETCH_STARSHIPS_START = "FETCH_STARSHIPS_START";
export const FETCH_STARSHIPS_SUCCESS = "FETCH_STARSHIPS_SUCCESS";
export const FETCH_STARSHIPS_FAILURE = "FETCH_STARSHIPS_FAILURE";
export const SEARCH_ALL = "SEARCH_ALL";
export const SEARCH_CHARACTERS = "SEARCH_CHARACTERS";
export const SEARCH_PLANETS = "SEARCH_PLANETS";
export const SEARCH_STARSHIPS = "SEARCH_STARSHIPS";
export const RESET_SEARCH_ALL = "RESET_SEARCH_ALL";
export const RESET_SEARCH_CHARACTERS = "RESET_SEARCH_CHARACTERS";
export const RESET_SEARCH_PLANETS = "RESET_SEARCH_PLANETS";
export const RESET_SEARCH_STARSHIPS = "RESET_SEARCH_STARSHIPS";
export const SET_RECENTLY_VIEWED = "SET_RECENTLY_VIEWED";
export const SET_DESCRIPTION = "SET_DESCRIPTION";

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

const searchAll = (payload) => ({
  type: SEARCH_ALL,
  payload,
})

const searchCharacters = (payload) => ({
  type: SEARCH_CHARACTERS,
  payload,
})

const searchPlanets = (payload) => ({
  type: SEARCH_PLANETS,
  payload,
})

const searchStarships = (payload) => ({
  type: SEARCH_STARSHIPS,
  payload,
})

const resetAll = (payload) => ({
  type: RESET_SEARCH_ALL,
  payload,
})

const resetCharacters = (payload) => ({
  type: RESET_SEARCH_CHARACTERS,
  payload,
})

const resetPlanets = (payload) => ({
  type: RESET_SEARCH_PLANETS,
  payload,
})

const resetStarships = (payload) => ({
  type: RESET_SEARCH_STARSHIPS,
  payload,
})

const recentlyViewed = (payload) => ({
  type: SET_RECENTLY_VIEWED,
  payload,
})

const setDescription = (payload) => ({
  type: SET_DESCRIPTION,
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
      nextPage = nextPage && nextPage.replace("http", "https");
      return response.results;
    })
    item.push(...results);
    return updateMoreResults(item, nextPage);
  }
}

// Loading Action Creators
export const doFetchCharacters = (initial) => async (dispatch) => {
  dispatch(fetchCharactersStart());

  let characters = [];
  return fetch(
    'https://swapi.dev/api/people/'
  )
  .then(response => response.json())
  .then(async response => {
    characters.push(...response.results);
    // dispatch the first 10 results
    if (initial) {
      dispatch(fetchCharactersSuccess({
        characters,
        loadingCharacters: false,
        initial: true
      }))
    }
    // Dispatch the remaining results later
    if (response.next) {
      const nextPage = response.next.replace("http", "https")
      characters = await updateMoreResults(characters, nextPage);
      dispatch(fetchCharactersSuccess({
        characters,
        loadingCharacters: false,
      }))
    }
  })
  .catch(error => {
    dispatch(fetchCharactersFailure({
      loadingCharactersError: error,
      loadingCharacters: false
    }))
  })
}

export const doFetchPlanets = (initial) => async (dispatch) => {
  dispatch(fetchPlanetsStart());

  let planets = [];
  return fetch(
    'https://swapi.dev/api/planets/'
  )
  .then(response => response.json())
  .then(async response => {
    planets.push(...response.results);
    // dispatch the first 10 results
    if (initial) {
      dispatch(fetchPlanetsSuccess({
        planets,
        loadingPlanets: false,
        initial: true
      }))
    }
    // Dispatch the remaining results later
    if (response.next) {
      const nextPage = response.next.replace("http", "https")
      planets = await updateMoreResults(planets, nextPage);
      dispatch(fetchPlanetsSuccess({
        planets,
        loadingPlanets: false,
      }))
    }
  })
  .catch(error => {
    dispatch(fetchPlanetsFailure({
      loadingPlanetsError: error,
      loadingPlanets: false
    }))
  })
}

export const doFetchStarships = (initial) => async (dispatch) => {
  dispatch(fetchStarshipsStart());

  let starships = [];
  return fetch(
    'https://swapi.dev/api/starships/'
  )
  .then(response => response.json())
  .then(async response => {
    starships.push(...response.results);
    // dispatch the first 10 results
    if (initial) {
      dispatch(fetchStarshipsSuccess({
        starships,
        loadingStarships: false,
        initial: true
      }))
    }
    // Dispatch the remaining results later
    if (response.next) {
      const nextPage = response.next.replace("http", "https")
      starships = await updateMoreResults(starships, nextPage);
      dispatch(fetchStarshipsSuccess({
        starships,
        loadingStarships: false,
      }))
    }
  })
  .catch(error => {
    dispatch(fetchStarshipsFailure({
      loadingStarshipsError: error,
      loadingStarships: false
    }))
  })
}

// Filter Action Creators
export const doSearchCharacters = (characters, param) => (dispatch) => (
  dispatch(searchCharacters({
    characters,
    param,
    isFilteringCharacters: true,
  }))
)

export const doSearchPlanets = (planets, param) => (dispatch) => (
  dispatch(searchPlanets({
    planets,
    param,
    isFilteringPlanets: true,
  }))
)

export const doSearchStarships = (starships, param) => (dispatch) => (
  dispatch(searchStarships({
    starships,
    param,
    isFilteringStarships: true,
  }))
)

export const doSearchAll = (param) => (dispatch) => (
  // Filtering is done on the reducer function
  dispatch(searchAll({
    param,
    isFilteringAll: true,
  }))
)

export const resetSearchCharacters = () => (dispatch) => (
  dispatch(resetCharacters({
    allFilteredCharacters: [],
    isFilteringCharacters: false
  }))
)

export const resetSearchPlanets = () => (dispatch) => (
  dispatch(resetPlanets({
    allFilteredStarships: [],
    isFilteringPlanets: false
  }))
)

export const resetSearchStarships = () => (dispatch) => (
  dispatch(resetStarships({
    allFilteredStarships: [],
    isFilteringStarships: false,
  }))
)

export const resetSearchAll = () => (dispatch) => (
  dispatch(resetAll({
    allFilteredCharacters: [],
    allFilteredPlanets: [],
    allFilteredStarships: [],
    isFilteringAll: false,
  }))
)

export const setRecentlyViewed = (type, item) => (dispatch) => (
  dispatch(recentlyViewed({
    type,
    item
  }))
)

export const doSetDescription = (category, name) => (dispatch) => (
  dispatch(setDescription({
    category,
    name
  }))
)

export default {
  doFetchCharacters,
  doFetchPlanets,
  doFetchStarships,
  doSearchAll,
  doSearchCharacters,
  doSearchPlanets,
  doSearchStarships,
  resetSearchAll,
  resetSearchCharacters,
  resetSearchPlanets,
  resetSearchStarships,
  setRecentlyViewed,
  doSetDescription,
}
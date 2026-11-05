import React from 'react'
import { connect } from 'react-redux'
import { useLocation } from 'react-router-dom'
import appActions from './app/actions'
import App from './App';

const mapStateToProps = (state) => ({
  characters: state.app.characters,
  planets: state.app.planets,
  charactersPaging: state.app.charactersPaging,
  planetsPaging: state.app.planetsPaging,
  starshipsPaging: state.app.starshipsPaging,
  starships: state.app.starships,
  loadingStarshipsError: state.app.loadingStarshipsError,
  loadingPlanetsError: state.app.loadingPlanetsError,
  loadingCharactersError: state.app.loadingCharactersError,
  loadingStarships: state.app.loadingStarships,
  loadingPlanets: state.app.loadingPlanets,
  loadingCharacters: state.app.loadingCharacters,
  loading: state.app.loadingCharacters && state.app.loadingPlanets && state.app.loadingStarships,
  charactersSearch: state.app.charactersSearch,
  planetsSearch: state.app.planetsSearch,
  starshipsSearch: state.app.starshipsSearch,
  allFilteredCharacters: state.app.allFilteredCharacters,
  allFilteredPlanets: state.app.allFilteredPlanets,
  allFilteredStarships: state.app.allFilteredStarships,
  isFilteringAll: state.app.isFilteringAll,
  isFilteringCharacters: state.app.isFilteringCharacters,
  isFilteringPlanets: state.app.isFilteringPlanets,
  isFilteringStarships: state.app.isFilteringStarships,
  recentlyViewed: state.app.recentlyViewed,
  descriptionItem: state.app.descriptionItem,
})

const mapDispatchToProps = (dispatch) => ({
  doFetchCharacters() {
    dispatch(appActions.doFetchCharacters())
  },
  doFetchPlanets() {
    dispatch(appActions.doFetchPlanets())
  },
  doFetchStarships() {
    dispatch(appActions.doFetchStarships())
  },
  doFetchCharactersPage(page) {
    dispatch(appActions.doFetchCharactersPage(page))
  },
  doFetchPlanetsPage(page) {
    dispatch(appActions.doFetchPlanetsPage(page))
  },
  doFetchStarshipsPage(page) {
    dispatch(appActions.doFetchStarshipsPage(page))
  },
  doSearchAll(param) {
    dispatch(appActions.doSearchAll(param))
  },
  doSearchCharacters(param) {
    dispatch(appActions.doSearchCharacters(param))
  },
  doSearchPlanets(param) {
    dispatch(appActions.doSearchPlanets(param))
  },
  doSearchStarships(param) {
    dispatch(appActions.doSearchStarships(param))
  },
  resetSearchAll() {
    dispatch(appActions.resetSearchAll())
  },
  resetSearchCharacters() {
    dispatch(appActions.resetSearchCharacters())
  },
  resetSearchPlanets() {
    dispatch(appActions.resetSearchPlanets())
  },
  resetSearchStarships() {
    dispatch(appActions.resetSearchStarships())
  },
  setRecentlyViewed(type, item) {
    dispatch(appActions.setRecentlyViewed(type, item))
  },
  doSetDescription(category, name) {
    dispatch(appActions.doSetDescription(category, name))
  },
})

// Link the Reducer state and Action creators to the App Component
const ConnectedApp = connect (mapStateToProps, mapDispatchToProps)(App)

// React Router 6 removed withRouter; supply the location prop via the hook instead
export default function ConnectedAppWithLocation(props) {
  const location = useLocation()
  return <ConnectedApp {...props} location={location} />
}
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import appActions from './app/actions'
import App from './App';

const mapStateToProps = (state) => ({
  characters: state.app.characters,
  planets: state.app.planets,
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
  doFetchCharacters(initial) {
    dispatch(appActions.doFetchCharacters(initial))
  },
  doFetchPlanets(initial) {
    dispatch(appActions.doFetchPlanets(initial))
  },
  doFetchStarships(initial) {
    dispatch(appActions.doFetchStarships(initial))
  },
  doSearchAll(param) {
    dispatch(appActions.doSearchAll(param))
  },
  doSearchCharacters(characters, param) {
    dispatch(appActions.doSearchCharacters(characters, param))
  },
  doSearchPlanets(planets, param) {
    dispatch(appActions.doSearchPlanets(planets, param))
  },
  doSearchStarships(starships, param) {
    dispatch(appActions.doSearchStarships(starships, param))
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
export default withRouter(ConnectedApp)
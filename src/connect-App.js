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
  loading: state.app.loadingCharacters && state.app.loadingPlanets && state.app.loadingStarships,
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
  }
})

// Link the Reducer state and Action creators to the App Component
const ConnectedApp = connect (mapStateToProps, mapDispatchToProps)(App)
export default withRouter(ConnectedApp)
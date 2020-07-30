import React, { Suspense, PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';
import './styles/main.scss';
import Fade from 'react-reveal/Fade';
import Home from './components/home';
import Planets from './components/planets';
import Characters from './components/characters';
import Starships from './components/starships';
import Description from './components/description';
import Loader from './components/partials/loader';

class App extends PureComponent {

  componentDidMount () {
    // Load Star wars information from the API
    const {
      doFetchCharacters, doFetchPlanets, doFetchStarships, location,
    } = this.props;
    if (!location.pathname.includes('description')) {
      doFetchCharacters(true);
      doFetchPlanets(true);
      doFetchStarships(true);
    } else {
      doFetchCharacters();
      doFetchPlanets();
      doFetchStarships();
    }
  }

  render () {
    const {
      characters, planets, starships, charactersSearch,
      planetsSearch, starshipsSearch, allFilteredCharacters,
      allFilteredPlanets, allFilteredStarships, loadingCharactersError, 
      loadingPlanetsError, loadingStarshipsError, isFilteringAll,
      isFilteringCharacters, isFilteringPlanets, isFilteringStarships,
      doSearchCharacters, resetSearchCharacters, doSearchStarships, resetSearchStarships,
      doSearchPlanets, resetSearchPlanets, doSearchAll, resetSearchAll,
      setRecentlyViewed, loadingCharacters, loadingPlanets, loadingStarships, recentlyViewed,
      doSetDescription, descriptionItem,
    } = this.props;

    return (
      <Switch>
        <Suspense fallback={<div>loading...</div>}>
          {
            (!loadingCharacters && !loadingPlanets && !loadingStarships) 
            ? (
              <Fade>
                <Route exact path="/"  
                  render={props => (
                    <Home 
                      {...props}
                      characters={characters}
                      planets={planets}
                      starships={starships}
                      loadingCharactersError={loadingCharactersError}
                      loadingPlanetsError={loadingPlanetsError}
                      loadingStarshipsError={loadingStarshipsError}
                      allFilteredCharacters={allFilteredCharacters}
                      allFilteredPlanets={allFilteredPlanets}
                      allFilteredStarships={allFilteredStarships}
                      charactersSearch={charactersSearch}
                      planetsSearch={planetsSearch}
                      starshipsSearch={starshipsSearch}
                      isFilteringAll={isFilteringAll}
                      doSearchAll={doSearchAll}
                      resetSearchAll={resetSearchAll}
                    />
                  )} 
                />
                <Route path="/planets" 
                  render={props => (
                    <Planets 
                      {...props}
                      planets={planets}
                      loadingPlanetsError={loadingPlanetsError}
                      allFilteredPlanets={allFilteredPlanets}
                      planetsSearch={planetsSearch}
                      isFilteringPlanets={isFilteringPlanets}
                      doSearchPlanets={doSearchPlanets}
                      resetSearchPlanets={resetSearchPlanets}
                      doSearchAll={doSearchAll}
                      resetSearchAll={resetSearchAll}
                    />
                  )} 
                />
                <Route path="/characters" 
                  render={props => (
                    <Characters 
                      {...props}
                      characters={characters}
                      loadingCharactersError={loadingCharactersError}
                      allFilteredCharacters={allFilteredCharacters}
                      charactersSearch={charactersSearch}
                      isFilteringCharacters={isFilteringCharacters}
                      doSearchCharacters={doSearchCharacters}
                      resetSearchCharacters={resetSearchCharacters}
                      doSearchAll={doSearchAll}
                      resetSearchAll={resetSearchAll}
                    />
                  )}
                />
                <Route path="/starships" 
                  render={props => (
                    <Starships 
                      {...props}
                      starships={starships}
                      loadingStarshipsError={loadingStarshipsError}
                      allFilteredStarships={allFilteredStarships}
                      starshipsSearch={starshipsSearch}
                      isFilteringStarships={isFilteringStarships}
                      doSearchStarships={doSearchStarships}
                      resetSearchStarships={resetSearchStarships}
                      doSearchAll={doSearchAll}
                      resetSearchAll={resetSearchAll}
                    />
                  )} 
                />
                <Route path="/description/:category/:id" 
                  render={props => (
                    <Description 
                      {...props}
                      characters={characters}
                      planets={planets}
                      starships={starships}
                      loadingCharactersError={loadingCharactersError}
                      loadingPlanetsError={loadingPlanetsError}
                      loadingStarshipsError={loadingStarshipsError}
                      setRecentlyViewed={setRecentlyViewed}
                      recentlyViewed={recentlyViewed}
                      descriptionItem={descriptionItem}
                      doSetDescription={doSetDescription}
                    />
                  )} 
                />
              </Fade>
            )
            : (
              <Loader />
            )
          }
        </Suspense>
      </Switch>
    );
  };
};

App.propTypes = {
  doFetchCharacters: PropTypes.func.isRequired,
  doFetchPlanets: PropTypes.func.isRequired,
  doFetchStarships: PropTypes.func.isRequired,
  characters: PropTypes.arrayOf(PropTypes.object).isRequired,
  planets: PropTypes.arrayOf(PropTypes.object).isRequired,
  starships: PropTypes.arrayOf(PropTypes.object).isRequired,
  loadingCharactersError: PropTypes.object.isRequired,
  loadingPlanetsError: PropTypes.object.isRequired,
  loadingStarshipsError: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  charactersSearch: PropTypes.objectOf(PropTypes.array).isRequired,
  planetsSearch: PropTypes.objectOf(PropTypes.array).isRequired,
  starshipsSearch: PropTypes.objectOf(PropTypes.array).isRequired,
  allFilteredCharacters: PropTypes.arrayOf(PropTypes.object).isRequired,
  allFilteredPlanets: PropTypes.arrayOf(PropTypes.object).isRequired,
  allFilteredStarships: PropTypes.arrayOf(PropTypes.object).isRequired,
  isFilteringAll: PropTypes.bool.isRequired,
  isFilteringCharacters: PropTypes.bool.isRequired,
  isFilteringPlanets: PropTypes.bool.isRequired,
  isFilteringStarships: PropTypes.bool.isRequired,
  doSearchAll: PropTypes.func.isRequired,
  doSearchCharacters: PropTypes.func.isRequired,
  doSearchPlanets: PropTypes.func.isRequired,
  doSearchStarships: PropTypes.func.isRequired,
  resetSearchAll: PropTypes.func.isRequired,
  resetSearchCharacters: PropTypes.func.isRequired,
  resetSearchPlanets: PropTypes.func.isRequired,
  resetSearchStarships: PropTypes.func.isRequired,
  setRecentlyViewed: PropTypes.func.isRequired,
  recentlyViewed: PropTypes.object.isRequired,
  doSetDescription: PropTypes.func.isRequired,
  descriptionItem: PropTypes.object.isRequired,
};

export default App;

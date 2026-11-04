import React, { useEffect } from 'react';
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import MainHome from './mainhome';
import SearchResult from './partials/search-result';
import Layout from './layout';

const Home = ({ 
  characters, planets, starships, loadingCharactersError, loadingPlanetsError, loadingStarshipsError,
  charactersSearch, planetsSearch, starshipsSearch, allFilteredCharacters, 
  allFilteredPlanets, allFilteredStarships, isFilteringAll, doSearchAll, resetSearchAll,
}) => {
  useEffect(() => {
    return resetSearchAll()
  }, [resetSearchAll]);

  return (
    <Layout
      doSearchAll={doSearchAll}
      resetSearchAll={resetSearchAll}
    >
      {
        isFilteringAll 

        ? (
          <SearchResult
            type="all"
            allFilteredCharacters={allFilteredCharacters}
            allFilteredPlanets={allFilteredPlanets}
            allFilteredStarships={allFilteredStarships}
            charactersSearch={charactersSearch}
            planetsSearch={planetsSearch}
            starshipsSearch={starshipsSearch}
          />
        )

        : (
          <MainHome 
            characters={characters}
            planets={planets}
            starships={starships}
            loadingCharactersError={loadingCharactersError}
            loadingPlanetsError={loadingPlanetsError}
            loadingStarshipsError={loadingStarshipsError}
          />
        )
      }
    </Layout>
  );
};

Home.propTypes = {
  characters: PropTypes.arrayOf(PropTypes.object).isRequired,
  planets: PropTypes.arrayOf(PropTypes.object).isRequired,
  starships: PropTypes.arrayOf(PropTypes.object).isRequired,
  loadingCharactersError: PropTypes.object.isRequired,
  loadingPlanetsError: PropTypes.object.isRequired,
  loadingStarshipsError: PropTypes.object.isRequired,
  charactersSearch: PropTypes.objectOf(PropTypes.string).isRequired,
  planetsSearch: PropTypes.objectOf(PropTypes.string).isRequired,
  starshipsSearch: PropTypes.objectOf(PropTypes.string).isRequired,
  allFilteredCharacters: PropTypes.arrayOf(PropTypes.object).isRequired,
  allFilteredPlanets: PropTypes.arrayOf(PropTypes.object).isRequired,
  allFilteredStarships: PropTypes.arrayOf(PropTypes.object).isRequired,
  isFilteringAll: PropTypes.bool.isRequired,
  doSearchAll: PropTypes.func.isRequired,
  resetSearchAll: PropTypes.func.isRequired,
};

export default Home;

import React, { useEffect } from 'react';
import PropTypes from 'prop-types'
import MainPlanets from './main-planets';
import Layout from './layout';

const Planets = ({
  planets, loadingPlanetsError, allFilteredPlanets, planetsSearch, 
  isFilteringPlanets, doSearchAll, resetSearchAll, doSearchPlanets,
  resetSearchPlanets,
}) => {
  useEffect(() => {
    return () => resetSearchAll()
  }, [resetSearchAll]);

  useEffect(() => {
    return () => resetSearchPlanets()
  }, [resetSearchPlanets]);
  return (
    <Layout
      doSearchAll={doSearchAll}
      resetSearchAll={resetSearchAll}
    >
      <MainPlanets
        planets={planets}
        loadingPlanetsError={loadingPlanetsError}
        doSearchPlanets={doSearchPlanets}
        resetSearchPlanets={resetSearchPlanets}
        isFilteringPlanets={isFilteringPlanets}
        planetsSearch={planetsSearch}
        allFilteredPlanets={allFilteredPlanets}
      />
    </Layout>
  );
};

Planets.propTypes = {
  planets: PropTypes.arrayOf(PropTypes.object).isRequired,
  loadingPlanetsError: PropTypes.object.isRequired,
  planetsSearch: PropTypes.objectOf(PropTypes.array).isRequired,
  allFilteredPlanets: PropTypes.arrayOf(PropTypes.object).isRequired,
  isFilteringPlanets: PropTypes.bool.isRequired,
  doSearchAll: PropTypes.func.isRequired,
  resetSearchAll: PropTypes.func.isRequired,
  doSearchPlanets: PropTypes.func.isRequired,
  resetSearchPlanets: PropTypes.func.isRequired,
};

export default Planets;

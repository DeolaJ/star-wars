import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import MainStarships from './main-starships';
import Layout from './layout';

const Starships = ({
  starships, loadingStarshipsError, allFilteredStarships, starshipsSearch, 
  isFilteringStarships, doSearchAll, resetSearchAll, doSearchStarships, resetSearchStarships,
}) => {
  useEffect(() => {
    return () => resetSearchAll()
  }, [resetSearchAll])

  useEffect(() => {
    return () => resetSearchStarships()
  }, [resetSearchStarships])
  return (
    <Layout
      doSearchAll={doSearchAll}
      resetSearchAll={resetSearchAll}
    >
      <MainStarships
        starships={starships}
        loadingStarshipsError={loadingStarshipsError}
        doSearchStarships={doSearchStarships}
        resetSearchStarships={resetSearchStarships}
        isFilteringStarships={isFilteringStarships}
        starshipsSearch={starshipsSearch}
        allFilteredStarships={allFilteredStarships}
      />
    </Layout>
  );
};

Starships.propTypes = {
  starships: PropTypes.arrayOf(PropTypes.object).isRequired,
  loadingStarshipsError: PropTypes.object.isRequired,
  starshipsSearch: PropTypes.objectOf(PropTypes.array).isRequired,
  allFilteredStarships: PropTypes.arrayOf(PropTypes.object).isRequired,
  isFilteringStarships: PropTypes.bool.isRequired,
  doSearchAll: PropTypes.func.isRequired,
  resetSearchAll: PropTypes.func.isRequired,
  doSearchStarships: PropTypes.func.isRequired,
  resetSearchStarships: PropTypes.func.isRequired,
};

export default Starships;

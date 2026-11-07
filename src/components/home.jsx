import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import MainHome from './mainhome';
import SearchResult from './partials/search-result';
import Layout from './layout';
import { RESOURCE_KEYS } from '../resources';
import { resourcesShape } from './resource-props';

const Home = ({ 
  resources, isFilteringAll, doSearchAll, resetSearchAll,
}) => {
  // Arriving at the home page clears any search left over from another page
  useEffect(() => {
    resetSearchAll();
  }, [resetSearchAll]);

  const results = Object.fromEntries(
    RESOURCE_KEYS.map(resource => [resource, resources[resource].filtered])
  );

  return (
    <Layout
      doSearchAll={doSearchAll}
      resetSearchAll={resetSearchAll}
    >
      {
        isFilteringAll 
        ? (
          <SearchResult
            results={results}
          />
        )
        : (
          <MainHome 
            resources={resources}
          />
        )
      }
    </Layout>
  );
};

Home.propTypes = {
  resources: resourcesShape.isRequired,
  isFilteringAll: PropTypes.bool.isRequired,
  doSearchAll: PropTypes.func.isRequired,
  resetSearchAll: PropTypes.func.isRequired,
};

export default Home;

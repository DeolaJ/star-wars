import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSearchParams } from 'react-router-dom';
import MainHome from './mainhome';
import SearchResult from './partials/search-result';
import Layout from './layout';
import { RESOURCE_KEYS } from '../resources';
import { resourcesShape } from './resource-props';

const Home = ({
  resources, isFilteringAll, doSearchAll, resetSearchAll,
}) => {
  // The site-wide search lives in the address bar too, so a set of results can
  // be shared and the back button leaves the search again
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '';

  const setQuery = useCallback((value) => {
    const next = new URLSearchParams(params);
    if (value) next.set('q', value);
    else next.delete('q');
    // Typing should not leave a history entry per keystroke
    setParams(next, { replace: true });
  }, [params, setParams]);

  const clearQuery = useCallback(() => setQuery(''), [setQuery]);

  useEffect(() => {
    if (query) doSearchAll(query);
    else resetSearchAll();
  }, [query, doSearchAll, resetSearchAll]);

  const results = Object.fromEntries(
    RESOURCE_KEYS.map(resource => [resource, resources[resource].filtered])
  );

  return (
    <Layout
      doSearchAll={setQuery}
      resetSearchAll={clearQuery}
      searchValue={query}
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

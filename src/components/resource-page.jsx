import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import ResourceList from './resource-list';
import Layout from './layout';
import { RESOURCE_KEYS } from '../resources';
import { resourceDataShape } from './resource-props';

// The page for one resource: the hero with the site-wide search, then the list
const ResourcePage = ({
  resource, data, doFetchPage, doFetchAll, doSearch, resetSearch, doSearchAll, resetSearchAll,
}) => {
  // Leaving the page clears its search and the site-wide one, so the next page
  // starts clean
  useEffect(() => {
    return () => resetSearchAll()
  }, [resetSearchAll]);

  useEffect(() => {
    return () => resetSearch(resource)
  }, [resource, resetSearch]);

  return (
    <Layout
      doSearchAll={doSearchAll}
      resetSearchAll={resetSearchAll}
    >
      <ResourceList
        resource={resource}
        data={data}
        doFetchPage={doFetchPage}
        doFetchAll={doFetchAll}
        doSearch={doSearch}
        resetSearch={resetSearch}
      />
    </Layout>
  );
};

ResourcePage.propTypes = {
  resource: PropTypes.oneOf(RESOURCE_KEYS).isRequired,
  data: resourceDataShape.isRequired,
  doFetchPage: PropTypes.func.isRequired,
  doFetchAll: PropTypes.func.isRequired,
  doSearch: PropTypes.func.isRequired,
  resetSearch: PropTypes.func.isRequired,
  doSearchAll: PropTypes.func.isRequired,
  resetSearchAll: PropTypes.func.isRequired,
};

export default ResourcePage;

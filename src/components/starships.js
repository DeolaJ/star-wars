import React from 'react';
import MainStarships from './main-starships';
import Search from './partials/search';
import Layout from './layout';

const Starships = () => {
  const isFiltering = false;
  const handleSearch = () => null;

  return (
    <Layout>
      {
        isFiltering

        ? (
          <Search 
            handleSearch={handleSearch}
          />
        )

        : (
          <MainStarships />
        )
      }
    </Layout>
  );
};

export default Starships;

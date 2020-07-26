import React from 'react';
import MainCharacters from './main-characters';
import Search from './partials/search';
import Layout from './layout';

const Characters = () => {
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
          <MainCharacters />
        )
      }
    </Layout>
  );
};

export default Characters;

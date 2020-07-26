import React from 'react';
import MainPlanets from './main-planets';
import Search from './partials/search';
import Layout from './layout';

const Planets = () => {
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
          <MainPlanets />
        )
      }
    </Layout>
  );
};

export default Planets;

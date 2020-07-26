import React from 'react';
import MainApp from './mainapp';
import Search from './partials/search';
import Layout from './layout';

const Home = () => {
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
          <MainApp />
        )
      }
    </Layout>
  );
};

export default Home;

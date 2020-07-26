import React from 'react';
import PropTypes from 'prop-types';
import MainHero from './mainhero';
import Footer from './partials/footer';

const Layout = ({ children, description }) => {
  return (
    <>
      {
        !description && (
          <MainHero />
        )
      }
      {children}
      <Footer />
    </>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
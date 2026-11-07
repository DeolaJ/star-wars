import React from 'react';
import PropTypes from 'prop-types';
import MainHero from './mainhero';
import Footer from './partials/footer';

const noop = () => null;

const Layout = ({
  children, description, doSearchAll = noop, resetSearchAll = noop,
}) => {
  return (
    <>
      {
        !description && (
          <MainHero 
            doSearchAll={doSearchAll}
            resetSearchAll={resetSearchAll}
          />
        )
      }
      {children}
      <Footer />
    </>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  // Set on the detail page, which supplies its own hero
  description: PropTypes.bool,
  doSearchAll: PropTypes.func,
  resetSearchAll: PropTypes.func,
};

export default Layout;
import React from 'react';
import PropTypes from 'prop-types';
import MainHero from './mainhero';
import Footer from './partials/footer';

const noop = () => null;

const Layout = ({
  children, description, doSearchAll = noop, resetSearchAll = noop, searchValue = '',
}) => {
  return (
    <>
      {
        !description && (
          <MainHero 
            doSearchAll={doSearchAll}
            resetSearchAll={resetSearchAll}
            searchValue={searchValue}
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
  // What the hero's search box shows; the home page keeps it in the URL
  searchValue: PropTypes.string,
};

export default Layout;
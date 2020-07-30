import React from 'react';
import PropTypes from 'prop-types';
import MainHero from './mainhero';
import Footer from './partials/footer';

const Layout = ({
  children, description, doSearchAll, resetSearchAll
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

Layout.defaultProps = {
  doSearchAll: () => null,
  resetSearchAll: () => null,
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  doSearchAll: PropTypes.func,
  resetSearchAll: PropTypes.func,
};

export default Layout;
import React, { useState, useRef, useEffect } from 'react';
import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';
import Hero from './partials/hero';
import SearchBar from './partials/searchbar';
import Logo from '../assets/logo.png';

const MainHero = ({
  doSearchAll, resetSearchAll,
}) => {
  const [searchParams, setSearchParams] = useState('');

  const performSearch = useRef(debounce((searchParams) => {
    if (searchParams.length > 0) {
      doSearchAll(searchParams);
    } else {
      resetSearchAll();
    }
  }, 1000));

  useEffect(() => performSearch.current(searchParams), [searchParams]);

  return (
    <Hero>
      <div className="hero__content">
        <div className="hero__heading">
          <img src={Logo} alt="Star wars logo" className="hero__logo" />
          <h2>Directory</h2>
        </div>
        <h3 className="hero__subtext">
          Find you favourite Characters, Films, Species, Starships and Planets.
        </h3>
        <SearchBar 
          handleSearch={setSearchParams}
        />
      </div>
    </Hero>
  );
};

MainHero.propTypes = {
  doSearchAll: PropTypes.func.isRequired,
  resetSearchAll: PropTypes.func.isRequired,
};

export default MainHero;

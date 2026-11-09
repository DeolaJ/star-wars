import React from 'react';
import PropTypes from 'prop-types';
import Hero from './partials/hero';
import SearchBar from './partials/searchbar';
import Emblem from '../assets/emblem.svg';

// The search box already waits for the typing to stop, so there is nothing to
// hold back here; the query itself belongs to the page above
const MainHero = ({
  doSearchAll, resetSearchAll, searchValue = '',
}) => {
  const handleSearch = (text) => {
    if (text.length > 0) {
      doSearchAll(text);
    } else {
      resetSearchAll();
    }
  };

  return (
    <Hero>
      <div className="hero__content">
        <div className="hero__heading">
          <img src={Emblem} alt="Star Wars Directory emblem" className="hero__logo" width="50" height="50" />
          <h1>Directory</h1>
        </div>
        <p className="hero__subtext">
          Find you favourite Characters, Films, Species, Starships and Planets.
        </p>
        <SearchBar 
          value={searchValue}
          handleSearch={handleSearch}
          label="Search the whole directory"
        />
      </div>
    </Hero>
  );
};

MainHero.propTypes = {
  doSearchAll: PropTypes.func.isRequired,
  resetSearchAll: PropTypes.func.isRequired,
  searchValue: PropTypes.string,
};

export default MainHero;

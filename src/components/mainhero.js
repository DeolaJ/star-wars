import React from 'react';
import Hero from './partials/hero';
import SearchBar from './partials/searchbar';
import Logo from '../assets/logo.png';

const mainhero = () => (
  <Hero>
    <div className="hero__content">
      <div className="hero__heading">
        <img src={Logo} alt="Star wars logo" />
        <p>Directory</p>
      </div>
      <p className="hero__subtext">
        Find you favourite Characters, Films, Species, Starships and Planets.
      </p>
      <SearchBar />
    </div>
  </Hero>
);

export default mainhero;

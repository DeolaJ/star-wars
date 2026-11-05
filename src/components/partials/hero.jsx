import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Emblem from '../../assets/emblem.svg';
import { heroArtwork, SIZES } from './artwork';

const Hero = ({ children }) => {
  return (
    <header className="hero">
      <img
        className="hero__banner"
        src={heroArtwork.src}
        srcSet={heroArtwork.srcSet}
        sizes={SIZES.hero}
        width={heroArtwork.width}
        height={heroArtwork.height}
        // React 18 only passes the lowercase attribute through to the DOM
        // eslint-disable-next-line react/no-unknown-property
        fetchpriority="high"
        decoding="async"
        alt=""
      />
      <nav className="hero__navbar">
        <Link to="/">
          <img src={Emblem} alt="Star Wars Directory home" className="hero__logo" width="50" height="50" />
        </Link>
      </nav>
      <div className="hero__body">
        {children}
      </div>
    </header>
  );
};

Hero.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Hero;
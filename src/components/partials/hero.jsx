import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Logo from '../../assets/logo.png';
import Banner from '../../assets/hero-banner.jpg';

const Hero = ({ children }) => {
  return (
    <header className="hero">
      <img className="hero__banner" src={Banner} alt="Hero banner" />
      <nav className="hero__navbar">
        <Link to="/">
          <img src={Logo} alt="Star wars logo" className="hero__logo" />
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
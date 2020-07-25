import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Logo from '../assets/logo.png';

const Hero = ({ children }) => {
  return (
    <header className="hero">
      <nav className="hero__navbar">
        <Link to="/">
          <img src={Logo} alt="Star wars logo" />
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
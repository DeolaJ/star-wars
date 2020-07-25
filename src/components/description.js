import React from 'react';
import PropTypes from 'prop-types';
import Hero from './hero';

const Description = ({ title, description, imageLink }) => {
  // Write logic to separate content into paragraphs
  // const computerdescription;
  return (
    <div className="description">
      <Hero>
        <div className="description__image">
          <img src={imageLink} alt={`${title}`} />
        </div>
        <div className="description__slider">
          slider
        </div>
      </Hero>
      <div className="descripiton__body">
        <h2 className="description__title">
          {title}
        </h2>
        <div className="description__content">
          {description}
        </div>
      </div>
    </div>
  );
};

Description.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  imageLink: PropTypes.string.isRequired,
};

export default Description;
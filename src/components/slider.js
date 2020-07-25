import React from 'react';
import PropTypes from 'prop-types';
import ListItem from './list-item';

const Slider = ({ items, resultsPerView, imagePosition, view }) => {
  return (
    <div className="slider">
      <div className="slider__body">
        {
          items.map(item => (
            <ListItem 
              key={item.title} 
              imagePosition={imagePosition}
              view={view}
              title={item.title}
              subtitle={item.subtitle}
              link={item.link}
              imageLink={item.imageLink}
            />
          ))
        }
      </div>
      <div className="slider__control">
        dots
        {resultsPerView}
      </div>
    </div>
  );
};

Slider.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  resultsPerView: PropTypes.number.isRequired,
  imagePosition: PropTypes.string.isRequired,
  view: PropTypes.string.isRequired,
};

export default Slider;
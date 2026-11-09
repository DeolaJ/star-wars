import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import ListItem from './list-item';
import { RESOURCES, RESOURCE_KEYS } from '../../resources';

const Slider = ({ 
  type, items, resultsPerView
}) => {
  const [currentIndex, setCurrentIndex] = useState(1);

  const recentResultsEndIndex = currentIndex * resultsPerView;
  const firstResultIndex = recentResultsEndIndex - resultsPerView;
  const currentItems = items.slice(firstResultIndex, recentResultsEndIndex);

  const parts = Math.ceil(items.length / resultsPerView);
  const pageNumbers = useMemo(() => {
    const pageNumbers = [];
    for (let i = 1; i <= parts; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers
  }, [parts]);

  return (
    <div className="slider">
      <div className="slider__body">
        {
          currentItems.map(item => (
            <ListItem
              key={item.name}
              item={item}
              type={type}
              imagePosition={RESOURCES[type].imagePosition.card}
              view="grid"
            />
          ))
        }
      </div>
      {/* The dots are a list of controls; each says where it goes, since it
          has no text of its own */}
      <ul className="slider__control">
        {
          pageNumbers.map(number => (
            <li
              key={number}
              className={`slider__item ${number === currentIndex ? 'active' : ''}`}
            >
              <button 
                type="button"
                onClick={() => setCurrentIndex(number)}
                className="slider__dot"
                aria-label={`Go to slide ${number} of ${parts}`}
                aria-current={number === currentIndex ? 'true' : undefined}
              >
              </button>
            </li>
          ))
        }
      </ul>
    </div>
  );
};

Slider.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  resultsPerView: PropTypes.number.isRequired,
  type: PropTypes.oneOf(RESOURCE_KEYS).isRequired,
};

export default Slider;

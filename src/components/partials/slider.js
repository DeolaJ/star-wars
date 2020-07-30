import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import ListItem from './list-item';

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
              imagePosition={item.gender ? "left" : "top"}
              name={item.name}
              type={type}
              population={item.population ? item.population : null}
              temperature={item.temperature ? item.temperature : null}
              birthyear={item.birth_year ? item.birth_year : null}
              gender={item.gender ? item.gender : null}
              model={item.model ? item.model : null}
              cargo={item.cargo ? item.cargo : null}
              view="grid"
            />
          ))
        }
      </div>
      <div className="slider__control">
        {
          pageNumbers.map(number => (
            <li
              key={number}
              className={`slider__item ${number === currentIndex ? 'active' : null}`}
            >
              <button 
                type="button"
                id={number}
                onClick={() => setCurrentIndex(number)}
                className="slider__dot"
              >
              </button>
            </li>
          ))
        }
      </div>
    </div>
  );
};

Slider.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  resultsPerView: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired,
};

export default Slider;
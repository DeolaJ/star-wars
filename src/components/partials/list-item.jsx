import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Arrow from '../../assets/right-arrow.svg';
import { artworkFor, SIZES } from './artwork';

const ListItem = ({
  imagePosition, name, population = '', birthyear = '', gender = '',
  view, model = '', cargo = '', temperature = '', type, item = null,
}) => {
  // Lazy-loaded artwork; the width and height reserve its space before it loads
  const artwork = (category) => {
    const image = artworkFor(category, item || { name });
    return (
      <img
        src={image.src}
        srcSet={image.srcSet}
        sizes={imagePosition === 'top' ? SIZES.top : SIZES.side}
        width={image.width}
        height={image.height}
        loading="lazy"
        decoding="async"
        alt={`${category} ${name}`}
      />
    );
  };

  const listBody = (
    type, name, population, birthyear, gender, 
    model, cargo, temperature, imagePosition,
  ) => {
    switch (type) {
      case 'characters': {
        return (
          <>
            <div className="list-item__image">
              {artwork(type)}
            </div>
            <div className="list-item__body">
              <div className="list-item__title">
                <h4>
                  {name}
                </h4>
              </div>
              <p className="list-item__description">
                {name.split(" ")[0]} was born in the year {birthyear}, and is {gender}
                {
                  imagePosition === "left" && (
                    <Link to="/">Read more</Link>
                  )
                }
              </p>
              {
                imagePosition === "top" && (
                  <Link to={`/description/characters/${name.split(" ").join("_").toLowerCase()}`} className="list-item__button">
                    <button
                      type="button"
                    >
                      Read more <img src={Arrow} alt="arrow" />
                    </button>
                  </Link>
                )
              }
            </div>
          </>
        )
      }

      case 'planets': {
        return (
          <>
            <div className="list-item__image">
              {artwork(type)}
            </div>
            <div className="list-item__body">
              <div className="list-item__title">
                <h4>
                  {name}
                </h4>
              </div>
              <p className="list-item__description">
                {name} has a temperature of {temperature}, and a population of {population}
                {
                  imagePosition === "left" && (
                    <Link to="/">Read more</Link>
                  )
                }
              </p>
              {
                imagePosition === "top" && (
                  <Link to={`/description/planets/${name.split(" ").join("_").toLowerCase()}`} className="list-item__button">
                    <button
                      type="button"
                    >
                      Read more <img src={Arrow} alt="arrow" />
                    </button>
                  </Link>
                )
              }
            </div>
          </>
        )
      }

      case 'starships': {
        return (
          <>
            <div className="list-item__image">
              {artwork(type)}
            </div>
            <div className="list-item__body">
              <div className="list-item__title">
                <h4>
                  {name}
                </h4>
              </div>
              <p className="list-item__description">
                {name.split(" ")[0]} is of the {model} model, and has a cargo of {cargo}
                {
                  imagePosition === "left" && (
                    <Link to="/">Read more</Link>
                  )
                }
              </p>
              {
                imagePosition === "top" && (
                  <Link to={`/description/starships/${name.split(" ").join("_").toLowerCase()}`} className="list-item__button">
                    <button
                      type="button"
                    >
                      Read more <img src={Arrow} alt="arrow" />
                    </button>
                  </Link>
                )
              }
            </div>
          </>
        )
      }
      
      default: return null
    }
  }
  return (
    <div className={`list-item ${type} ${view} ${imagePosition}`}>
      {
        listBody(type, name, population, birthyear, gender, 
          model, cargo, temperature, imagePosition
        )
      }
    </div>
  );
};

ListItem.propTypes = {
  // The full API item, used to choose artwork that matches it
  item: PropTypes.object,
  name: PropTypes.string.isRequired,
  view: PropTypes.string.isRequired,
  imagePosition: PropTypes.string.isRequired,
  population: PropTypes.string,
  birthyear: PropTypes.string,
  gender: PropTypes.string,
  model: PropTypes.string,
  cargo: PropTypes.string,
  temperature: PropTypes.string,
  type: PropTypes.string.isRequired,
};

export default ListItem;

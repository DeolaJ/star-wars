import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Character1 from '../../assets/character-1.jpg';
import Character2 from '../../assets/character-2.jpg';
import Character3 from '../../assets/character-3.jpg';
import Character4 from '../../assets/character-4.jpg';
import Planet1 from '../../assets/planet-1.jpg';
import Planet2 from '../../assets/planet-2.jpg';
import Planet3 from '../../assets/planet-3.jpg';
import Starship1 from '../../assets/starship-1.jpg';
import Starship2 from '../../assets/starship-2.jpg';
import Starship3 from '../../assets/starship-3.jpg';
import Starship4 from '../../assets/starship-4.jpg';
import Starship5 from '../../assets/starship-5.jpg';
import Starship6 from '../../assets/starship-6.jpg';
import Arrow from '../../assets/right-arrow.svg';

const ListItem = ({
  imagePosition, name, population, birthyear, gender, 
  view, model, cargo, temperature, type,
}) => {
  const characterImages = [
    Character1, Character2, Character3, Character4
  ];

  const starshipImages = [
    Starship1, Starship2, Starship3, Starship4, Starship5, Starship6
  ];

  const planetImages = [
    Planet1, Planet2, Planet3
  ];

  const randomImage = (total) => {
    return Math.floor(Math.random() * total);
  };

  const listBody = (
    type, name, population, birthyear, gender, 
    model, cargo, temperature, imagePosition,
  ) => {
    switch (type) {
      case 'characters': {
        const imageLink = characterImages[randomImage(4)];
        return (
          <>
            <div className="list-item__image">
              <img src={imageLink} alt={`${type} ${name}`} />
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
        const imageLink = planetImages[randomImage(3)];
        return (
          <>
            <div className="list-item__image">
              <img src={imageLink} alt={`${type} ${name}`} />
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
        const imageLink = starshipImages[randomImage(6)];
        return (
          <>
            <div className="list-item__image">
              <img src={imageLink} alt={`${type} ${name}`} />
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

ListItem.defaultProps = {
  population: '',
  birthyear: '',
  gender: '',
  model: '',
  cargo: '',
  temperature: '',
}

ListItem.propTypes = {
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

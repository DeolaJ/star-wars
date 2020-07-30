import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import { Link } from 'react-router-dom';
import Section from './partials/section';
import Slider from './partials/slider';
import ListItem from './partials/list-item';

const MainHome = ({
  characters, planets, starships, loadingCharactersError, 
  loadingPlanetsError, loadingStarshipsError,
}) => {
  console.log(loadingStarshipsError.message)
  return (
    <div className="home">
  
      {/* Starships Section */}
      <Section
        title="Popular Starships"
      >
        {
          !isEmpty(loadingStarshipsError.message)
          ? (
            <p>
              {`There was an error while loading Star Wars Starships: ${loadingStarshipsError.message}`}
            </p>
          )
          : (
            <>
              {
                starships.slice(0, 6).map(starship => (
                  <ListItem
                    key={starship.name}
                    imagePosition="top"
                    type="starships"
                    name={starship.name}
                    model={starship.model}
                    cargo={starship.cargo_capacity}
                    view="grid"
                  />
                ))
              }
              <div className="section__button">
                <Link to="/starships">
                  <button
                    type="button"
                  >
                    View All
                  </button>
                </Link>
              </div>
            </>
          )
        }
      </Section>


      {/* Planets Section */}
      <Section
        title="Popular Planets"
      >
        {
          !isEmpty(loadingPlanetsError.message)
          ? (
            <p>
              {`There was an error while loading Star Wars Planets: ${loadingPlanetsError.message}`}
            </p>
          )
          : (
            <>
              <Slider
                items={planets.slice(0, 9)}
                resultsPerView={3}
                type="planets"
              />
              <div className="section__button">
                <Link to="/planets">
                  <button
                    type="button"
                  >
                    View All
                  </button>
                </Link>
              </div>
            </>
          )
        }
      </Section>

      {/* Characters Section */}
      <Section
        title="Popular Characters"
      >
        {
          !isEmpty(loadingCharactersError.message)
          ? (
            <p>
              {`There was an error while loading Star Wars Characters: ${loadingCharactersError.message}`}
            </p>
          )
          : (
            <>
              {
                characters.slice(0, 4).map(character => (
                  <ListItem
                    key={character.name}
                    imagePosition="left"
                    type="characters"
                    name={character.name}
                    birthyear={character.birth_year}
                    gender={character.gender}
                    view="grid"
                  />
                ))
              }
              <div className="section__button">
                <Link to="/characters">
                  <button
                    type="button"
                  >
                    View All
                  </button>
                </Link>
              </div>
            </>
          )
        }
      </Section>
    </div>
  );
};

MainHome.propTypes = {
  characters: PropTypes.arrayOf(PropTypes.object).isRequired,
  planets: PropTypes.arrayOf(PropTypes.object).isRequired,
  starships: PropTypes.arrayOf(PropTypes.object).isRequired,
  loadingCharactersError: PropTypes.object.isRequired,
  loadingPlanetsError: PropTypes.object.isRequired,
  loadingStarshipsError: PropTypes.object.isRequired,
};

export default MainHome;

import React from 'react';
import PropTypes from 'prop-types';
import Hero from './partials/hero';
import Layout from './layout';
import Slider from './partials/slider';

const Description = ({
  match, characters, planets, starships, recent,
}) => {
  const { category, id } = match.params;
  const item = (category) => {
    switch(category) {
      case 'characters': return characters[id]
      case 'planets': return planets[id]
      case 'starships': return starships[id]
      default: return
    }
  };
  // Write logic to separate content into paragraphs
  // const computerdescription;
  return (
    <Layout>
      <div className="desciption">
        <Hero>
          <img src={item.image} alt={`${category} description`} />
          <div className="description__title">
            {item.title}
          </div>
          {/* <div className="description__slider">
            slider
          </div> */}
        </Hero>
        <div className="descripiton__body">
          <h2 className="description__title">
            {item.title}
          </h2>
          <div className="description__content">
            {item.description}
          </div>
        </div>
        <div className="description__recent">
          <Slider
            items={recent['category'].slice(0, 9)}
            imagePosition={category === "characters" ? "left" : "top"}
            resultsPerView={3}
          />
        </div>
      </div>
    </Layout>
  );
};

Description.propTypes = {
  // match: PropTypes.objectOf(PropTypes.object).isRequired,
  match: PropTypes.object.isRequired,
  recent: PropTypes.arrayOf(PropTypes.object),
  characters: PropTypes.arrayOf(PropTypes.object),
  planets: PropTypes.arrayOf(PropTypes.object),
  starships: PropTypes.arrayOf(PropTypes.object),
};

export default Description;

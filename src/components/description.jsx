import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import { Link, useHistory } from 'react-router-dom';
import Hero from './partials/hero';
import Layout from './layout';
import Character1 from '../assets/character-1.jpg';
import Character2 from '../assets/character-2.jpg';
import Character3 from '../assets/character-3.jpg';
import Character4 from '../assets/character-4.jpg';
import Planet1 from '../assets/planet-1.jpg';
import Planet2 from '../assets/planet-2.jpg';
import Planet3 from '../assets/planet-3.jpg';
import Starship1 from '../assets/starship-1.jpg';
import Starship2 from '../assets/starship-2.jpg';
import Starship3 from '../assets/starship-3.jpg';
import Starship4 from '../assets/starship-4.jpg';
import Starship5 from '../assets/starship-5.jpg';
import Starship6 from '../assets/starship-6.jpg';
import RecentlyViewed from './partials/recently-viewed';
import RightChevron from '../assets/chevron-right.svg';
import LeftChevron from '../assets/chevron-left.svg';

const Description = ({
  match, recentlyViewed, descriptionItem, doSetDescription, 
  setRecentlyViewed
}) => {
  const { category, id } = match.params;
  const [currentIndex, setCurrentIndex] = useState(recentlyViewed[category].length - 1)
  const [currentNegIndex, setCurrentNegIndex] = useState(0)
  const [imageLink, setImageLink] = useState('');
  const [nextLink, setNextLink] = useState('');
  const [previousLink, setPreviousLink] = useState('');
  const idName = id.split("_").join(" ");
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
  const link = (category) => {
    switch(category) {
      case 'characters': return characterImages[randomImage(4)]
      case 'planets': return planetImages[randomImage(3)]
      case 'starships': return starshipImages[randomImage(6)]
      default: return
    }
  };

  const getItemInfo = useRef((category) => {
    setImageLink(link(category));
    doSetDescription(category, idName)
  });

  const getRecentlyViewed = useRef((recentlyViewed) => {
    setPreviousLink(`/description/${category}/${recentlyViewed[category][recentlyViewed[category].length-2].name.split(" ").join("_").toLowerCase()}`);
    setNextLink(`/description/${category}/${recentlyViewed[category][0].name.split(" ").join("_").toLowerCase()}`);
  })

  useEffect(() => getItemInfo.current(category), [category]);
  useEffect(() => {
    getRecentlyViewed.current(recentlyViewed)
    setCurrentIndex(recentlyViewed[category].length - 1)
  }, [recentlyViewed, setCurrentIndex, category]);

  useEffect(() => {
    if (!isEmpty(descriptionItem)) {
      setRecentlyViewed(category, descriptionItem.category);
    }
  }, [category, setRecentlyViewed, descriptionItem])

  const history = useHistory();
  const navigateNext = () => {
    const newName = recentlyViewed[category][currentNegIndex].name.toLowerCase();
    history.push(nextLink)
    doSetDescription(category, newName);
    setCurrentNegIndex(currentNegIndex + 1);
  };
  
  const navigatePrevious = () => {
    const newName = recentlyViewed[category][currentIndex - 1].name.toLowerCase();
    history.push(previousLink)
    doSetDescription(category, newName);
  }

  return (
    <Layout 
      description
    >
      {
        !isEmpty(descriptionItem) && !isEmpty(recentlyViewed) && (
          <div className="description">
            <Hero>
              <img src={imageLink} alt={`${category} description`} />
              <div className="description__title">
                <h1>
                  {descriptionItem.category.name}
                </h1>
              </div>
              <div className="description__slider">
                <button 
                  type="button"
                  onClick={navigatePrevious}
                >
                  <img src={LeftChevron} alt="previous icon" />
                </button>
                <button 
                  type="button"
                  onClick={navigateNext}
                >
                  <img src={RightChevron} alt="next icon" />
                </button>
              </div>
            </Hero>
            <div className="description__body">
              <h2 className="description__title">
                {descriptionItem.category.name}
              </h2>
              <div className="description__content">
                {descriptionItem.description}
              </div>
            </div>
            <div className="description__recent">
              <RecentlyViewed 
                category={category}
                recentlyViewed={recentlyViewed[category]}
              />
            </div>
          </div>
        )
      }
    </Layout>
  )
};

Description.propTypes = {
  match: PropTypes.object.isRequired,
  descriptionItem: PropTypes.object.isRequired,
  recentlyViewed: PropTypes.object.isRequired,
  doSetDescription: PropTypes.func.isRequired,
  setRecentlyViewed: PropTypes.func.isRequired,
};

export default Description;

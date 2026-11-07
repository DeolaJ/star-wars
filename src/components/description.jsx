import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import { useNavigate, useParams } from 'react-router-dom';
import Hero from './partials/hero';
import Layout from './layout';
import RecentlyViewed from './partials/recently-viewed';
import RightChevron from '../assets/chevron-right.svg';
import LeftChevron from '../assets/chevron-left.svg';
import { artworkFor, SIZES } from './partials/artwork';

const Description = ({
  recentlyViewed, descriptionItem, doSetDescription, 
  setRecentlyViewed
}) => {
  const { category, id } = useParams();
  const [currentIndex, setCurrentIndex] = useState(recentlyViewed[category].length - 1)
  const [currentNegIndex, setCurrentNegIndex] = useState(0)
  const [nextLink, setNextLink] = useState('');
  const [previousLink, setPreviousLink] = useState('');
  const idName = id.split("_").join(" ");
  const getItemInfo = useRef((category) => {
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

  // The picture follows the item shown, so it changes with next and previous
  const artwork = !isEmpty(descriptionItem) ? artworkFor(category, descriptionItem.category) : null;

  const navigate = useNavigate();
  const navigateNext = () => {
    const newName = recentlyViewed[category][currentNegIndex].name.toLowerCase();
    navigate(nextLink)
    doSetDescription(category, newName);
    setCurrentNegIndex(currentNegIndex + 1);
  };
  
  const navigatePrevious = () => {
    const newName = recentlyViewed[category][currentIndex - 1].name.toLowerCase();
    navigate(previousLink)
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
              {artwork && (
                <img
                  src={artwork.src}
                  srcSet={artwork.srcSet}
                  sizes={SIZES.description}
                  width={artwork.width}
                  height={artwork.height}
                  decoding="async"
                  alt={`${category} description`}
                />
              )}
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
  descriptionItem: PropTypes.object.isRequired,
  recentlyViewed: PropTypes.object.isRequired,
  doSetDescription: PropTypes.func.isRequired,
  setRecentlyViewed: PropTypes.func.isRequired,
};

export default Description;

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useParams } from 'react-router-dom';
import Hero from './partials/hero';
import Layout from './layout';
import RecentlyViewed from './partials/recently-viewed';
import RelatedItems, { itemsShape } from './partials/related-items';
import RightChevron from '../assets/chevron-right.svg';
import LeftChevron from '../assets/chevron-left.svg';
import { artworkFor, SIZES } from './partials/artwork';
import { descriptionPath, paragraphs } from '../resources';

const Description = ({
  recentlyViewed, descriptionItem, items,
  doSetDescription, setRecentlyViewed, doFetchItem,
}) => {
  const { category, id } = useParams();
  const navigate = useNavigate();
  const idName = id.split('_').join(' ');

  // The URL is the source of truth: whenever it names another item, that item
  // is loaded. Links, the browser's back button and the arrows all just change
  // the URL.
  useEffect(() => {
    doSetDescription(category, idName);
  }, [category, idName, doSetDescription]);

  // Only the item the URL names is shown, never the one from the previous page
  // while the new one is on its way
  const current = (
    descriptionItem.resource === category
    && descriptionItem.category
    && descriptionItem.category.name.toLowerCase() === idName
  ) ? descriptionItem : null;

  useEffect(() => {
    if (current) setRecentlyViewed(category, current.category);
  }, [category, current, setRecentlyViewed]);

  // The arrows step through this category's recently viewed list, wrapping at
  // either end. An item reached directly, which is not in the list yet, steps
  // onto the list's first or last entry.
  const viewed = recentlyViewed[category] || [];
  const position = viewed.findIndex(entry => entry.name.toLowerCase() === idName);
  const step = (offset) => {
    if (viewed.length === 0) return;
    const index = position < 0
      ? (offset > 0 ? 0 : viewed.length - 1)
      : (position + offset + viewed.length) % viewed.length;
    navigate(descriptionPath(category, viewed[index].name));
  };

  // The picture follows the item shown
  const artwork = current ? artworkFor(category, current.category) : null;

  return (
    <Layout
      description
    >
      {
        current !== null && (
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
                  {current.category.name}
                </h1>
              </div>
              <div className="description__slider">
                <button
                  type="button"
                  onClick={() => step(-1)}
                >
                  <img src={LeftChevron} alt="previous icon" />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                >
                  <img src={RightChevron} alt="next icon" />
                </button>
              </div>
            </Hero>
            <div className="description__body">
              <h2 className="description__title">
                {current.category.name}
              </h2>
              <div className="description__content">
                {
                  paragraphs(current.description).map((part, index) => (
                    <p key={index}>{part}</p>
                  ))
                }
              </div>
            </div>
            <div className="description__related">
              <RelatedItems
                resource={category}
                item={current.category}
                items={items}
                doFetchItem={doFetchItem}
              />
            </div>
            <div className="description__recent">
              <RecentlyViewed
                category={category}
                recentlyViewed={viewed}
              />
            </div>
          </div>
        )
      }
    </Layout>
  )
};

Description.propTypes = {
  descriptionItem: PropTypes.shape({
    resource: PropTypes.string,
    category: PropTypes.object,
    description: PropTypes.string,
  }).isRequired,
  recentlyViewed: PropTypes.object.isRequired,
  items: itemsShape.isRequired,
  doSetDescription: PropTypes.func.isRequired,
  setRecentlyViewed: PropTypes.func.isRequired,
  doFetchItem: PropTypes.func.isRequired,
};

export default Description;

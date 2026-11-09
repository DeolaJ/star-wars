import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Arrow from '../../assets/right-arrow.svg';
import { artworkFor, SIZES } from './artwork';
import { RESOURCES, descriptionPath } from '../../resources';

// A card for one API item. What it says comes from the resource's configuration;
// `imagePosition` decides the layout: picture beside the text ("left") or above
// it ("top").
const ListItem = ({ item, type, imagePosition, view }) => {
  const { cardText } = RESOURCES[type];
  const { name } = item;
  // Lazy-loaded artwork; the width and height reserve its space before it loads
  const image = artworkFor(type, item);
  const detailPath = descriptionPath(type, name);

  return (
    <div className={`list-item ${type} ${view} ${imagePosition}`}>
      <div className="list-item__image">
        <img
          src={image.src}
          srcSet={image.srcSet}
          sizes={imagePosition === 'top' ? SIZES.top : SIZES.side}
          width={image.width}
          height={image.height}
          loading="lazy"
          decoding="async"
          alt={`${type} ${name}`}
        />
      </div>
      <div className="list-item__body">
        <div className="list-item__title">
          <h3>
            {name}
          </h3>
        </div>
        <p className="list-item__description">
          {cardText(item)}
          {
            imagePosition === 'left' && (
              <Link to={detailPath}>Read more</Link>
            )
          }
        </p>
        {
          imagePosition === 'top' && (
            <Link to={detailPath} className="list-item__button">
              Read more <img src={Arrow} alt="" />
            </Link>
          )
        }
      </div>
    </div>
  );
};

ListItem.propTypes = {
  // The full API item, used for the text and to choose artwork that matches it
  item: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
  type: PropTypes.oneOf(Object.keys(RESOURCES)).isRequired,
  imagePosition: PropTypes.oneOf(['left', 'top']).isRequired,
  view: PropTypes.oneOf(['grid', 'list']).isRequired,
};

export default ListItem;

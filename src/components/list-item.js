import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const ListItem = ({
  imagePosition, title, subtitle, description, link, imageLink, view,
}) => {
  return (
    <div className={`list-item ${view} ${imagePosition}`}>
      <div className="list-item__image">
        <img src={imageLink} alt={`${title}`} />
      </div>
      <div className="list-item__title">
        <h4>
          {title}
        </h4>
        {
          subtitle && (
            <span>
              {subtitle}
            </span>
          )
        }
      </div>
      <p className="list-item__description">
        {description}
        {
          imagePosition === "left" && (
            <Link to="/">Read more</Link>
          )
        }
      </p>
      {
        imagePosition === "top" && (
          <Link to={link} className="list-item__button">
            <button
              type="button"
            >
              Read more
            </button>
          </Link>
        )
      }
    </div>
  );
};

ListItem.defaultProps = {
  subtitle: '',
}

ListItem.propTypes = {
  title: PropTypes.string.isRequired,
  view: PropTypes.string.isRequired,
  imagePosition: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  description: PropTypes.string.isRequired,
  imageLink: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
};

export default ListItem;

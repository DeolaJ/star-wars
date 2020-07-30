import React from 'react';
import PropTypes from 'prop-types';
import Slider from './slider';

const RecentlyViewed = ({
  category, recentlyViewed,
}) => {
  return (
    <div className="recently-viewed">
      <h2 className="recently-viewed__title">
        Recently Viewed
      </h2>
      <Slider
        items={recentlyViewed.slice(0, 9)}
        resultsPerView={3}
        type={category}
      />
    </div>
  );
};

RecentlyViewed.propTypes = {
  category: PropTypes.string.isRequired,
  recentlyViewed: PropTypes.array.isRequired,
};

export default RecentlyViewed;
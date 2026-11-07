import React from 'react';
import PropTypes from 'prop-types';
import Section from './section';
import ListItem from './list-item';
import { RESOURCES, RESOURCE_KEYS } from '../../resources';

const cards = (resource, items, view) => items.map(item => (
  <ListItem
    key={item.name}
    item={item}
    type={resource}
    imagePosition={RESOURCES[resource].imagePosition.card}
    view={view}
  />
));

// Search results. With a `category`, the results of that resource's own search
// box; otherwise the results of the site-wide search, one section per resource.
const SearchResult = ({ category, items = [], results = {}, view = 'grid' }) => {
  if (category) {
    return (
      <div className="search-result__specific">
        <h2 className="search-result__title">
          {category.toUpperCase()} Results
        </h2>
        <div className="search-result__body">
          <Section
            title="Search results"
          >
            {cards(category, items, view)}
          </Section>
        </div>
      </div>
    );
  }

  return (
    <div className="search-result__all">
      <h2 className="search-result__title">
        All Results
      </h2>
      <div className="search-result__body">
        {
          RESOURCE_KEYS.map(resource => (
            <Section
              key={resource}
              title={RESOURCES[resource].label}
            >
              {cards(resource, results[resource] || [], 'grid')}
            </Section>
          ))
        }
      </div>
    </div>
  );
};

SearchResult.propTypes = {
  category: PropTypes.oneOf(RESOURCE_KEYS),
  items: PropTypes.arrayOf(PropTypes.object),
  results: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.object)),
  view: PropTypes.oneOf(['grid', 'list']),
};

export default SearchResult;

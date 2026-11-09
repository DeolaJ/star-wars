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

// What one resource's search produced: its matches, a note that nothing
// matched, or a note that the search did not run with a way to try again.
// A failed search is told apart from an empty one so no one concludes an item
// does not exist because the API was down.
const Outcome = ({ resource, items, error, query, view, onRetry }) => {
  const { label } = RESOURCES[resource];
  if (error) {
    return (
      <p className="search-result__failed" role="alert">
        {`The search for “${query}” could not be completed.`}
        {
          onRetry && (
            <button
              type="button"
              className="search-result__retry"
              onClick={() => onRetry(resource)}
            >
              Try again
            </button>
          )
        }
      </p>
    );
  }
  if (items.length === 0) {
    return (
      <p className="search-result__empty" role="status">
        {`No ${label.toLowerCase()} match “${query}”.`}
      </p>
    );
  }
  return cards(resource, items, view);
};

Outcome.propTypes = {
  resource: PropTypes.oneOf(RESOURCE_KEYS).isRequired,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  error: PropTypes.shape({ message: PropTypes.string }),
  query: PropTypes.string.isRequired,
  view: PropTypes.oneOf(['grid', 'list']).isRequired,
  onRetry: PropTypes.func,
};

// Search results. With a `category`, the results of that resource's own search
// box; otherwise the results of the site-wide search, one section per resource.
const SearchResult = ({
  category, items = [], results = {}, errors = {}, query = '', view = 'grid', onRetry,
}) => {
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
            <Outcome
              resource={category}
              items={items}
              error={errors[category]}
              query={query}
              view={view}
              onRetry={onRetry}
            />
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
              <Outcome
                resource={resource}
                items={results[resource] || []}
                error={errors[resource]}
                query={query}
                view="grid"
                onRetry={onRetry}
              />
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
  // Why a resource's search did not run, by resource
  errors: PropTypes.objectOf(PropTypes.shape({ message: PropTypes.string })),
  query: PropTypes.string,
  view: PropTypes.oneOf(['grid', 'list']),
  // Called with the resource whose search should run again
  onRetry: PropTypes.func,
};

export default SearchResult;

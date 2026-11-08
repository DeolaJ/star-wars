import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { RESOURCES, RESOURCE_KEYS, relatedUrls, resourceForPath, descriptionPath } from '../../resources';
import { apiPathOf } from '../../app/api';

// The items an item links to (a character's homeworld, a film's cast), grouped
// under the headings in the resource's configuration. Each link is resolved to
// its item so it can be shown by name; until then a placeholder holds its place.
const RelatedItems = ({ resource, item, items, doFetchItem }) => {
  const groups = RESOURCES[resource].related
    .map(({ field, label }) => ({ field, label, urls: relatedUrls(item[field]) }))
    .filter(group => group.urls.length > 0);

  // One string of every link, so the effect runs when the links change and not
  // on every render
  const urlKey = groups.flatMap(group => group.urls).join('\n');
  useEffect(() => {
    if (urlKey) urlKey.split('\n').forEach(url => doFetchItem(url));
  }, [urlKey, doFetchItem]);

  if (groups.length === 0) return null;

  return (
    <div className="related">
      <h2 className="related__heading">Related</h2>
      {
        groups.map(({ field, label, urls }) => (
          <div key={field} className="related__group">
            <h3 className="related__title">{label}</h3>
            <ul className="related__list">
              {
                urls.map(url => {
                  const path = apiPathOf(url);
                  const target = resourceForPath(path);
                  const linked = path && items.byPath[path];
                  const failed = path && items.errors[path];
                  return (
                    <li key={url} className="related__item">
                      {
                        linked && target
                          ? <Link to={descriptionPath(target, linked.name)}>{linked.name}</Link>
                          : <span className={`related__${failed ? 'unavailable' : 'loading'}`}>
                              {failed ? 'Unavailable' : 'Loading…'}
                            </span>
                      }
                    </li>
                  );
                })
              }
            </ul>
          </div>
        ))
      }
    </div>
  );
};

export const itemsShape = PropTypes.shape({
  byPath: PropTypes.objectOf(PropTypes.object).isRequired,
  loading: PropTypes.objectOf(PropTypes.bool).isRequired,
  errors: PropTypes.objectOf(PropTypes.object).isRequired,
});

RelatedItems.propTypes = {
  resource: PropTypes.oneOf(RESOURCE_KEYS).isRequired,
  item: PropTypes.object.isRequired,
  items: itemsShape.isRequired,
  doFetchItem: PropTypes.func.isRequired,
};

export default RelatedItems;

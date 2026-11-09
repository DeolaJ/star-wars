import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import { Link } from 'react-router-dom';
import Section from './partials/section';
import Slider from './partials/slider';
import ListItem from './partials/list-item';
import { RESOURCES, HOME_SECTIONS, listPath } from '../resources';
import { resourceDataShape, resourcesShape } from './resource-props';

const cards = (resource, items) => items.map(item => (
  <ListItem
    key={item.name}
    item={item}
    type={resource}
    imagePosition={RESOURCES[resource].imagePosition.card}
    view="grid"
  />
));

// A "Popular ..." section: a taste of one resource with a link to all of it,
// or the error that stopped it loading
const Popular = ({ resource, display, count, data }) => {
  const { label } = RESOURCES[resource];
  const items = data.items.slice(0, count);
  return (
    <Section
      title={`Popular ${label}`}
    >
      {
        !isEmpty(data.error.message)
        ? (
          <p>
            {`There was an error while loading Star Wars ${label}: ${data.error.message}`}
          </p>
        )
        : (
          <>
            {
              display === 'slider'
                ? <Slider items={items} resultsPerView={3} type={resource} />
                : cards(resource, items)
            }
            <div className="section__button">
              <Link to={listPath(resource)}>
                View All
              </Link>
            </div>
          </>
        )
      }
    </Section>
  );
};

Popular.propTypes = {
  resource: PropTypes.oneOf(Object.keys(RESOURCES)).isRequired,
  display: PropTypes.oneOf(['cards', 'slider']).isRequired,
  count: PropTypes.number.isRequired,
  data: resourceDataShape.isRequired,
};

const MainHome = ({ resources }) => {
  return (
    <div className="home">
      {
        HOME_SECTIONS.map(({ resource, display, count }) => (
          <Popular
            key={resource}
            resource={resource}
            display={display}
            count={count}
            data={resources[resource]}
          />
        ))
      }
    </div>
  );
};

MainHome.propTypes = {
  resources: resourcesShape.isRequired,
};

export default MainHome;

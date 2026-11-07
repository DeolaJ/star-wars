import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import { Link } from 'react-router-dom';
import Section from './partials/section';
import Slider from './partials/slider';
import ListItem from './partials/list-item';
import { RESOURCES, listPath } from '../resources';
import { resourceDataShape, resourcesShape } from './resource-props';

// A "Popular ..." section: a taste of one resource with a link to all of it,
// or the error that stopped it loading
const Popular = ({ resource, data, children }) => {
  const { label } = RESOURCES[resource];
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
            {children}
            <div className="section__button">
              <Link to={listPath(resource)}>
                <button
                  type="button"
                >
                  View All
                </button>
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
  data: resourceDataShape.isRequired,
  children: PropTypes.node.isRequired,
};

const cards = (resource, items) => items.map(item => (
  <ListItem
    key={item.name}
    item={item}
    type={resource}
    imagePosition={RESOURCES[resource].imagePosition.card}
    view="grid"
  />
));

const MainHome = ({ resources }) => {
  return (
    <div className="home">
      <Popular resource="starships" data={resources.starships}>
        {cards('starships', resources.starships.items.slice(0, 6))}
      </Popular>

      <Popular resource="planets" data={resources.planets}>
        <Slider
          items={resources.planets.items.slice(0, 9)}
          resultsPerView={3}
          type="planets"
        />
      </Popular>

      <Popular resource="characters" data={resources.characters}>
        {cards('characters', resources.characters.items.slice(0, 4))}
      </Popular>
    </div>
  );
};

MainHome.propTypes = {
  resources: resourcesShape.isRequired,
};

export default MainHome;

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Section from './partials/section';
import Search from './partials/search';
import Pagination from './partials/pagination';
import ListItem from './partials/list-item';

const MainPlanets = ({ planets }) => {
  const handleSearch = () => null;
  const [currentPage, setCurrentPage] = useState(1);
  const [filtered, setFiltered] = useState(planets);
  const resultsPerPage = 10;
  const imagePosition = 'left';
  const view = 'grid';

  const recentResultsEndIndex = currentPage * resultsPerPage;
  const firstResultIndex = recentResultsEndIndex - resultsPerPage;
  const currentPlanets = planets.slice(firstResultIndex, recentResultsEndIndex);

  return (
    <Section
      title="Starwars Planets"
    >
      <div className="filter-group">
        <div className="filter-group__left">
          <div>Filter</div>
          <div>View</div>
        </div>
        <div className="filter-group__right">
          <Search
            mini
            handleSearch={handleSearch}
          />
        </div>
      </div>
      {
        currentPlanets.map(planet => (
          <React.Fragment key={planet.id}>
            <ListItem
              imagePosition={imagePosition}
              title={planet.title}
              subtitle={planet.subtitle}
              description={planet.description}
              link={planet.link}
              imageLink={planet.imageLink}
              view={view}
            />
          </React.Fragment>
        ))
      }
      <Pagination
        items={planets}
        resultsPerPage={resultsPerPage}
        changeResultPage={setCurrentPage}
        currentPage={currentPage}
      />
    </Section>
  );
};

MainPlanets.propTypes = {
  planets: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default MainPlanets;

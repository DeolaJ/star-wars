import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Section from './partials/section';
import Search from './partials/search';
import Pagination from './partials/pagination';
import ListItem from './partials/list-item';

const MainStarships = ({ starships }) => {
  const handleSearch = () => null;
  const [currentPage, setCurrentPage] = useState(1);
  const [filtered, setFiltered] = useState(starships);
  const resultsPerPage = 10;
  const imagePosition = 'left';
  const view = 'grid';

  const recentResultsEndIndex = currentPage * resultsPerPage;
  const firstResultIndex = recentResultsEndIndex - resultsPerPage;
  const currentStarships = starships.slice(firstResultIndex, recentResultsEndIndex);

  return (
    <Section
      title="Starwars Starships"
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
        currentStarships.map(starship => (
          <React.Fragment key={starship.id}>
            <ListItem
              imagePosition={imagePosition}
              title={starship.title}
              subtitle={starship.subtitle}
              description={starship.description}
              link={starship.link}
              imageLink={starship.imageLink}
              view={view}
            />
          </React.Fragment>
        ))
      }
      <Pagination
        items={starships}
        resultsPerPage={resultsPerPage}
        changeResultPage={setCurrentPage}
        currentPage={currentPage}
      />
    </Section>
  );
};

MainStarships.propTypes = {
  starships: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default MainStarships;

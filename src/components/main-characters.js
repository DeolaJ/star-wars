import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Section from './partials/section';
import Search from './partials/search';
import Pagination from './partials/pagination';
import ListItem from './partials/list-item';

const MainCharacters = ({ characters }) => {
  const handleSearch = () => null;
  const [currentPage, setCurrentPage] = useState(1);
  const [filtered, setFiltered] = useState(characters);
  const resultsPerPage = 10;
  const imagePosition = 'left';
  const view = 'grid';

  const recentResultsEndIndex = currentPage * resultsPerPage;
  const firstResultIndex = recentResultsEndIndex - resultsPerPage;
  const currentCharacters = characters.slice(firstResultIndex, recentResultsEndIndex);

  return (
    <Section
      title="Starwars Characters"
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
        currentCharacters.map(character => (
          <React.Fragment key={character.id}>
            <ListItem
              imagePosition={imagePosition}
              title={character.title}
              subtitle={character.subtitle}
              description={character.description}
              link={character.link}
              imageLink={character.imageLink}
              view={view}
            />
          </React.Fragment>
        ))
      }
      <Pagination
        items={characters}
        resultsPerPage={resultsPerPage}
        changeResultPage={setCurrentPage}
        currentPage={currentPage}
      />
    </Section>
  );
};

MainCharacters.propTypes = {
  characters: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default MainCharacters;

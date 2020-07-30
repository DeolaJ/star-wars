import React, { useState, useEffect, useRef } from 'react';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import Fade from 'react-reveal/Fade';
import Section from './partials/section';
import SearchResult from './partials/search-result';
import SearchBar from './partials/searchbar';
import Pagination from './partials/pagination';
import ListItem from './partials/list-item';
import Dropdown from './partials/dropdown';

const MainStarships = ({
  starships, loadingStarshipsError, doSearchStarships, resetSearchStarships,
  isFilteringStarships, starshipsSearch, allFilteredStarships,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams, setSearchParams] = useState('');
  const [view, setView] = useState('grid');

  const performSearch = useRef(debounce((searchParams) => {
    if (searchParams.length > 0) {
      doSearchStarships(starships, searchParams);
    } else {
      resetSearchStarships();
    }
  }, 1000));

  useEffect(() => performSearch.current(searchParams), [searchParams]);

  const resultsPerPage = 10;
  const imagePosition = 'top';

  const recentResultsEndIndex = currentPage * resultsPerPage;
  const firstResultIndex = recentResultsEndIndex - resultsPerPage;
  const currentStarships = starships.slice(firstResultIndex, recentResultsEndIndex);

  const viewOptions = [
    {
      label: 'Grid',
      value: 'grid'
    },
    {
      label: 'List',
      value: 'list'
    },
  ];

  return (
    <Section
      title="Starwars Starships"
    >
      {
        !isEmpty(loadingStarshipsError.message)
        ? (
          <p>
            {`There was an error while loading Star Wars Characters: ${loadingStarshipsError.message}`}
          </p>
        )
        : (
          <>
            <div className="filter-group">
              <div className="filter-group__left">
                <Dropdown
                  options={viewOptions}
                  setValue={view}
                  changeSetValue={setView}
                />
              </div>
              <div className="filter-group__right">
                <SearchBar
                  mini
                  handleSearch={setSearchParams}
                />
              </div>
            </div>
            {
              isFilteringStarships

              ? (
                <Fade>
                  <SearchResult
                    type="specific"
                    category="starships"
                    allFilteredStarships={allFilteredStarships}
                    starshipsSearch={starshipsSearch}
                    view={view}
                  />
                </Fade>
              )

              : (
                <>
                  {
                    currentStarships.map(starship => (
                      <React.Fragment key={starship.name}>
                        <ListItem
                          imagePosition={imagePosition}
                          name={starship.name}
                          type="starships"
                          cargo={starship.cargo_capacity}
                          model={starship.model}
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
                </>
              )
            }
          </>
        )
      }
    </Section>
  );
};

MainStarships.propTypes = {
  starships: PropTypes.arrayOf(PropTypes.object).isRequired,
  loadingStarshipsError: PropTypes.object.isRequired,
  doSearchStarships: PropTypes.func.isRequired,
  resetSearchStarships: PropTypes.func.isRequired,
};

export default MainStarships;

import React, { useState, useRef, useEffect } from 'react';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import Section from './partials/section';
import SearchBar from './partials/searchbar';
import SearchResult from './partials/search-result';
import Pagination from './partials/pagination';
import ListItem from './partials/list-item';
import Dropdown from './partials/dropdown';

const MainPlanets = ({
  planetsPaging, doFetchPlanetsPage, loadingPlanetsError, doSearchPlanets, resetSearchPlanets,
  isFilteringPlanets, planetsSearch, allFilteredPlanets,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams, setSearchParams] = useState('');
  const [view, setView] = useState('grid');

  const performSearch = useRef(debounce((searchParams) => {
    if (searchParams.length > 0) {
      doSearchPlanets(searchParams);
    } else {
      resetSearchPlanets();
    }
  }, 1000));

  useEffect(() => performSearch.current(searchParams), [searchParams]);

  // Pages after the first are fetched when the user opens them. Page 1 is the
  // app's initial load, and retrying it here would loop through the app loader
  // whenever the API is down.
  useEffect(() => {
    if (currentPage > 1) {
      doFetchPlanetsPage(currentPage);
    }
  }, [currentPage, doFetchPlanetsPage]);

  const pageError = planetsPaging.errors[currentPage];
  const pageLoading = planetsPaging.loading[currentPage];

  const resultsPerPage = 10;
  const imagePosition = 'left';

  const currentPlanets = planetsPaging.pages[currentPage] || [];

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
      title="Starwars Planets"
    >
      {
        !isEmpty(loadingPlanetsError.message)
        ? (
          <p>
            {`There was an error while loading Star Wars Planets: ${loadingPlanetsError.message}`}
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
              isFilteringPlanets

              ? (
                <SearchResult
                  type="specific"
                  category="planets"
                  allFilteredPlanets={allFilteredPlanets}
                  planetsSearch={planetsSearch}
                  view={view}
                />
              )

              : (
                <>
                  {
                    pageError && (
                      <p>
                        {`There was an error while loading page ${currentPage}: ${pageError.message}`}
                      </p>
                    )
                  }
                  {
                    !pageError && pageLoading && (
                      <p>
                        {`Loading page ${currentPage}...`}
                      </p>
                    )
                  }
                  {
                    currentPlanets.map(planet => (
                      <React.Fragment key={planet.name}>
                        <ListItem
                          item={planet}
                          imagePosition={imagePosition}
                          name={planet.name}
                          type="planets"
                          population={planet.population}
                          temperature={planet.temperature}
                          view={view}
                        />
                      </React.Fragment>
                    ))
                  }
                  <Pagination
                    totalItems={planetsPaging.count}
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

MainPlanets.propTypes = {
  planets: PropTypes.arrayOf(PropTypes.object).isRequired,
  planetsPaging: PropTypes.shape({
    count: PropTypes.number,
    pages: PropTypes.object,
    loading: PropTypes.object,
    errors: PropTypes.object,
  }).isRequired,
  doFetchPlanetsPage: PropTypes.func.isRequired,
  loadingPlanetsError: PropTypes.object.isRequired,
  doSearchPlanets: PropTypes.func.isRequired,
  resetSearchPlanets: PropTypes.func.isRequired,
  isFilteringPlanets: PropTypes.bool.isRequired,
  planetsSearch: PropTypes.objectOf(PropTypes.array).isRequired,
  allFilteredPlanets: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default MainPlanets;

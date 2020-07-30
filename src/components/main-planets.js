import React, { useState, useRef, useEffect } from 'react';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import Fade from 'react-reveal/Fade';
import Section from './partials/section';
import SearchBar from './partials/searchbar';
import SearchResult from './partials/search-result';
import Pagination from './partials/pagination';
import ListItem from './partials/list-item';
import Dropdown from './partials/dropdown';

const MainPlanets = ({
  planets, loadingPlanetsError, doSearchPlanets, resetSearchPlanets,
  isFilteringPlanets, planetsSearch, allFilteredPlanets,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams, setSearchParams] = useState('');
  const [view, setView] = useState('grid');

  const performSearch = useRef(debounce((searchParams) => {
    if (searchParams.length > 0) {
      doSearchPlanets(planets, searchParams);
    } else {
      resetSearchPlanets();
    }
  }, 1000));

  useEffect(() => performSearch.current(searchParams), [searchParams]);

  const resultsPerPage = 10;
  const imagePosition = 'left';

  const recentResultsEndIndex = currentPage * resultsPerPage;
  const firstResultIndex = recentResultsEndIndex - resultsPerPage;
  const currentPlanets = planets.slice(firstResultIndex, recentResultsEndIndex);

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
                <Fade>
                  <SearchResult
                    type="specific"
                    category="planets"
                    allFilteredPlanets={allFilteredPlanets}
                    planetsSearch={planetsSearch}
                    view={view}
                  />
                </Fade>
              )

              : (
                <>
                  {
                    currentPlanets.map(planet => (
                      <React.Fragment key={planet.name}>
                        <ListItem
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
                    items={planets}
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
  loadingPlanetsError: PropTypes.object.isRequired,
  doSearchPlanets: PropTypes.func.isRequired,
  resetSearchPlanets: PropTypes.func.isRequired,
};

export default MainPlanets;

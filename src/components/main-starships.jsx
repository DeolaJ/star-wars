import React, { useState, useEffect, useRef } from 'react';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import Section from './partials/section';
import SearchResult from './partials/search-result';
import SearchBar from './partials/searchbar';
import Pagination from './partials/pagination';
import ListItem from './partials/list-item';
import Dropdown from './partials/dropdown';

const MainStarships = ({
  starshipsPaging, doFetchStarshipsPage, loadingStarshipsError, doSearchStarships, resetSearchStarships,
  isFilteringStarships, starshipsSearch, allFilteredStarships,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams, setSearchParams] = useState('');
  const [view, setView] = useState('grid');

  const performSearch = useRef(debounce((searchParams) => {
    if (searchParams.length > 0) {
      doSearchStarships(searchParams);
    } else {
      resetSearchStarships();
    }
  }, 1000));

  useEffect(() => performSearch.current(searchParams), [searchParams]);

  // Pages after the first are fetched when the user opens them. Page 1 is the
  // app's initial load, and retrying it here would loop through the app loader
  // whenever the API is down.
  useEffect(() => {
    if (currentPage > 1) {
      doFetchStarshipsPage(currentPage);
    }
  }, [currentPage, doFetchStarshipsPage]);

  const pageError = starshipsPaging.errors[currentPage];
  const pageLoading = starshipsPaging.loading[currentPage];

  const resultsPerPage = 10;
  const imagePosition = 'top';

  const currentStarships = starshipsPaging.pages[currentPage] || [];

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
                <SearchResult
                  type="specific"
                  category="starships"
                  allFilteredStarships={allFilteredStarships}
                  starshipsSearch={starshipsSearch}
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
                    currentStarships.map(starship => (
                      <React.Fragment key={starship.name}>
                        <ListItem
                          item={starship}
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
                    totalItems={starshipsPaging.count}
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
  starshipsPaging: PropTypes.shape({
    count: PropTypes.number,
    pages: PropTypes.object,
    loading: PropTypes.object,
    errors: PropTypes.object,
  }).isRequired,
  doFetchStarshipsPage: PropTypes.func.isRequired,
  loadingStarshipsError: PropTypes.object.isRequired,
  doSearchStarships: PropTypes.func.isRequired,
  resetSearchStarships: PropTypes.func.isRequired,
  isFilteringStarships: PropTypes.bool.isRequired,
  starshipsSearch: PropTypes.objectOf(PropTypes.array).isRequired,
  allFilteredStarships: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default MainStarships;

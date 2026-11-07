import React, { useState, useEffect, useRef } from 'react';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import Section from './partials/section';
import SearchBar from './partials/searchbar';
import SearchResult from './partials/search-result';
import Pagination from './partials/pagination';
import ListItem from './partials/list-item';
import Dropdown from './partials/dropdown';

const MainCharacters = ({
  charactersPaging, doFetchCharactersPage, loadingCharactersError, doSearchCharacters, resetSearchCharacters,
  isFilteringCharacters, charactersSearch, allFilteredCharacters,
 }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams, setSearchParams] = useState('');
  const [view, setView] = useState('grid');
  const resultsPerPage = 10;
  const imagePosition = 'left';

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
  const currentCharacters = charactersPaging.pages[currentPage] || [];

  const performSearch = useRef(debounce((searchParams) => {
    if (searchParams.length > 0) {
      doSearchCharacters(searchParams);
    } else {
      resetSearchCharacters()
    }
  }, 1000));

  useEffect(() => performSearch.current(searchParams), [searchParams]);

  // Pages after the first are fetched when the user opens them. Page 1 is the
  // app's initial load, and retrying it here would loop through the app loader
  // whenever the API is down.
  useEffect(() => {
    if (currentPage > 1) {
      doFetchCharactersPage(currentPage);
    }
  }, [currentPage, doFetchCharactersPage]);

  const pageError = charactersPaging.errors[currentPage];
  const pageLoading = charactersPaging.loading[currentPage];

  return (
    <Section
      title="Starwars Characters"
    >
      {
        !isEmpty(loadingCharactersError.message)
        ? (
          <p>
            {`There was an error while loading Star Wars Characters: ${loadingCharactersError.message}`}
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
              isFilteringCharacters

              ? (
                <SearchResult
                  type="specific"
                  category="characters"
                  allFilteredCharacters={allFilteredCharacters}
                  charactersSearch={charactersSearch}
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
                    currentCharacters.map(character => (
                      <React.Fragment key={character.name}>
                        <ListItem
                          item={character}
                          imagePosition={imagePosition}
                          name={character.name}
                          type="characters"
                          birthyear={character.birth_year}
                          view={view}
                        />
                      </React.Fragment>
                    ))
                  }
                  <Pagination
                    totalItems={charactersPaging.count}
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

MainCharacters.propTypes = {
  characters: PropTypes.arrayOf(PropTypes.object).isRequired,
  charactersPaging: PropTypes.shape({
    count: PropTypes.number,
    pages: PropTypes.object,
    loading: PropTypes.object,
    errors: PropTypes.object,
  }).isRequired,
  doFetchCharactersPage: PropTypes.func.isRequired,
  loadingCharactersError: PropTypes.object.isRequired,
  doSearchCharacters: PropTypes.func.isRequired,
  resetSearchCharacters: PropTypes.func.isRequired,
  isFilteringCharacters: PropTypes.bool.isRequired,
  charactersSearch: PropTypes.objectOf(PropTypes.array).isRequired,
  allFilteredCharacters: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default MainCharacters;

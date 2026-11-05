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
  characters, charactersPaging, doFetchCharactersPage, loadingCharactersError, doSearchCharacters, resetSearchCharacters,
  isFilteringCharacters, charactersSearch, allFilteredCharacters,
 }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams, setSearchParams] = useState('');
  const [gender, setGender] = useState('all');
  const [view, setView] = useState('grid');
  const resultsPerPage = 10;
  const imagePosition = 'left';
  const genderOptions = [
    {
      label: 'All',
      value: 'all'
    },
    {
      label: 'Male',
      value: 'male'
    },
    {
      label: 'Female',
      value: 'female'
    },
  ];

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
  const recentResultsEndIndex = currentPage * resultsPerPage;
  const firstResultIndex = recentResultsEndIndex - resultsPerPage;
  let currentCharacters = charactersPaging.pages[currentPage] || [];

  // Filter Characters by Gender
  const doFilterGender = (gender) => (
    characters.filter(character => {
      const characterGender = character.gender.toLowerCase();
      const genderfilter = gender.toLowerCase();
      return characterGender === genderfilter;
    })
  );

  const performSearch = useRef(debounce((searchParams) => {
    if (searchParams.length > 0) {
      doSearchCharacters(searchParams);
    } else {
      resetSearchCharacters()
    }
  }, 1000));

  const updatedFilter = useRef((characters) => {
    if (gender === 'all') {
      currentCharacters = characters.slice(firstResultIndex, recentResultsEndIndex);
    } else {
      currentCharacters = doFilterGender(gender)
    }
  });

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
  // useEffect(() => updatedFilter.current(characters), [gender, characters]);

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
                  options={genderOptions}
                  setValue={gender}
                  changeSetValue={setGender}
                />
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
};

export default MainCharacters;

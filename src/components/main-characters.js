import React, { useState, useEffect, useRef } from 'react';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';
import Fade from 'react-reveal/Fade';
import PropTypes from 'prop-types';
import Section from './partials/section';
import SearchBar from './partials/searchbar';
import SearchResult from './partials/search-result';
import Pagination from './partials/pagination';
import ListItem from './partials/list-item';
import Dropdown from './partials/dropdown';

const MainCharacters = ({
  characters, loadingCharactersError, doSearchCharacters, resetSearchCharacters,
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
  let currentCharacters = characters.slice(firstResultIndex, recentResultsEndIndex);

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
      doSearchCharacters(characters, searchParams);
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
                <Fade>
                  <SearchResult
                    type="specific"
                    category="characters"
                    allFilteredCharacters={allFilteredCharacters}
                    charactersSearch={charactersSearch}
                    view={view}
                  />
                </Fade>
              ) 
              : (
                <>
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
                    items={characters}
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
  loadingCharactersError: PropTypes.object.isRequired,
  doSearchCharacters: PropTypes.func.isRequired,
  resetSearchCharacters: PropTypes.func.isRequired,
};

export default MainCharacters;

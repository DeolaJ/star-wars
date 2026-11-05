import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import MainCharacters from './main-characters';
import Layout from './layout';

const Characters = ({
  characters, charactersPaging, doFetchCharactersPage, loadingCharactersError, allFilteredCharacters, charactersSearch, 
  isFilteringCharacters, doSearchAll, resetSearchAll, resetSearchCharacters,
  doSearchCharacters,
}) => {
  useEffect(() => {
    return () => resetSearchAll()
  }, [resetSearchAll]);

  useEffect(() => {
    return () => resetSearchCharacters()
  }, [resetSearchCharacters]);
  return (
    <Layout
      doSearchAll={doSearchAll}
      resetSearchAll={resetSearchAll}
    >
      <MainCharacters 
        characters={characters}
        charactersPaging={charactersPaging}
        doFetchCharactersPage={doFetchCharactersPage}
        loadingCharactersError={loadingCharactersError}
        resetSearchCharacters={resetSearchCharacters}
        doSearchCharacters={doSearchCharacters}
        isFilteringCharacters={isFilteringCharacters}
        allFilteredCharacters={allFilteredCharacters}
        charactersSearch={charactersSearch}
      />
    </Layout>
  );
};

Characters.propTypes = {
  characters: PropTypes.arrayOf(PropTypes.object).isRequired,
  charactersPaging: PropTypes.object.isRequired,
  doFetchCharactersPage: PropTypes.func.isRequired,
  loadingCharactersError: PropTypes.object.isRequired,
  charactersSearch: PropTypes.objectOf(PropTypes.array).isRequired,
  allFilteredCharacters: PropTypes.arrayOf(PropTypes.object).isRequired,
  isFilteringCharacters: PropTypes.bool.isRequired,
  doSearchAll: PropTypes.func.isRequired,
  resetSearchAll: PropTypes.func.isRequired,
  doSearchCharacters: PropTypes.func.isRequired,
  resetSearchCharacters: PropTypes.func.isRequired,
};

export default Characters;

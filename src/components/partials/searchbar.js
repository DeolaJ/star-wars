import React, { useState, useRef, useEffect } from 'react';
import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';

const SearchBar = ({ handleSearch, mini }) => {
  const [searchValue, setSearchValue] = useState('')
  const updateSearchValue = useRef(debounce((value) => {
    handleSearch(value);
  }, 1000));

  useEffect(() => updateSearchValue.current(searchValue), [searchValue]);

  return (
    <div className={`searchbar ${mini ? 'mini' : null}`}>
      <input
        type="text"
        onChange={(e) => setSearchValue(e.target.value)}
        onBlur={(e) => setSearchValue(e.target.value)}
        value={searchValue}
        className="searchbar__input"
      />
      <div className="searchbar__icon">
        icon
      </div>
    </div>
  );
};

SearchBar.defaultProps = {
  mini: false,
}

SearchBar.propTypes = {
  handleSearch: PropTypes.func.isRequired,
  mini: PropTypes.bool,
};

export default SearchBar;
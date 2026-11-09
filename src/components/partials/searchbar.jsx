import React, { useState, useRef, useEffect } from 'react';
import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';
import Search from '../../assets/search.svg';

// The box types straight away and tells its parent once the typing stops, so
// the address bar is not rewritten on every keystroke. `value` is where the
// query lives (the URL), and the box follows it when it changes from somewhere
// else, such as the back button or a shared link.
const SearchBar = ({ handleSearch, value = '', mini = false, label = 'Search' }) => {
  const [searchValue, setSearchValue] = useState(value);
  // The last value this box handed over, so a change coming back from the URL
  // is told apart from one the user is still typing
  const reported = useRef(value);
  // The waiting is set up once, so it has to reach the current handler rather
  // than the one it was created with: that one would build the next URL out of
  // the parameters as they were when the box first appeared, dropping any page,
  // sort or filter chosen since.
  const latest = useRef(handleSearch);
  latest.current = handleSearch;
  const report = useRef(debounce((text) => {
    reported.current = text;
    latest.current(text);
  }, 1000));

  useEffect(() => {
    if (searchValue === reported.current) return;
    report.current(searchValue);
  }, [searchValue]);

  useEffect(() => {
    if (value === reported.current) return;
    reported.current = value;
    setSearchValue(value);
  }, [value]);

  return (
    <div className={`searchbar ${mini ? 'mini' : ''}`}>
      <input
        type="text"
        onChange={(e) => setSearchValue(e.target.value)}
        onBlur={(e) => setSearchValue(e.target.value)}
        value={searchValue}
        placeholder="Enter a search item"
        aria-label={label}
        className="searchbar__input"
      />
      <div className="searchbar__icon">
        <img src={Search} alt="search bar icon" />
      </div>
    </div>
  );
};

SearchBar.propTypes = {
  handleSearch: PropTypes.func.isRequired,
  value: PropTypes.string,
  mini: PropTypes.bool,
  // What the box searches, for assistive technology; the placeholder is only a hint
  label: PropTypes.string,
};

export default SearchBar;

import React from 'react';
import PropTypes from 'prop-types';

// A plain controlled select. The value belongs to whoever renders it — on the
// list pages that is the URL — so it follows the back and forward buttons
// instead of keeping a copy of its own that could drift out of step.
const noop = () => {};

const DropdownOption = ({
  setValue, options, changeSetValue, label, onFocus = noop,
}) => (
  <select
    value={setValue}
    onChange={(e) => changeSetValue(e.target.value)}
    onFocus={onFocus}
    className="dropdown"
    aria-label={label}
  >
    {
      options.map((option) => (
        <option
          key={option.label}
          value={option.value}
          className="dropdown__option"
        >
          {option.label}
        </option>
      ))
    }
  </select>
);

DropdownOption.propTypes = {
  setValue: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.object).isRequired,
  changeSetValue: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  // Called when the menu is opened, so the page can load what it needs to fill it
  onFocus: PropTypes.func,
};

export default DropdownOption;

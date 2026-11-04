/* eslint-disable max-lines-per-function */
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const DropdownOption = ({
  setValue, options, changeSetValue,
}) => {
  const [dropdownValue, setDropdownValue] = useState(setValue);

  const updateDropdown = useRef((value) => {
    if (setValue !== value) {
      changeSetValue(value);
    }
  });

  useEffect(() => updateDropdown.current(dropdownValue), [dropdownValue]);

  return (
    <select
      value={dropdownValue}
      onChange={(e) => setDropdownValue(e.target.value)}
      onBlur={(e) => setDropdownValue(e.target.value)}
      className="dropdown"
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
};

DropdownOption.propTypes = {
  setValue: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.object).isRequired,
  changeSetValue: PropTypes.func.isRequired,
};

export default DropdownOption;

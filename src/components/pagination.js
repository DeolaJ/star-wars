import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

const Pagination = ({ items, resultsPerPage, changeResultPage }) => {
  const pageNumbers = useMemo(() => {
    const pageNumbers = [];
    const parts = Math.ceil(items.length / resultsPerPage);
    for (let i = 1; i <= parts; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers
  }, [items, resultsPerPage]);

  return (
    <div className="pagination">
      <ul className="pagination__list">
        {
          pageNumbers.map(number => (
            <li
              key={number}
              className="pagination__item"
            >
              <button 
                type="button"
                id={number}
                onClick={changeResultPage}
                className="pagination__button"
              >
                {number}
              </button>
            </li>
          ))
        }
      </ul>
    </div>
  );
};

Pagination.propTypes = {
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
  resultsPerPage: PropTypes.number.isRequired,
  changeResultPage: PropTypes.func.isRequired,
};

export default Pagination;
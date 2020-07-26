import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

const Pagination = ({
  items, currentPage, resultsPerPage, changeResultPage,
}) => {
  const parts = Math.ceil(items.length / resultsPerPage);
  const pageNumbers = useMemo(() => {
    const pageNumbers = [];
    for (let i = 1; i <= parts; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers
  }, [parts]);

  return (
    <div className="pagination">
      <ul className="pagination__list">
        {
          pageNumbers.map(number => (
            <li
              key={number}
              className={`pagination__item ${number === currentPage ? 'active' : null}`}
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
        <div className="pagination__controls">
          <button
            typ="button"
            onClick={() => (currentPage > 1) && changeResultPage(currentPage - 1)}
          >
            Previous
          </button>
          <button
            typ="button"
            onClick={() => (currentPage <= parts) && changeResultPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </ul>
    </div>
  );
};

Pagination.propTypes = {
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
  resultsPerPage: PropTypes.number.isRequired,
  changeResultPage: PropTypes.func.isRequired,
  currentPage: PropTypes.number.isRequired,
};

export default Pagination;
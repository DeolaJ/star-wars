import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import RightChevron from '../../assets/chevron-right.svg';
import LeftChevron from '../../assets/chevron-left.svg';

// Page controls, as a navigation landmark with the current page marked up as
// such rather than by colour alone
const Pagination = ({
  totalItems, currentPage, resultsPerPage, changeResultPage,
}) => {
  const parts = Math.ceil(totalItems / resultsPerPage);
  const pageNumbers = useMemo(() => {
    const pageNumbers = [];
    for (let i = 1; i <= parts; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers
  }, [parts]);

  return (
    <nav className="pagination" aria-label="Pagination">
      <ul className="pagination__list">
        {
          pageNumbers.map(number => (
            <li
              key={number}
              className={`pagination__item ${number === currentPage ? 'active' : ''}`}
            >
              <button 
                type="button"
                onClick={() => changeResultPage(number)}
                className="pagination__button"
                aria-current={number === currentPage ? 'page' : undefined}
              >
                {number}
              </button>
            </li>
          ))
        }
      </ul>
      <div className="pagination__controls">
        <button
          type="button"
          onClick={() => (currentPage > 1) && changeResultPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <img src={LeftChevron} alt="previous icon" />
        </button>
        <button
          type="button"
          onClick={() => (currentPage < parts) && changeResultPage(currentPage + 1)}
          disabled={currentPage === (parts)}
        >
          <img src={RightChevron} alt="next icon" />
        </button>
      </div>
    </nav>
  );
};

Pagination.propTypes = {
  totalItems: PropTypes.number.isRequired,
  resultsPerPage: PropTypes.number.isRequired,
  changeResultPage: PropTypes.func.isRequired,
  currentPage: PropTypes.number.isRequired,
};

export default Pagination;

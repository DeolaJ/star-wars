import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import RightChevron from '../../assets/chevron-right.svg';
import LeftChevron from '../../assets/chevron-left.svg';

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
                onClick={() => changeResultPage(number)}
                className="pagination__button"
              >
                {number}
              </button>
            </li>
          ))
        }
      </ul>
      <div className="pagination__controls">
        <button
          typ="button"
          onClick={() => (currentPage > 1) && changeResultPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <img src={LeftChevron} alt="previous icon" />
        </button>
        <button
          typ="button"
          onClick={() => (currentPage < parts) && changeResultPage(currentPage + 1)}
          disabled={currentPage === (parts)}
        >
          <img src={RightChevron} alt="next icon" />
        </button>
      </div>
    </div>
  );
};

Pagination.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  resultsPerPage: PropTypes.number.isRequired,
  changeResultPage: PropTypes.func.isRequired,
  currentPage: PropTypes.number.isRequired,
};

export default Pagination;
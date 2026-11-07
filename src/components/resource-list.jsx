import React, { useState, useEffect, useRef } from 'react';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import Section from './partials/section';
import SearchBar from './partials/searchbar';
import SearchResult from './partials/search-result';
import Pagination from './partials/pagination';
import ListItem from './partials/list-item';
import Dropdown from './partials/dropdown';
import { RESOURCES, RESOURCE_KEYS } from '../resources';
import { resourceDataShape } from './resource-props';

// SWAPI returns 10 results per page, so a page of the list is one request
const RESULTS_PER_PAGE = 10;

const VIEW_OPTIONS = [
  { label: 'Grid', value: 'grid' },
  { label: 'List', value: 'list' },
];

// The paginated, searchable list of one resource
const ResourceList = ({
  resource, data, doFetchPage, doSearch, resetSearch,
}) => {
  const { label, imagePosition } = RESOURCES[resource];
  const { paging, error, filtered, isFiltering } = data;
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState('');
  const [view, setView] = useState('grid');

  const performSearch = useRef(debounce((text) => {
    if (text.length > 0) {
      doSearch(resource, text);
    } else {
      resetSearch(resource);
    }
  }, 1000));

  useEffect(() => performSearch.current(query), [query]);

  // Pages after the first are fetched when the user opens them. Page 1 is the
  // app's initial load, and retrying it here would loop through the app loader
  // whenever the API is down.
  useEffect(() => {
    if (currentPage > 1) {
      doFetchPage(resource, currentPage);
    }
  }, [resource, currentPage, doFetchPage]);

  const items = paging.pages[currentPage] || [];
  const pageError = paging.errors[currentPage];
  const pageLoading = paging.loading[currentPage];

  return (
    <Section
      title={`Starwars ${label}`}
    >
      {
        !isEmpty(error.message)
        ? (
          <p>
            {`There was an error while loading Star Wars ${label}: ${error.message}`}
          </p>
        )
        : (
          <>
            <div className="filter-group">
              <div className="filter-group__left">
                <Dropdown
                  options={VIEW_OPTIONS}
                  setValue={view}
                  changeSetValue={setView}
                />
              </div>
              <div className="filter-group__right">
                <SearchBar
                  mini
                  handleSearch={setQuery}
                />
              </div>
            </div>
            {
              isFiltering
              ? (
                <SearchResult
                  category={resource}
                  items={filtered}
                  view={view}
                />
              )
              : (
                <>
                  {
                    pageError && (
                      <p>
                        {`There was an error while loading page ${currentPage}: ${pageError.message}`}
                      </p>
                    )
                  }
                  {
                    !pageError && pageLoading && (
                      <p>
                        {`Loading page ${currentPage}...`}
                      </p>
                    )
                  }
                  {
                    items.map(item => (
                      <ListItem
                        key={item.name}
                        item={item}
                        type={resource}
                        imagePosition={imagePosition.page}
                        view={view}
                      />
                    ))
                  }
                  <Pagination
                    totalItems={paging.count}
                    resultsPerPage={RESULTS_PER_PAGE}
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

ResourceList.propTypes = {
  resource: PropTypes.oneOf(RESOURCE_KEYS).isRequired,
  data: resourceDataShape.isRequired,
  doFetchPage: PropTypes.func.isRequired,
  doSearch: PropTypes.func.isRequired,
  resetSearch: PropTypes.func.isRequired,
};

export default ResourceList;

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import Section from './partials/section';
import SearchBar from './partials/searchbar';
import SearchResult from './partials/search-result';
import Pagination from './partials/pagination';
import ListItem from './partials/list-item';
import Dropdown from './partials/dropdown';
import { RESOURCES, RESOURCE_KEYS, filterValues, filterItems, sortItems } from '../resources';
import { API_PAGE_SIZE } from '../config';
import { useListParams } from '../use-list-params';
import { resourceDataShape } from './resource-props';

const VIEW_OPTIONS = [
  { label: 'Grid', value: 'grid' },
  { label: 'List', value: 'list' },
];

// Both directions of every field the resource can be ordered by
const sortOptions = (sortFields) => [
  { label: 'Sort by…', value: '' },
  ...sortFields.flatMap(({ field, label, numeric }) => [
    { label: `${label} ${numeric ? '(low to high)' : '(A–Z)'}`, value: field },
    { label: `${label} ${numeric ? '(high to low)' : '(Z–A)'}`, value: `-${field}` },
  ]),
];

// The paginated, searchable list of one resource. The URL holds the search,
// page, sort and filters, so the list is simply a view of the address bar.
const ResourceList = ({
  resource, data, doFetchPage, doFetchAll, doSearch, resetSearch,
}) => {
  const { label, imagePosition, sortFields } = RESOURCES[resource];
  const { paging, error, filtered, isFiltering, items: allItems } = data;
  const {
    query, page, sort, filters, isProcessing, filterFields,
    setQuery, setPage, setSort, setFilter,
  } = useListParams(resource);
  const [view, setView] = useState('grid');

  // Filtering or sorting needs every item, so the rest of the pages are fetched
  // the moment either is in use — including when a shared link arrives with one
  // already set. Plain browsing still loads only the page being looked at.
  useEffect(() => {
    if (isProcessing) doFetchAll(resource);
  }, [resource, isProcessing, doFetchAll]);

  // Opening either menu is the earliest sign the whole resource is wanted, so
  // the options are complete by the time one is picked
  const loadAll = useCallback(() => doFetchAll(resource), [resource, doFetchAll]);

  // Pages after the first are fetched when they are opened. Page 1 is the
  // app's initial load, and asking for it again here would loop: the retry
  // turns the app-wide loading flag back on, which unmounts this list and
  // mounts it afresh, which asks again.
  useEffect(() => {
    if (page > 1) doFetchPage(resource, page);
  }, [resource, page, doFetchPage]);

  // The search in the address bar is the one that runs
  useEffect(() => {
    if (query) doSearch(resource, query);
    else resetSearch(resource);
  }, [resource, query, doSearch, resetSearch]);

  const totalPages = Math.ceil(paging.count / API_PAGE_SIZE);
  const loadedEveryPage = paging.count > 0 && Object.keys(paging.pages).length >= totalPages;

  // Filter options come from the items themselves, since the API keeps adding
  // classes and climates that no fixed list would know about
  const options = useMemo(() => (
    filterFields.map(({ field, label: name }) => ({
      field,
      label: name,
      values: filterValues(allItems, field),
    }))
  ), [filterFields, allItems]);

  // Search results, or the whole resource when filtering or sorting, or just
  // the page the API gave us
  const source = isFiltering ? filtered : (isProcessing ? allItems : (paging.pages[page] || []));
  const processed = useMemo(
    () => sortItems(filterItems(source, filters), sort, sortFields),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [source, JSON.stringify(filters), sort, sortFields],
  );

  // A filtered or sorted list is paged here; an unprocessed one is already a
  // single page from the API
  const paged = isProcessing && !isFiltering
    ? processed.slice((page - 1) * API_PAGE_SIZE, page * API_PAGE_SIZE)
    : processed;
  const totalItems = isProcessing ? processed.length : paging.count;

  const pageError = paging.errors[page];
  const pageLoading = !isProcessing && paging.loading[page];

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
                  label="View"
                />
                {
                  options.map(({ field, label: name, values }) => (
                    <Dropdown
                      key={field}
                      options={[
                        { label: 'All', value: '' },
                        ...values.map(value => ({ label: value, value })),
                      ]}
                      setValue={filters[field] || ''}
                      changeSetValue={(value) => setFilter(field, value)}
                      onFocus={loadAll}
                      label={name}
                    />
                  ))
                }
                <Dropdown
                  options={sortOptions(sortFields)}
                  setValue={sort}
                  changeSetValue={setSort}
                  onFocus={loadAll}
                  label="Sort"
                />
              </div>
              <div className="filter-group__right">
                <SearchBar
                  mini
                  value={query}
                  handleSearch={setQuery}
                />
              </div>
            </div>
            {
              isProcessing && !loadedEveryPage && (
                <p>
                  {`Loading all ${label.toLowerCase()}...`}
                </p>
              )
            }
            {
              isFiltering
              ? (
                <SearchResult
                  category={resource}
                  items={paged}
                  view={view}
                />
              )
              : (
                <>
                  {
                    pageError && (
                      <p>
                        {`There was an error while loading page ${page}: ${pageError.message}`}
                      </p>
                    )
                  }
                  {
                    !pageError && pageLoading && (
                      <p>
                        {`Loading page ${page}...`}
                      </p>
                    )
                  }
                  {
                    paged.map(item => (
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
                    totalItems={totalItems}
                    resultsPerPage={API_PAGE_SIZE}
                    changeResultPage={setPage}
                    currentPage={page}
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
  doFetchAll: PropTypes.func.isRequired,
  doSearch: PropTypes.func.isRequired,
  resetSearch: PropTypes.func.isRequired,
};

export default ResourceList;

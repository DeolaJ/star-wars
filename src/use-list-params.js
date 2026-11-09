import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RESOURCES } from './resources';

// A list page keeps its state in the URL, so a link carries the search, page,
// sort and filters with it, and the browser's back and forward buttons restore
// them. Anything at its default (page 1, no query, no sort, no filter) is left
// out so ordinary links stay short.
export const useListParams = (resource) => {
  const [params, setParams] = useSearchParams();
  const { filters: fields, sortFields } = RESOURCES[resource];

  const query = params.get('q') || '';
  const sort = params.get('sort') || '';
  const page = Math.max(1, Math.trunc(Number(params.get('page'))) || 1);

  const filters = {};
  fields.forEach(({ field }) => {
    const value = params.get(field);
    if (value) filters[field] = value;
  });

  // `replace` is for typing, which would otherwise leave a history entry per
  // keystroke; choosing a page, sort or filter is a step worth going back to.
  const update = useCallback((changes, { replace = false } = {}) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) => {
      const empty = value === '' || value === null || value === undefined;
      if (empty || (key === 'page' && Number(value) <= 1)) next.delete(key);
      else next.set(key, String(value));
    });
    // Anything other than the page itself starts again at the first page
    if (!('page' in changes)) next.delete('page');
    setParams(next, { replace });
  }, [params, setParams]);

  return {
    query,
    page,
    sort,
    filters,
    // Whether the list has to be worked out from every item rather than served
    // a page at a time by the API
    isProcessing: Boolean(sort) || Object.keys(filters).length > 0,
    sortFields,
    filterFields: fields,
    setQuery: (value) => update({ q: value }, { replace: true }),
    setPage: (value) => update({ page: value }),
    setSort: (value) => update({ sort: value }),
    setFilter: (field, value) => update({ [field]: value }),
  };
};

export default useListParams;

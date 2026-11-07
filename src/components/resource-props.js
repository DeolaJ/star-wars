import PropTypes from 'prop-types';

// The state of one resource as gathered by selectResource
export const resourceDataShape = PropTypes.shape({
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  paging: PropTypes.shape({
    count: PropTypes.number,
    pages: PropTypes.object,
    loading: PropTypes.object,
    errors: PropTypes.object,
  }).isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.object.isRequired,
  search: PropTypes.objectOf(PropTypes.array).isRequired,
  filtered: PropTypes.arrayOf(PropTypes.object).isRequired,
  isFiltering: PropTypes.bool.isRequired,
});

// Every resource's state, by resource
export const resourcesShape = PropTypes.objectOf(resourceDataShape);

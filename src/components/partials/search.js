import React from 'react';
import PropTypes from 'prop-types';
import Section from './section';

const SearchResult = ({ type, results, active, view }) => {
  switch (type) {
    case 'all': {
      return (
        <div className="search-result_all">
          {
            results.map(section => (
              <Section 
                key={section.title} 
                title={section.title}
                view={view}
              >
                {
                  active
                  
                  ? section.children
                
                  : (
                    <p>No results were found for this search</p>
                  )
                }
              </Section>
            ))
          }
        </div>
      )
    }

    case 'specific': {
      return (
        <div className="search-result_specific">
          {
            results.map(section => (
              <Section 
                key={section.title} 
                title={section.title}
                view={view}
              >
                {
                  active
                  
                  ? section.children
                
                  : (
                    <p>No results were found for this search</p>
                  )
                }
              </Section>
            ))
          }
        </div>
      )
    }

    default: return null;
  }
};

SearchResult.propTypes = {
  type: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
  results: PropTypes.arrayOf(PropTypes.object).isRequired,
  view: PropTypes.string.isRequired,
};

export default SearchResult;

import React from 'react';
import PropTypes from 'prop-types';

const Section = ({ children, title }) => {
  return (
    <section className="section">
      <h2 className="section__title">
        {title}
      </h2>
      <div className="section__body">
        {children}
      </div>
    </section>
  );
};

Section.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
};

export default Section;
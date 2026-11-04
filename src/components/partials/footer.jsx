import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      &copy; { new Date().getFullYear() } 
      <a href="deola.xyz" target="_blank" rel="noopener noreferrer" className="footer__link">Deola</a>
    </footer>
  );
};

export default Footer;

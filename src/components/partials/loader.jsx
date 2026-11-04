import React from 'react';
import Banner from '../../assets/hero-banner.jpg';

const Loader = () => {
  return (
    <div 
      style={{ 
        background: "darkblue", display: 'flex', width: '100%', height: '100vh', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold',
        color: 'white', fontSize: '2rem', backgroundImage: `url(${Banner})`, backgroundSize: 'cover',
      }}
    >
      <h1>
        Star Wars
      </h1>
    </div>
  );
};

export default Loader;
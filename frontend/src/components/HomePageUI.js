import React from 'react';
import Map from './Map';

const HomePageUI = ({
  isAuthenticated
}) => {
  return (
    <div className="home-page">
      <Map />
    </div>
  );
};

export default HomePageUI;

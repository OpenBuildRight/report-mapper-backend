import React from 'react';
import Map from './Map';

interface HomePageUIProps {
  isAuthenticated: boolean;
}

const HomePageUI: React.FC<HomePageUIProps> = ({
  isAuthenticated
}) => {
  return (
    <div className="home-page" data-testid="home-page">
      <Map />
    </div>
  );
};

export default HomePageUI;

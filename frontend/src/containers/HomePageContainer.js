import React from 'react';
import { useHomePage } from '../hooks/useHomePage';
import HomePageUI from '../components/HomePageUI';

const HomePageContainer = () => {
  const { isAuthenticated } = useHomePage();

  return (
    <HomePageUI
      isAuthenticated={isAuthenticated}
    />
  );
};

export default HomePageContainer;

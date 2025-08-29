import React from 'react';
import { useHeader } from '../hooks/useHeader';
import HeaderUI from '../components/HeaderUI';

const HeaderContainer: React.FC = () => {
  const {
    user,
    isAuthenticated,
    showUserDropdown,
    dropdownRef,
    handleLogout,
    handleLogin,
    toggleUserDropdown,
    getUserInitials
  } = useHeader();

  return (
    <HeaderUI
      user={user}
      isAuthenticated={isAuthenticated}
      showUserDropdown={showUserDropdown}
      dropdownRef={dropdownRef}
      onLogout={handleLogout}
      onLogin={handleLogin}
      onToggleUserDropdown={toggleUserDropdown}
      getUserInitials={getUserInitials}
    />
  );
};

export default HeaderContainer;

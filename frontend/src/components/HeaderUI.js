import React from 'react';
import { Link } from 'react-router-dom';

const HeaderUI = ({
  user,
  isAuthenticated,
  showUserDropdown,
  dropdownRef,
  onLogout,
  onLogin,
  onToggleUserDropdown,
  getUserInitials
}) => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <Link to="/" className="header-title">
            <h1>Report Mapper</h1>
          </Link>
        </div>
        
        <nav className="header-nav">
          <Link to="/" className="nav-link">Map</Link>
          <Link to="/observation" className="nav-link">Create Observation</Link>
        </nav>

        <div className="header-actions">
          {isAuthenticated ? (
            <div className="user-dropdown" ref={dropdownRef}>
              <button 
                className="user-button"
                onClick={onToggleUserDropdown}
              >
                {getUserInitials()}
              </button>
              {showUserDropdown && (
                <div className="dropdown-menu">
                  <div className="user-info">
                    <div className="user-name">
                      {user?.profile?.name || user?.profile?.email || 'User'}
                    </div>
                    <div className="user-email">
                      {user?.profile?.email}
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button onClick={onLogout} className="dropdown-item">
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              className="login-button"
              onClick={onLogin}
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderUI;

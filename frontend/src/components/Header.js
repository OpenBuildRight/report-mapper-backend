import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../auth/useAuth';
import { useNavigate, Link } from 'react-router-dom';

const Header = () => {
  const { user, signoutRedirect, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    signoutRedirect();
    setShowUserDropdown(false);
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get user initials
  const getUserInitials = () => {
    if (!user || !user.profile) return 'U';
    const { given_name, family_name, name, email } = user.profile;
    
    if (given_name && family_name) {
      return `${given_name[0]}${family_name[0]}`.toUpperCase();
    }
    if (name) {
      const names = name.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return name[0].toUpperCase();
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

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
                onClick={toggleUserDropdown}
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
                  <button onClick={handleLogout} className="dropdown-item">
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              className="login-button"
              onClick={handleLogin}
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

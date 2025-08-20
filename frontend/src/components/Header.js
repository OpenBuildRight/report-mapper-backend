import React from 'react';
import { useAuth } from '../auth/useAuth';

const Header = () => {
  const { user, signoutRedirect, isAuthenticated } = useAuth();

  const handleLogout = () => {
    signoutRedirect();
  };

  return (
    <header className="header">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <div>
          <h1>Report Mapper</h1>
          <p>Upload images and create observations with location data</p>
        </div>
        
        {isAuthenticated && user && (
          <div style={{ textAlign: 'right', color: 'white' }}>
            <div style={{ marginBottom: '10px' }}>
              Welcome, <strong>{user.profile?.name || user.profile?.preferred_username || 'User'}</strong>
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'background 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

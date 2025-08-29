import React from 'react';
import { useAuth } from '../auth/useAuth';

const AuthDebug: React.FC = () => {
  const { isAuthenticated, isLoading, user, getAccessToken, error, clearError } = useAuth();

  const handleTestAuth = () => {
    const token = getAccessToken();
    console.log('🔍 Manual Auth Test:', {
      isAuthenticated,
      isLoading,
      user,
      token,
      error,
      localStorage: {
        access_token: localStorage.getItem('access_token'),
        pendingAction: localStorage.getItem('pendingAction'),
        redirectAfterLogin: localStorage.getItem('redirectAfterLogin')
      }
    });
  };

  const handleClearStorage = () => {
    localStorage.clear();
    console.log('🧹 Cleared localStorage');
    window.location.reload();
  };

  const handleSetTestToken = () => {
    localStorage.setItem('access_token', 'test-token-' + Date.now());
    console.log('🔑 Set test token');
    window.location.reload();
  };

  const handleSimulateError = () => {
    // Simulate an invalid token error
    localStorage.setItem('access_token', 'invalid-token');
    console.log('🚨 Simulated invalid token error');
    window.location.reload();
  };

  const handleClearError = () => {
    clearError();
    console.log('🧹 Cleared error state');
  };

  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: '#f0f0f0',
      border: '1px solid #ccc',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '350px'
    }}>
      <h4 style={{ margin: '0 0 10px 0' }}>🔍 Auth Debug</h4>
      <div>
        <strong>Status:</strong> {isLoading ? 'Loading...' : (isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated')}
      </div>
      <div>
        <strong>User:</strong> {user ? `${user.name || user.email || 'Unknown'}` : 'None'}
      </div>
      <div>
        <strong>Token:</strong> {getAccessToken() ? '✅ Present' : '❌ Missing'}
      </div>
      {error && (
        <div style={{ marginTop: '5px', color: '#ef4444' }}>
          <strong>Error:</strong> {error.title}
        </div>
      )}
      <div style={{ marginTop: '10px' }}>
        <button onClick={handleTestAuth} style={{ marginRight: '5px', fontSize: '10px' }}>
          Test Auth
        </button>
        <button onClick={handleSetTestToken} style={{ marginRight: '5px', fontSize: '10px' }}>
          Set Test Token
        </button>
        <button onClick={handleSimulateError} style={{ marginRight: '5px', fontSize: '10px' }}>
          Simulate Error
        </button>
        <button onClick={handleClearStorage} style={{ marginRight: '5px', fontSize: '10px' }}>
          Clear Storage
        </button>
        {error && (
          <button onClick={handleClearError} style={{ fontSize: '10px' }}>
            Clear Error
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthDebug;

import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/useAuth';

const DebugAuth = () => {
  const auth = useAuth();
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const updateDebugInfo = () => {
      setDebugInfo({
        isAuthenticated: auth.isAuthenticated,
        isLoading: auth.isLoading,
        user: auth.user,
        hasToken: !!localStorage.getItem('access_token'),
        token: localStorage.getItem('access_token') ? 
          localStorage.getItem('access_token').substring(0, 20) + '...' : 
          'None',
        urlParams: Object.fromEntries(new URLSearchParams(window.location.search)),
        timestamp: new Date().toISOString()
      });
    };

    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 1000);
    return () => clearInterval(interval);
  }, [auth]);

  return (
    <div style={{ 
      position: 'fixed', 
      top: 10, 
      right: 10, 
      background: 'white', 
      border: '1px solid #ccc', 
      padding: '10px', 
      borderRadius: '5px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 1000
    }}>
      <h4>Auth Debug</h4>
      <pre style={{ fontSize: '10px', overflow: 'auto' }}>
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  );
};

export default DebugAuth;

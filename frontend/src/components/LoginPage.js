import React, { useEffect } from 'react';
import { useAuth } from '../auth/useAuth';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const { signinRedirect, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Check if user is authenticated and redirect if needed
  useEffect(() => {
    if (isAuthenticated) {
      const pendingAction = localStorage.getItem('pendingAction');
      if (pendingAction) {
        // Clear the pending action and redirect to home
        localStorage.removeItem('pendingAction');
        navigate('/');
      } else {
        // No pending action, just go to home
        navigate('/');
      }
    }
  }, [isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        textAlign: 'center',
        maxWidth: '400px',
        width: '90%'
      }}>
        <h1 style={{ color: '#2c3e50', marginBottom: '20px' }}>
          Report Mapper
        </h1>
        <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>
          Please sign in to access the application
        </p>
        
        <button
          onClick={() => signinRedirect()}
          style={{
            background: '#3498db',
            color: 'white',
            border: 'none',
            padding: '12px 30px',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: 'pointer',
            width: '100%',
            transition: 'background 0.3s ease'
          }}
          onMouseOver={(e) => e.target.style.background = '#2980b9'}
          onMouseOut={(e) => e.target.style.background = '#3498db'}
        >
          Sign In
        </button>
        
        <div style={{ marginTop: '20px', fontSize: '14px', color: '#95a5a6' }}>
          <p><strong>Test Credentials:</strong></p>
          <p>Username: <code>alice</code></p>
          <p>Password: <code>alice_password</code></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

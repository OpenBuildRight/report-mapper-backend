import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './auth/useAuth';
import HeaderContainer from './containers/HeaderContainer';
import HomePageContainer from './containers/HomePageContainer';
import LoginPage from './components/LoginPage';
import ObservationFormContainer from './containers/ObservationFormContainer';
import AuthDebug from './components/AuthDebug';
import AuthErrorModal from './components/AuthErrorModal';
import './App.css';

interface ProtectedRouteProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  isLoading: boolean;
  redirectTo: string;
}

// Protected Route component that handles OAuth flow
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, isAuthenticated, isLoading, redirectTo }) => {
  const { signinRedirect } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // If not loading and not authenticated, start OAuth flow
    if (!isLoading && !isAuthenticated) {
      // Store the intended destination for after login
      localStorage.setItem('redirectAfterLogin', redirectTo);
      console.log('🔐 Starting OAuth flow, redirecting to:', redirectTo);
      signinRedirect();
    }
  }, [isLoading, isAuthenticated, redirectTo, signinRedirect]);

  // Show loading while OAuth flow is in progress
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <div>Authenticating...</div>
      </div>
    );
  }

  // If authenticated, show the protected content
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If not authenticated and not loading, show loading (OAuth flow should start)
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '50vh' 
    }}>
      <div>Redirecting to login...</div>
    </div>
  );
};

// Component to handle redirect after successful authentication
const AuthRedirectHandler: React.FC = () => {
  const { isAuthenticated, isLoading, error } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Check if we have a pending redirect and are now authenticated
    if (isAuthenticated && !isLoading) {
      const pendingRedirect = localStorage.getItem('redirectAfterLogin');
      if (pendingRedirect) {
        console.log('🔐 Authentication successful, redirecting to:', pendingRedirect);
        localStorage.removeItem('redirectAfterLogin');
        // Use window.location to ensure full page navigation
        window.location.href = pendingRedirect;
      }
    }
  }, [isAuthenticated, isLoading]);

  // If there's an error, show it but don't redirect away
  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        flexDirection: 'column'
      }}>
        <h2>Authentication Failed</h2>
        <p>{error.message}</p>
        <p>Please try again or contact support if the problem persists.</p>
      </div>
    );
  }

  // Show loading while checking authentication status
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '50vh' 
    }}>
      <div>Checking authentication...</div>
    </div>
  );
};

const App: React.FC = () => {
  const { isLoading, isAuthenticated, error, clearError, signinRedirect } = useAuth();

  const handleObservationSuccess = (result: any) => {
    console.log('Observation created successfully:', result);
    // You can add navigation or other success handling here
  };

  const handleRetryLogin = () => {
    clearError();
    signinRedirect();
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <AuthDebug />
        <AuthErrorModal 
          error={error} 
          onClose={clearError} 
          onRetry={handleRetryLogin}
        />
        <HeaderContainer />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePageContainer />} />
            <Route 
              path="/observation" 
              element={
                <ProtectedRoute 
                  isAuthenticated={isAuthenticated} 
                  isLoading={isLoading}
                  redirectTo="/observation"
                >
                  <ObservationFormContainer onSuccess={handleObservationSuccess} />
                </ProtectedRoute>
              } 
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth-callback" element={<AuthRedirectHandler />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;

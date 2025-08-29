import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import { useAuth } from './auth/useAuth';
import ObservationFormContainer from './containers/ObservationFormContainer';
import HeaderContainer from './containers/HeaderContainer';
import AuthErrorModal from './components/AuthErrorModal';
import './styles/ErrorComponents.css';

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  isLoading: boolean;
  redirectTo: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, isAuthenticated, isLoading, redirectTo }) => {
  const { signinRedirect } = useAuth();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      localStorage.setItem('redirectAfterLogin', redirectTo);
      console.log('🔐 Starting OAuth flow, redirecting to:', redirectTo);
      signinRedirect();
    }
  }, [isLoading, isAuthenticated, redirectTo, signinRedirect]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Authenticating...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Redirecting to login...</p>
    </div>
  );
};

// Auth Redirect Handler Component
const AuthRedirectHandler: React.FC = () => {
  const { isAuthenticated, isLoading, error } = useAuth();
  
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const pendingRedirect = localStorage.getItem('redirectAfterLogin');
      if (pendingRedirect) {
        console.log('🔐 Authentication successful, redirecting to:', pendingRedirect);
        localStorage.removeItem('redirectAfterLogin');
        window.location.href = pendingRedirect;
      }
    }
  }, [isAuthenticated, isLoading]);

  if (error) {
    return (
      <div className="auth-error-container">
        <h2>Authentication Error</h2>
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Checking authentication...</p>
    </div>
  );
};

// Main App Component
const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, error, clearError, handleRetryLogin } = useAuth();

  const handleSuccess = (result: any) => {
    console.log('Observation created successfully:', result);
    // You can add navigation or other success handling here
  };

  return (
    <div className="App">
      <HeaderContainer />
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/observation-form" replace />} />
          
          <Route 
            path="/observation-form" 
            element={
              <ProtectedRoute 
                isAuthenticated={isAuthenticated} 
                isLoading={isLoading} 
                redirectTo="/observation-form"
              >
                <ObservationFormContainer onSuccess={handleSuccess} />
              </ProtectedRoute>
            } 
          />
          
          <Route path="/auth-callback" element={<AuthRedirectHandler />} />
          
          <Route path="*" element={<Navigate to="/observation-form" replace />} />
        </Routes>
      </main>

      <AuthErrorModal 
        error={error} 
        onClose={clearError} 
        onRetry={handleRetryLogin}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;

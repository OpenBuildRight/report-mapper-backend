import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth/useAuth';
import HeaderContainer from './containers/HeaderContainer';
import HomePageContainer from './containers/HomePageContainer';
import LoginPage from './components/LoginPage';
import ObservationFormContainer from './containers/ObservationFormContainer';
import AuthDebug from './components/AuthDebug';
import './App.css';

interface ProtectedRouteProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  redirectTo: string;
}

// Protected Route component that redirects to login and back
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, isAuthenticated, redirectTo }) => {
  if (!isAuthenticated) {
    // Store the intended destination for after login
    localStorage.setItem('redirectAfterLogin', redirectTo);
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const { isLoading, isAuthenticated } = useAuth();

  const handleObservationSuccess = (result: any) => {
    console.log('Observation created successfully:', result);
    // You can add navigation or other success handling here
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
        <HeaderContainer />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePageContainer />} />
            <Route 
              path="/observation" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} redirectTo="/observation">
                  <ObservationFormContainer onSuccess={handleObservationSuccess} />
                </ProtectedRoute>
              } 
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;

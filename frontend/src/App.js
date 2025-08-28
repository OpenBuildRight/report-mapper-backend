import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth/useAuth';
import HeaderContainer from './containers/HeaderContainer';
import HomePageContainer from './containers/HomePageContainer';
import LoginPage from './components/LoginPage';
import ObservationFormContainer from './containers/ObservationFormContainer';
import './App.css';

// Protected Route component that redirects to login and back
const ProtectedRoute = ({ children, isAuthenticated, redirectTo }) => {
  if (!isAuthenticated) {
    // Store the intended destination for after login
    localStorage.setItem('redirectAfterLogin', redirectTo);
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const { isLoading, isAuthenticated } = useAuth();

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
        <HeaderContainer />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePageContainer />} />
            <Route 
              path="/observation" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} redirectTo="/observation">
                  <ObservationFormContainer />
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
}

export default App;

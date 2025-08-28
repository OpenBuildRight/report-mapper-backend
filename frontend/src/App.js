import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth/useAuth';
import HeaderContainer from './containers/HeaderContainer';
import HomePageContainer from './containers/HomePageContainer';
import LoginPage from './components/LoginPage';
import ObservationFormContainer from './containers/ObservationFormContainer';
import ImageUploadFormContainer from './containers/ImageUploadFormContainer';
import './App.css';

function App() {
  const { isLoading } = useAuth();

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
            <Route path="/observation" element={<ObservationFormContainer />} />
            <Route path="/upload" element={<ImageUploadFormContainer />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

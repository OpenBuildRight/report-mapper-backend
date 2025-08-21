import React, { useState } from 'react';
import { useAuth } from './auth/useAuth';
import Header from './components/Header';
import LoginPage from './components/LoginPage';
import ImageUploadForm from './components/ImageUploadForm';
import ObservationForm from './components/ObservationForm';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('upload');
  const { isAuthenticated, isLoading } = useAuth();

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

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="App">
      <Header />

      <div className="container">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            Upload Images
          </button>
          <button 
            className={`tab ${activeTab === 'observation' ? 'active' : ''}`}
            onClick={() => setActiveTab('observation')}
          >
            Create Observation
          </button>
        </div>

        <div className={`tab-content ${activeTab === 'upload' ? 'active' : ''}`}>
          <ImageUploadForm />
        </div>

        <div className={`tab-content ${activeTab === 'observation' ? 'active' : ''}`}>
          <ObservationForm />
        </div>
      </div>
    </div>
  );
}

export default App;

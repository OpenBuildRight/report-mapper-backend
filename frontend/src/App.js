import React, { useState } from 'react';
import ImageUploadForm from './components/ImageUploadForm';
import ObservationForm from './components/ObservationForm';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('upload');

  return (
    <div className="App">
      <header className="header">
        <h1>Report Mapper</h1>
        <p>Upload images and create observations with location data</p>
      </header>

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

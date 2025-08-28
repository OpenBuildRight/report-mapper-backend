import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/useAuth';
import Map from './Map';
import ReportModal from './ReportModal';

function HomePage() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleMapClick = (latlng) => {
    setSelectedLocation(latlng);
    setShowReportModal(true);
  };

  const handleReportSubmit = (reportData) => {
    // Handle report submission for authenticated users
    console.log('Submitting report:', reportData);
    // Here you would typically send the data to your backend API
    setShowReportModal(false);
    setSelectedLocation(null);
  };

  const handleReportCancel = () => {
    setShowReportModal(false);
    setSelectedLocation(null);
  };

  // Check for pending actions when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      const pendingAction = localStorage.getItem('pendingAction');
      if (pendingAction) {
        try {
          const action = JSON.parse(pendingAction);
          if (action.type === 'report' && action.location) {
            setSelectedLocation(action.location);
            setShowReportModal(true);
            localStorage.removeItem('pendingAction');
          }
        } catch (error) {
          console.error('Error parsing pending action:', error);
          localStorage.removeItem('pendingAction');
        }
      }
    }
  }, [isAuthenticated]);

  return (
    <div className="home-page">
      <Map 
        selectedLocation={selectedLocation}
        onMapClick={handleMapClick}
      />
      
      <ReportModal
        isOpen={showReportModal}
        selectedLocation={selectedLocation}
        onClose={handleReportCancel}
        onSubmit={handleReportSubmit}
      />
    </div>
  );
}

export default HomePage;

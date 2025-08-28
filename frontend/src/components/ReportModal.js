import React from 'react';
import { useAuth } from '../auth/useAuth';
import { useNavigate } from 'react-router-dom';
import ReportForm from './ReportForm';

const ReportModal = ({ 
  isOpen, 
  selectedLocation, 
  onClose, 
  onSubmit 
}) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleReport = () => {
    if (!isAuthenticated) {
      // Store the intended action and redirect to login
      localStorage.setItem('pendingAction', JSON.stringify({
        type: 'report',
        location: selectedLocation
      }));
      navigate('/login');
      return;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Report Issue</h2>
        {isAuthenticated ? (
          <ReportForm
            location={selectedLocation}
            onSubmit={onSubmit}
            onCancel={onClose}
          />
        ) : (
          <div className="login-prompt">
            <p>Please log in to submit a report for this location.</p>
            <div className="modal-buttons">
              <button onClick={handleReport} className="report-button">
                Login to Report
              </button>
              <button onClick={onClose} className="cancel-button">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportModal;

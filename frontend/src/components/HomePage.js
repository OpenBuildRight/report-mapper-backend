import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import { useAuth } from '../auth/useAuth';
import { useNavigate } from 'react-router-dom';
import ReportForm from './ReportForm';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Component to handle map clicks
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });
  return null;
}

function HomePage() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const handleMapClick = (latlng) => {
    setSelectedLocation(latlng);
    setShowReportModal(true);
  };

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
    
    // Show the report form for authenticated users
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

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    logout();
    setShowUserDropdown(false);
  };

  const handleClearAuth = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleTestAuth = () => {
    console.log('🧪 Testing authentication state:');
    console.log('- isAuthenticated:', isAuthenticated);
    console.log('- user:', user);
    console.log('- localStorage access_token:', localStorage.getItem('access_token'));
    console.log('- localStorage pendingAction:', localStorage.getItem('pendingAction'));
  };

  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get user initials
  const getUserInitials = () => {
    if (!user || !user.profile) return 'U';
    const { given_name, family_name, name, email } = user.profile;
    
    if (given_name && family_name) {
      return `${given_name[0]}${family_name[0]}`.toUpperCase();
    }
    if (name) {
      const names = name.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return name[0].toUpperCase();
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
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
      <div className="header">
        <h1>Report Mapper</h1>
        {process.env.NODE_ENV === 'development' && (
          <div className="debug-info">
            Auth: {isAuthenticated ? 'Yes' : 'No'} | 
            User: {user ? 'Yes' : 'No'} |
            <button 
              onClick={() => console.log('Current auth state:', { isAuthenticated, user })}
              style={{ background: 'none', border: '1px solid white', color: 'white', padding: '2px 6px', marginLeft: '10px', cursor: 'pointer' }}
            >
              Debug
            </button>
          </div>
        )}
        <div className="header-actions">
          {isAuthenticated ? (
            <div className="user-dropdown" ref={dropdownRef}>
              <button 
                className="user-button"
                onClick={toggleUserDropdown}
              >
                {getUserInitials()}
              </button>
              {showUserDropdown && (
                <div className="dropdown-menu">
                  <div className="user-info">
                    <div className="user-name">
                      {user?.profile?.name || user?.profile?.email || 'User'}
                    </div>
                    <div className="user-email">
                      {user?.profile?.email}
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button onClick={handleLogout} className="dropdown-item">
                    Logout
                  </button>
                  <button onClick={handleClearAuth} className="dropdown-item">
                    Clear Auth (Debug)
                  </button>
                  <button onClick={handleTestAuth} className="dropdown-item">
                    Test Auth State
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              className="login-button"
              onClick={handleLogin}
            >
              Login
            </button>
          )}
        </div>
      </div>

      <div className="map-container">
        <MapContainer
          center={[51.505, -0.09]}
          zoom={13}
          style={{ height: 'calc(100vh - 80px)', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapClickHandler onMapClick={handleMapClick} />
          
          {selectedLocation && (
            <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
              <Popup>
                Selected location for reporting
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {showReportModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Report Issue</h2>
            {isAuthenticated ? (
              <ReportForm
                location={selectedLocation}
                onSubmit={handleReportSubmit}
                onCancel={handleReportCancel}
              />
            ) : (
              <div className="login-prompt">
                <p>Please log in to submit a report for this location.</p>
                <div className="modal-buttons">
                  <button onClick={handleReport} className="report-button">
                    Login to Report
                  </button>
                  <button onClick={() => setShowReportModal(false)} className="cancel-button">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;

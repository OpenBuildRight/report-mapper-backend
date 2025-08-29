import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Icon, LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface MapClickHandlerProps {
  onMapClick: (latlng: LatLng) => void;
}

// Component to handle map clicks
function MapClickHandler({ onMapClick }: MapClickHandlerProps) {
  useMapEvents({
    click: (e: { latlng: LatLng }) => {
      onMapClick(e.latlng);
    },
  });
  return null;
}

interface MapProps {
  selectedLocation?: { lat: number; lng: number };
  onMapClick?: (latlng: LatLng) => void;
}

const Map: React.FC<MapProps> = ({ selectedLocation, onMapClick }) => {
  return (
    <div className="map-container">
      <MapContainer
        center={[51.505, -0.09] as [number, number]}
        zoom={13}
        style={{ height: 'calc(100vh - 80px)', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {onMapClick && <MapClickHandler onMapClick={onMapClick} />}
        
        {selectedLocation && (
          <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
            <Popup>
              Selected location for reporting
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default Map;

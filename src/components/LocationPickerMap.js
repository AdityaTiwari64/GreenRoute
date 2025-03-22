import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icon issue
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

// Component to handle location selection on map
function LocationSelector({ onLocationSelect, initialLocation }) {
  const [position, setPosition] = useState(initialLocation);
  const map = useMap();

  useEffect(() => {
    if (initialLocation) {
      setPosition(initialLocation);
      map.flyTo(initialLocation, 14);
    }
  }, [initialLocation, map]);

  // Handle map click events
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onLocationSelect([lat, lng]);
    },
  });

  return position ? <Marker position={position} draggable={true} /> : null;
}

// Component to set map view based on user's location
function UserLocationMarker({ setInitialLocation }) {
  const map = useMap();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userLocation = [latitude, longitude];
          setInitialLocation(userLocation);
          map.flyTo(userLocation, 14);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Use default location if geolocation fails
          setInitialLocation([51.505, -0.09]); // London center
          map.flyTo([51.505, -0.09], 12);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      setInitialLocation([51.505, -0.09]); // London center
      map.flyTo([51.505, -0.09], 12);
    }
  }, [map, setInitialLocation]);

  return null;
}

// Geocoding function to convert coordinates to address
const getAddressFromCoordinates = async (lat, lng) => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
    const data = await response.json();
    return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch (error) {
    console.error('Geocoding error:', error);
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
};

export default function LocationPickerMap({ onLocationSelect, value }) {
  const [initialLocation, setInitialLocation] = useState(null);

  useEffect(() => {
    // If values are passed as [lat, lng] array
    if (Array.isArray(value) && value.length === 2) {
      setInitialLocation(value);
    }
    // If value is a string with "lat,lng" format
    else if (typeof value === 'string' && value.includes(',')) {
      const [lat, lng] = value.split(',').map(coord => parseFloat(coord.trim()));
      if (!isNaN(lat) && !isNaN(lng)) {
        setInitialLocation([lat, lng]);
      }
    }
  }, [value]);

  const handleLocationSelect = async (coordinates) => {
    const address = await getAddressFromCoordinates(coordinates[0], coordinates[1]);
    onLocationSelect({
      coordinates,
      address,
      rawValue: `${coordinates[0]},${coordinates[1]}`
    });
  };

  return (
    <MapContainer
      center={initialLocation || [51.505, -0.09]}
      zoom={13}
      style={{ height: '100%', width: '100%', minHeight: '300px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Get user's location and set initial map view */}
      <UserLocationMarker setInitialLocation={setInitialLocation} />
      
      {/* Handle location selection */}
      <LocationSelector 
        onLocationSelect={handleLocationSelect} 
        initialLocation={initialLocation} 
      />
    </MapContainer>
  );
} 
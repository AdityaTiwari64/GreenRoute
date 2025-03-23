import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
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

const parkingIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/494/494586.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const userLocationIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1946/1946429.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Ensure Leaflet default icon is set
if (typeof L !== 'undefined') {
  L.Marker.prototype.options.icon = defaultIcon;
}

// Mock data for available parking spaces
const mockParkingSpots = [
  {
    id: 1,
    name: 'Downtown Parking Garage',
    location: [51.505, -0.09],
    availableSpaces: 15,
    totalSpaces: 120,
    pricePerHour: '$2.50',
    hasEVCharging: true,
    hasHandicapSpots: true,
  },
  {
    id: 2,
    name: 'City Center Lot',
    location: [51.51, -0.1],
    availableSpaces: 5,
    totalSpaces: 50,
    pricePerHour: '$3.00',
    hasEVCharging: false,
    hasHandicapSpots: true,
  },
  {
    id: 3,
    name: 'South Street Parking',
    location: [51.498, -0.085],
    availableSpaces: 30,
    totalSpaces: 80,
    pricePerHour: '$2.00',
    hasEVCharging: true,
    hasHandicapSpots: true,
  },
  {
    id: 4,
    name: 'West End Garage',
    location: [51.515, -0.12],
    availableSpaces: 8,
    totalSpaces: 150,
    pricePerHour: '$4.00',
    hasEVCharging: true,
    hasHandicapSpots: true,
  },
  {
    id: 5,
    name: 'North Street Lot',
    location: [51.52, -0.095],
    availableSpaces: 0, // Full
    totalSpaces: 35,
    pricePerHour: '$1.50',
    hasEVCharging: false,
    hasHandicapSpots: false,
  },
];

// Component to set map view and handle location tracking
function LocationMarker() {
  const [position, setPosition] = useState(null);
  const [accuracy, setAccuracy] = useState(0);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);
  const map = useMap();
  
  mapRef.current = map;

  useEffect(() => {
    // Get user's current location
    let isMounted = true;
    
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (isMounted && mapRef.current) {
            const { latitude, longitude, accuracy } = position.coords;
            const userLocation = [latitude, longitude];
            setPosition(userLocation);
            setAccuracy(accuracy);
            mapRef.current.flyTo(userLocation, 14);
            setLoading(false);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          // Use default location if geolocation fails
          if (isMounted && mapRef.current) {
            setPosition([51.505, -0.09]); // London center
            mapRef.current.flyTo([51.505, -0.09], 12);
            setLoading(false);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      if (isMounted && mapRef.current) {
        setPosition([51.505, -0.09]); // London center
        mapRef.current.flyTo([51.505, -0.09], 12);
        setLoading(false);
      }
    }
    
    return () => {
      isMounted = false;
    };
  }, []);

  return position === null ? null : (
    <>
      <Marker position={position} icon={userLocationIcon}>
        <Popup>
          <div>
            <strong>Your current location</strong>
          </div>
        </Popup>
      </Marker>
      <Circle
        center={position}
        radius={accuracy}
        pathOptions={{ fillColor: 'blue', fillOpacity: 0.1, weight: 1, color: 'blue' }}
      />
    </>
  );
}

export default function ParkingMap() {
  const [isClient, setIsClient] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const containerRef = useRef(null);
  
  useEffect(() => {
    setIsClient(true);
    
    // Ensure the map container is ready
    const timer = setTimeout(() => {
      setMapReady(true);
      
      // Force the map to update its size if container exists
      if (containerRef.current) {
        const mapElement = containerRef.current.querySelector('.leaflet-container');
        if (mapElement && mapElement._leaflet_id) {
          const map = L.DomUtil.get(mapElement)._leaflet_map;
          if (map) {
            map.invalidateSize();
          }
        }
      }
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);

  // Color availability indicator
  const getAvailabilityColor = (available, total) => {
    const ratio = available / total;
    if (ratio === 0) return '#ef4444'; // Red - full
    if (ratio < 0.2) return '#f97316'; // Orange - limited
    return '#22c55e'; // Green - available
  };

  // Function to open Google Maps with directions to the parking spot
  const navigateToParkingSpot = (lat, lng) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const url = `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${lat},${lng}&travelmode=driving`;
          window.open(url, '_blank');
        },
        (error) => {
          // If can't get current location, just navigate to the parking spot
          const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
          window.open(url, '_blank');
        }
      );
    } else {
      // If geolocation not supported, just navigate to the parking spot
      const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      window.open(url, '_blank');
    }
  };

  // Don't render map on server side
  if (!isClient || !mapReady) {
    return <div className="h-full w-full bg-tertiary/20 flex items-center justify-center">Loading map...</div>;
  }

  return (
    <div className="h-full w-full" style={{ minHeight: '500px' }} ref={containerRef}>
      <MapContainer 
        key="parking-map"
        center={[51.505, -0.09]} // Default center, will be updated by LocationMarker
        zoom={13} 
        style={{ height: '100%', width: '100%', minHeight: '500px' }}
        whenCreated={(map) => {
          // Force a map container update to fix initial rendering issues
          setTimeout(() => {
            map.invalidateSize();
          }, 200);
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=6170aad10dfd42a38d4d8c709a536f38"
        />
        
        {/* User location marker */}
        <LocationMarker />
        
        {/* Parking spots */}
        {mockParkingSpots.map((spot) => (
          <div key={spot.id}>
            <Circle
              center={spot.location}
              radius={100}
              pathOptions={{
                fillColor: getAvailabilityColor(spot.availableSpaces, spot.totalSpaces),
                fillOpacity: 0.3,
                color: getAvailabilityColor(spot.availableSpaces, spot.totalSpaces),
                weight: 1,
              }}
            />
            
            <Marker 
              position={spot.location}
              icon={parkingIcon}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <h3 className="font-bold text-base">{spot.name}</h3>
                  <div className="mt-2 flex flex-col space-y-1 text-sm">
                    <p>
                      <span className="font-semibold">Availability:</span>{' '}
                      <span className={spot.availableSpaces === 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                        {spot.availableSpaces === 0
                          ? 'Full'
                          : `${spot.availableSpaces} / ${spot.totalSpaces} spots`}
                      </span>
                    </p>
                    <p>
                      <span className="font-semibold">Price:</span> {spot.pricePerHour}/hour
                    </p>
                    <p>
                      <span className="font-semibold">Features:</span>
                      {spot.hasEVCharging && <span className="ml-1 text-green-600">EV Charging</span>}
                      {spot.hasHandicapSpots && <span className="ml-1 text-blue-600"> • Handicap Spots</span>}
                    </p>
                  </div>
                  <div className="mt-3 flex flex-col gap-2">
                    <button 
                      className="bg-primary text-white text-xs py-1 px-2 rounded hover:bg-primary/90 w-full"
                      onClick={() => navigateToParkingSpot(spot.location[0], spot.location[1])}
                    >
                      Navigate in Google Maps
                    </button>
                    {spot.availableSpaces > 0 && (
                      <button className="bg-secondary text-white text-xs py-1 px-2 rounded hover:bg-secondary/90 w-full">
                        Reserve a spot
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          </div>
        ))}
      </MapContainer>
    </div>
  );
} 
import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
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

// Earth-toned icons
const userLocationIcon = L.divIcon({
  html: `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="11" fill="#3B82F6" stroke="white" stroke-width="2"/>
    <circle cx="12" cy="9" r="3" fill="white"/>
    <path d="M18 12C18 15.3137 15.3137 18 12 18C8.68629 18 6 15.3137 6 12" stroke="white" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
  className: "custom-div-icon",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

const startLocationIcon = L.divIcon({
  html: `<svg viewBox="0 0 24 24" width="36" height="36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 1C7.05 1 3 5.05 3 10C3 16.25 12 23 12 23C12 23 21 16.25 21 10C21 5.05 16.95 1 12 1Z" fill="#10B981" stroke="white" stroke-width="2"/>
    <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" fill="white"/>
  </svg>`,
  className: "custom-div-icon",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

const destinationIcon = L.divIcon({
  html: `<svg viewBox="0 0 24 24" width="36" height="36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 1C7.05 1 3 5.05 3 10C3 16.25 12 23 12 23C12 23 21 16.25 21 10C21 5.05 16.95 1 12 1Z" fill="#EF4444" stroke="white" stroke-width="2"/>
    <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" fill="white"/>
    <circle cx="12" cy="10" r="6" fill="#EF4444" stroke="white" stroke-width="1.5"/>
    <path d="M15 10C15 11.6569 13.6569 13 12 13C10.3431 13 9 11.6569 9 10C9 8.34315 10.3431 7 12 7C13.6569 7 15 8.34315 15 10Z" fill="white"/>
  </svg>`,
  className: "custom-div-icon",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

// Ensure Leaflet default icon is set
if (typeof L !== 'undefined') {
  L.Marker.prototype.options.icon = defaultIcon;
  
  // Add CSS for custom markers
  if (typeof document !== 'undefined') {
    // Only run in browser environment
    const style = document.createElement('style');
    style.textContent = `
      .custom-div-icon {
        background: none;
        border: none;
      }
    `;
    document.head.appendChild(style);
  }
}

// Function to safely format dates
const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    // Format date in a consistent way to avoid hydration errors
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    console.error('Date formatting error:', e);
    return 'Invalid date';
  }
};

// Mock data for available carpools
const mockCarpools = [
  {
    id: 1,
    driver: 'John Doe',
    startLocation: [51.505, -0.09],
    destination: [51.51, -0.1],
    departureTime: '2023-07-25T08:30',
    seatsAvailable: 3,
    costPerPerson: '₹5',
  },
  {
    id: 2,
    driver: 'Jane Smith',
    startLocation: [51.51, -0.11],
    destination: [51.52, -0.07],
    departureTime: '2023-07-25T09:00',
    seatsAvailable: 2,
    costPerPerson: '₹7',
  },
  {
    id: 3,
    driver: 'Mike Johnson',
    startLocation: [51.49, -0.08],
    destination: [51.53, -0.09],
    departureTime: '2023-07-25T08:45',
    seatsAvailable: 4,
    costPerPerson: '₹4',
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
        pathOptions={{ fillColor: '#5f8d4e', fillOpacity: 0.1, weight: 1, color: '#5f8d4e' }}
      />
    </>
  );
}

export default function CarpoolMap({ carpools = [], onBookRide }) {
  // Combine mock data with passed carpools
  const [allCarpools, setAllCarpools] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    
    // Use mock data initially or when no carpools are provided
    if (carpools.length === 0) {
      setAllCarpools(mockCarpools);
    } else {
      // Combine mock data with provided carpools
      setAllCarpools([...mockCarpools, ...carpools]);
    }
    
    // Ensure the map container is ready
    const timer = setTimeout(() => {
      setMapReady(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [carpools]);

  // Function to open Google Maps with directions
  const openGoogleMapsDirections = (startLat, startLng, destLat, destLng) => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${startLat},${startLng}&destination=${destLat},${destLng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  // Don't render map on server side
  if (!isClient || !mapReady) {
    return <div className="h-full w-full bg-tertiary/20 flex items-center justify-center">Loading map...</div>;
  }

  return (
    <div className="h-full w-full" style={{ minHeight: '400px' }}>
      <MapContainer
        key="carpool-map"
        center={[51.505, -0.09]} // Default center, will be updated by LocationMarker
        zoom={12}
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
        whenCreated={(map) => {
          // Force a map container update to fix initial rendering issues
          setTimeout(() => {
            map.invalidateSize();
          }, 0);
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=6170aad10dfd42a38d4d8c709a536f38"
        />
        
        {/* User location marker and circle */}
        <LocationMarker />
        
        {/* Carpool markers */}
        {allCarpools.map((carpool, index) => {
          const id = carpool.id || `new-${index}`;
          const startLocation = Array.isArray(carpool.startLocation) 
            ? carpool.startLocation 
            : carpool.startLocation?.coordinates || [51.505, -0.09];
          const destination = Array.isArray(carpool.destination) 
            ? carpool.destination 
            : carpool.destination?.coordinates || [51.51, -0.1];
          
          return (
            <div key={id}>
              {/* Start location marker */}
              <Marker 
                position={startLocation}
                icon={startLocationIcon}
              >
                <Popup>
                  <div>
                    <h3 className="font-bold">{carpool.driver || 'Driver'}</h3>
                    <p className="text-sm font-semibold">Pickup Point</p>
                    <p className="text-xs">{carpool.startLocationAddress || 'Start location'}</p>
                    <p className="text-sm">
                      Departure: {formatDate(carpool.departureTime)} <br />
                      Seats available: {carpool.seatsAvailable} <br />
                      {carpool.costPerPerson && `Cost: ${carpool.costPerPerson.replace('$', '₹')}`}
                    </p>
                    <div className="flex flex-col gap-2 mt-2">
                      <button 
                        className="bg-primary text-white text-xs py-1 px-2 rounded hover:bg-primary/90 w-full"
                        onClick={() => openGoogleMapsDirections(
                          startLocation[0],
                          startLocation[1],
                          destination[0],
                          destination[1]
                        )}
                      >
                        View route in Google Maps
                      </button>
                      {onBookRide && carpool.seatsAvailable > 0 && (
                        <button 
                          className="bg-accent text-white text-xs py-1 px-2 rounded hover:bg-accent/90 w-full"
                          onClick={(e) => {
                            // Prevent popup from closing when clicking the button
                            e.stopPropagation();
                            onBookRide(carpool);
                          }}
                        >
                          Book Seat
                        </button>
                      )}
                      {carpool.seatsAvailable <= 0 && (
                        <p className="text-gray-500 text-xs text-center mt-1">Fully booked</p>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
              
              {/* Destination marker */}
              <Marker 
                position={destination}
                icon={destinationIcon}
              >
                <Popup>
                  <div>
                    <h3 className="font-bold">{carpool.driver || 'Driver'}</h3>
                    <p className="text-sm font-semibold">Destination</p>
                    <p className="text-xs">{carpool.destinationAddress || 'Destination location'}</p>
                    <div className="flex flex-col gap-2 mt-2">
                      <button 
                        className="bg-primary text-white text-xs py-1 px-2 rounded hover:bg-primary/90 w-full"
                        onClick={() => openGoogleMapsDirections(
                          startLocation[0],
                          startLocation[1],
                          destination[0],
                          destination[1]
                        )}
                      >
                        View route in Google Maps
                      </button>
                      {onBookRide && carpool.seatsAvailable > 0 && (
                        <button 
                          className="bg-accent text-white text-xs py-1 px-2 rounded hover:bg-accent/90 w-full"
                          onClick={(e) => {
                            // Prevent popup from closing when clicking the button
                            e.stopPropagation();
                            onBookRide(carpool);
                          }}
                        >
                          Book Seat
                        </button>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            </div>
          );
        })}
      </MapContainer>
    </div>
  );
} 
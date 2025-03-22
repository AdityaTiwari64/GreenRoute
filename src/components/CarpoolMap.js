import { useState, useEffect } from 'react';
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

const userLocationIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1946/1946429.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const startLocationIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/484/484167.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const destinationIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1077/1077012.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

L.Marker.prototype.options.icon = defaultIcon;

// Mock data for available carpools
const mockCarpools = [
  {
    id: 1,
    driver: 'John Doe',
    startLocation: [51.505, -0.09],
    destination: [51.51, -0.1],
    departureTime: '2023-07-25T08:30',
    seatsAvailable: 3,
    costPerPerson: '$5',
  },
  {
    id: 2,
    driver: 'Jane Smith',
    startLocation: [51.51, -0.11],
    destination: [51.52, -0.07],
    departureTime: '2023-07-25T09:00',
    seatsAvailable: 2,
    costPerPerson: '$7',
  },
  {
    id: 3,
    driver: 'Mike Johnson',
    startLocation: [51.49, -0.08],
    destination: [51.53, -0.09],
    departureTime: '2023-07-25T08:45',
    seatsAvailable: 4,
    costPerPerson: '$4',
  },
];

// Component to set map view and handle location tracking
function LocationMarker() {
  const [position, setPosition] = useState(null);
  const [accuracy, setAccuracy] = useState(0);
  const [loading, setLoading] = useState(true);
  const map = useMap();

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          const userLocation = [latitude, longitude];
          setPosition(userLocation);
          setAccuracy(accuracy);
          map.flyTo(userLocation, 14);
          setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Use default location if geolocation fails
          setPosition([51.505, -0.09]); // London center
          map.flyTo([51.505, -0.09], 12);
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      setPosition([51.505, -0.09]); // London center
      map.flyTo([51.505, -0.09], 12);
      setLoading(false);
    }
  }, [map]);

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

export default function CarpoolMap({ carpools = [] }) {
  // Combine mock data with passed carpools
  const [allCarpools, setAllCarpools] = useState([]);
  
  useEffect(() => {
    // Use mock data initially or when no carpools are provided
    if (carpools.length === 0) {
      setAllCarpools(mockCarpools);
    } else {
      // Combine mock data with provided carpools
      setAllCarpools([...mockCarpools, ...carpools]);
    }
  }, [carpools]);

  // Function to open Google Maps with directions
  const openGoogleMapsDirections = (startLat, startLng, destLat, destLng) => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${startLat},${startLng}&destination=${destLat},${destLng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  return (
    <>
      <MapContainer
        center={[51.505, -0.09]} // Default center, will be updated by LocationMarker
        zoom={12}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
                      Departure: {new Date(carpool.departureTime).toLocaleString()} <br />
                      Seats available: {carpool.seatsAvailable} <br />
                      {carpool.costPerPerson && `Cost: ${carpool.costPerPerson}`}
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
                      <button className="bg-secondary text-white text-xs py-1 px-2 rounded hover:bg-secondary/90 w-full">
                        Request seat
                      </button>
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
                    <button 
                      className="bg-primary text-white text-xs py-1 px-2 rounded hover:bg-primary/90 w-full mt-2"
                      onClick={() => openGoogleMapsDirections(
                        startLocation[0],
                        startLocation[1],
                        destination[0],
                        destination[1]
                      )}
                    >
                      View route in Google Maps
                    </button>
                  </div>
                </Popup>
              </Marker>
            </div>
          );
        })}
      </MapContainer>
    </>
  );
} 
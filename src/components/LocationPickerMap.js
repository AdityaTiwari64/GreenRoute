import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icon issue
const defaultIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3711/3711245.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

// Ensure Leaflet default icon is set
if (typeof L !== 'undefined') {
  L.Marker.prototype.options.icon = defaultIcon;
}

// Component to handle location selection on map
function LocationSelector({ onLocationSelect, initialLocation }) {
  const [position, setPosition] = useState(initialLocation);
  const mapRef = useRef(null);
  const map = useMap();
  
  mapRef.current = map;

  useEffect(() => {
    let isMounted = true;
    
    if (initialLocation && isMounted && mapRef.current) {
      setPosition(initialLocation);
      mapRef.current.flyTo(initialLocation, 14);
    }
    
    return () => {
      isMounted = false;
    };
  }, [initialLocation]);

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
  const mapRef = useRef(null);
  const map = useMap();
  
  mapRef.current = map;

  useEffect(() => {
    let isMounted = true;
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (isMounted && mapRef.current) {
            const { latitude, longitude } = position.coords;
            const userLocation = [latitude, longitude];
            setInitialLocation(userLocation);
            mapRef.current.flyTo(userLocation, 14);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          // Use default location if geolocation fails
          if (isMounted && mapRef.current) {
            setInitialLocation([51.505, -0.09]); // London center
            mapRef.current.flyTo([51.505, -0.09], 12);
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
        setInitialLocation([51.505, -0.09]); // London center
        mapRef.current.flyTo([51.505, -0.09], 12);
      }
    }
    
    return () => {
      isMounted = false;
    };
  }, [setInitialLocation]);

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

// Function to search for location by name
const searchLocation = async (query) => {
  if (!query.trim()) return null;
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
    );
    const data = await response.json();
    return data.map(item => ({
      coordinates: [parseFloat(item.lat), parseFloat(item.lon)],
      address: item.display_name,
      placeId: item.place_id
    }));
  } catch (error) {
    console.error('Location search error:', error);
    return [];
  }
};

export default function LocationPickerMap({ onLocationSelect, value }) {
  const [initialLocation, setInitialLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    // This will only run on the client
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
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only process values on the client side
    if (!isClient) return;
    
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
  }, [value, isClient]);

  const handleLocationSelect = async (coordinates) => {
    const address = await getAddressFromCoordinates(coordinates[0], coordinates[1]);
    onLocationSelect({
      coordinates,
      address,
      rawValue: `${coordinates[0]},${coordinates[1]}`
    });
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    const results = await searchLocation(searchQuery);
    setSearchResults(results || []);
    setIsSearching(false);
  };

  const handleSearchResultClick = (result) => {
    setInitialLocation(result.coordinates);
    onLocationSelect({
      coordinates: result.coordinates,
      address: result.address,
      rawValue: `${result.coordinates[0]},${result.coordinates[1]}`
    });
    setSearchResults([]);
  };

  // Add a style to override Leaflet defaults
  useEffect(() => {
    if (isClient) {
      // Add a style tag to ensure Leaflet controls are visible
      const styleTag = document.createElement('style');
      styleTag.innerHTML = `
        .leaflet-top, .leaflet-bottom {
          z-index: 1000 !important;
        }
        .leaflet-container {
          z-index: 10 !important;
        }
        .leaflet-marker-icon, .leaflet-marker-shadow {
          z-index: 1000 !important;
        }
      `;
      document.head.appendChild(styleTag);
      
      return () => {
        document.head.removeChild(styleTag);
      };
    }
  }, [isClient]);

  return (
    <div className="h-full flex flex-col" style={{ height: '100%' }} ref={containerRef}>
      <div className="mb-3 p-2 bg-white rounded-md shadow-sm" style={{ position: 'relative' }}>
        <div className="flex">
          <input
            type="text"
            placeholder="Search for a location..."
            className="w-full p-2 border border-tertiary rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            className="bg-primary text-white px-4 py-2 rounded-r-md hover:bg-primary/90"
            onClick={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
        
        {searchResults.length > 0 && (
          <div className="mt-2 bg-white rounded-md shadow-md border border-tertiary absolute w-full max-h-60 overflow-y-auto left-0" style={{ zIndex: 9999 }}>
            {searchResults.map((result, index) => (
              <div
                key={result.placeId || index}
                className="p-2 hover:bg-tertiary/20 cursor-pointer border-b border-tertiary/30 last:border-0"
                onClick={() => handleSearchResultClick(result)}
              >
                <p className="text-sm">{result.address}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {isClient && mapReady ? (
        <div className="flex-grow" style={{ height: 'calc(100% - 60px)', position: 'relative' }}>
          <MapContainer
            key="location-picker-map"
            center={initialLocation || [51.505, -0.09]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            whenCreated={(map) => {
              // Force a map container update to fix initial rendering issues
              setTimeout(() => {
                map.invalidateSize();
              }, 300);
            }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=6170aad10dfd42a38d4d8c709a536f38"
            />
            
            {/* Get user's location and set initial map view */}
            <UserLocationMarker setInitialLocation={setInitialLocation} />
            
            {/* Handle location selection */}
            <LocationSelector 
              onLocationSelect={handleLocationSelect} 
              initialLocation={initialLocation} 
            />
          </MapContainer>
        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center bg-gray-100 rounded-md" style={{ height: 'calc(100% - 60px)' }}>
          <p className="text-gray-500">Loading map...</p>
        </div>
      )}
    </div>
  );
} 
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { completeRide, verifyPassengerLocation } from '../lib/firebase';

export default function RideCompletion({ ride }) {
  const { currentUser } = useAuth();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [distance, setDistance] = useState(0);
  const [locationVerified, setLocationVerified] = useState(false);
  
  // Determine if the current user is the driver of this ride
  const isDriver = currentUser && ride && currentUser.uid === ride.driverId;
  
  // Check if the ride is valid for completion
  const canComplete = ride && 
    ride.status === 'active' && 
    new Date() >= new Date(ride.departureTime) &&
    !ride.completed;
  
  // Calculate if two locations are nearby (using Haversine formula)
  const isLocationNearby = useCallback((location1, location2, maxDistanceKm) => {
    if (!location1 || !location2 || !Array.isArray(location1) || !Array.isArray(location2)) {
      return false;
    }
    
    const toRad = (value) => value * Math.PI / 180;
    const R = 6371; // Earth's radius in km
    
    const dLat = toRad(location2[0] - location1[0]);
    const dLon = toRad(location2[1] - location1[1]);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(location1[0])) * Math.cos(toRad(location2[0])) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    setDistance(distance);
    return distance <= maxDistanceKm;
  }, []);
  
  // Get current location
  const getCurrentLocation = useCallback(() => {
    if (!ride) return;
    
    setVerifying(true);
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setVerifying(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation([latitude, longitude]);
        setVerifying(false);
        
        // Check if we're near the destination
        if (ride && ride.destinationCoordinates && Array.isArray(ride.destinationCoordinates) && ride.destinationCoordinates.length === 2) {
          const isNearDestination = isLocationNearby(
            [latitude, longitude],
            ride.destinationCoordinates,
            0.5 // Within 500 meters
          );
          
          if (!isNearDestination) {
            addNotification('You don\'t appear to be at the destination. Please verify your location.', 'warning');
          }
        } else {
          addNotification('Destination coordinates are not available for this ride.', 'warning');
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationError(`Error getting your location: ${error.message}`);
        setVerifying(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [ride, isLocationNearby, addNotification]);
  
  // Handle ride completion by driver
  const handleCompleteRide = async () => {
    if (!ride || !currentUser) {
      addNotification('Unable to complete ride: Missing ride details or user information', 'error');
      return;
    }
    
    setLoading(true);
    try {
      // Extract passenger IDs from bookings
      const passengerIds = Array.isArray(ride.bookings) ? 
        ride.bookings
          .filter(booking => booking && booking.status === 'confirmed')
          .map(booking => booking.passengerId) : 
        [];
      
      // Complete the ride with the firebase function
      const result = await completeRide(
        ride.id,
        ride.driverId,
        passengerIds,
        ride.distance || 0
      );
      
      if (result.success) {
        addNotification('Ride completed successfully! Green points have been awarded.', 'success');
      } else {
        addNotification(`Failed to complete ride: ${result.error || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('Error completing ride:', error);
      addNotification(`Error: ${error.message || 'Unknown error'}`, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle passenger location verification
  const handleVerifyPassengerLocation = async () => {
    if (!ride || !currentUser) {
      addNotification('Unable to verify location: Missing ride details or user information', 'error');
      return;
    }
    
    setLoading(true);
    try {
      // Verify passenger location
      const result = await verifyPassengerLocation(ride.id, currentUser.uid);
      
      if (result.success) {
        setLocationVerified(true);
        addNotification('Your location has been verified! Waiting for the driver to complete the ride.', 'success');
      } else {
        addNotification(`Failed to verify location: ${result.error || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('Error verifying passenger location:', error);
      addNotification(`Error: ${error.message || 'Unknown error'}`, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Count the number of confirmed passengers
  const confirmedPassengerCount = Array.isArray(ride?.bookings) 
    ? ride.bookings.filter(booking => booking && booking.status === 'confirmed').length 
    : 0;
  
  // When the component mounts, get location if the ride can be completed
  useEffect(() => {
    if (canComplete && !currentLocation) {
      getCurrentLocation();
    }
  }, [canComplete, currentLocation, getCurrentLocation]);
  
  if (!ride) {
    return (
      <div className="bg-white rounded-lg shadow-md p-5 mt-4">
        <h3 className="text-lg font-bold text-dark mb-3">Complete Ride</h3>
        <p className="text-gray-600">No ride information available.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-5 mt-4">
      <h3 className="text-lg font-bold text-dark mb-3">
        {isDriver ? 'Complete This Ride' : 'Verify Ride Completion'}
      </h3>
      
      {!canComplete ? (
        <p className="text-gray-600">
          This ride cannot be completed yet. It may be pending, already completed, or scheduled for a future time.
        </p>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-gray-600 mb-2">
              {isDriver 
                ? `Verify arrival at the destination to complete this ride. ${confirmedPassengerCount} confirmed passenger(s) will earn green points.`
                : 'Verify your arrival at the destination to confirm ride completion.'}
            </p>
            
            {locationError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-md mb-3">
                {locationError}
              </div>
            )}
            
            {currentLocation && (
              <div className="p-3 bg-green-50 text-green-700 rounded-md mb-3">
                <p>
                  Location verified! You are approximately {distance.toFixed(2)} km from the destination.
                </p>
                {distance > 0.5 && (
                  <p className="text-yellow-600 mt-1">
                    Warning: You appear to be more than 500m from the destination.
                  </p>
                )}
              </div>
            )}
            
            {!currentLocation && (
              <button
                className={`btn btn-outline mb-3 ${verifying ? 'opacity-70 cursor-not-allowed' : ''}`}
                onClick={getCurrentLocation}
                disabled={verifying}
              >
                {verifying ? 'Verifying Location...' : 'Verify Location'}
              </button>
            )}
          </div>
          
          <div className="mt-4">
            {isDriver ? (
              <div>
                <button
                  className={`btn btn-primary ${loading || !currentLocation ? 'opacity-70 cursor-not-allowed' : ''}`}
                  onClick={handleCompleteRide}
                  disabled={loading || !currentLocation}
                >
                  {loading ? 'Completing Ride...' : 'Complete Ride'}
                </button>
                
                <p className="text-sm text-gray-500 mt-2">
                  As the driver, completing this ride will record the trip for all passengers and award green points based on the distance traveled and number of passengers.
                </p>
              </div>
            ) : (
              <div>
                {locationVerified ? (
                  <div className="p-3 bg-blue-50 text-blue-700 rounded-md">
                    <p className="font-medium">Your location has been verified!</p>
                    <p className="text-sm mt-1">Waiting for the driver to complete the ride.</p>
                  </div>
                ) : (
                  <>
                    {currentLocation && distance <= 0.7 && (
                      <button
                        className={`btn btn-primary mb-3 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        onClick={handleVerifyPassengerLocation}
                        disabled={loading}
                      >
                        {loading ? 'Verifying...' : 'Confirm Arrival'}
                      </button>
                    )}
                    
                    <p className="text-sm text-gray-500 mb-2">
                      Only the driver can complete the ride. Verify your location to confirm your arrival at the destination.
                    </p>
                    <p className="text-sm font-medium text-primary">
                      {distance <= 0.5 
                        ? 'You are at the destination! Please confirm your arrival.' 
                        : 'Please make sure you reach the exact destination for verification.'}
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
          
          {isDriver && confirmedPassengerCount > 0 && (
            <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-md">
              <p className="font-medium">Passenger Information:</p>
              <ul className="list-disc pl-5 mt-1 text-sm">
                {Array.isArray(ride.bookings) && ride.bookings
                  .filter(booking => booking && booking.status === 'confirmed')
                  .map((booking, index) => (
                    <li key={booking.id || index}>
                      {booking.passengerName || `Passenger ${index + 1}`}
                      {booking.passengerPhone && ` - ${booking.passengerPhone}`}
                    </li>
                  ))
                }
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
} 
import { useGreenPoints } from '../contexts/GreenPointsContext';

export default function TripHistoryDisplay() {
  const { tripHistory, loading } = useGreenPoints();

  // Helper function to format dates
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-dark">Your Trip History</h2>
        {loading && <span className="text-sm text-gray-500">Loading...</span>}
      </div>
      
      {tripHistory.length > 0 ? (
        <div className="space-y-4">
          {tripHistory.map((trip, index) => (
            <div 
              key={trip.id || index} 
              className={`border-l-4 p-4 ${
                trip.status === 'completed' 
                  ? 'border-green-500 bg-green-50' 
                  : trip.status === 'pending'
                  ? 'border-yellow-500 bg-yellow-50'
                  : 'border-gray-300 bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">
                    {trip.startLocation} to {trip.endLocation}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatDate(trip.departureTime || trip.recordedAt)}
                  </p>
                  <div className="mt-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      trip.mode === 'carpool' 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-secondary/10 text-secondary'
                    }`}>
                      {trip.mode === 'carpool' 
                        ? `Carpool - ${trip.role === 'driver' ? 'Driver' : 'Passenger'}` 
                        : trip.mode}
                    </span>
                    
                    {trip.passengers > 0 && (
                      <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {trip.passengers} {trip.passengers === 1 ? 'passenger' : 'passengers'}
                      </span>
                    )}
                    
                    <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {trip.distance} km
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-sm font-semibold ${
                    trip.status === 'completed' ? 'text-green-600' : 
                    trip.status === 'pending' ? 'text-yellow-600' : 'text-gray-600'
                  }`}>
                    {trip.status === 'completed' ? 'Verified' : 
                     trip.status === 'pending' ? 'Pending Verification' : trip.status}
                  </div>
                  
                  {trip.pointsAwarded > 0 && (
                    <div className="mt-1 bg-green-100 text-green-800 px-2 py-1 text-xs rounded-full inline-block">
                      +{trip.pointsAwarded} points
                    </div>
                  )}
                </div>
              </div>
              
              {trip.notes && (
                <p className="mt-2 text-sm text-gray-600 italic">
                  "{trip.notes}"
                </p>
              )}
            </div>
          ))}
        </div>
      ) : loading ? (
        <div className="py-8 text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2.5"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
          </svg>
          <h3 className="text-lg font-medium mb-1">No trips recorded yet</h3>
          <p className="text-sm">
            Your carpool trips will appear here automatically after completion
          </p>
        </div>
      )}
    </div>
  );
} 